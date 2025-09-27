import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import i18n from '../lang/i18n'
import * as logger from '../common/logger'
import * as env from '../config/env.config'
import * as authHelper from '../common/authHelper'
import User from '../models/User'
import {
  fetchAgencyCommissions,
  generateMonthlyInvoice,
  generateBookingInvoice,
  fetchCommissionBookingById,
  getSupplierById,
  triggerCommissionReminder,
  fetchAdminCommissions,
  updateAgencyCommissionStatus,
  toggleAgencyCommissionBlock,
  addAgencyCommissionNote,
  sendAgencyCommissionReminder,
  getAgencyCommissionSettings,
  upsertAgencyCommissionSettings,
} from '../common/commissionHelper'

const getActor = async (req: Request) => {
  try {
    const session = await authHelper.getSessionData(req)
    if (session?.id) {
      const actor = await User.findById(session.id, 'fullName').lean<{ _id: string; fullName: string }>()
      if (actor) {
        return {
          _id: actor._id?.toString(),
          fullName: actor.fullName,
        }
      }
    }
  } catch (err) {
    logger.error('[commission.getActor] unable to resolve actor', err)
  }
  return undefined
}

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

export const getAdminCommissions = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.GetAdminCommissionsPayload } = req
    const data = await fetchAdminCommissions(body)
    return res.json(data)
  } catch (err) {
    logger.error(`[commission.getAdminCommissions] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
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

export const updateAgencyCommissionStatusController = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params
    const { body }: { body: bookcarsTypes.UpdateAgencyCommissionStatusPayload } = req

    if (!stateId || !body) {
      return res.sendStatus(400)
    }

    const actor = await getActor(req)
    const result = await updateAgencyCommissionStatus(stateId, body, actor)

    if (!result) {
      return res.sendStatus(404)
    }

    return res.json(result)
  } catch (err) {
    logger.error(`[commission.updateAgencyCommissionStatus] ${i18n.t('DB_ERROR')} ${JSON.stringify({ params: req.params, body: req.body })}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const toggleAgencyCommissionBlockController = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params
    const { body }: { body: bookcarsTypes.ToggleAgencyCommissionBlockPayload } = req

    if (!stateId || !body) {
      return res.sendStatus(400)
    }

    const actor = await getActor(req)
    const result = await toggleAgencyCommissionBlock(stateId, body, actor)

    if (!result) {
      return res.sendStatus(404)
    }

    return res.json(result)
  } catch (err) {
    logger.error(`[commission.toggleAgencyCommissionBlock] ${i18n.t('DB_ERROR')} ${JSON.stringify({ params: req.params, body: req.body })}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const addAgencyCommissionNoteController = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params
    const { body }: { body: bookcarsTypes.CreateAgencyCommissionNotePayload } = req

    if (!stateId || !body) {
      return res.sendStatus(400)
    }

    const actor = await getActor(req)
    const result = await addAgencyCommissionNote(stateId, body, actor)

    if (!result) {
      return res.sendStatus(404)
    }

    return res.json(result)
  } catch (err) {
    logger.error(`[commission.addAgencyCommissionNote] ${i18n.t('DB_ERROR')} ${JSON.stringify({ params: req.params, body: req.body })}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const sendAgencyCommissionReminderController = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params
    const { body }: { body: bookcarsTypes.SendAgencyCommissionReminderPayload } = req

    if (!stateId || !body) {
      return res.sendStatus(400)
    }

    const actor = await getActor(req)
    const result = await sendAgencyCommissionReminder(stateId, body, actor)

    if (!result) {
      return res.sendStatus(404)
    }

    return res.json(result)
  } catch (err) {
    logger.error(`[commission.sendAgencyCommissionReminder] ${i18n.t('DB_ERROR')} ${JSON.stringify({ params: req.params, body: req.body })}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const getCommissionSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getAgencyCommissionSettings()
    return res.json(settings)
  } catch (err) {
    logger.error(`[commission.getCommissionSettings] ${i18n.t('DB_ERROR')}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const updateCommissionSettings = async (req: Request, res: Response) => {
  try {
    const { body }: { body: bookcarsTypes.UpsertAgencyCommissionSettingsPayload } = req
    if (!body) {
      return res.sendStatus(400)
    }

    const actor = await getActor(req)
    const settings = await upsertAgencyCommissionSettings(body, actor)
    return res.json(settings)
  } catch (err) {
    logger.error(`[commission.updateCommissionSettings] ${i18n.t('DB_ERROR')} ${JSON.stringify(req.body)}`, err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
