import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import i18n from '../lang/i18n'
import * as logger from '../common/logger'
import * as env from '../config/env.config'
import {
  fetchAgencyCommissions,
  generateMonthlyInvoice,
  generateBookingInvoice,
  fetchCommissionBookingById,
  getSupplierById,
  triggerCommissionReminder,
} from '../common/commissionHelper'

export const getAgencyCommissions = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetAgencyCommissionsPayload } = req

    if (!body || !body.suppliers || body.suppliers.length === 0) {
      return res.json({
        bookings: [],
        summary: {
          gross: 0,
          grossAll: 0,
          commission: 0,
          net: 0,
          reservations: 0,
          commissionPercentage: env.PLANY_COMMISSION_PERCENTAGE,
        },
      })
    }

    const data = await fetchAgencyCommissions(body)
    return res.json(data)
  } catch (err) {
    logger.error(`[commission.getAgencyCommissions] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const downloadMonthlyInvoice = async (req: Request, res: Response) => {
  try {
    const { supplierId, year, month } = req.params
    const numericYear = Number.parseInt(year, 10)
    const numericMonthParam = Number.parseInt(month, 10)
    const monthIndex = Number.isNaN(numericMonthParam) ? new Date().getMonth() : Math.min(Math.max(numericMonthParam - 1, 0), 11)
    const payload: bookcarsTypes.GetAgencyCommissionsPayload = {
      suppliers: [supplierId],
      month: monthIndex,
      year: Number.isNaN(numericYear) ? new Date().getFullYear() : numericYear,
    }

    const data = await fetchAgencyCommissions(payload)
    const supplier = data.supplier || await getSupplierById(supplierId)

    if (!supplier) {
      return res.sendStatus(404)
    }

    await generateMonthlyInvoice(res, data, supplier, payload.month, payload.year)
    return res
  } catch (err) {
    logger.error(`[commission.downloadMonthlyInvoice] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.params)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const downloadBookingInvoice = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const result = await fetchCommissionBookingById(bookingId)

    if (!result) {
      return res.sendStatus(404)
    }

    generateBookingInvoice(res, {
      booking: result.booking,
      supplier: result.supplier,
    })
    return res
  } catch (err) {
    logger.error(`[commission.downloadBookingInvoice] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.params)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const sendCommissionReminder = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const { body }: { body: bookcarsTypes.SendCommissionReminderPayload } = req

    if (!body || (body.target !== 'supplier' && body.target !== 'client')) {
      return res.sendStatus(400)
    }

    const result = await triggerCommissionReminder(bookingId, body.target)

    if (!result) {
      return res.sendStatus(404)
    }

    return res.json(result)
  } catch (err) {
    logger.error(`[commission.sendCommissionReminder] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.params)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
