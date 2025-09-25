import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import * as authHelper from '../common/authHelper'
import * as commissionHelper from '../common/commissionHelper'
import * as helper from '../common/helper'
import * as mailHelper from '../common/mailHelper'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import * as env from '../config/env.config'

const buildReminderHtml = (recipient: bookcarsTypes.User, bookingId: string, type: 'supplier' | 'client') => {
  const baseGreeting = `${i18n.t('HELLO')}${recipient.fullName},`
  const bookingLink = type === 'supplier'
    ? `${env.BACKEND_HOST}/update-booking?b=${bookingId}`
    : `${env.FRONTEND_HOST}/booking/${bookingId}`

  const actionLabel = type === 'supplier'
    ? i18n.t('COMMISSION_SUPPLIER_ACTION')
    : i18n.t('COMMISSION_CLIENT_ACTION')

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <p>${baseGreeting}</p>
      <p>${type === 'supplier'
        ? i18n.t('COMMISSION_SUPPLIER_MESSAGE', { bookingId })
        : i18n.t('COMMISSION_CLIENT_MESSAGE', { bookingId })}</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${bookingLink}" style="background-color: #0066cc; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none;">
          ${actionLabel}
        </a>
      </p>
      <p>${i18n.t('REGARDS')}<br />Plany</p>
    </div>
  `
}

const sendReminder = async (bookingId: string, type: 'supplier' | 'client') => {
  const booking = await Booking.findById(bookingId).populate(['supplier', 'driver'])
  if (!booking) {
    return null
  }

  const supplier = booking.supplier as bookcarsTypes.User
  const driver = booking.driver as bookcarsTypes.User

  if (!supplier || !driver) {
    return null
  }

  const recipient = type === 'supplier' ? supplier : driver
  if (!recipient.email) {
    return null
  }

  i18n.locale = recipient.language || env.DEFAULT_LANGUAGE

  const bookingId = booking._id.toString()

  const subject = type === 'supplier'
    ? i18n.t('COMMISSION_SUPPLIER_SUBJECT', { bookingId })
    : i18n.t('COMMISSION_CLIENT_SUBJECT', { bookingId })

  const html = buildReminderHtml(recipient, bookingId, type)

  await mailHelper.sendMail({
    from: env.SMTP_FROM,
    to: recipient.email,
    subject,
    html,
  })

  const notifications = booking.notifications || {}
  const now = new Date()
  if (type === 'supplier') {
    notifications.supplier = {
      count: (notifications.supplier?.count ?? 0) + 1,
      lastSent: now,
    }
  } else {
    notifications.client = {
      count: (notifications.client?.count ?? 0) + 1,
      lastSent: now,
    }
  }

  booking.notifications = notifications
  await booking.save()

  return commissionHelper.mapBookingToCommission(booking as any)
}

export const getAgencyCommissions = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.AgencyCommissionsPayload } = req
    const session = await authHelper.getSessionData(req)
    const supplierFilter = await commissionHelper.filterAuthorizedSuppliers(session.id, body?.supplierIds)

    const query: Record<string, unknown> = {
      status: { $in: commissionHelper.getIncludedStatuses() },
    }

    if (supplierFilter) {
      query.supplier = { $in: supplierFilter }
    }

    const bookings = await Booking
      .find(query)
      .populate(['supplier', 'driver'])
      .sort({ from: -1 })
      .lean()

    const mapped = bookings
      .filter((booking) => booking.supplier && booking.driver)
      .map((booking) => commissionHelper.mapBookingToCommission(booking as any))

    return res.json({
      summary: commissionHelper.summarizeCommissions(mapped),
      bookings: mapped,
    })
  } catch (err) {
    logger.error('[commission.getAgencyCommissions]', err)
    return res.status(400).send(i18n.t('DB_ERROR'))
  }
}

export const remindSupplier = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    if (!helper.isValidObjectId(bookingId)) {
      return res.sendStatus(400)
    }

    await authHelper.getSessionData(req)
    const updated = await sendReminder(bookingId, 'supplier')

    if (!updated) {
      return res.sendStatus(404)
    }

    return res.json(updated)
  } catch (err) {
    logger.error('[commission.remindSupplier]', err)
    return res.status(400).send(i18n.t('DB_ERROR'))
  }
}

export const remindClient = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    if (!helper.isValidObjectId(bookingId)) {
      return res.sendStatus(400)
    }

    await authHelper.getSessionData(req)
    const updated = await sendReminder(bookingId, 'client')

    if (!updated) {
      return res.sendStatus(404)
    }

    return res.json(updated)
  } catch (err) {
    logger.error('[commission.remindClient]', err)
    return res.status(400).send(i18n.t('DB_ERROR'))
  }
}
