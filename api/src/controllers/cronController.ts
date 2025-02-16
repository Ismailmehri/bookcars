import { Request, Response } from 'express'
import nodemailer from 'nodemailer'
import * as bookcarsTypes from ':bookcars-types'
import User from '../models/User'
import Car from '../models/Car'
import i18n from '../lang/i18n'
import * as mailHelper from '../common/mailHelper'
import * as env from '../config/env.config'
import * as logger from '../common/logger'
import Booking from '../models/Booking'
import { CDN_CARS_API } from '../config/env.config'
import * as helper from '../common/helper'

/**
 * Notify Suppliers who haven't added cars after one week.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const notifySuppliersWithoutCars = async (req: Request, res: Response) => {
  try {
      // Récupérer les paramètres de l'URL
      const shouldSendMail = req.query.mail === 'true' // Contrôler l'envoi des e-mails
      const limit = parseInt(req.query.limit as string, 10) // Limite d'e-mails à envoyer

      // Valider que limit est un nombre valide (positif ou 0)
      if (Number.isNaN(limit) || limit < 0) {
          return res.status(400).json({ message: 'Invalid limit parameter. It must be a positive number or 0.' })
      }

      // Get the current date and subtract one week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      // Find suppliers registered more than one week ago
      const suppliers = await User.find({
          type: bookcarsTypes.UserType.Supplier,
          createdAt: { $lte: oneWeekAgo },
      })

      // Liste des fournisseurs sans voitures
      const suppliersWithoutCars: { email: string; fullName: string; active: boolean; verified: boolean }[] = []

      // Compteur pour suivre le nombre d'e-mails envoyés
      let emailsSent = 0

      for (const supplier of suppliers) {
          // Si la limite est atteinte (et limit !== 0), arrêter l'envoi des e-mails
          if (limit !== 0 && emailsSent >= limit) {
              break
          }

          // Vérifier si le fournisseur a ajouté des voitures
          const carsCount = await Car.countDocuments({ supplier: supplier._id })

          if (carsCount === 0) {
              // Ajouter les informations du fournisseur à la liste
              suppliersWithoutCars.push({
                  email: supplier.email,
                  fullName: supplier.fullName,
                  active: supplier.active || false,
                  verified: supplier.verified || false,
              })

              // Envoyer un e-mail de rappel uniquement si mail=true, et si le fournisseur est actif et vérifié
              if (shouldSendMail && supplier.active && supplier.verified) {
                  i18n.locale = supplier.language || 'fr' // Utiliser le français par défaut si la langue n'est pas définie
                  const mailOptions: nodemailer.SendMailOptions = {
                      from: env.SMTP_FROM,
                      to: supplier.email,
                      subject: i18n.t('SUPPLIER_REMINDER_SUBJECT'), // Ajoutez ce sujet dans vos fichiers de langue
                      html: `
                          <table style="width: 100%; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                              <tr>
                                  <td style="text-align: center; padding: 20px;">
                                      <h1 style="color: #007BFF;">${i18n.t('WELCOME_TO_PLANY')}</h1>
                                  </td>
                              </tr>
                              <tr>
                                  <td style="padding: 20px;">
                                      <p>${i18n.t('HELLO')} <strong>${supplier.fullName}</strong>,</p>
                                      <p>${i18n.t('WELCOME_MESSAGE')}</p>
                                      <p>${i18n.t('NOTICE_MISSING_CARS')}</p>
                                      <p><strong>${i18n.t('ADD_YOUR_CARS_NOW')}</strong></p>
                                      <p style="text-align: center; margin: 20px 0;">
                                          <a href="https://admin.plany.tn" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                                              ${i18n.t('ADD_NOW_BUTTON')}
                                          </a>
                                      </p>
                                      <p>${i18n.t('WATCH_TUTORIAL')}:</p>
                                      <p style="text-align: center; margin: 20px 0;">
                                          <a href="https://youtu.be/WEViB9spCeA?si=MuLu9MdpH36gws4j" style="text-decoration: underline; color: #007BFF;">
                                              ${i18n.t('WATCH_VIDEO')}
                                          </a>
                                      </p>
                                      <p><strong>${i18n.t('DONT_MISS_OPPORTUNITY')}</strong></p>
                                      <hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">
                                      <p>${i18n.t('CONTACT_US')} <a href="mailto:contact@plany.tn" style="color: #007BFF;">contact@plany.tn</a>.</p>
                                      <p>${i18n.t('THANK_YOU')}</p>
                                      <p style="margin-top: 30px; text-align: center;">
                                          <a href="https://plany.tn" style="color: #007BFF;">${i18n.t('VISIT_PLANY')}</a>
                                      </p>
                                  </td>
                              </tr>
                          </table>
                      `,
                  }

                  await mailHelper.sendMail(mailOptions)
                  logger.info(`Reminder email sent to supplier: ${supplier.email}`)
                  emailsSent += 1 // Incrémenter le compteur d'e-mails envoyés
              }
          }
      }

      // Retourner la liste des fournisseurs sans voitures
      return res.status(200).json({
          message: shouldSendMail
              ? `Reminder emails sent to ${emailsSent} suppliers without cars`
              : 'Suppliers without cars retrieved',
          suppliersWithoutCars,
      })
  } catch (err) {
      logger.error(`[notification.notifySuppliersWithoutCars] ${i18n.t('DB_ERROR')}`, err)
      return res.status(500).send(i18n.t('DB_ERROR') + err)
  }
}

  /**
 * Notify Suppliers who haven't added a phone number.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
  export const notifySuppliersWithoutPhone = async (req: Request, res: Response) => {
    try {
        // Récupérer les paramètres de l'URL
        const shouldSendMail = req.query.mail === 'true' // Contrôler l'envoi des e-mails
        const limit = parseInt(req.query.limit as string, 10) // Limite d'e-mails à envoyer

        // Valider que limit est un nombre valide (positif ou 0)
        if (Number.isNaN(limit) || limit < 0) {
            return res.status(400).json({ message: 'Invalid limit parameter. It must be a positive number or 0.' })
        }

        // Trouver les fournisseurs sans numéro de téléphone
        const suppliers = await User.find({
            type: bookcarsTypes.UserType.Supplier,
            $or: [
                { phone: { $exists: false } }, // Champ inexistant
                { phone: null }, // Champ null
                { phone: '' }, // Chaîne vide
            ],
        })

        // Liste des fournisseurs sans numéro de téléphone
        const suppliersWithoutPhone: { email: string; fullName: string; active: boolean; verified: boolean }[] = []

        // Compteur pour suivre le nombre d'e-mails envoyés
        let emailsSent = 0

        for (const supplier of suppliers) {
            // Si la limite est atteinte (et limit !== 0), arrêter l'envoi des e-mails
            if (limit !== 0 && emailsSent >= limit) {
                break
            }

            // Ajouter les informations du fournisseur à la liste
            suppliersWithoutPhone.push({
                email: supplier.email,
                fullName: supplier.fullName,
                active: supplier.active || false,
                verified: supplier.verified || false,
            })

            // Envoyer un e-mail de rappel uniquement si mail=true, et si le fournisseur est actif et vérifié
            if (shouldSendMail && supplier.active && supplier.verified) {
                i18n.locale = supplier.language || 'fr' // Utiliser le français par défaut si la langue n'est pas définie
                const mailOptions: nodemailer.SendMailOptions = {
                    from: env.SMTP_FROM,
                    to: supplier.email,
                    subject: i18n.t('SUPPLIER_PHONE_REMINDER_SUBJECT'), // Ajoutez ce sujet dans vos fichiers de langue
                    html: `
                        <table style="width: 100%; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <tr>
                                <td style="text-align: center; padding: 20px;">
                                    <h1 style="color: #007BFF;">${i18n.t('WELCOME_TO_PLANY')}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px;">
                                    <p>${i18n.t('HELLO')} <strong>${supplier.fullName}</strong>,</p>
                                    <p>${i18n.t('SUPPLIER_PHONE_REMINDER_MESSAGE')}</p>
                                    <p><strong>${i18n.t('ADD_YOUR_PHONE_NOW')}</strong></p>
                                    <p style="text-align: center; margin: 20px 0;">
                                        <a href="https://admin.plany.tn/settings" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                                            ${i18n.t('UPDATE_PROFILE_BUTTON')}
                                        </a>
                                    </p>
                                    <p>${i18n.t('CONTACT_US')} <a href="mailto:contact@plany.tn" style="color: #007BFF;">contact@plany.tn</a>.</p>
                                    <p>${i18n.t('THANK_YOU')}</p>
                                    <p style="margin-top: 30px; text-align: center;">
                                        <a href="https://plany.tn" style="color: #007BFF;">${i18n.t('VISIT_PLANY')}</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    `,
                }

                await mailHelper.sendMail(mailOptions)
                logger.info(`Reminder email sent to supplier (no phone): ${supplier.email}`)
                emailsSent += 1 // Incrémenter le compteur d'e-mails envoyés
            }
        }

        // Retourner la liste des fournisseurs sans numéro de téléphone
        return res.status(200).json({
            message: shouldSendMail
                ? `Reminder emails sent to ${emailsSent} suppliers without phone numbers`
                : 'Suppliers without phone numbers retrieved',
            suppliersWithoutPhone,
        })
    } catch (err) {
        logger.error(`[notification.notifySuppliersWithoutPhone] ${i18n.t('DB_ERROR')}`, err)
        return res.status(500).send(i18n.t('DB_ERROR') + err)
    }
}

  /**
 * Notify Clients who haven't added a phone number.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
  export const notifyClientsWithoutPhone = async (req: Request, res: Response) => {
    try {
        // Récupérer les paramètres de l'URL
        const shouldSendMail = req.query.mail === 'true' // Contrôler l'envoi des e-mails
        const limit = parseInt(req.query.limit as string, 10) // Limite d'e-mails à envoyer

        // Valider que limit est un nombre valide (positif ou 0)
        if (Number.isNaN(limit) || limit < 0) {
            return res.status(400).json({ message: 'Invalid limit parameter. It must be a positive number or 0.' })
        }

        // Trouver les clients sans numéro de téléphone
        const clients = await User.find({
            type: bookcarsTypes.UserType.User,
            $or: [
                { phone: { $exists: false } }, // Champ inexistant
                { phone: null }, // Champ null
                { phone: '' }, // Chaîne vide
            ],
        })

        // Liste des clients sans numéro de téléphone
        const clientsWithoutPhone: { email: string; fullName: string }[] = []

        // Compteur pour suivre le nombre d'e-mails envoyés
        let emailsSent = 0

        for (const client of clients) {
            // Si la limite est atteinte (et limit !== 0), arrêter l'envoi des e-mails
            if (limit !== 0 && emailsSent >= limit) {
                break
            }

            // Ajouter les informations du client à la liste
            clientsWithoutPhone.push({
                email: client.email,
                fullName: client.fullName,
            })

            // Envoyer un e-mail de rappel uniquement si mail=true
            if (shouldSendMail && client.active && client.verified) {
                i18n.locale = client.language || 'fr' // Utiliser le français par défaut si la langue n'est pas définie
                const mailOptions: nodemailer.SendMailOptions = {
                    from: env.SMTP_FROM,
                    to: client.email,
                    subject: i18n.t('CLIENT_PHONE_REMINDER_SUBJECT'), // Ajoutez ce sujet dans vos fichiers de langue
                    html: `
                        <table style="width: 100%; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <tr>
                                <td style="text-align: center; padding: 20px;">
                                    <h3 style="color: #007BFF;">${i18n.t('WELCOME_TO_PLANY')}</h3>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px;">
                                    <p>${i18n.t('HELLO')} <strong>${client.fullName}</strong>,</p>
                                    <p>${i18n.t('CLIENT_PHONE_REMINDER_MESSAGE')}</p>
                                    <p><strong>${i18n.t('CLIENT_ADD_YOUR_PHONE_NOW')}</strong></p>
                                    <p style="text-align: center; margin: 20px 0;">
                                        <a href="https://plany.tn/settings" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                                            ${i18n.t('CLIENT_UPDATE_PROFILE_BUTTON')}
                                        </a>
                                    </p>
                                    <p>${i18n.t('THANK_YOU')}</p>
                                    <p style="margin-top: 30px; text-align: center;">
                                        <a href="https://plany.tn" style="color: #007BFF;">${i18n.t('VISIT_PLANY')}</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    `,
                }

                await mailHelper.sendMail(mailOptions)
                logger.info(`Reminder email sent to client (no phone): ${client.email}`)
                emailsSent += 1 // Incrémenter le compteur d'e-mails envoyés
            }
        }

        // Retourner la liste des clients sans numéro de téléphone
        return res.status(200).json({
            message: shouldSendMail
                ? `Reminder emails sent to ${emailsSent} clients without phone numbers`
                : 'Clients without phone numbers retrieved',
            clientsWithoutPhone,
        })
    } catch (err) {
        logger.error(`[notification.notifyClientsWithoutPhone] ${i18n.t('DB_ERROR')}`, err)
        return res.status(500).send(i18n.t('DB_ERROR') + err)
    }
}

  /**
   * Notify Suppliers with pending bookings older than two days.
   *
   * @export
   * @async
   * @param {Request} req
   * @param {Response} res
   * @returns {unknown}
   */
  export const notifySuppliersWithPendingBookings = async (req: Request, res: Response) => {
    try {
        // Récupérer les paramètres de l'URL
        const shouldSendMail = req.query.mail === 'true' // Contrôler l'envoi des e-mails
        const days = parseInt(req.query.days as string, 10) || 2 // Nombre de jours (par défaut 2)
        const limit = parseInt(req.query.limit as string, 10) // Limite d'e-mails à envoyer

        // Valider que limit est un nombre valide (positif ou 0)
        if (Number.isNaN(limit) || limit < 0) {
            return res.status(400).json({ message: 'Invalid limit parameter. It must be a positive number or 0.' })
        }

        // Calculer la date en soustrayant le nombre de jours spécifié
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() - days)

        // Trouver les réservations avec le statut "pending" créées avant la date cible
        const pendingBookings = await Booking.find({
            status: 'pending',
            createdAt: { $lte: targetDate },
        })
            .populate<{ supplier: bookcarsTypes.User }>('supplier')
            .populate<{ driver: bookcarsTypes.User }>('driver') // Récupérer les informations du client

        // Utiliser un Set pour éviter les doublons de fournisseurs
        const uniqueSuppliers = new Set<string>()

        // Liste des fournisseurs avec des réservations en attente
        const suppliersWithPendingBookings: { email: string | undefined; phone: string | undefined; fullName: string }[] = []

        // Compteur pour suivre le nombre d'e-mails envoyés
        let emailsSent = 0

        for (const booking of pendingBookings) {
            // Si la limite est atteinte (et limit !== 0), arrêter l'envoi des e-mails
            if (limit !== 0 && emailsSent >= limit) {
                break
            }

            if (booking.supplier && booking.supplier._id && !uniqueSuppliers.has(booking.supplier._id.toString())) {
                uniqueSuppliers.add(booking.supplier._id.toString())

                // Ajouter les informations du fournisseur à la liste
                suppliersWithPendingBookings.push({
                    email: booking.supplier.email,
                    phone: booking.supplier.phone,
                    fullName: booking.supplier.fullName,
                })

                // Envoyer un e-mail de rappel uniquement si mail=true
                if (shouldSendMail) {
                    // Récupérer les informations du client (driver)
                    const clientEmail = booking.driver?.email || 'Non disponible'
                    const clientPhone = booking.driver?.phone || 'Non disponible'

                    // Envoyer un e-mail au fournisseur
                    i18n.locale = booking.supplier.language ? booking.supplier.language : 'fr'
                    const mailOptions: nodemailer.SendMailOptions = {
                        from: env.SMTP_FROM,
                        to: booking.supplier.email,
                        subject: i18n.t('SUPPLIER_PENDING_BOOKING_REMINDER_SUBJECT'),
                        html: `
                            <table style="width: 100%; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p>${i18n.t('HELLO')} <strong>${booking.supplier.fullName}</strong>,</p>
                                        <p>${i18n.t('SUPPLIER_PENDING_BOOKING_REMINDER_MESSAGE')}</p>
                                        <p><strong>${i18n.t('BOOKING_DETAILS')}:</strong></p>
                                        <ul>
                                            <li>${i18n.t('CLIENT_FULLNAME')}: ${booking.driver?.fullName}</li>
                                            <li>${i18n.t('FROM_RESERVATION')}: ${new Date(booking.from).toLocaleString()}</li>
                                            <li>${i18n.t('TO_RESERVATION')}: ${new Date(booking.to).toLocaleString()}</li>
                                            <li>${i18n.t('CLIENT_EMAIL')}: ${clientEmail}</li>
                                            <li>${i18n.t('CLIENT_PHONE')}: ${clientPhone}</li>
                                        </ul>
                                        <p style="text-align: center; margin: 20px 0;">
                                            <a href="https://admin.plany.tn" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                                                ${i18n.t('VIEW_BOOKING_BUTTON')}
                                            </a>
                                        </p>
                                        <p>${i18n.t('THANK_YOU')}</p>
                                        <p style="margin-top: 30px; text-align: center;">
                                            <a href="https://plany.tn" style="color: #007BFF;">${i18n.t('VISIT_PLANY')}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        `,
                    }

                    await mailHelper.sendMail(mailOptions)
                    logger.info(`Reminder email sent to supplier (pending booking): ${booking.supplier.email}`)
                    emailsSent += 1 // Incrémenter le compteur d'e-mails envoyés
                }
            }
        }

        // Retourner la liste des fournisseurs avec des réservations en attente
        return res.status(200).json({
            message: shouldSendMail
                ? `Reminder emails sent to ${emailsSent} suppliers with pending bookings`
                : 'Suppliers with pending bookings retrieved',
            suppliersWithPendingBookings,
        })
    } catch (err) {
        logger.error(`[notification.notifySuppliersWithPendingBookings] ${i18n.t('DB_ERROR')}`, err)
        return res.status(500).send(i18n.t('DB_ERROR') + err)
    }
}

/**
 * Notify Suppliers who haven't configured high season prices (July and August).
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const notifySuppliersWithoutHighSeasonPrices = async (req: Request, res: Response) => {
  try {
      // Récupérer les paramètres de l'URL
      const shouldSendMail = req.query.mail === 'true'
      const limit = parseInt(req.query.limit as string, 10) // Récupérer et convertir le paramètre limit en nombre

      // Valider que limit est un nombre valide (positif ou 0)
      if (Number.isNaN(limit) || limit < 0) {
          return res.status(400).json({ message: 'Invalid limit parameter. It must be a positive number or 0.' })
      }

      // Dates clés pour vérifier les prix de haute saison (5 juillet et 5 août)
      const julyDate = new Date(new Date().getFullYear(), 6, 5) // 5 juillet
      const augustDate = new Date(new Date().getFullYear(), 7, 5) // 5 août

      // Récupérer toutes les agences
      const suppliers = await User.find({ type: bookcarsTypes.UserType.Supplier })

      // Liste des fournisseurs sans prix de haute saison
      const suppliersWithoutHighSeasonPrices: { email: string; phone: string | undefined; fullName: string }[] = []

      // Compteur pour suivre le nombre d'e-mails envoyés
      let emailsSent = 0

      for (const supplier of suppliers) {
          // Si la limite est atteinte (et limit !== 0), arrêter l'envoi des e-mails
          if (limit !== 0 && emailsSent >= limit) {
              break
          }

          // Récupérer toutes les voitures de l'agence
          const cars = await Car.find({ supplier: supplier._id })

          // Si l'agence n'a pas encore ajouté de voitures, passer à l'agence suivante
          if (cars && cars.length > 0) {
              let hasHighSeasonPrices = false

              for (const car of cars) {
                  if (car.periodicPrices && car.periodicPrices.length > 0) {
                      for (const period of car.periodicPrices) {
                          // Vérifier que startDate et endDate ne sont pas null
                          if (period.startDate && period.endDate) {
                              const startDate = new Date(period.startDate)
                              const endDate = new Date(period.endDate)

                              // Vérifier si la période couvre le 5 juillet ou le 5 août
                              if (
                                  (julyDate >= startDate && julyDate <= endDate)
                                  || (augustDate >= startDate && augustDate <= endDate)
                              ) {
                                  hasHighSeasonPrices = true
                                  break // Pas besoin de vérifier les autres périodes
                              }
                          }
                      }

                      if (hasHighSeasonPrices) {
                          break // Pas besoin de vérifier les autres voitures
                      }
                  }
              }

              // Si aucune voiture n'a de prix pour juillet ou août, ajouter le fournisseur à la liste
              if (!hasHighSeasonPrices) {
                  // Ajouter un objet contenant email, phone et fullName
                  suppliersWithoutHighSeasonPrices.push({
                      email: supplier.email,
                      phone: supplier.phone,
                      fullName: supplier.fullName,
                  })

                  // Envoyer un e-mail de rappel uniquement si mail=true
                  if (shouldSendMail) {
                      // Récupérer l'image de la première voiture sans prix de haute saison
                      const firstCar = cars[0]
                      const carImageUrl = firstCar.image
                          ? `${CDN_CARS_API}/${firstCar.image}` // Utilisation de CDN_CARS_API
                          : 'https://via.placeholder.com/300' // Image par défaut si aucune image n'est disponible

                      i18n.locale = supplier.language || 'fr' // Utiliser le français par défaut si la langue n'est pas définie
                      const mailOptions: nodemailer.SendMailOptions = {
                          from: env.SMTP_FROM,
                          to: supplier.email,
                          subject: i18n.t('SUPPLIER_HIGH_SEASON_REMINDER_SUBJECT'),
                          html: `
                              <table style="width: 100%; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                                  <tr>
                                      <td style="text-align: center; padding: 20px;">
                                          <h1 style="color: #007BFF;">${i18n.t('WELCOME_TO_PLANY')}</h1>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding: 20px;">
                                          <p>${i18n.t('HELLO')} <strong>${supplier.fullName}</strong>,</p>
                                          <p>${i18n.t('SUPPLIER_HIGH_SEASON_REMINDER_MESSAGE')}</p>
                                          <p><strong>${i18n.t('ADD_HIGH_SEASON_PRICES_NOW')}</strong></p>
                                          <div style="text-align: center; margin: 20px 0;">
                                              <img src="${carImageUrl}" alt="Car Image" style="max-width: 100%; height: auto; border-radius: 10px;">
                                          </div>
                                          <p style="text-align: center; margin: 20px 0;">
                                              <a href="https://admin.plany.tn" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; display: inline-block; width: 265px; text-align: center;">
                                                  ${i18n.t('UPDATE_PRICES_BUTTON')}
                                              </a>
                                          </p>
                                          <p>${i18n.t('THANK_YOU')}</p>
                                          <p style="text-align: center; margin: 20px 0;">
                                              <a href="https://youtu.be/FwzTmx_ia6c?si=H-3ar72zJdh6bZeK" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; display: inline-block; width: 265px; text-align: center;">
                                                  ${i18n.t('WATCH_HOW_TO_ADD_DATES')}
                                              </a>
                                          </p>
                                      </td>
                                  </tr>
                              </table>
                          `,
                      }

                      await mailHelper.sendMail(mailOptions)
                      logger.info(`Reminder email sent to supplier (high season prices): ${supplier.email}`)
                      emailsSent += 1 // Incrémenter le compteur d'e-mails envoyés
                  }
              }
          }
      }

      // Retourner la liste des fournisseurs sans prix de haute saison
      return res.status(200).json({
          message: shouldSendMail
              ? `Reminder emails sent to ${emailsSent} suppliers without high season prices`
              : 'Suppliers without high season prices retrieved',
          suppliersWithoutHighSeasonPrices,
      })
  } catch (err) {
      logger.error(`[notification.notifySuppliersWithoutHighSeasonPrices] ${i18n.t('DB_ERROR')}`, err)
      return res.status(500).send(i18n.t('DB_ERROR') + err)
  }
}

/**
 * Calculate agency scores and notify agencies with low scores.
 *
 * @export
 * @async
 * @param {Request} req
 * @param {Response} res
 * @returns {unknown}
 */
export const notifyAgenciesWithLowScores = async (req: Request, res: Response) => {
    try {
      // Récupérer les paramètres de l'URL
      const shouldSendMail = req.query.mail === 'true' // Contrôler l'envoi des e-mails
      const limit = parseInt(req.query.limit as string, 10) // Limite d'e-mails à envoyer
      const minScoreThreshold = parseInt(req.query.minScore as string, 10) || 50 // Seuil de score minimum (par défaut 50)
      const maxScoreThreshold = parseInt(req.query.maxScore as string, 10) || 100 // Seuil de score minimum (par défaut 50)

      // Valider que limit est un nombre valide (positif ou 0)
      if (Number.isNaN(limit) || limit < 0) {
        return res.status(400).json({ message: 'Invalid limit parameter. It must be a positive number or 0.' })
      }

      // Récupérer toutes les agences
      const agencies = await User.find({ type: bookcarsTypes.UserType.Supplier }) as bookcarsTypes.User[]

      // Liste des agences avec un score faible
      const agenciesWithLowScores: { email: string; fullName: string; score: number; recommendations: string[] }[] = []

      // Compteur pour suivre le nombre d'e-mails envoyés
      let emailsSent = 0

      for (const agency of agencies) {
        // Si la limite est atteinte (et limit !== 0), arrêter l'envoi des e-mails
        if (limit !== 0 && emailsSent >= limit) {
          break
        }

        // Récupérer les réservations et les voitures de l'agence
        const bookings = await Booking.find({ supplier: agency._id }) as bookcarsTypes.Booking[]
        const cars = (await Car.find({ supplier: agency._id }) as bookcarsTypes.Car[]).filter((car) => car.available)
        const scoreBreakdown = helper.calculateAgencyScore(agency, bookings, cars)

        // Si le score est inférieur au seuil, ajouter l'agence à la liste
        if (scoreBreakdown.total > minScoreThreshold && scoreBreakdown.total <= maxScoreThreshold) {
          agenciesWithLowScores.push({
            email: agency.email || 'info@plany.tn',
            fullName: agency.fullName,
            score: scoreBreakdown.total,
            recommendations: scoreBreakdown.recommendations,
          })

          // Envoyer un e-mail de notification uniquement si mail=true
          const score = scoreBreakdown.total // Le score est disponible ici
          type ScoreInterval = 'low' | 'mediumLow' | 'mediumHigh' | 'high';

          // Définir les messages en fonction des intervalles de score
          const scoreMessages: Record<ScoreInterval, { subject: string; message: (agencyName: string) => string }> = {
            low: {
              subject: 'Votre score est très faible - Action Requise',
              message: (agencyName) => `
                Bonjour ${agencyName},
                Nous avons remarqué que votre score sur notre plateforme est actuellement très faible. Un score plus élevé est essentiel pour maximiser votre visibilité et attirer plus de clients.

              `,
            },
            mediumLow: {
                subject: 'Votre score peut être amélioré - Voici comment',
                message: (agencyName) => `
                  Bonjour ${agencyName},
                  Votre score sur notre plateforme est actuellement en dessous de la moyenne. Bien que cela soit un bon début, il y a encore des opportunités pour améliorer votre visibilité et attirer plus de clients.

              `,
            },
            mediumHigh: {
                subject: 'Votre score est bon - Continuez sur cette voie !',
                message: (agencyName) => `
                  Bonjour ${agencyName},
                  Votre score sur notre plateforme est actuellement bon, ce qui est une excellente nouvelle ! Vous êtes sur la bonne voie pour maximiser votre visibilité et attirer plus de clients.

              `,
            },
            high: {
              subject: 'Félicitations ! Votre score est élevé',
              message: (agencyName) => `
                Bonjour ${agencyName},
                Félicitations ! Votre score sur notre plateforme est actuellement élevé. Cela signifie que vous êtes bien positionné pour attirer plus de clients.
                Continuez sur cette lancée et n'hésitez pas à nous contacter si vous avez des questions ou besoin d'aide.
              `,
            },
          }

          // Déterminer l'intervalle de score
          let interval: ScoreInterval
          if (score < 50) {
            interval = 'low'
          } else if (score >= 50 && score < 65) {
            interval = 'mediumLow'
          } else if (score >= 65 && score < 85) {
            interval = 'mediumHigh'
          } else {
            interval = 'high'
          }

          // Récupérer le sujet et la fonction de message en fonction de l'intervalle
          const { subject, message } = scoreMessages[interval]

          // Interpoler les variables dynamiques
          const emailMessage = message(agency.fullName)

          // Envoi de l'e-mail
          if (shouldSendMail && agency.active && agency.verified && cars.length > 0) {
            i18n.locale = agency.language || 'fr' // Utiliser le français par défaut si la langue n'est pas définie

            const mailOptions = {
              from: env.SMTP_FROM,
              to: agency.email,
              subject,
              html: `
                <table style="width: 100%; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <tr>
                    <td style="text-align: center; padding: 20px;">
                      <h2 style="color: #007BFF;">${i18n.t('IMPROVE_YOUR_SCORE')}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px;">
                      <p>${emailMessage}</p>
                      <p><strong>${i18n.t('YOUR_SCORE')}: ${score}/100</strong></p>
                      ${score < 85 ? `<p>${i18n.t('RECOMMENDATIONS')}:</p>
                        <ul>
                          ${scoreBreakdown.recommendations.map((rec) => `<li>${rec}</li>`).join('')}
                        </ul>` : ''}
                      <p style="text-align: center; margin: 20px 0;">
                        <a href="https://admin.plany.tn" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                          ${i18n.t('IMPROVE_SCORE_BUTTON')}
                        </a>
                      </p>
                      <p>${i18n.t('THANK_YOU')}</p>
                    </td>
                  </tr>
                </table>
              `,
            }

            await mailHelper.sendMail(mailOptions)
            logger.info(`Notification email sent to agency (score: ${score}): ${agency.email}`)
            emailsSent += 1 // Incrémenter le compteur d'e-mails envoyés
          }
        }
      }

      // Retourner la liste des agences avec un score faible
      return res.status(200).json({
        message: shouldSendMail
          ? `Notification emails sent to ${emailsSent} agencies with low scores`
          : 'Agencies with low scores retrieved',
        agenciesWithLowScores,
      })
    } catch (err) {
      logger.error(`[notification.notifyAgenciesWithLowScores] ${i18n.t('DB_ERROR')}`, err)
      return res.status(500).send(i18n.t('DB_ERROR') + err)
    }
  }

export const updateSupplierScores = async (req: Request, res: Response) => {
try {
    // Récupérer tous les suppliers
    const suppliers = await User.find({ type: bookcarsTypes.UserType.Supplier }) as bookcarsTypes.User[]

    // Parcourir chaque supplier
    for (const supplier of suppliers) {
    // Récupérer les voitures du supplier
    const cars = (await Car.find({ supplier: supplier._id }) as bookcarsTypes.Car[]).filter((car) => car.available)

    // Vérifier si le supplier a au moins une voiture
    if (cars.length > 0) {
        // Récupérer les réservations du supplier
        const bookings = await Booking.find({ supplier: supplier._id }) as bookcarsTypes.Booking[]

        // Calculer le score du supplier
        const scoreBreakdown = helper.calculateAgencyScore(supplier, bookings, cars)
        const score = scoreBreakdown.total

        const user = await User.findById(supplier._id)
        if (user) {
        user.score = score
        await user.save()
        }

        logger.info(`Score updated for supplier ${supplier.fullName} (ID: ${supplier._id}): ${score}`)
    } else {
        logger.info(`Supplier ${supplier.fullName} (ID: ${supplier._id}) has no cars. Skipping score calculation.`)
    }
    }

    // Retourner une réponse réussie
    return res.status(200).json({ message: 'Supplier scores updated successfully' })
} catch (err) {
    logger.error(`[updateSupplierScores] Error updating supplier scores: ${err}`)
    return res.status(500).json({ message: 'Internal server error', error: err })
}
}
