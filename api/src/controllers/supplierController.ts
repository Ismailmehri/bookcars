import path from 'node:path'
import fs from 'node:fs/promises'
import escapeStringRegexp from 'escape-string-regexp'
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { nanoid } from 'nanoid'
import * as bookcarsTypes from ':bookcars-types'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import User from '../models/User'
import NotificationCounter from '../models/NotificationCounter'
import Notification from '../models/Notification'
import AdditionalDriver from '../models/AdditionalDriver'
import Booking from '../models/Booking'
import Car from '../models/Car'
import * as helper from '../common/helper'
import * as logger from '../common/logger'
import * as authHelper from '../common/authHelper'

/**
 * Validate Supplier by fullname.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const validate = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.ValidateSupplierPayload } = req
  const { fullName } = body

  try {
    const keyword = escapeStringRegexp(fullName)
    const options = 'i'
    const user = await User.findOne({
      type: bookcarsTypes.UserType.Supplier,
      fullName: { $regex: new RegExp(`^${keyword}$`), $options: options },
    })
    return user ? res.sendStatus(204) : res.sendStatus(200)
  } catch (err) {
    logger.error(`[supplier.validate] ${i18n.t('DB_ERROR')} ${fullName}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Update Supplier.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.UpdateSupplierPayload } = req
  const { _id } = body
  const sessionData = await authHelper.getSessionData(req)
  let connectedUser: bookcarsTypes.User | null

  if (!helper.isValidObjectId(_id)) {
    throw new Error('body._id is not valid')
  }
  const supplier = await User.findById(_id)

  if (sessionData.id === _id && supplier) {
    connectedUser = supplier as bookcarsTypes.User
  } else {
    connectedUser = await User.findById(sessionData.id)
  }

  const isAdmin = connectedUser ? helper.admin(connectedUser) : false

  if (!isAdmin && connectedUser?._id !== _id) {
    return res.status(400).send(i18n.t('DB_ERROR'))
  }

  try {
    if (supplier) {
      const {
        fullName,
        phone,
        location,
        bio,
        payLater,
      } = body
      supplier.fullName = fullName
      supplier.phone = phone
      supplier.location = location
      supplier.bio = bio
      supplier.payLater = payLater

      await supplier.save()
      return res.json({
        _id,
        fullName: supplier.fullName,
        phone: supplier.phone,
        location: supplier.location,
        bio: supplier.bio,
        payLater: supplier.payLater,
        contracts: supplier.contracts,
      })
    }
    logger.error('[supplier.update] Supplier not found:', _id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[supplier.update] ${i18n.t('DB_ERROR')} ${_id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete Supplier by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteSupplier = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const supplier = await User.findById(id)
    if (supplier) {
      await User.deleteOne({ _id: id })

      if (supplier.avatar) {
        const avatar = path.join(env.CDN_USERS, supplier.avatar)
        if (await helper.exists(avatar)) {
          await fs.unlink(avatar)
        }
      }

      if (supplier.contracts && supplier.contracts.length > 0) {
        for (const contract of supplier.contracts) {
          if (contract.file) {
            const file = path.join(env.CDN_CONTRACTS, contract.file)
            if (await helper.exists(file)) {
              await fs.unlink(file)
            }
          }
        }
      }

      await NotificationCounter.deleteMany({ user: id })
      await Notification.deleteMany({ user: id })
      const additionalDrivers = (await Booking.find({ supplier: id, _additionalDriver: { $ne: null } }, { _id: 0, _additionalDriver: 1 })).map((b) => b._additionalDriver)
      await AdditionalDriver.deleteMany({ _id: { $in: additionalDrivers } })
      await Booking.deleteMany({ supplier: id })
      const cars = await Car.find({ supplier: id })
      await Car.deleteMany({ supplier: id })
      for (const car of cars) {
        if (car.image) {
          const image = path.join(env.CDN_CARS, car.image)
          if (await helper.exists(image)) {
            await fs.unlink(image)
          }
        }
      }
    } else {
      return res.sendStatus(204)
    }
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[supplier.delete] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get Supplier by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getSupplier = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const user = await User.findById(id).lean()

    if (!user) {
      logger.error('[supplier.getSupplier] Supplier not found:', id)
      return res.sendStatus(204)
    }
    const {
      _id,
      email,
      fullName,
      avatar,
      phone,
      location,
      bio,
      payLater,
      agencyVerified,
      contracts,
    } = user

    return res.json({
      _id,
      email,
      fullName,
      avatar,
      phone,
      location,
      bio,
      payLater,
      agencyVerified,
      contracts,
    })
  } catch (err) {
    logger.error(`[supplier.getSupplier] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get Agency Score by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getAgencyScore = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Récupérer l'agence (utilisateur de type "supplier")
    const agency = await User.findById(id) as bookcarsTypes.User

    if (!agency) {
      logger.error('[agency.getAgencyScore] Agency not found:', id)
      return res.sendStatus(204) // No Content
    }

    // Vérifier que l'utilisateur est bien une agence (supplier)
    if (agency.type !== 'supplier') {
      logger.error('[agency.getAgencyScore] User is not a supplier:', id)
      return res.status(400).send(i18n.t('NOT_A_SUPPLIER'))
    }

    // Récupérer les réservations et les voitures de l'agence
    const bookings = await Booking.find({ supplier: id }) as bookcarsTypes.Booking[]
    const cars = await Car.find({ supplier: id }) as bookcarsTypes.Car[]

    // Calculer le score de l'agence
    const scoreBreakdown = helper.calculateAgencyScore(agency, bookings, cars)

    // Retourner le score et les détails
    return res.json({
      success: true,
      score: scoreBreakdown.total,
      details: scoreBreakdown.details,
      recommendations: scoreBreakdown.recommendations,
    })
  } catch (err) {
    logger.error(`[agency.getAgencyScore] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get Suppliers.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    const data = await User.aggregate(
      [
        {
          $match: {
            type: bookcarsTypes.UserType.Supplier,
            avatar: { $ne: null },
            fullName: { $regex: keyword, $options: options },
          },
        },
        {
          $facet: {
            resultData: [{ $sort: { fullName: 1, _id: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
            pageInfo: [
              {
                $count: 'totalRecords',
              },
            ],
          },
        },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    data[0].resultData = data[0].resultData.map((supplier: env.User) => {
      const { _id, fullName, avatar, slug, agencyVerified } = supplier
      return { _id, fullName, avatar, slug, agencyVerified }
    })

    return res.json(data)
  } catch (err) {
    logger.error(`[supplier.getSuppliers] ${i18n.t('DB_ERROR')} ${req.query.s}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get all Suppliers.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const data = await User.aggregate(
      [
        // Étape 1 : Filtrer les utilisateurs de type "Supplier" non blacklistés
        {
          $match: {
            type: bookcarsTypes.UserType.Supplier,
            blacklisted: { $ne: true },
          },
        },

        // Étape 2 : Joindre la collection "Car" pour compter les voitures associées
        {
          $lookup: {
            from: 'Car',
            localField: '_id',
            foreignField: 'supplier',
            as: 'cars',
          },
        },

        // Étape 3 : Ajouter des champs calculés (voitures, avis et réservations)
        {
          $addFields: {
            carCount: { $size: '$cars' },
            reviewCount: {
              $cond: {
                if: { $isArray: '$reviews' },
                then: { $size: '$reviews' },
                else: 0,
              },
            },
            reviewAuthorIds: {
              $map: {
                input: { $ifNull: ['$reviews', []] },
                as: 'review',
                in: '$$review.user',
              },
            },
          },
        },

        // Étape 4 : Compter le nombre de réservations confirmées pour chaque agence
        {
          $lookup: {
            from: 'Booking',
            let: { supplierId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$supplier', '$$supplierId'] },
                },
              },
              {
                $count: 'count',
              },
            ],
            as: 'reservationStats',
          },
        },
        {
          $addFields: {
            reservationCount: {
              $cond: [
                { $gt: [{ $size: '$reservationStats' }, 0] },
                { $arrayElemAt: ['$reservationStats.count', 0] },
                0,
              ],
            },
          },
        },

        // Étape 5 : Récupérer les informations des auteurs d'avis
        {
          $lookup: {
            from: 'User',
            let: { reviewerIds: '$reviewAuthorIds' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$_id', { $ifNull: ['$$reviewerIds', []] }],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                },
              },
            ],
            as: 'reviewAuthors',
          },
        },

        // Étape 6 : Trier les résultats par statut de validation puis par disponibilité
        { $sort: { agencyVerified: -1, carCount: -1, fullName: 1 } },

        // Étape 7 : Sélectionner uniquement les champs nécessaires
        {
          $project: {
            _id: 1,
            fullName: 1,
            avatar: 1,
            verified: 1,
            active: 1,
            agencyVerified: 1,
            slug: 1,
            carCount: 1,
            score: { $ifNull: ['$score', 0] },
            reviewCount: 1,
            reviews: { $ifNull: ['$reviews', []] },
            reviewAuthors: 1,
            reservationCount: 1,
            location: 1,
          },
        },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(data)
  } catch (err) {
    logger.error(`[supplier.getAllSuppliers] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get Frontend Suppliers.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getFrontendSuppliers = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const pickupLocation = new mongoose.Types.ObjectId(body.pickupLocation)
    const {
      carType,
      gearbox,
      mileage,
      fuelPolicy,
      deposit,
      carSpecs,
      ranges,
      multimedia,
      rating,
      seats,
    } = body

    const $match: mongoose.FilterQuery<bookcarsTypes.Car> = {
      $and: [
        { locations: pickupLocation },
        { available: true }, { type: { $in: carType } },
        { gearbox: { $in: gearbox } },
        { fuelPolicy: { $in: fuelPolicy } },
      ],
    }

    if (carSpecs) {
      if (carSpecs.aircon) {
        $match.$and!.push({ aircon: true })
      }
      if (carSpecs.moreThanFourDoors) {
        $match.$and!.push({ doors: { $gt: 4 } })
      }
      if (carSpecs.moreThanFiveSeats) {
        $match.$and!.push({ seats: { $gt: 5 } })
      }
    }

    if (mileage) {
      if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Limited) {
        $match.$and!.push({ mileage: { $gt: -1 } })
      } else if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Unlimited) {
        $match.$and!.push({ mileage: -1 })
      } else if (mileage.length === 0) {
        return res.json([])
      }
    }

    if (deposit && deposit > -1) {
      $match.$and!.push({ deposit: { $lte: deposit } })
    }

    if (ranges) {
      $match.$and!.push({ range: { $in: ranges } })
    }

    if (multimedia && multimedia.length > 0) {
      for (const multimediaOption of multimedia) {
        $match.$and!.push({ multimedia: multimediaOption })
      }
    }

    if (rating && rating > -1) {
      $match.$and!.push({ rating: { $gte: rating } })
    }

    if (seats) {
      if (seats > -1) {
        if (seats === 6) {
          $match.$and!.push({ seats: { $gte: 5 } })
        } else {
          $match.$and!.push({ seats })
        }
      }
    }

    const data = await Car.aggregate(
      [
        { $match },
        {
          $lookup: {
            from: 'User',
            let: { userId: '$supplier' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$userId'] },
                },
              },
            ],
            as: 'supplier',
          },
        },
        { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: '$supplier._id',
            fullName: { $first: '$supplier.fullName' },
            avatar: { $first: '$supplier.avatar' },
            score: { $first: '$supplier.score' },
            agencyVerified: { $first: '$supplier.agencyVerified' },
            slug: { $first: '$supplier.slug' },
            carCount: { $sum: 1 },
          },
        },
        { $sort: { fullName: 1 } },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )
    return res.json(data)
  } catch (err) {
    logger.error(`[supplier.getFrontendSuppliers] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get Backend Suppliers.
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getBackendSuppliers = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const {
      carType,
      gearbox,
      mileage,
      deposit,
      availability,
      fuelPolicy,
      carSpecs,
      ranges,
      multimedia,
      rating,
      seats,
    } = body
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'

    const $match: mongoose.FilterQuery<bookcarsTypes.Car> = {
      $and: [
        { name: { $regex: keyword, $options: options } },
        { fuelPolicy: { $in: fuelPolicy } },
      ],
    }

    if (carSpecs) {
      if (carSpecs.aircon) {
        $match.$and!.push({ aircon: true })
      }
      if (carSpecs.moreThanFourDoors) {
        $match.$and!.push({ doors: { $gt: 4 } })
      }
      if (carSpecs.moreThanFiveSeats) {
        $match.$and!.push({ seats: { $gt: 5 } })
      }
    }

    if (carType) {
      $match.$and!.push({ type: { $in: carType } })
    }

    if (gearbox) {
      $match.$and!.push({ gearbox: { $in: gearbox } })
    }

    if (mileage) {
      if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Limited) {
        $match.$and!.push({ mileage: { $gt: -1 } })
      } else if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Unlimited) {
        $match.$and!.push({ mileage: -1 })
      } else if (mileage.length === 0) {
        return res.json([])
      }
    }

    if (deposit && deposit > -1) {
      $match.$and!.push({ deposit: { $lte: deposit } })
    }

    if (Array.isArray(availability)) {
      if (availability.length === 1 && availability[0] === bookcarsTypes.Availablity.Available) {
        $match.$and!.push({ available: true })
      } else if (availability.length === 1 && availability[0] === bookcarsTypes.Availablity.Unavailable) {
        $match.$and!.push({ available: false })
      } else if (availability.length === 0) {
        return res.json([])
      }
    }

    if (ranges) {
      $match.$and!.push({ range: { $in: ranges } })
    }

    if (multimedia && multimedia.length > 0) {
      for (const multimediaOption of multimedia) {
        $match.$and!.push({ multimedia: multimediaOption })
      }
    }

    if (rating && rating > -1) {
      $match.$and!.push({ rating: { $gte: rating } })
    }

    if (seats) {
      if (seats > -1) {
        if (seats === 6) {
          $match.$and!.push({ seats: { $gte: 5 } })
        } else {
          $match.$and!.push({ seats })
        }
      }
    }

    const data = await Car.aggregate(
      [
        { $match },
        {
          $lookup: {
            from: 'User',
            let: { userId: '$supplier' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$userId'] },
                },
              },
            ],
            as: 'supplier',
          },
        },
        { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: '$supplier._id',
            fullName: { $first: '$supplier.fullName' },
            avatar: { $first: '$supplier.avatar' },
            score: { $first: '$supplier.score' },
            carCount: { $sum: 1 },
          },
        },
        { $sort: { fullName: 1 } },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(data)
  } catch (err) {
    logger.error(`[supplier.getBackendSuppliers] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Upload a contract to temp folder.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createContract = async (req: Request, res: Response) => {
  const { language } = req.params

  try {
    if (!req.file) {
      throw new Error('req.file not found')
    }
    if (!req.file.originalname.includes('.')) {
      throw new Error('File extension not found')
    }
    if (language.length !== 2) {
      throw new Error('Language not valid')
    }

    const filename = `${nanoid()}_${language}${path.extname(req.file.originalname)}`
    const filepath = path.join(env.CDN_TEMP_CONTRACTS, filename)

    await fs.writeFile(filepath, req.file.buffer)
    return res.json(filename)
  } catch (err) {
    logger.error(`[supplier.createContract] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Update a contract.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateContract = async (req: Request, res: Response) => {
  const { id, language } = req.params
  const { file } = req

  try {
    if (!file) {
      throw new Error('req.file not found')
    }
    if (!file.originalname.includes('.')) {
      throw new Error('File extension not found')
    }
    if (!helper.isValidObjectId(id)) {
      throw new Error('Supplier Id not valid')
    }
    if (language.length !== 2) {
      throw new Error('Language not valid')
    }

    const supplier = await User.findOne({ _id: id, type: bookcarsTypes.UserType.Supplier })

    if (supplier) {
      const contract = supplier.contracts?.find((c) => c.language === language)
      if (contract?.file) {
        const contractFile = path.join(env.CDN_CONTRACTS, contract.file)
        if (await helper.exists(contractFile)) {
          await fs.unlink(contractFile)
        }
      }

      const filename = `${supplier._id}_${language}${path.extname(file.originalname)}`
      const filepath = path.join(env.CDN_CONTRACTS, filename)

      await fs.writeFile(filepath, file.buffer)
      if (!contract) {
        supplier.contracts?.push({ language, file: filename })
      } else {
        contract.file = filename
      }
      await supplier.save()
      return res.json(filename)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[supplier.updateContract] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a contract.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteContract = async (req: Request, res: Response) => {
  const { id, language } = req.params

  try {
    if (!helper.isValidObjectId(id)) {
      throw new Error('Supplier Id not valid')
    }
    if (language.length !== 2) {
      throw new Error('Language not valid')
    }
    const supplier = await User.findOne({ _id: id, type: bookcarsTypes.UserType.Supplier })

    if (supplier) {
      const contract = supplier.contracts?.find((c) => c.language === language)
      if (contract?.file) {
        const contractFile = path.join(env.CDN_CONTRACTS, contract.file)
        if (await helper.exists(contractFile)) {
          await fs.unlink(contractFile)
        }
        contract.file = null
      }

      await supplier.save()
      return res.sendStatus(200)
    }
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[supplier.deleteContract] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a temp contract.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export const deleteTempContract = async (req: Request, res: Response) => {
  const { file } = req.params

  try {
    if (!file.includes('.')) {
      throw new Error('Filename not valid')
    }
    const contractFile = path.join(env.CDN_TEMP_CONTRACTS, file)
    if (await helper.exists(contractFile)) {
      await fs.unlink(contractFile)
    }

    res.sendStatus(200)
  } catch (err) {
    logger.error(`[supplier.deleteTempContract] ${i18n.t('DB_ERROR')} ${file}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}
