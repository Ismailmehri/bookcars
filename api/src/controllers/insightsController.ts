import { Request, Response } from 'express'
import mongoose, { Types } from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as authHelper from '../common/authHelper'
import * as mailHelper from '../common/mailHelper'
import { sendSms, validateAndFormatPhoneNumber } from '../common/smsHelper'
import User from '../models/User'
import AgencyNote from '../models/AgencyNote'
import Car from '../models/Car'
import AgencyCommissionState from '../models/AgencyCommissionState'

interface AdminSession {
  id: mongoose.Types.ObjectId
  fullName: string
}

interface LoadedAgency {
  _id: mongoose.Types.ObjectId | string
  fullName?: string | null
  email?: string | null
  phone?: string | null
  blacklisted?: boolean
}

interface BulkResult {
  succeeded: bookcarsTypes.BulkActionResultEntry[]
  failed: bookcarsTypes.BulkActionFailureEntry[]
  warnings: bookcarsTypes.BulkActionFailureEntry[]
}

const unauthorized = (res: Response) => res.status(403).json({ message: 'UNAUTHORIZED' })

const ensureAdmin = async (req: Request): Promise<AdminSession | null> => {
  const session = await authHelper.getSessionData(req)
  const admin = await User.findById(session.id, { fullName: 1, type: 1 })
    .lean()
    .exec()

  if (!admin || admin.type !== bookcarsTypes.UserType.Admin) {
    return null
  }

  return { id: admin._id as mongoose.Types.ObjectId, fullName: admin.fullName ?? 'Admin' }
}

const normalizeAgencyIds = (agencyIds: unknown): string[] => {
  if (!Array.isArray(agencyIds)) {
    return []
  }

  return Array.from(
    new Set(
      agencyIds
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        .map((value) => value.trim()),
    ),
  )
}

const loadAgencies = async (
  ids: string[],
): Promise<{ agencies: Map<string, LoadedAgency>; invalid: string[]; missing: string[] }> => {
  const invalid = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id))
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id))

  if (validIds.length === 0) {
    return { agencies: new Map(), invalid, missing: [] }
  }

  const objectIds = validIds.map((id) => new mongoose.Types.ObjectId(id))
  const agencies = await User.find(
    { _id: { $in: objectIds }, type: bookcarsTypes.UserType.Supplier },
    { fullName: 1, email: 1, phone: 1, blacklisted: 1 },
  ).lean()

  const agenciesMap = new Map<string, LoadedAgency>()
  agencies.forEach((agency) => {
    agenciesMap.set(String(agency._id), agency)
  })

  const missing = validIds.filter((id) => !agenciesMap.has(id))

  return { agencies: agenciesMap, invalid, missing }
}

const toResultEntry = (agency: LoadedAgency): bookcarsTypes.BulkActionResultEntry => ({
  agencyId: String(agency._id),
  agencyName: agency.fullName ?? '—',
})

const toFailureEntry = (agency: LoadedAgency | { _id: string; fullName?: string | null }, reason: string): bookcarsTypes.BulkActionFailureEntry => ({
  agencyId: String(agency._id),
  agencyName: agency.fullName ?? '—',
  reason,
})

const getAgencyObjectId = (agency: LoadedAgency) =>
  (agency._id instanceof mongoose.Types.ObjectId ? agency._id : new mongoose.Types.ObjectId(agency._id))

const addNote = async (
  admin: AdminSession,
  agency: LoadedAgency,
  type: bookcarsTypes.AgencyNoteType,
  summary: string,
  details?: string,
  metadata?: Record<string, unknown>,
) => {
  await AgencyNote.create({
    agency: getAgencyObjectId(agency),
    type,
    summary,
    details,
    metadata,
    createdBy: admin.id,
  })
}

const initializeResult = (missing: string[], invalid: string[]): BulkResult => ({
  succeeded: [],
  failed: [
    ...missing.map((id) => ({ agencyId: id, agencyName: '—', reason: 'AGENCY_NOT_FOUND' })),
    ...invalid.map((id) => ({ agencyId: id, agencyName: '—', reason: 'INVALID_AGENCY_ID' })),
  ],
  warnings: [],
})

const handleBulkEmail = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return unauthorized(res)
    }

    const body = req.body as Partial<{ agencyIds: unknown; subject: unknown; message: unknown }>
    const agencyIds = normalizeAgencyIds(body.agencyIds)
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (agencyIds.length === 0 || !subject || !message) {
      return res.status(400).json({ message: 'INVALID_PAYLOAD' })
    }

    const { agencies, invalid, missing } = await loadAgencies(agencyIds)
    const result = initializeResult(missing, invalid)

    await Promise.all(
      Array.from(agencies.values()).map(async (agency) => {
        try {
          if (!agency.email) {
            result.failed.push(toFailureEntry(agency, 'MISSING_EMAIL'))
            return
          }

          await mailHelper.sendMail({ to: agency.email, subject, html: message })

          await addNote(
            admin,
            agency,
            bookcarsTypes.AgencyNoteType.Email,
            `Email sent: subject="${subject}"`,
            message,
            { subject, recipients: 1 },
          )

          result.succeeded.push(toResultEntry(agency))
        } catch (err) {
          console.error('[insights.sendBulkEmail]', err)
          result.failed.push(toFailureEntry(agency, 'EMAIL_SEND_FAILED'))
        }
      }),
    )

    return res.json(result)
  } catch (err) {
    console.error('[insights.sendBulkEmail]', err)
    return res.status(500).json({ message: 'FAILED_TO_PROCESS_EMAIL' })
  }
}

const handleBulkSms = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return unauthorized(res)
    }

    const body = req.body as Partial<{ agencyIds: unknown; message: unknown }>
    const agencyIds = normalizeAgencyIds(body.agencyIds)
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (agencyIds.length === 0 || !message) {
      return res.status(400).json({ message: 'INVALID_PAYLOAD' })
    }

    const { agencies, invalid, missing } = await loadAgencies(agencyIds)
    const result = initializeResult(missing, invalid)

    await Promise.all(
      Array.from(agencies.values()).map(async (agency) => {
        try {
          const phoneCheck = validateAndFormatPhoneNumber(agency.phone ?? undefined)
          if (!phoneCheck.isValide || !phoneCheck.phone) {
            result.failed.push(toFailureEntry(agency, 'INVALID_PHONE'))
            return
          }

          await sendSms(phoneCheck.phone, message)

          await addNote(
            admin,
            agency,
            bookcarsTypes.AgencyNoteType.Sms,
            'SMS sent',
            message,
            { recipients: 1 },
          )

          result.succeeded.push(toResultEntry(agency))
        } catch (err) {
          console.error('[insights.sendBulkSms]', err)
          result.failed.push(toFailureEntry(agency, 'SMS_SEND_FAILED'))
        }
      }),
    )

    return res.json(result)
  } catch (err) {
    console.error('[insights.sendBulkSms]', err)
    return res.status(500).json({ message: 'FAILED_TO_PROCESS_SMS' })
  }
}

const handleBlockAgencies = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return unauthorized(res)
    }

    const body = req.body as bookcarsTypes.BulkBlockPayload
    const agencyIds = normalizeAgencyIds(body.agencyIds)
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    const notifyByEmail = Boolean(body.notifyByEmail)
    const notifyBySms = Boolean(body.notifyBySms)
    const emailSubject = typeof body.emailSubject === 'string' ? body.emailSubject.trim() : ''
    const emailMessage = typeof body.emailMessage === 'string' ? body.emailMessage.trim() : ''
    const smsMessage = typeof body.smsMessage === 'string' ? body.smsMessage.trim() : ''

    if (agencyIds.length === 0 || !reason) {
      return res.status(400).json({ message: 'INVALID_PAYLOAD' })
    }

    if (notifyByEmail && (!emailSubject || !emailMessage)) {
      return res.status(400).json({ message: 'INVALID_EMAIL_TEMPLATE' })
    }

    if (notifyBySms && !smsMessage) {
      return res.status(400).json({ message: 'INVALID_SMS_TEMPLATE' })
    }

    const { agencies, invalid, missing } = await loadAgencies(agencyIds)
    const result = initializeResult(missing, invalid)

    for (const agency of agencies.values()) {
      try {
        await User.updateOne({ _id: agency._id }, { $set: { blacklisted: true } }).exec()

        const warnings: bookcarsTypes.BulkActionFailureEntry[] = []

        const agencyObjectId = getAgencyObjectId(agency)
        const cars = await Car.find(
          { supplier: agencyObjectId },
          { _id: 1, available: 1 },
        )
          .lean()
          .exec()

        const availableCarIds = cars
          .filter((car) => car.available)
          .map((car) => car._id as Types.ObjectId)

        if (availableCarIds.length > 0) {
          await Car.updateMany(
            { _id: { $in: availableCarIds } },
            { $set: { available: false } },
          ).exec()
        }

        let state = await AgencyCommissionState.findOne({ agency: agencyObjectId }).exec()

        if (!state) {
          state = new AgencyCommissionState({ agency: agencyObjectId, blocked: false, disabledCars: [] })
        }

        if (availableCarIds.length > 0) {
          const disabledCarSet = new Set(state.disabledCars?.map((id) => id.toString()) ?? [])
          availableCarIds.forEach((id) => disabledCarSet.add(id.toString()))
          state.disabledCars = Array.from(disabledCarSet).map((id) => new mongoose.Types.ObjectId(id))
        }

        state.blocked = true
        state.blockedAt = new Date()
        state.blockedBy = admin.id
        await state.save()

        if (notifyByEmail) {
          try {
            if (!agency.email) {
              warnings.push(toFailureEntry(agency, 'MISSING_EMAIL'))
            } else {
              await mailHelper.sendMail({ to: agency.email, subject: emailSubject, html: emailMessage })
            }
          } catch (err) {
            console.error('[insights.blockAgencies.email]', err)
            warnings.push(toFailureEntry(agency, 'EMAIL_SEND_FAILED'))
          }
        }

        if (notifyBySms) {
          try {
            const phoneCheck = validateAndFormatPhoneNumber(agency.phone ?? undefined)
            if (!phoneCheck.isValide || !phoneCheck.phone) {
              warnings.push(toFailureEntry(agency, 'INVALID_PHONE'))
            } else {
              await sendSms(phoneCheck.phone, smsMessage)
            }
          } catch (err) {
            console.error('[insights.blockAgencies.sms]', err)
            warnings.push(toFailureEntry(agency, 'SMS_SEND_FAILED'))
          }
        }

        await addNote(
          admin,
          agency,
          bookcarsTypes.AgencyNoteType.Block,
          `Agency blocked: reason="${reason}"`,
          [
            reason,
            notifyByEmail ? `Email notified: ${warnings.some((warning) => warning.reason.includes('EMAIL')) ? 'no' : 'yes'}` : undefined,
            notifyBySms ? `SMS notified: ${warnings.some((warning) => warning.reason.includes('SMS') || warning.reason === 'INVALID_PHONE') ? 'no' : 'yes'}` : undefined,
          ]
            .filter(Boolean)
            .join('\n'),
          { reason, notifyByEmail, notifyBySms },
        )

        result.succeeded.push(toResultEntry(agency))

        if (warnings.length > 0) {
          result.warnings.push(...warnings)
        }
      } catch (err) {
        console.error('[insights.blockAgencies]', err)
        result.failed.push(toFailureEntry(agency, 'BLOCK_FAILED'))
      }
    }

    return res.json(result)
  } catch (err) {
    console.error('[insights.blockAgencies]', err)
    return res.status(500).json({ message: 'FAILED_TO_BLOCK_AGENCIES' })
  }
}

const handleUnblockAgencies = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return unauthorized(res)
    }

    const body = req.body as bookcarsTypes.BulkUnblockPayload
    const agencyIds = normalizeAgencyIds(body.agencyIds)
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

    if (agencyIds.length === 0 || !reason) {
      return res.status(400).json({ message: 'INVALID_PAYLOAD' })
    }

    const { agencies, invalid, missing } = await loadAgencies(agencyIds)
    const result = initializeResult(missing, invalid)

    await Promise.all(
      Array.from(agencies.values()).map(async (agency) => {
        try {
          if (!agency.blacklisted) {
            result.warnings.push(toFailureEntry(agency, 'ALREADY_ACTIVE'))
            return
          }

          const agencyObjectId = getAgencyObjectId(agency)

          await User.updateOne({ _id: agency._id }, { $set: { blacklisted: false } }).exec()

          const state = await AgencyCommissionState.findOne({ agency: agencyObjectId }).exec()

          if (state) {
            const disabledCars = state.disabledCars ?? []
            if (disabledCars.length > 0) {
              await Car.updateMany(
                { _id: { $in: disabledCars } },
                { $set: { available: true } },
              ).exec()
            }

            state.blocked = false
            state.blockedAt = undefined
            state.blockedBy = undefined
            state.disabledCars = []
            await state.save()
          }

          await addNote(
            admin,
            agency,
            bookcarsTypes.AgencyNoteType.Unblock,
            `Agency unblocked: reason="${reason}"`,
            reason,
          )

          result.succeeded.push(toResultEntry(agency))
        } catch (err) {
          console.error('[insights.unblockAgencies]', err)
          result.failed.push(toFailureEntry(agency, 'UNBLOCK_FAILED'))
        }
      }),
    )

    return res.json(result)
  } catch (err) {
    console.error('[insights.unblockAgencies]', err)
    return res.status(500).json({ message: 'FAILED_TO_UNBLOCK_AGENCIES' })
  }
}

const handleManualNote = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return unauthorized(res)
    }

    const body = req.body as bookcarsTypes.BulkNotePayload
    const agencyIds = normalizeAgencyIds(body.agencyIds)
    const note = typeof body.note === 'string' ? body.note.trim() : ''

    if (agencyIds.length === 0 || !note) {
      return res.status(400).json({ message: 'INVALID_PAYLOAD' })
    }

    const { agencies, invalid, missing } = await loadAgencies(agencyIds)
    const result = initializeResult(missing, invalid)

    await Promise.all(
      Array.from(agencies.values()).map(async (agency) => {
        try {
          await addNote(admin, agency, bookcarsTypes.AgencyNoteType.Note, 'Manual note added', note)
          result.succeeded.push(toResultEntry(agency))
        } catch (err) {
          console.error('[insights.addNote]', err)
          result.failed.push(toFailureEntry(agency, 'NOTE_SAVE_FAILED'))
        }
      }),
    )

    return res.json(result)
  } catch (err) {
    console.error('[insights.addNote]', err)
    return res.status(500).json({ message: 'FAILED_TO_SAVE_NOTE' })
  }
}

const handleGetNotes = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return unauthorized(res)
    }

    const { agencyId } = req.params

    if (!agencyId || !mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: 'INVALID_AGENCY_ID' })
    }

    const notes = await AgencyNote.find({ agency: new mongoose.Types.ObjectId(agencyId) })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName')
      .lean()

    const response: bookcarsTypes.AgencyNotesResponse = {
      notes: notes.map((note) => ({
        _id: String(note._id),
        agencyId,
        type: note.type as bookcarsTypes.AgencyNoteType,
        summary: note.summary,
        details: note.details ?? undefined,
        metadata: note.metadata ?? undefined,
        createdAt: note.createdAt ?? new Date(),
        author: {
          id: note.createdBy ? String(note.createdBy._id ?? note.createdBy) : '',
          name:
            typeof note.createdBy === 'object' && note.createdBy && 'fullName' in note.createdBy
              ? (note.createdBy.fullName as string)
              : admin.fullName,
        },
      })),
    }

    return res.json(response)
  } catch (err) {
    console.error('[insights.getNotes]', err)
    return res.status(500).json({ message: 'FAILED_TO_FETCH_NOTES' })
  }
}

export const sendBulkEmail = handleBulkEmail
export const sendBulkSms = handleBulkSms
export const blockAgencies = handleBlockAgencies
export const unblockAgencies = handleUnblockAgencies
export const addManualNote = handleManualNote
export const getAgencyNotes = handleGetNotes
