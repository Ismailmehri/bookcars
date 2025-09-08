import fs from 'node:fs/promises'
import path from 'node:path'
import { nanoid } from 'nanoid'
import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import Car from '../models/Car'
import User from '../models/User'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'
import * as helper from '../common/helper'
import * as logger from '../common/logger'
import * as authHelper from '../common/authHelper'
import { CarStats } from '../models/CarStats'

/**
 * Create a Car.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const create = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.CreateCarPayload } = req

  try {
    if (!body.image) {
      logger.error(`[car.create] ${i18n.t('CAR_IMAGE_REQUIRED')} ${JSON.stringify(body)}`)
      return res.status(400).send(i18n.t('CAR_IMAGE_REQUIRED'))
    }

    const car = new Car(body)
    await car.save()

    const image = path.join(env.CDN_TEMP_CARS, body.image)

    if (await helper.exists(image)) {
      const filename = `${car._id}_${Date.now()}${path.extname(body.image)}`
      const newPath = path.join(env.CDN_CARS, filename)

      await fs.rename(image, newPath)
      car.image = filename
      await car.save()
    } else {
      await Car.deleteOne({ _id: car._id })
      logger.error(i18n.t('CAR_IMAGE_NOT_FOUND'), body)
      return res.status(400).send(i18n.t('CAR_IMAGE_NOT_FOUND'))
    }

    return res.json(car)
  } catch (err) {
    logger.error(`[car.create] ${i18n.t('DB_ERROR')} ${JSON.stringify(body)}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Update a Car.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const update = async (req: Request, res: Response) => {
  const { body }: { body: bookcarsTypes.UpdateCarPayload } = req
  const { _id } = body

  try {
    if (!helper.isValidObjectId(_id)) {
      throw new Error('body._id is not valid')
    }
    const car = await Car.findById(_id)

    if (car) {
      const {
        supplier,
        name,
        minimumAge,
        available,
        type,
        locations,
        dailyPrice,
        discountedDailyPrice,
        biWeeklyPrice,
        discountedBiWeeklyPrice,
        weeklyPrice,
        discountedWeeklyPrice,
        monthlyPrice,
        discountedMonthlyPrice,
        deposit,
        seats,
        doors,
        aircon,
        gearbox,
        fuelPolicy,
        mileage,
        cancellation,
        amendments,
        theftProtection,
        collisionDamageWaiver,
        fullInsurance,
        additionalDriver,
        range,
        multimedia,
        rating,
        co2,
        minimumDrivingLicenseYears,
        periodicPrices,
        unavailablePeriods,
        minimumRentalDays,
        discounts,
      } = body

      car.supplier = new mongoose.Types.ObjectId(supplier)
      car.minimumAge = minimumAge
      car.locations = locations.map((l) => new mongoose.Types.ObjectId(l))
      car.name = name
      car.available = available
      car.type = type as bookcarsTypes.CarType
      car.dailyPrice = dailyPrice
      car.discountedDailyPrice = discountedDailyPrice
      car.biWeeklyPrice = biWeeklyPrice
      car.discountedBiWeeklyPrice = discountedBiWeeklyPrice
      car.weeklyPrice = weeklyPrice
      car.discountedWeeklyPrice = discountedWeeklyPrice
      car.monthlyPrice = monthlyPrice
      car.discountedMonthlyPrice = discountedMonthlyPrice
      car.deposit = deposit
      car.seats = seats
      car.doors = doors
      car.aircon = aircon
      car.gearbox = gearbox as bookcarsTypes.GearboxType
      car.fuelPolicy = fuelPolicy as bookcarsTypes.FuelPolicy
      car.mileage = mileage
      car.cancellation = cancellation
      car.amendments = amendments
      car.theftProtection = theftProtection
      car.collisionDamageWaiver = collisionDamageWaiver
      car.fullInsurance = fullInsurance
      car.additionalDriver = additionalDriver
      car.range = range
      car.multimedia = multimedia
      car.rating = rating
      car.co2 = co2
      car.minimumDrivingLicenseYears = minimumDrivingLicenseYears
      car.periodicPrices = periodicPrices
      car.unavailablePeriods = unavailablePeriods
      car.minimumRentalDays = minimumRentalDays
      car.discounts = discounts

      await car.save()
      return res.json(car)
    }

    logger.error('[car.update] Car not found:', _id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[car.update] ${i18n.t('DB_ERROR')} ${_id}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Check if a Car is related to bookings.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const checkCar = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const _id = new mongoose.Types.ObjectId(id)
    const count = await Booking
      .find({ car: _id })
      .limit(1)
      .countDocuments()

    if (count === 1) {
      return res.sendStatus(200)
    }

    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[car.check] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Delete a Car by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteCar = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const car = await Car.findById(id)
    if (car) {
      await Car.deleteOne({ _id: id })

      if (car.image) {
        const image = path.join(env.CDN_CARS, car.image)
        if (await helper.exists(image)) {
          await fs.unlink(image)
        }
      }
      await Booking.deleteMany({ car: car._id })
    } else {
      return res.sendStatus(204)
    }
    return res.sendStatus(200)
  } catch (err) {
    logger.error(`[car.delete] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Upload a Car image to temp folder.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const createImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new Error('[car.createImage] req.file not found')
    }

    const filename = `${helper.getFilenameWithoutExtension(req.file.originalname)}_${nanoid()}_${Date.now()}${path.extname(req.file.originalname)}`
    const filepath = path.join(env.CDN_TEMP_CARS, filename)

    await fs.writeFile(filepath, req.file.buffer)
    return res.json(filename)
  } catch (err) {
    logger.error(`[car.createImage] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Update a Car image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const updateImage = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    if (!req.file) {
      const msg = '[car.updateImage] req.file not found'
      logger.error(msg)
      return res.status(400).send(msg)
    }

    const { file } = req

    const car = await Car.findById(id)

    if (car) {
      if (car.image) {
        const image = path.join(env.CDN_CARS, car.image)
        if (await helper.exists(image)) {
          await fs.unlink(image)
        }
      }

      const filename = `${car._id}_${Date.now()}${path.extname(file.originalname)}`
      const filepath = path.join(env.CDN_CARS, filename)

      await fs.writeFile(filepath, file.buffer)
      car.image = filename
      await car.save()
      return res.json(filename)
    }

    logger.error('[car.updateImage] Car not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[car.updateImage] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a Car image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const car = await Car.findById(id)

    if (car) {
      if (car.image) {
        const image = path.join(env.CDN_CARS, car.image)
        if (await helper.exists(image)) {
          await fs.unlink(image)
        }
      }
      car.image = null

      await car.save()
      return res.sendStatus(200)
    }
    logger.error('[car.deleteImage] Car not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[car.deleteImage] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Delete a temp Car image.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {*}
 */
export const deleteTempImage = async (req: Request, res: Response) => {
  const { image } = req.params

  try {
    const imageFile = path.join(env.CDN_TEMP_CARS, image)
    if (!await helper.exists(imageFile)) {
      throw new Error(`[car.deleteTempImage] temp image ${imageFile} not found`)
    }

    await fs.unlink(imageFile)

    res.sendStatus(200)
  } catch (err) {
    logger.error(`[car.deleteTempImage] ${i18n.t('DB_ERROR')} ${image}`, err)
    res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Get a Car by ID.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCar = async (req: Request, res: Response) => {
  const { id, language } = req.params

  try {
    const car = await Car.findById(id)
      .populate<{ supplier: env.UserInfo }>('supplier')
      .populate<{ locations: env.LocationInfo[] }>({
        path: 'locations',
        populate: {
          path: 'values',
          model: 'LocationValue',
        },
      })
      .lean()

    if (car) {
      const {
        _id,
        fullName,
        avatar,
        payLater,
      } = car.supplier
      car.supplier = {
        _id,
        fullName,
        avatar,
        payLater,
      }

      for (const location of car.locations) {
        location.name = location.values.filter((value) => value.language === language)[0].value
      }

      return res.json(car)
    }
    logger.error('[car.getCar] Car not found:', id)
    return res.sendStatus(204)
  } catch (err) {
    logger.error(`[car.getCar] ${i18n.t('DB_ERROR')} ${id}`, err)
    return res.status(400).send(i18n.t('ERROR') + err)
  }
}

/**
 * Get Cars.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getCars = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)
    const suppliers = body.suppliers!.map((id) => new mongoose.Types.ObjectId(id))
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
        { supplier: { $in: suppliers } },
      ],
    }

    if (fuelPolicy) {
      $match.$and!.push({ fuelPolicy: { $in: fuelPolicy } })
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
        return res.json([{ resultData: [], pageInfo: [] }])
      }
    }

    if (deposit && deposit > -1) {
      $match.$and!.push({ deposit: { $lte: deposit } })
    }

    if (Array.isArray(availability)) {
      if (availability.length === 1 && availability[0] === bookcarsTypes.Availablity.Available) {
        $match.$and!.push({ available: true })
      } else if (availability.length === 1
        && availability[0] === bookcarsTypes.Availablity.Unavailable) {
        $match.$and!.push({ available: false })
      } else if (availability.length === 0) {
        return res.json([{ resultData: [], pageInfo: [] }])
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
          $match.$and!.push({ seats: { $gt: 5 } })
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
        // {
        //   $lookup: {
        //     from: 'Location',
        //     let: { locations: '$locations' },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: { $in: ['$_id', '$$locations'] },
        //         },
        //       },
        //     ],
        //     as: 'locations',
        //   },
        // },
        {
          $facet: {
            resultData: [{ $sort: { updatedAt: -1, _id: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
            // resultData: [{ $sort: { price: 1, _id: 1 } }, { $skip: (page - 1) * size }, { $limit: size }],
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

    for (const car of data[0].resultData) {
      const { _id, fullName, avatar } = car.supplier
      car.supplier = { _id, fullName, avatar }
    }

    return res.json(data)
  } catch (err) {
    logger.error(`[car.getCars] ${i18n.t('DB_ERROR')} ${req.query.s}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get Cars by Supplier and pick-up Location.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getBookingCars = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetBookingCarsPayload } = req
    const supplier = new mongoose.Types.ObjectId(body.supplier)
    const pickupLocation = new mongoose.Types.ObjectId(body.pickupLocation)
    const keyword = escapeStringRegexp(String(req.query.s || ''))
    const options = 'i'
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)

    const cars = await Car.aggregate(
      [
        {
          $match: {
            $and: [
              { supplier: { $eq: supplier } },
              { locations: pickupLocation },
              { available: true }, { name: { $regex: keyword, $options: options } },
            ],
          },
        },
        { $sort: { name: 1, _id: 1 } },
        { $skip: (page - 1) * size },
        { $limit: size },
      ],
      { collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 } },
    )

    return res.json(cars)
  } catch (err) {
    logger.error(`[car.getBookingCars] ${i18n.t('DB_ERROR')} ${req.query.s}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const updateCarBoost = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)
    const isAllowed = connectedUser ? helper.admin(connectedUser) || helper.supplier(connectedUser) : false
    if (!isAllowed) {
      return res.sendStatus(403)
    }

    const { carId, boostData } = req.body

    if (carId === undefined || boostData === undefined) {
      return res.status(400).send('Missing parameters: carId and paused status are required')
    }

    const car = await Car.findById(carId)

    if (!car) {
      return res.status(404).send('Car not found')
    }

    if (!car.boost) {
      return res.status(404).send('No boost found for this car')
    }

    // Mise à jour uniquement du champ paused
    car.boost.paused = boostData.paused

    await car.save()

    return res.status(200).json(car.boost)
  } catch (err) {
    logger.error(`[car.updateCarBoostPause] ${i18n.t('DB_ERROR')}`, err)
    return res.status(500).send(i18n.t('DB_ERROR') + err)
  }
}

export const boostCar = async (req: Request, res: Response) => {
  try {
    const sessionData = await authHelper.getSessionData(req)
    const connectedUser: bookcarsTypes.User | null = await User.findById(sessionData.id)
    const isAllowed = connectedUser ? helper.admin(connectedUser) || helper.supplier(connectedUser) : false
    if (!isAllowed) {
      return res.sendStatus(403)
    }

    const { boostData, carId } = req.body // Assuming boostData contains the boost information
    const car = await Car.findById(carId)

    if (!car) {
      return res.status(404).send('Car not found')
    }

    if (car.boost && car.boost.active) {
      return res.status(400).send('A boost is already activated for this car')
    }

    // Set default values for the boost
    const newBoost = {
      active: true,
      paused: false,
      purchasedViews: boostData.purchasedViews, // Get purchasedViews from the request
      consumedViews: 0,
      startDate: boostData.startDate || new Date(),
      endDate: boostData.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default to 14 days
      createdAt: new Date(),
      lastViewAt: new Date(),
    }

    car.boost = newBoost
    await car.save()

    return res.status(200).json(car.boost)
  } catch (err) {
    logger.error(`[car.boostCar] ${i18n.t('DB_ERROR')}`, err)
    return res.status(500).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Get Cars available for rental.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const getFrontendCars = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const page = Number.parseInt(req.params.page, 10)
    const size = Number.parseInt(req.params.size, 10)

    const suppliers = body.suppliers?.map((id) => new mongoose.Types.ObjectId(id)) || []
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
      startDate,
      endDate,
      minPrice,
      maxPrice,
    } = body

    const startDateObj = new Date(startDate || Date.now())
    const endDateObj = new Date(endDate || Date.now())

    // Fenêtre restreinte pour forcer prix min
    const restrictedStartDate = new Date('2025-06-01')
    const restrictedEndDate = new Date('2025-09-15')

    // Filtre de base
    const $match: mongoose.FilterQuery<bookcarsTypes.Car> = {
      $and: [
        { supplier: { $in: suppliers } },
        { locations: pickupLocation },
        { available: true },
        { type: { $in: carType } },
        { gearbox: { $in: gearbox } },
      ],
    }

    // Filtres additionnels
    if (fuelPolicy) $match.$and!.push({ fuelPolicy: { $in: fuelPolicy } })

    if (carSpecs) {
      if (carSpecs.aircon) $match.$and!.push({ aircon: true })
      if (carSpecs.moreThanFourDoors) $match.$and!.push({ doors: { $gt: 4 } })
      if (carSpecs.moreThanFiveSeats) $match.$and!.push({ seats: { $gt: 5 } })
    }

    if (mileage) {
      if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Limited) {
        $match.$and!.push({ mileage: { $gt: -1 } })
      } else if (mileage.length === 1 && mileage[0] === bookcarsTypes.Mileage.Unlimited) {
        $match.$and!.push({ mileage: -1 })
      } else if (mileage.length === 0) {
        return res.json([{ resultData: [], pageInfo: [] }])
      }
    }

    if (deposit && deposit > -1) $match.$and!.push({ deposit: { $lte: deposit } })
    if (ranges) $match.$and!.push({ range: { $in: ranges } })

    if (multimedia && multimedia.length > 0) {
      for (const multimediaOption of multimedia) {
        $match.$and!.push({ multimedia: multimediaOption })
      }
    }

    if (rating && rating > -1) $match.$and!.push({ rating: { $gte: rating } })

    if (seats && seats > -1) {
      if (seats === 6) $match.$and!.push({ seats: { $gt: 5 } })
      else $match.$and!.push({ seats })
    }

    if (carType?.length) $match.type = { $in: carType }
    if (gearbox?.length) $match.gearbox = { $in: gearbox }

    const pipeline: mongoose.PipelineStage[] = [
      { $match },

      // ── Lookup fournisseur avec filtre score:
      // - score >= 50 => OK
      // - score null ou manquant (nouvelle agence) => OK
      // - score < 50 => EXCLU
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
            {
              $match: {
                $expr: {
                  $or: [
                    { $gte: ['$score', 65] },
                    { $eq: [{ $ifNull: ['$score', '__NO_SCORE__'] }, '__NO_SCORE__'] }, // null ou manquant
                  ],
                },
              },
            },
          ],
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },

      // ── (Optionnel) Abonnement actif
      ...(env.SUBSCRIPTION_ACTIVE
        ? [
            {
              $lookup: {
                from: 'Subscription',
                let: { supplierId: '$supplier._id', now: new Date() },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ['$supplier', '$$supplierId'] },
                          { $lte: ['$startDate', '$$now'] },
                          { $gte: ['$endDate', '$$now'] },
                        ],
                      },
                    },
                  },
                  { $sort: { endDate: -1 as const } },
                  { $limit: 1 },
                ],
                as: 'subscription',
              },
            },
            { $unwind: { path: '$subscription', preserveNullAndEmptyArrays: true } },
            { $addFields: { resultsCars: '$subscription.resultsCars' } },
          ]
        : []),

      // ── Stats résa fournisseur
      {
        $lookup: {
          from: 'Booking',
          let: { supplierId: '$supplier._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$supplier', '$$supplierId'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $ne: ['$status', 'void'] },
                  ],
                },
              },
            },
          ],
          as: 'supplierBookings',
        },
      },
      {
        $addFields: {
          supplierReservationCount: { $size: '$supplierBookings' },
        },
      },

      // ── Conflits de réservation
      {
        $lookup: {
          from: 'Booking',
          let: { carId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$car', '$$carId'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $ne: ['$status', 'void'] },
                    { $lt: ['$from', endDateObj] },
                    { $gt: ['$to', startDateObj] },
                  ],
                },
              },
            },
          ],
          as: 'conflictingBookings',
        },
      },
      { $addFields: { hasConflict: { $gt: [{ $size: '$conflictingBookings' }, 0] } } },
      { $match: { hasConflict: false } },

      // ── Indisponibilités manuelles
      { $addFields: { unavailablePeriods: { $ifNull: ['$unavailablePeriods', []] } } },
      {
        $addFields: {
          isUnavailable: {
            $anyElementTrue: {
              $map: {
                input: '$unavailablePeriods',
                as: 'period',
                in: {
                  $and: [
                    { $lte: ['$$period.startDate', endDateObj] },
                    { $gte: ['$$period.endDate', startDateObj] },
                  ],
                },
              },
            },
          },
        },
      },
      { $match: { isUnavailable: false } },

      // ── Prix journalier (périodique si applicable)
      {
        $addFields: {
          dailyPrice: {
            $let: {
              vars: {
                periodicPrices: { $ifNull: ['$periodicPrices', []] },
                periodicPrice: {
                  $filter: {
                    input: '$periodicPrices',
                    as: 'period',
                    cond: {
                      $and: [
                        { $lte: ['$$period.startDate', endDateObj] },
                        { $gte: ['$$period.endDate', startDateObj] },
                      ],
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: { $ifNull: ['$$periodicPrice', []] } }, 0] },
                  then: { $arrayElemAt: ['$$periodicPrice.dailyPrice', 0] },
                  else: '$dailyPrice',
                },
              },
            },
          },
        },
      },

      // ── Remise si seuil de jours atteint
      {
        $addFields: {
          dailyPriceWithDiscount: {
            $cond: {
              if: {
                $and: [
                  { $ne: [{ $ifNull: ['$discounts', null] }, null] },
                  { $ne: ['$discounts.percentage', null] },
                  { $ne: ['$discounts.threshold', null] },
                  {
                    $gte: [
                      {
                        $ceil: {
                          $divide: [
                            { $subtract: [endDateObj, startDateObj] },
                            1000 * 60 * 60 * 24,
                          ],
                        },
                      },
                      '$discounts.threshold',
                    ],
                  },
                ],
              },
              then: {
                $multiply: [
                  '$dailyPrice',
                  { $subtract: [1, { $divide: ['$discounts.percentage', 100] }] },
                ],
              },
              else: '$dailyPrice',
            },
          },
        },
      },

      // ── Filtre min/max prix
      { $match: { dailyPriceWithDiscount: { $gte: minPrice, $lte: maxPrice } } },

      // ── Règle période restreinte (ex.: été)
      {
        $match: {
          $expr: {
            $or: [
              // Période en dehors de la fenêtre restreinte
              { $lte: [endDateObj, restrictedStartDate] },
              { $gte: [startDateObj, restrictedEndDate] },

              // Chevauchement => voiture doit avoir periodicPrices ET prix >= 110
              {
                $and: [
                  { $lt: [startDateObj, restrictedEndDate] },
                  { $gt: [endDateObj, restrictedStartDate] },
                  { $gt: [{ $size: { $ifNull: ['$periodicPrices', []] } }, 0] },
                  { $gte: ['$dailyPriceWithDiscount', 110] },
                ],
              },
            ],
          },
        },
      },

      // ── Limites par fournisseur (abonnement / ou fallback)
      {
        $group: {
          _id: '$supplier._id',
          cars: { $push: '$$ROOT' },
          ...(env.SUBSCRIPTION_ACTIVE
            ? { resultsCars: { $first: { $ifNull: ['$resultsCars', 1] } } }
            : {}),
        },
      },
      {
        $project: {
          cars: env.SUBSCRIPTION_ACTIVE
            ? { $slice: ['$cars', '$resultsCars'] }
            : { $slice: ['$cars', suppliers.length > 5 ? 2 : 20] },
        },
      },
      { $unwind: '$cars' },
      { $replaceRoot: { newRoot: '$cars' } },

      // ── Pagination + tri
      {
        $facet: {
          resultData: [
            { $sort: { dailyPriceWithDiscount: 1, supplierReservationCount: 1 } },
            { $skip: (page - 1) * size },
            { $limit: size },
          ],
          pageInfo: [{ $count: 'totalRecords' }],
        },
      },
    ]

    const data = await Car.aggregate(pipeline, {
      collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 },
    })

    const formattedData = data.map((aggregationResult) => ({
      pageInfo: aggregationResult.pageInfo || [],
      resultData: aggregationResult.resultData.map((car: bookcarsTypes.Car) => ({
        ...car,
        supplier: {
          _id: car.supplier._id,
          fullName: car.supplier.fullName,
          avatar: car.supplier.avatar,
          score: car.supplier.score, // peut être undefined/null (nouvelles agences)
        },
      })),
    }))

    // Logging asynchrone (CarStats)
    if (formattedData[0]?.resultData) {
      const statsData = formattedData[0].resultData.map((car: bookcarsTypes.Car) => {
        const timeDiff = endDateObj.getTime() - startDateObj.getTime()
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1

        return {
          car: car._id,
          supplier: car.supplier._id,
          pickupLocation: body.pickupLocation,
          startDate: startDateObj,
          endDate: endDateObj,
          viewedAt: new Date(),
          days,
          paidView: false,
          clientId: req.signedCookies.clientId,
        }
      })

      CarStats.insertMany(statsData).catch((err) => logger.error('Error logging car stats:', err))
    }

    return res.json(formattedData)
  } catch (err: any) {
    logger.error(`[car.getFrontendCars] Error: ${err.message}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err.message)
  }
}

export const getFrontendBoostedCars = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetCarsPayload } = req
    const page = Number.parseInt(req.params.page, 10)
    const size = 1 // Taille de page (peut devenir paramétrable)

    const pickupLocation = new mongoose.Types.ObjectId(body.pickupLocation)

    const {
      startDate,
      endDate,
      minPrice,
      maxPrice,
    } = body

    // Fenêtre de recherche demandée par le client
    const startDateObj = new Date(startDate || Date.now())
    const endDateObj = new Date(endDate || Date.now())

    // Période "haute saison" (ex : été) — à externaliser en config si possible
    const restrictedStartDate = new Date('2025-06-01')
    const restrictedEndDate = new Date('2025-09-15')

    // --- 1) Filtre de base (uniquement voitures boost actives & non en pause, dispos et à l'agence cherchée)
    const $match: mongoose.FilterQuery<bookcarsTypes.Car> = {
      $and: [
        { locations: pickupLocation },
        { available: true },
        { 'boost.active': true },
        { 'boost.paused': false },

        // --- 1.b) Budget Boost : N'AFFICHE que les voitures qui ont encore des vues (ou illimitées)
        {
          $or: [
            // illimité
            { 'boost.purchasedViews': -1 },
            // consommé < acheté, avec garde-fous null/undefined
            {
              $expr: {
                $lt: [
                  { $ifNull: ['$boost.consumedViews', 0] },
                  { $ifNull: ['$boost.purchasedViews', 0] },
                ],
              },
            },
          ],
        },
      ],
    }

    // --- 2) Définition du pipeline d'agrégation
    const pipeline: mongoose.PipelineStage[] = [
      { $match },

      // Récupérer le fournisseur (User) pour la voiture
      {
        $lookup: {
          from: 'User',
          let: { userId: '$supplier' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
          ],
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },

      // Compter les réservations du fournisseur (info de contexte, pas de filtre)
      {
        $lookup: {
          from: 'Booking',
          let: { supplierId: '$supplier._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$supplier', '$$supplierId'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $ne: ['$status', 'void'] },
                  ],
                },
              },
            },
          ],
          as: 'supplierBookings',
        },
      },
      { $addFields: { supplierReservationCount: { $size: '$supplierBookings' } } },

      // Vérifier les conflits de réservations sur LA voiture dans la période demandée
      {
        $lookup: {
          from: 'Booking',
          let: { carId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$car', '$$carId'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $ne: ['$status', 'void'] },
                    { $lt: ['$from', endDateObj] }, // début reservation existante < fin demandée
                    { $gt: ['$to', startDateObj] }, // fin reservation existante > début demandée
                  ],
                },
              },
            },
          ],
          as: 'conflictingBookings',
        },
      },
      { $addFields: { hasConflict: { $gt: [{ $size: '$conflictingBookings' }, 0] } } },
      { $match: { hasConflict: false } }, // Exclure les voitures avec collision

      // Indisponibilités manuelles
      { $addFields: { unavailablePeriods: { $ifNull: ['$unavailablePeriods', []] } } },
      {
        $addFields: {
          isUnavailable: {
            $anyElementTrue: {
              $map: {
                input: '$unavailablePeriods',
                as: 'period',
                in: {
                  $and: [
                    { $lte: ['$$period.startDate', endDateObj] },
                    { $gte: ['$$period.endDate', startDateObj] },
                  ],
                },
              },
            },
          },
        },
      },
      { $match: { isUnavailable: false } },

      // Calcul du dailyPrice effectif (périodique prioritaire si chevauchement)
      {
        $addFields: {
          dailyPrice: {
            $let: {
              vars: {
                periodicPrices: { $ifNull: ['$periodicPrices', []] },
                periodicPrice: {
                  $filter: {
                    input: '$periodicPrices',
                    as: 'period',
                    cond: {
                      $and: [
                        { $lte: ['$$period.startDate', endDateObj] },
                        { $gte: ['$$period.endDate', startDateObj] },
                      ],
                    },
                  },
                },
              },
              in: {
                $cond: {
                  if: { $gt: [{ $size: { $ifNull: ['$$periodicPrice', []] } }, 0] },
                  then: { $arrayElemAt: ['$$periodicPrice.dailyPrice', 0] }, // Premier match périodique
                  else: '$dailyPrice',
                },
              },
            },
          },
        },
      },

      // Application d'une éventuelle remise (si seuil de jours atteint)
      {
        $addFields: {
          dailyPriceWithDiscount: {
            $cond: {
              if: {
                $and: [
                  { $ne: [{ $ifNull: ['$discounts', null] }, null] },
                  { $ne: ['$discounts.percentage', null] },
                  { $ne: ['$discounts.threshold', null] },
                  {
                    $gte: [
                      { $ceil: { $divide: [{ $subtract: [endDateObj, startDateObj] }, 1000 * 60 * 60 * 24] } },
                      '$discounts.threshold',
                    ],
                  },
                ],
              },
              then: {
                $multiply: [
                  '$dailyPrice',
                  { $subtract: [1, { $divide: ['$discounts.percentage', 100] }] },
                ],
              },
              else: '$dailyPrice',
            },
          },
        },
      },

      // Filtre prix min/max demandé par le client
      { $match: { dailyPriceWithDiscount: { $gte: minPrice, $lte: maxPrice } } },

      // Règles "haute saison" : si chevauchement été → periodicPrices non vide + prix min 110
      {
        $match: {
          $expr: {
            $or: [
              // 1) Période demandée entièrement en dehors de l'été
              {
                $or: [
                  { $lte: [endDateObj, restrictedStartDate] },
                  { $gte: [startDateObj, restrictedEndDate] },
                ],
              },
              // 2) Période demandée chevauche l'été → exigences supplémentaires
              {
                $and: [
                  { $lt: [startDateObj, restrictedEndDate] },
                  { $gt: [endDateObj, restrictedStartDate] },
                  { $gt: [{ $size: { $ifNull: ['$periodicPrices', []] } }, 0] },
                  { $gte: ['$dailyPriceWithDiscount', 110] },
                ],
              },
            ],
          },
        },
      },

      // --- 3) Tri par rotation boost (les moins récemment vus d'abord)
      { $sort: { 'boost.lastViewAt': 1 } },

      // --- 4) Diversité par fournisseur (groupage puis "unwind")
      {
        $group: {
          _id: '$supplier._id',
          cars: { $push: '$$ROOT' },
        },
      },
      // Astuce optionnelle : limiter le nombre de voitures par fournisseur
      // {
      //   $project: {
      //     cars: { $slice: ['$cars', 2] }, // ex: garder 2 voitures max par supplier
      //   },
      // },
      { $unwind: '$cars' },
      { $replaceRoot: { newRoot: '$cars' } },

      // --- 5) Pagination
      {
        $facet: {
          resultData: [
            { $sort: { 'boost.lastViewAt': 1 } }, // cohérent avec la rotation
            { $skip: (page - 1) * size },
            { $limit: size },
          ],
          pageInfo: [
            { $count: 'totalRecords' },
          ],
        },
      },
    ]

    const data = await Car.aggregate(pipeline, {
      collation: { locale: env.DEFAULT_LANGUAGE, strength: 2 },
    })

    // Mise en forme de la réponse : ne renvoyer que les champs utiles du supplier
    const formattedData = data.map((aggregationResult) => ({
      pageInfo: aggregationResult.pageInfo || [],
      resultData: aggregationResult.resultData.map((car: bookcarsTypes.Car) => ({
        ...car,
        supplier: {
          _id: car.supplier._id,
          fullName: car.supplier.fullName,
          avatar: car.supplier.avatar,
          score: car.supplier.score,
        },
      })),
    }))

    // --- 6) Logging & conso des vues Boost (après avoir déterminé les résultats affichés)
    if (formattedData[0]?.resultData?.length) {
      // Calcul précis du nombre de jours affichés
      const timeDiff = endDateObj.getTime() - startDateObj.getTime()
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1

      // Préparer stats d'affichage
      const statsData = formattedData[0].resultData.map((car: bookcarsTypes.Car) => ({
        car: car._id,
        supplier: car.supplier._id,
        pickupLocation: body.pickupLocation,
        startDate: startDateObj,
        endDate: endDateObj,
        viewedAt: new Date(),
        days,
        paidView: true,
        clientId: req.signedCookies.clientId,
      }))

      // Incrémenter consumedViews + maj lastViewAt UNIQUEMENT si budget encore dispo (ou illimité)
      const carIds = formattedData[0].resultData.map((car: bookcarsTypes.Car) => car._id)
      await Car.updateMany(
        {
          _id: { $in: carIds },
          'boost.active': true,
          'boost.paused': false,
          $or: [
            { 'boost.purchasedViews': -1 },
            {
              $expr: {
                $lt: [
                  { $ifNull: ['$boost.consumedViews', 0] },
                  { $ifNull: ['$boost.purchasedViews', 0] },
                ],
              },
            },
          ],
        },
        {
          $inc: { 'boost.consumedViews': 1 },
          $set: { 'boost.lastViewAt': new Date() },
        },
      ).catch((err) => logger.error('Error updating consumed views:', err))

      // Logger la vue (stats)
      CarStats.insertMany(statsData)
        .catch((err) => logger.error('Error logging car stats:', err))
    }

    return res.json(formattedData)
  } catch (err: any) {
    logger.error(`[car.getFrontendCars] Error: ${err.message}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err.message)
  }
}
