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
      // Get the current date and subtract one week
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      // Find suppliers registered more than one week ago
      const suppliers = await User.find({
        type: bookcarsTypes.UserType.Supplier,
        createdAt: { $lte: oneWeekAgo },
      })

      for (const supplier of suppliers) {
        // Check if the supplier has added any cars
        const carsCount = await Car.countDocuments({ supplier: supplier._id })

        if (carsCount === 0) {
          // Send a reminder email
          i18n.locale = supplier.language
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
        }
      }

      return res.status(200).json({ message: 'Reminder emails sent successfully' })
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
      // Find suppliers without a phone number
      const suppliers = await User.find({
        type: bookcarsTypes.UserType.Supplier,
        $or: [
            { phone: { $exists: false } }, // Champ inexistant
            { phone: null }, // Champ null
            { phone: '' }, // Chaîne vide
          ],
      })

      for (const supplier of suppliers) {
        i18n.locale = supplier.language
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
      }

      return res.status(200).json({ message: 'Reminder emails sent to suppliers without phone numbers' })
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
      // Find clients without a phone number
      const clients = await User.find({
        type: bookcarsTypes.UserType.User,
        $or: [
            { phone: { $exists: false } }, // Champ inexistant
            { phone: null }, // Champ null
            { phone: '' }, // Chaîne vide
          ],
      })

      for (const client of clients) {
        i18n.locale = client.language
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
      }

      return res.status(200).json({ message: 'Reminder emails sent to clients without phone numbers' })
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
      // Get the current date and subtract two days
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      // Find bookings with status "pending" created more than two days ago
      const pendingBookings = await Booking.find({
        status: 'pending',
        createdAt: { $lte: twoDaysAgo },
      })
        .populate<{ supplier: bookcarsTypes.User }>('supplier')
        .populate<{ driver: bookcarsTypes.User }>('driver') // Récupérer les informations du client

      // Use a Set to avoid duplicate suppliers
      const uniqueSuppliers = new Set<string>()

      for (const booking of pendingBookings) {
        if (booking.supplier && booking.supplier._id && !uniqueSuppliers.has(booking.supplier._id.toString())) {
          uniqueSuppliers.add(booking.supplier._id.toString())

          // Récupérer les informations du client (driver)
          const clientEmail = booking.driver?.email || 'Non disponible'
          const clientPhone = booking.driver?.phone || 'Non disponible'

          // Send a reminder email to the supplier
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
        }
      }

      return res.status(200).json({ message: 'Reminder emails sent to suppliers with pending bookings' })
    } catch (err) {
      logger.error(`[notification.notifySuppliersWithPendingBookings] ${i18n.t('DB_ERROR')}`, err)
      return res.status(500).send(i18n.t('DB_ERROR') + err)
    }
  }
