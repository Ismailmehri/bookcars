import mongoose from 'mongoose'
import PDFDocument from 'pdfkit'
import axios from 'axios'
import { Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import User from '../models/User'
import AgencyCommissionState, { AgencyCommissionStateDocument } from '../models/AgencyCommissionState'
import AgencyCommissionSetting from '../models/AgencyCommissionSetting'
import * as env from '../config/env.config'
import i18n from '../lang/i18n'
import * as mailHelper from './mailHelper'
import { sendSms, validateAndFormatPhoneNumber } from './smsHelper'

const MS_PER_DAY = 1000 * 60 * 60 * 24
const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]
const nf = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 })

const formatAmount = (value: number) => `${nf.format(Math.round(value || 0))} TND`
const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR')

const resolveCommissionRate = (commissionRate?: number) => {
  if (typeof commissionRate !== 'number' || Number.isNaN(commissionRate)) {
    return env.PLANY_COMMISSION_RATE
  }

  const normalized = commissionRate > 1 ? commissionRate / 100 : commissionRate
  if (normalized <= 0) {
    return env.PLANY_COMMISSION_RATE
  }

  return normalized
}

const BOOKING_STATUS_LABELS_FR: Record<bookcarsTypes.BookingStatus, string> = {
  [bookcarsTypes.BookingStatus.Void]: 'Brouillon',
  [bookcarsTypes.BookingStatus.Pending]: 'En attente',
  [bookcarsTypes.BookingStatus.Deposit]: 'Acompte',
  [bookcarsTypes.BookingStatus.Paid]: 'Payée',
  [bookcarsTypes.BookingStatus.Reserved]: 'Confirmée',
  [bookcarsTypes.BookingStatus.Cancelled]: 'Annulée',
}

const BILLABLE_STATUSES = new Set<bookcarsTypes.BookingStatus>([
  bookcarsTypes.BookingStatus.Deposit,
  bookcarsTypes.BookingStatus.Reserved,
  bookcarsTypes.BookingStatus.Paid,
])

const COMMISSION_THRESHOLD = env.COMMISSION_MONTHLY_THRESHOLD

const COMMISSION_EFFECTIVE_DATE = (() => {
  if (!env.COMMISSION_EFFECTIVE_DATE) {
    return null
  }

  const parsed = new Date(env.COMMISSION_EFFECTIVE_DATE)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  parsed.setHours(0, 0, 0, 0)
  return parsed
})()

export const calculateCommissionAmount = (price?: number, commissionRate?: number) => (
  Math.round((price || 0) * resolveCommissionRate(commissionRate))
)

const getRentalDays = (from: Date, to: Date) => {
  if (!(from instanceof Date) || Number.isNaN(from.getTime()) || !(to instanceof Date) || Number.isNaN(to.getTime())) {
    return 0
  }
  const diff = to.getTime() - from.getTime()
  if (diff <= 0) {
    return 0
  }
  return Math.ceil(diff / MS_PER_DAY)
}

type RawCommissionBooking = {
  _id: mongoose.Types.ObjectId
  from: Date
  to: Date
  price?: number
  status: bookcarsTypes.BookingStatus
  commission?: number
  commissionTotal?: number
  commissionRate?: number
  commissionStatus?: bookcarsTypes.CommissionStatus
  notifications?: {
    supplier?: { count?: number; lastSent?: Date | null }
    client?: { count?: number; lastSent?: Date | null }
  }
  driver?: { _id: mongoose.Types.ObjectId; fullName: string }
  supplier?: { _id: mongoose.Types.ObjectId; fullName: string }
}

interface NormalizedCommissionBooking {
  booking: bookcarsTypes.AgencyCommissionBooking
  commissionPercentage?: number
}

const normalizeCommissionBooking = (booking: RawCommissionBooking): NormalizedCommissionBooking => {
  const fromDate = new Date(booking.from)
  const toDate = new Date(booking.to)
  const days = Math.max(getRentalDays(fromDate, toDate), 1)
  const totalClient = Math.round(booking.price || 0)
  const commissionRateValue = typeof booking.commissionRate === 'number'
    ? booking.commissionRate
    : undefined

  let commissionPercentage: number | undefined
  if (typeof commissionRateValue === 'number') {
    commissionPercentage = commissionRateValue > 1
      ? commissionRateValue
      : commissionRateValue * 100
  }

  let storedCommission: number | undefined
  if (typeof booking.commission === 'number') {
    storedCommission = booking.commission
  } else if (typeof booking.commissionTotal === 'number') {
    storedCommission = booking.commissionTotal
  }

  const commissionAmount = typeof storedCommission === 'number'
    ? Math.round(storedCommission)
    : calculateCommissionAmount(booking.price, commissionRateValue)

  const commissionDue = BILLABLE_STATUSES.has(booking.status)
    ? commissionAmount
    : 0
  const netAgency = totalClient - commissionDue
  const pricePerDay = Math.round(days > 0 ? totalClient / days : totalClient)
  const supplierInfo = booking.supplier
    ? {
      _id: booking.supplier._id.toString(),
      fullName: booking.supplier.fullName || '',
    }
    : { _id: '', fullName: '' }

  const notifications = booking.notifications
    ? {
      supplier: booking.notifications.supplier
        ? {
          count: Math.max(0, booking.notifications.supplier.count || 0),
          lastSent: booking.notifications.supplier.lastSent instanceof Date
            ? booking.notifications.supplier.lastSent.toISOString()
            : undefined,
        }
        : undefined,
      client: booking.notifications.client
        ? {
          count: Math.max(0, booking.notifications.client.count || 0),
          lastSent: booking.notifications.client.lastSent instanceof Date
            ? booking.notifications.client.lastSent.toISOString()
            : undefined,
        }
        : undefined,
    }
    : undefined

  return {
    booking: {
      bookingId: booking._id.toString(),
      bookingNumber: booking._id.toString(),
      bookingStatus: booking.status,
      commissionStatus: booking.commissionStatus || bookcarsTypes.CommissionStatus.Pending,
      driver: {
        _id: booking.driver?._id.toString() || '',
        fullName: booking.driver?.fullName || '',
      },
      supplier: supplierInfo,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      days,
      pricePerDay,
      totalClient,
      commission: commissionDue,
      netAgency,
      notifications,
    },
    commissionPercentage,
  }
}

const mapReminderStats = (reminders?: { emailCount?: number; smsCount?: number; lastEmailAt?: Date; lastSmsAt?: Date }) => ({
  emailCount: reminders?.emailCount ? Math.max(0, reminders.emailCount) : 0,
  smsCount: reminders?.smsCount ? Math.max(0, reminders.smsCount) : 0,
  lastEmailAt: reminders?.lastEmailAt instanceof Date ? reminders.lastEmailAt.toISOString() : undefined,
  lastSmsAt: reminders?.lastSmsAt instanceof Date ? reminders.lastSmsAt.toISOString() : undefined,
})

const mapNoteEntries = (notes?: AgencyCommissionStateDocument['notes']) => (notes || []).map((note) => ({
  _id: note._id ? note._id.toString() : new mongoose.Types.ObjectId().toString(),
  message: note.message,
  createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : new Date().toISOString(),
  createdBy: note.createdBy?._id
    ? { _id: note.createdBy._id.toString(), fullName: note.createdBy.fullName }
    : undefined,
}))

const mapLogEntries = (logs?: AgencyCommissionStateDocument['logs']) => (logs || []).map((log) => ({
  _id: log._id ? log._id.toString() : new mongoose.Types.ObjectId().toString(),
  type: log.type,
  message: log.message,
  createdAt: log.createdAt instanceof Date ? log.createdAt.toISOString() : new Date().toISOString(),
  createdBy: log.createdBy?._id
    ? { _id: log.createdBy._id.toString(), fullName: log.createdBy.fullName }
    : undefined,
}))

const ensureCommissionState = async (supplierId: mongoose.Types.ObjectId, month: number, year: number) => {
  const existing = await AgencyCommissionState.findOne({ supplier: supplierId, month, year }).lean()
  if (existing) {
    return existing
  }

  try {
    const created = await AgencyCommissionState.create({
      supplier: supplierId,
      month,
      year,
    })

    return created.toObject()
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000) {
      const retry = await AgencyCommissionState.findOne({ supplier: supplierId, month, year }).lean()
      if (retry) {
        return retry
      }
    }
    throw err
  }
}

const buildCreatedBy = (user?: bookcarsTypes.User | null) => {
  if (!user?._id || !mongoose.Types.ObjectId.isValid(user._id)) {
    return undefined
  }

  return {
    _id: new mongoose.Types.ObjectId(user._id),
    fullName: user.fullName || '',
  }
}

const mapStateToResponse = (state: AgencyCommissionStateDocument): bookcarsTypes.AgencyCommissionStateUpdateResponse => ({
  stateId: state._id.toString(),
  paymentStatus: state.paymentStatus,
  commissionPaid: Math.max(0, Math.round(state.commissionPaid || 0)),
  blocked: state.blocked,
  reminders: mapReminderStats(state.reminders),
  notes: mapNoteEntries(state.notes),
  logs: mapLogEntries(state.logs),
})

const renderTemplate = (template: string, variables: Record<string, string>) => template.replace(
  /\{\{\s*(\w+)\s*\}\}/g,
  (_, key: string) => variables[key] ?? '',
)

const ensureCommissionSettings = async () => AgencyCommissionSetting
  .findOneAndUpdate({}, {}, { upsert: true, new: true, setDefaultsOnInsert: true })
  .lean<AgencyCommissionSettingDocument & { _id: mongoose.Types.ObjectId }>()

const mapSettingsToResponse = (settings: (AgencyCommissionSettingDocument & { _id: mongoose.Types.ObjectId }) | null): bookcarsTypes.AgencyCommissionSettings => ({
  _id: settings?._id ? settings._id.toString() : '',
  email_subject: settings?.email_subject || '',
  email_body: settings?.email_body || '',
  sms_body: settings?.sms_body || '',
  from_email: settings?.from_email || '',
  from_name: settings?.from_name || '',
  from_sms_sender: settings?.from_sms_sender || '',
  updated_by: settings?.updated_by
    ? { _id: settings.updated_by.toString(), fullName: settings.updated_by_name || '' }
    : undefined,
  updated_at: settings?.updated_at instanceof Date ? settings.updated_at.toISOString() : undefined,
})

const COMMISSION_STATUS_LABELS_FR: Record<bookcarsTypes.CommissionStatus, string> = {
  [bookcarsTypes.CommissionStatus.Pending]: 'Commission en attente',
  [bookcarsTypes.CommissionStatus.Paid]: 'Commission payée',
}

const buildMatchStage = (supplierIds: mongoose.Types.ObjectId[], month: number, year: number): mongoose.PipelineStage.Match => {
  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const endDate = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))

  return {
    $match: {
      supplier: { $in: supplierIds },
      expireAt: null,
      from: { $gte: startDate, $lt: endDate },
    },
  }
}

export const fetchAgencyCommissions = async (
  payload: bookcarsTypes.GetAgencyCommissionsPayload,
): Promise<bookcarsTypes.AgencyCommissionsResponse> => {
  const { suppliers, month, year, query } = payload

  if (!suppliers || suppliers.length === 0) {
    return {
      bookings: [],
      summary: {
        gross: 0,
        grossAll: 0,
        commission: 0,
        net: 0,
        reservations: 0,
        commissionPercentage: env.PLANY_COMMISSION_PERCENTAGE,
      },
    }
  }

  const numericMonth = Number.isFinite(month) ? month : new Date().getMonth()
  const numericYear = Number.isFinite(year) ? year : new Date().getFullYear()

  const supplierIds = suppliers
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id))

  if (supplierIds.length === 0) {
    return {
      bookings: [],
      summary: {
        gross: 0,
        grossAll: 0,
        commission: 0,
        net: 0,
        reservations: 0,
        commissionPercentage: env.PLANY_COMMISSION_PERCENTAGE,
      },
    }
  }

  const pipeline: mongoose.PipelineStage[] = [
    buildMatchStage(supplierIds, numericMonth, numericYear),
    {
      $lookup: {
        from: 'User',
        let: { supplierId: '$supplier' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$supplierId'],
              },
            },
          },
        ],
        as: 'supplier',
      },
    },
    { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: 'User',
        let: { driverId: '$driver' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$driverId'],
              },
            },
          },
        ],
        as: 'driver',
      },
    },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: false } },
    {
      $project: {
        _id: 1,
        from: 1,
        to: 1,
        price: 1,
        status: 1,
        commission: 1,
        commissionTotal: 1,
        commissionRate: 1,
        commissionStatus: 1,
        notifications: 1,
        driver: {
          _id: '$driver._id',
          fullName: '$driver.fullName',
        },
        supplier: {
          _id: '$supplier._id',
          fullName: '$supplier.fullName',
        },
      },
    },
    { $sort: { from: 1, _id: 1 } },
  ]

  const rawBookings = await Booking.aggregate<RawCommissionBooking>(pipeline)

  const normalizedQuery = (query || '').trim().toLowerCase()
  const filtered = normalizedQuery
    ? rawBookings.filter((booking) => {
      const bookingId = booking._id.toString().toLowerCase()
      const driverName = (booking.driver?.fullName || '').toLowerCase()
      return bookingId.includes(normalizedQuery) || driverName.includes(normalizedQuery)
    })
    : rawBookings

  let effectiveCommissionPercentage = env.PLANY_COMMISSION_PERCENTAGE

  const bookings = filtered.map((booking) => {
    const normalized = normalizeCommissionBooking(booking)
    if (typeof normalized.commissionPercentage === 'number' && !Number.isNaN(normalized.commissionPercentage)) {
      effectiveCommissionPercentage = normalized.commissionPercentage
    }
    return normalized.booking
  })

  const summary = bookings.reduce<bookcarsTypes.AgencyCommissionSummary>((acc, booking) => {
    const isBillable = BILLABLE_STATUSES.has(booking.bookingStatus)
    const bookingStart = new Date(booking.from)
    const eligibleByDate = !COMMISSION_EFFECTIVE_DATE || bookingStart >= COMMISSION_EFFECTIVE_DATE

    acc.grossAll += booking.totalClient

    if (isBillable && eligibleByDate) {
      acc.gross += booking.totalClient
      acc.commission += booking.commission
      acc.net += booking.netAgency
      acc.reservations += 1
    }

    return acc
  }, {
    gross: 0,
    grossAll: 0,
    commission: 0,
    net: 0,
    reservations: 0,
    commissionPercentage: effectiveCommissionPercentage,
  })

  const supplierInfo = rawBookings.length > 0 ? rawBookings[0].supplier : null

  return {
    bookings,
    summary: {
      gross: summary.gross,
      grossAll: summary.grossAll,
      commission: summary.commission,
      net: summary.net,
      reservations: summary.reservations,
      commissionPercentage: effectiveCommissionPercentage,
    },
    supplier: supplierInfo
      ? { _id: supplierInfo._id.toString(), fullName: supplierInfo.fullName }
      : undefined,
  }
}

export const fetchAdminCommissions = async (
  payload: bookcarsTypes.GetAdminCommissionsPayload,
): Promise<bookcarsTypes.GetAdminCommissionsResponse> => {
  const { filters } = payload
  const now = new Date()
  const month = Number.isFinite(filters?.month)
    ? Math.min(Math.max(filters.month, 0), 11)
    : now.getMonth()
  const year = Number.isFinite(filters?.year)
    ? filters.year
    : now.getFullYear()
  const normalizedQuery = (filters?.query || '').trim().toLowerCase()
  const agencyStatusFilter = filters?.agencyStatus || 'all'
  const paymentStatusFilter = filters?.paymentStatus || 'all'
  const aboveThreshold = Boolean(filters?.aboveThreshold)
  const pageSize = Math.max(1, Math.min(1000, filters?.pageSize || 25))
  const page = Math.max(1, filters?.page || 1)

  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const endDate = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0))

  const pipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        expireAt: null,
        from: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $lookup: {
        from: 'User',
        let: { supplierId: '$supplier' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$supplierId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
              email: 1,
              phone: 1,
              slug: 1,
              active: 1,
              blacklisted: 1,
            },
          },
        ],
        as: 'supplier',
      },
    },
    { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: false } },
    {
      $project: {
        _id: 1,
        from: 1,
        to: 1,
        price: 1,
        status: 1,
        commission: 1,
        commissionTotal: 1,
        commissionRate: 1,
        commissionStatus: 1,
        notifications: 1,
        supplier: 1,
      },
    },
    { $sort: { 'supplier._id': 1, from: 1, _id: 1 } },
  ]

  const rawBookings = await Booking.aggregate<RawCommissionBooking & {
    supplier: {
      _id: mongoose.Types.ObjectId
      fullName: string
      email?: string
      phone?: string
      slug?: string
      active?: boolean
      blacklisted?: boolean
    }
  }>(pipeline)

  if (rawBookings.length === 0) {
    return {
      agencies: [],
      total: 0,
      page,
      pageSize,
      summary: {
        grossRevenue: 0,
        commissionDue: 0,
        commissionCollected: 0,
        agenciesOverThreshold: 0,
      },
      month,
      year,
      threshold: COMMISSION_THRESHOLD,
      effectiveDate: COMMISSION_EFFECTIVE_DATE ? COMMISSION_EFFECTIVE_DATE.toISOString() : undefined,
    }
  }

  const grouped = new Map<string, Array<typeof rawBookings[number]>>()
  rawBookings.forEach((booking) => {
    if (!booking.supplier?._id) {
      return
    }

    const supplierId = booking.supplier._id.toString()
    if (!grouped.has(supplierId)) {
      grouped.set(supplierId, [])
    }
    grouped.get(supplierId)?.push(booking)
  })

  const supplierIds = Array.from(grouped.keys())
  const supplierObjectIds = supplierIds.map((id) => new mongoose.Types.ObjectId(id))
  const states = await Promise.all(supplierObjectIds.map((supplierId) => ensureCommissionState(supplierId, month, year)))
  const stateMap = new Map(states.map((state) => [state.supplier.toString(), state]))

  const suppliers = await User.find({ _id: { $in: supplierObjectIds } }, 'fullName email phone slug active blacklisted').lean<{
    _id: mongoose.Types.ObjectId
    fullName: string
    email?: string
    phone?: string
    slug?: string
    active?: boolean
    blacklisted?: boolean
  }>({})
  const supplierMap = new Map(suppliers.map((supplier) => [supplier._id.toString(), supplier]))

  const agencies = Array.from(grouped.entries()).map(([supplierId, bookings]) => {
    const normalizedBookings = bookings.map((booking) => normalizeCommissionBooking(booking).booking)

    let grossTotal = 0
    let commissionDue = 0

    normalizedBookings.forEach((booking) => {
      grossTotal += booking.totalClient

      const bookingStart = new Date(booking.from)
      const eligibleByDate = !COMMISSION_EFFECTIVE_DATE || bookingStart >= COMMISSION_EFFECTIVE_DATE
      if (eligibleByDate && BILLABLE_STATUSES.has(booking.bookingStatus)) {
        commissionDue += booking.commission
      }
    })

    const state = stateMap.get(supplierId)
    const supplierInfo = supplierMap.get(supplierId)
    const paymentStatus = state?.paymentStatus || bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid
    const commissionPaidRaw = typeof state?.commissionPaid === 'number' ? state.commissionPaid : undefined
    let commissionPaid = 0
    if (Number.isFinite(commissionPaidRaw)) {
      commissionPaid = Math.max(0, Math.round(commissionPaidRaw as number))
    } else if (paymentStatus === bookcarsTypes.AgencyCommissionPaymentStatus.Paid) {
      commissionPaid = Math.round(commissionDue)
    }
    const blocked = Boolean(state?.blocked || supplierInfo?.blacklisted)
    const reminders = mapReminderStats(state?.reminders)
    const notes = mapNoteEntries(state?.notes)
    const logs = mapLogEntries(state?.logs)
    const overThreshold = commissionDue >= COMMISSION_THRESHOLD

    return {
      supplier: {
        _id: supplierId,
        fullName: supplierInfo?.fullName || bookings[0]?.supplier?.fullName || '',
        email: supplierInfo?.email,
        phone: supplierInfo?.phone,
        slug: supplierInfo?.slug,
      },
      stateId: state?._id ? state._id.toString() : '',
      bookingsCount: normalizedBookings.length,
      grossTotal: Math.round(grossTotal),
      commissionDue: Math.round(commissionDue),
      commissionPaid,
      paymentStatus,
      blocked,
      overThreshold,
      reminders,
      notes,
      logs,
      bookings: normalizedBookings,
    } as bookcarsTypes.AgencyCommissionAgencySummary
  })

  const filteredAgencies = agencies.filter((agency) => {
    if (normalizedQuery) {
      const haystack = [
        agency.supplier.fullName,
        agency.supplier.slug,
        agency.supplier._id,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())
      if (!haystack.some((value) => value.includes(normalizedQuery))) {
        return false
      }
    }

    if (aboveThreshold && !agency.overThreshold) {
      return false
    }

    if (paymentStatusFilter !== 'all' && agency.paymentStatus !== paymentStatusFilter) {
      return false
    }

    if (agencyStatusFilter === 'active' && agency.blocked) {
      return false
    }

    if (agencyStatusFilter === 'blocked' && !agency.blocked) {
      return false
    }

    if (agencyStatusFilter === 'follow_up'
      && agency.paymentStatus !== bookcarsTypes.AgencyCommissionPaymentStatus.FollowUp) {
      return false
    }

    return true
  })

  const summary = filteredAgencies.reduce<bookcarsTypes.AgencyCommissionKpis>((acc, agency) => {
    acc.grossRevenue += agency.grossTotal
    acc.commissionDue += agency.commissionDue
    acc.commissionCollected += agency.commissionPaid
    if (agency.overThreshold) {
      acc.agenciesOverThreshold += 1
    }
    return acc
  }, {
    grossRevenue: 0,
    commissionDue: 0,
    commissionCollected: 0,
    agenciesOverThreshold: 0,
  })

  const total = filteredAgencies.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const offset = (currentPage - 1) * pageSize
  const paginated = filteredAgencies.slice(offset, offset + pageSize)

  return {
    agencies: paginated,
    total,
    page: currentPage,
    pageSize,
    summary,
    month,
    year,
    threshold: COMMISSION_THRESHOLD,
    effectiveDate: COMMISSION_EFFECTIVE_DATE ? COMMISSION_EFFECTIVE_DATE.toISOString() : undefined,
  }
}

export const updateAgencyCommissionStatus = async (
  stateId: string,
  payload: bookcarsTypes.UpdateAgencyCommissionStatusPayload,
  actor?: bookcarsTypes.User | null,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(stateId)) {
    return null
  }

  const state = await AgencyCommissionState.findById(new mongoose.Types.ObjectId(stateId))
  if (!state) {
    return null
  }

  state.paymentStatus = payload.status

  if (typeof payload.amountPaid === 'number' && Number.isFinite(payload.amountPaid)) {
    state.commissionPaid = Math.max(0, Math.round(payload.amountPaid))
  }

  const createdBy = buildCreatedBy(actor)
  state.logs.push({
    type: 'status',
    message: `Payment status updated to ${payload.status}`,
    createdAt: new Date(),
    createdBy,
  })

  if (payload.note) {
    const note = {
      message: payload.note,
      createdAt: new Date(),
      createdBy,
    }
    state.notes.push(note)
    state.logs.push({
      type: 'note',
      message: payload.note,
      createdAt: new Date(),
      createdBy,
    })
  }

  await state.save()

  return mapStateToResponse(state)
}

export const toggleAgencyCommissionBlock = async (
  stateId: string,
  payload: bookcarsTypes.ToggleAgencyCommissionBlockPayload,
  actor?: bookcarsTypes.User | null,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(stateId)) {
    return null
  }

  const state = await AgencyCommissionState.findById(new mongoose.Types.ObjectId(stateId))
  if (!state) {
    return null
  }

  state.blocked = payload.blocked

  const createdBy = buildCreatedBy(actor)
  state.logs.push({
    type: payload.blocked ? 'block' : 'unblock',
    message: payload.reason || (payload.blocked ? 'Agency blocked' : 'Agency unblocked'),
    createdAt: new Date(),
    createdBy,
  })

  await state.save()

  if (state.supplier) {
    await User.findByIdAndUpdate(state.supplier, {
      blacklisted: payload.blocked,
      active: !payload.blocked,
    })
  }

  return mapStateToResponse(state)
}

export const addAgencyCommissionNote = async (
  stateId: string,
  payload: bookcarsTypes.CreateAgencyCommissionNotePayload,
  actor?: bookcarsTypes.User | null,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(stateId)) {
    return null
  }

  const state = await AgencyCommissionState.findById(new mongoose.Types.ObjectId(stateId))
  if (!state) {
    return null
  }

  const createdBy = buildCreatedBy(actor)
  const note = {
    message: payload.message,
    createdAt: new Date(),
    createdBy,
  }

  state.notes.push(note)
  state.logs.push({
    type: 'note',
    message: payload.message,
    createdAt: new Date(),
    createdBy,
  })

  await state.save()

  return mapStateToResponse(state)
}

export const sendAgencyCommissionReminder = async (
  stateId: string,
  payload: bookcarsTypes.SendAgencyCommissionReminderPayload,
  actor?: bookcarsTypes.User | null,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(stateId)) {
    return null
  }

  const state = await AgencyCommissionState.findById(new mongoose.Types.ObjectId(stateId))
  if (!state) {
    return null
  }

  const supplier = await User.findById(state.supplier).lean<{
    _id: mongoose.Types.ObjectId
    fullName: string
    email?: string
    phone?: string
    language?: string
  }>()

  if (!supplier) {
    return null
  }

  const settings = await ensureCommissionSettings()
  const commissionData = await fetchAgencyCommissions({
    suppliers: [state.supplier.toString()],
    month: state.month,
    year: state.year,
  })

  const commissionDue = commissionData.summary?.commission || 0
  const monthLabel = MONTHS_FR[state.month] || `${state.month + 1}`
  const variables: Record<string, string> = {
    agency_name: supplier.fullName || '',
    month_label: monthLabel,
    year: String(state.year),
    commission_due: Math.round(commissionDue).toString(),
    threshold: Math.round(COMMISSION_THRESHOLD).toString(),
    payment_link: env.FRONTEND_HOST ? `${env.FRONTEND_HOST}/commissions` : '',
  }

  const defaultEmailSubject = 'Relance commission {{month_label}} {{year}}'
  const defaultEmailBody = 'Bonjour {{agency_name}},<br/>Merci de régler votre commission de {{commission_due}} TND pour {{month_label}} {{year}}.'
  const defaultSmsBody = 'Plany: Commission {{month_label}} {{year}} de {{commission_due}} TND. Merci.'

  const emailSubjectTemplate = payload.emailSubject || settings?.email_subject || defaultEmailSubject
  const emailBodyTemplate = payload.emailBody || settings?.email_body || defaultEmailBody
  const smsBodyTemplate = payload.smsBody || settings?.sms_body || defaultSmsBody

  const emailSubject = renderTemplate(emailSubjectTemplate, variables)
  const emailBody = renderTemplate(emailBodyTemplate, variables)
  const smsBody = renderTemplate(smsBodyTemplate, variables)

  const createdBy = buildCreatedBy(actor)
  const reminderDate = new Date()
  let sent = false

  if ((payload.channel === 'email' || payload.channel === 'both') && supplier.email) {
    await mailHelper.sendMail({
      to: supplier.email,
      subject: emailSubject,
      html: emailBody,
      replyTo: settings?.from_email || undefined,
    })
    state.reminders.emailCount = (state.reminders.emailCount || 0) + 1
    state.reminders.lastEmailAt = reminderDate
    state.logs.push({
      type: 'reminder_email',
      message: emailSubject,
      createdAt: reminderDate,
      createdBy,
    })
    sent = true
  }

  if ((payload.channel === 'sms' || payload.channel === 'both') && supplier.phone) {
    const formattedPhone = validateAndFormatPhoneNumber(supplier.phone)
    if (formattedPhone.isValide && formattedPhone.phone) {
      await sendSms(formattedPhone.phone, smsBody.slice(0, 160))
      state.reminders.smsCount = (state.reminders.smsCount || 0) + 1
      state.reminders.lastSmsAt = reminderDate
      state.logs.push({
        type: 'reminder_sms',
        message: smsBody,
        createdAt: reminderDate,
        createdBy,
      })
      sent = true
    }
  }

  if (!sent) {
    return null
  }

  await state.save()

  return mapStateToResponse(state)
}

export const getAgencyCommissionSettings = async (): Promise<bookcarsTypes.AgencyCommissionSettings> => {
  const settings = await ensureCommissionSettings()
  return mapSettingsToResponse(settings)
}

export const upsertAgencyCommissionSettings = async (
  payload: bookcarsTypes.UpsertAgencyCommissionSettingsPayload,
  actor?: bookcarsTypes.User | null,
): Promise<bookcarsTypes.AgencyCommissionSettings> => {
  const createdBy = buildCreatedBy(actor)
  const update: Partial<AgencyCommissionSettingDocument> = {
    email_subject: payload.email_subject,
    email_body: payload.email_body,
    sms_body: payload.sms_body,
    from_email: payload.from_email,
    from_name: payload.from_name,
    from_sms_sender: payload.from_sms_sender,
    updated_at: new Date(),
  }

  if (createdBy?._id) {
    update.updated_by = createdBy._id
    update.updated_by_name = createdBy.fullName
  }

  const settings = await AgencyCommissionSetting
    .findOneAndUpdate({}, { $set: update }, { upsert: true, new: true, setDefaultsOnInsert: true })
    .lean<AgencyCommissionSettingDocument & { _id: mongoose.Types.ObjectId }>()

  return mapSettingsToResponse(settings)
}

export const fetchCommissionBookingById = async (bookingId: string) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return null
  }

  const booking = await Booking
    .findById(new mongoose.Types.ObjectId(bookingId))
    .populate('driver', 'fullName email language phone')
    .populate('supplier', 'fullName email language phone')
    .lean<{
      _id: mongoose.Types.ObjectId
      from: Date
      to: Date
      price?: number
      status: bookcarsTypes.BookingStatus
      commission?: number
      commissionTotal?: number
      commissionRate?: number
      commissionStatus?: bookcarsTypes.CommissionStatus
      driver?: { _id: mongoose.Types.ObjectId; fullName: string; email?: string; language?: string; phone?: string }
      supplier?: { _id: mongoose.Types.ObjectId; fullName: string; email?: string; language?: string; phone?: string }
      notifications?: {
        supplier?: { count?: number; lastSent?: Date | null }
        client?: { count?: number; lastSent?: Date | null }
      }
    }>()

  if (!booking) {
    return null
  }

  const fromDate = new Date(booking.from)
  const toDate = new Date(booking.to)
  const days = Math.max(getRentalDays(fromDate, toDate), 1)
  const totalClient = Math.round(booking.price || 0)
  const commissionRateValue = typeof booking.commissionRate === 'number'
    ? booking.commissionRate
    : undefined
  let storedCommission: number | undefined
  if (typeof booking.commission === 'number') {
    storedCommission = booking.commission
  } else if (typeof booking.commissionTotal === 'number') {
    storedCommission = booking.commissionTotal
  }
  const commissionAmount = typeof storedCommission === 'number'
    ? Math.round(storedCommission)
    : calculateCommissionAmount(booking.price, commissionRateValue)
  const commissionDue = BILLABLE_STATUSES.has(booking.status)
    ? commissionAmount
    : 0
  const netAgency = totalClient - commissionDue
  const pricePerDay = Math.round(days > 0 ? totalClient / days : totalClient)

  const commissionBooking: bookcarsTypes.AgencyCommissionBooking = {
    bookingId: booking._id.toString(),
    bookingNumber: booking._id.toString(),
    bookingStatus: booking.status,
    commissionStatus: booking.commissionStatus || bookcarsTypes.CommissionStatus.Pending,
    driver: {
      _id: booking.driver?._id.toString() || '',
      fullName: booking.driver?.fullName || '',
    },
    supplier: booking.supplier
      ? { _id: booking.supplier._id.toString(), fullName: booking.supplier.fullName || '' }
      : { _id: '', fullName: '' },
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    days,
    pricePerDay,
    totalClient,
    commission: commissionDue,
    netAgency,
    notifications: booking.notifications
      ? {
        supplier: booking.notifications.supplier
          ? {
            count: Math.max(0, booking.notifications.supplier.count || 0),
            lastSent: booking.notifications.supplier.lastSent instanceof Date
              ? booking.notifications.supplier.lastSent.toISOString()
              : undefined,
          }
          : undefined,
        client: booking.notifications.client
          ? {
            count: Math.max(0, booking.notifications.client.count || 0),
            lastSent: booking.notifications.client.lastSent instanceof Date
              ? booking.notifications.client.lastSent.toISOString()
              : undefined,
          }
          : undefined,
      }
      : undefined,
  }

  const supplier = booking.supplier
    ? { _id: booking.supplier._id.toString(), fullName: booking.supplier.fullName }
    : undefined

  return {
    booking: commissionBooking,
    supplier,
  }
}

type MutableReminderSummary = {
  supplier?: { count: number; lastSent?: Date }
  client?: { count: number; lastSent?: Date }
}

const createMutableReminderSummary = (notifications?: {
  supplier?: { count?: number; lastSent?: Date | null }
  client?: { count?: number; lastSent?: Date | null }
}): MutableReminderSummary => ({
  supplier: notifications?.supplier
    ? {
      count: Math.max(0, notifications.supplier.count || 0),
      lastSent: notifications.supplier.lastSent || undefined,
    }
    : undefined,
  client: notifications?.client
    ? {
      count: Math.max(0, notifications.client.count || 0),
      lastSent: notifications.client.lastSent || undefined,
    }
    : undefined,
})

const normalizeReminderSummary = (
  summary: MutableReminderSummary,
): bookcarsTypes.CommissionReminderSummary => ({
  supplier: summary.supplier
    ? {
      count: summary.supplier.count,
      lastSent: summary.supplier.lastSent ? summary.supplier.lastSent.toISOString() : undefined,
    }
    : undefined,
  client: summary.client
    ? {
      count: summary.client.count,
      lastSent: summary.client.lastSent ? summary.client.lastSent.toISOString() : undefined,
    }
    : undefined,
})

export const triggerCommissionReminder = async (
  bookingId: string,
  target: bookcarsTypes.CommissionReminderTarget,
): Promise<bookcarsTypes.CommissionReminderResponse | null> => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return null
  }

  const booking = await Booking
    .findById(new mongoose.Types.ObjectId(bookingId))
    .populate('driver', 'fullName email language')
    .populate('supplier', 'fullName email language')
    .lean<{
      _id: mongoose.Types.ObjectId
      supplier?: { _id: mongoose.Types.ObjectId; fullName: string; email?: string; language?: string }
      driver?: { _id: mongoose.Types.ObjectId; fullName: string; email?: string; language?: string }
      notifications?: {
        supplier?: { count?: number; lastSent?: Date | null }
        client?: { count?: number; lastSent?: Date | null }
      }
    }>()

  if (!booking) {
    return null
  }

  const recipient = target === 'supplier' ? booking.supplier : booking.driver

  if (!recipient || !recipient.email) {
    throw new Error('RECIPIENT_EMAIL_NOT_FOUND')
  }

  const locale = recipient.language || 'fr'
  i18n.locale = locale
  const subjectKey = target === 'supplier'
    ? 'COMMISSION_REMINDER_SUPPLIER_SUBJECT'
    : 'COMMISSION_REMINDER_CLIENT_SUBJECT'
  const bodyKey = target === 'supplier'
    ? 'COMMISSION_REMINDER_SUPPLIER_BODY'
    : 'COMMISSION_REMINDER_CLIENT_BODY'

  const bookingRef = booking._id.toString()
  const html = `
    <p>${i18n.t('HELLO')} <strong>${recipient.fullName}</strong>,</p>
    <p>${i18n.t(bodyKey, { booking: bookingRef })}</p>
    <p>${i18n.t('THANK_YOU')}</p>
  `

  await mailHelper.sendMail({
    to: recipient.email,
    subject: i18n.t(subjectKey),
    html,
  })

  const baseNotifications = createMutableReminderSummary(booking.notifications)

  const now = new Date()
  if (target === 'supplier') {
    const count = (baseNotifications.supplier?.count || 0) + 1
    baseNotifications.supplier = { count, lastSent: now }
  } else {
    const count = (baseNotifications.client?.count || 0) + 1
    baseNotifications.client = { count, lastSent: now }
  }

  await Booking.findByIdAndUpdate(
    booking._id,
    {
      notifications: {
        supplier: baseNotifications.supplier
          ? { count: baseNotifications.supplier.count, lastSent: baseNotifications.supplier.lastSent }
          : undefined,
        client: baseNotifications.client
          ? { count: baseNotifications.client.count, lastSent: baseNotifications.client.lastSent }
          : undefined,
      },
    },
    { new: false },
  )

  return {
    target,
    notifications: normalizeReminderSummary(baseNotifications),
  }
}

export const generateMonthlyInvoice = async (
  res: Response,
  data: bookcarsTypes.AgencyCommissionsResponse,
  supplier: Pick<bookcarsTypes.User, '_id' | 'fullName'>,
  month: number,
  year: number,
) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const safeMonthIndex = Math.max(0, Math.min(11, month))
  const monthLabel = MONTHS_FR[safeMonthIndex]
  const sanitizedMonth = monthLabel
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
  const filename = `facture_commission_${sanitizedMonth}_${year}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  doc.pipe(res)

  let logoBuffer: Buffer | undefined
  try {
    const response = await axios.get<ArrayBuffer>('https://plany.tn/logo.png', { responseType: 'arraybuffer' })
    logoBuffer = Buffer.from(response.data)
  } catch (err) {
    console.warn('[commission.generateMonthlyInvoice] Unable to load Plany logo', err)
  }

  doc.font('Helvetica')
  doc.fontSize(9)

  if (logoBuffer) {
    doc.image(logoBuffer, doc.page.margins.left, doc.page.margins.top, { width: 120, height: 50 })
    doc.moveDown(2)
  }

  doc.fillColor('#000000')
  doc.fontSize(16).text('Facture des commissions agence', { align: 'center' })
  doc.moveDown(0.8)
  doc.fontSize(9)

  doc.text(`Agence : ${supplier.fullName}`)
  doc.text(`Période : ${monthLabel} ${year}`)
  doc.text(`Taux de commission Plany : ${data.summary.commissionPercentage}%`)
  doc.moveDown(1.2)

  const columns: Array<{ label: string; width: number; getValue: (booking: bookcarsTypes.AgencyCommissionBooking) => string }> = [
    { label: 'N° Réservation', width: 130, getValue: (booking) => booking.bookingNumber },
    { label: 'Jours', width: 60, getValue: (booking) => String(booking.days) },
    { label: 'Total client (TND)', width: 105, getValue: (booking) => formatAmount(booking.totalClient) },
    { label: 'Commission (TND)', width: 100, getValue: (booking) => formatAmount(booking.commission) },
    { label: 'Net agence (TND)', width: 100, getValue: (booking) => formatAmount(booking.netAgency) },
  ]

  const tableStartX = doc.page.margins.left
  let currentY = doc.y
  const rowHeight = 24
  const lineWidth = 0.5

  const drawRow = (
    values: string[],
    options: { backgroundColor?: string; header?: boolean },
  ) => {
    let cursorX = tableStartX
    values.forEach((value, index) => {
      const column = columns[index]
      if (!column) {
        return
      }

      if (options.backgroundColor) {
        doc.save()
        doc.rect(cursorX, currentY, column.width, rowHeight).fill(options.backgroundColor)
        doc.restore()
      }

      doc.lineWidth(lineWidth).strokeColor('#9e9e9e').rect(cursorX, currentY, column.width, rowHeight).stroke()

      doc.fillColor(options.header ? '#ffffff' : '#000000')
      doc.text(
        value,
        cursorX,
        currentY + (rowHeight / 2) - 5,
        {
          width: column.width,
          align: 'center',
        },
      )

      cursorX += column.width
    })
    currentY += rowHeight
  }

  drawRow(
    columns.map((column) => column.label),
    { header: true, backgroundColor: '#1976d2' },
  )

  const hasBookings = data.bookings.length > 0
  if (hasBookings) {
    data.bookings.forEach((booking) => {
      drawRow(columns.map((column) => column.getValue(booking)), { header: false })
    })
  }

  const summaryValues = [
    'TOTAL',
    '',
    formatAmount(data.summary.gross),
    formatAmount(data.summary.commission),
    formatAmount(data.summary.net),
  ]

  drawRow(summaryValues, { backgroundColor: '#eeeeee' })

  doc.moveDown(2)

  doc.fillColor('#000000')
  doc.text('Document généré automatiquement – Merci d\'utiliser Plany', { align: 'center' })

  doc.end()
}

export const generateBookingInvoice = (
  res: Response,
  payload: { booking: bookcarsTypes.AgencyCommissionBooking; supplier?: Pick<bookcarsTypes.User, '_id' | 'fullName'> },
) => {
  const { booking, supplier } = payload
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const filename = `commission_booking_${booking.bookingNumber}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  doc.pipe(res)

  doc.fontSize(18).text('Facture commission réservation', { align: 'center' })
  doc.moveDown()

  if (supplier) {
    doc.fontSize(12).text(`Agence : ${supplier.fullName}`)
  }
  doc.fontSize(12).text(`Réservation : ${booking.bookingNumber}`)
  doc.text(`Client : ${booking.driver.fullName}`)
  doc.text(`Période : ${formatDate(booking.from)} → ${formatDate(booking.to)}`)
  doc.text(`Jours : ${booking.days}`)
  doc.moveDown()

  doc.font('Helvetica-Bold').text(`Total client : ${formatAmount(booking.totalClient)}`)
  doc.font('Helvetica').text(`Commission Plany : ${formatAmount(booking.commission)}`)
  doc.text(`Net agence : ${formatAmount(booking.netAgency)}`)
  doc.text(`Statut réservation : ${BOOKING_STATUS_LABELS_FR[booking.bookingStatus]}`)
  doc.text(`Statut commission : ${COMMISSION_STATUS_LABELS_FR[booking.commissionStatus]}`)

  doc.moveDown()
  doc.fontSize(10).text('Document généré automatiquement – Merci d\'utiliser Plany', { align: 'center' })

  doc.end()
}

export const getSupplierById = async (supplierId: string) => {
  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return null
  }

  const supplier = await User
    .findById(new mongoose.Types.ObjectId(supplierId))
    .select('_id fullName')
    .lean<{ _id: mongoose.Types.ObjectId; fullName: string }>()

  if (!supplier) {
    return null
  }

  return {
    _id: supplier._id.toString(),
    fullName: supplier.fullName,
  }
}
