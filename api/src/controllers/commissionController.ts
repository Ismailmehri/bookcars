import { Request, Response } from 'express'
import escapeStringRegexp from 'escape-string-regexp'
import PDFDocument from 'pdfkit'
import axios from 'axios'
import mongoose from 'mongoose'
import validator from 'validator'
import * as bookcarsTypes from ':bookcars-types'
import { getCommissionConfig } from ':bookcars-helper'
import Booking from '../models/Booking'
import User from '../models/User'
import Car from '../models/Car'
import AgencyCommissionEvent from '../models/AgencyCommissionEvent'
import AgencyCommissionState from '../models/AgencyCommissionState'
import AgencyCommissionSettings from '../models/AgencyCommissionSettings'
import * as env from '../config/env.config'
import * as authHelper from '../common/authHelper'
import * as logger from '../common/logger'
import * as mailHelper from '../common/mailHelper'
import { sendSms, validateAndFormatPhoneNumber } from '../common/smsHelper'
import i18n from '../lang/i18n'

interface CommissionComputationResult {
  summary: bookcarsTypes.AgencyCommissionSummary
  rows: bookcarsTypes.AgencyCommissionRow[]
  total: number
}

type CommissionEventRecord = Omit<env.AgencyCommissionEvent, 'admin'> & {
  admin?: env.User | mongoose.Types.ObjectId
}
const CSV_SEPARATOR = ';'
const LOGO_URL = 'https://plany.tn/logo.png'

const ensureAdmin = async (req: Request): Promise<env.User | null> => {
  const sessionData = await authHelper.getSessionData(req)
  if (!sessionData || !sessionData.id) {
    return null
  }

  const user = await User.findById(sessionData.id)
  if (!user || user.type !== bookcarsTypes.UserType.Admin) {
    return null
  }

  return user
}

const ensureCommissionUser = async (req: Request): Promise<env.User | null> => {
  const sessionData = await authHelper.getSessionData(req)
  if (!sessionData || !sessionData.id) {
    return null
  }

  const user = await User.findById(sessionData.id)
  if (!user) {
    return null
  }

  if (
    user.type !== bookcarsTypes.UserType.Admin
    && user.type !== bookcarsTypes.UserType.Supplier
  ) {
    return null
  }

  return user
}

const getPeriodBoundaries = (year: number, month: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start, end }
}

const normalizeNumber = (value: number | undefined | null): number => {
  if (!value) {
    return 0
  }
  return Math.round(value)
}

const formatCurrency = (value: number) => value.toLocaleString('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const fetchLogo = async (): Promise<Buffer | null> => {
  try {
    const response = await axios.get(LOGO_URL, { responseType: 'arraybuffer' })
    return Buffer.from(response.data)
  } catch {
    return null
  }
}

const COMMISSION_ELIGIBLE_STATUSES: bookcarsTypes.BookingStatus[] = [
  bookcarsTypes.BookingStatus.Reserved,
  bookcarsTypes.BookingStatus.Deposit,
  bookcarsTypes.BookingStatus.Paid,
]

const BIC_REGEX = /^[A-Za-z]{4}[A-Za-z]{2}[0-9A-Za-z]{2}([0-9A-Za-z]{3})?$/

type SanitizedRibDetails = {
  accountHolder: string
  bankName: string
  bankAddress?: string
  iban: string
  bic: string
  accountNumber: string
}

const sanitizeRibDetails = (details?: bookcarsTypes.CommissionRibDetails | null): SanitizedRibDetails | null => {
  if (!details) {
    return null
  }

  const sanitized: SanitizedRibDetails = {
    accountHolder: (details.accountHolder || '').trim(),
    bankName: (details.bankName || '').trim(),
    iban: (details.iban || '').replace(/\s+/g, '').toUpperCase(),
    bic: (details.bic || '').replace(/\s+/g, '').toUpperCase(),
    accountNumber: (details.accountNumber || '').replace(/\s+/g, ''),
  }

  const bankAddress = (details.bankAddress || '').trim()
  if (bankAddress) {
    sanitized.bankAddress = bankAddress
  }

  return sanitized
}

const validateRibDetails = (details?: bookcarsTypes.CommissionRibDetails | null): SanitizedRibDetails | null => {
  const sanitized = sanitizeRibDetails(details)
  if (!sanitized) {
    return null
  }

  if (
    !sanitized.accountHolder
    || !sanitized.bankName
    || !sanitized.iban
    || !sanitized.bic
    || !sanitized.accountNumber
  ) {
    return null
  }

  if (!validator.isIBAN(sanitized.iban)) {
    return null
  }

  if (!BIC_REGEX.test(sanitized.bic)) {
    return null
  }

  if (sanitized.accountNumber.length < 6) {
    return null
  }

  return sanitized
}

const buildPaymentOptions = (
  settings: env.AgencyCommissionSettings,
): bookcarsTypes.CommissionPaymentOptions => ({
  bankTransferEnabled: settings.bankTransferEnabled !== false,
  cardPaymentEnabled: settings.cardPaymentEnabled === true,
  d17PaymentEnabled: settings.d17PaymentEnabled === true,
  bankTransferRibInformation: settings.bankTransferRibInformation || '',
  bankTransferRibDetails: sanitizeRibDetails(settings.bankTransferRibDetails),
})

const isCommissionEligibleStatus = (status?: bookcarsTypes.BookingStatus | null) => {
  if (!status) {
    return false
  }

  return COMMISSION_ELIGIBLE_STATUSES.includes(status)
}

const getUserId = (user: env.User): string => {
  if (typeof user._id === 'string') {
    return user._id
  }

  if (user._id) {
    return user._id.toString()
  }

  return ''
}

const toAgency = (user: env.User): bookcarsTypes.AgencyCommissionAgency => ({
  id: getUserId(user),
  name: user.fullName,
  city: user.location || undefined,
  email: user.email || undefined,
  phone: user.phone || undefined,
  slug: user.slug || undefined,
})

const ensureObjectId = (value?: mongoose.Types.ObjectId | string) => {
  if (!value) {
    return undefined
  }

  if (typeof value === 'string') {
    return new mongoose.Types.ObjectId(value)
  }

  return value
}

const computeStatus = (
  blocked: boolean,
  balance: number,
): bookcarsTypes.AgencyCommissionStatus => {
  if (blocked) {
    return bookcarsTypes.AgencyCommissionStatus.Blocked
  }

  if (balance > 0) {
    return bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp
  }

  return bookcarsTypes.AgencyCommissionStatus.Active
}

const buildReminderInfo = (
  event?: CommissionEventRecord | null,
): bookcarsTypes.AgencyCommissionReminderInfo | undefined => {
  if (!event) {
    return undefined
  }

  const channel = event.channel || bookcarsTypes.CommissionReminderChannel.Email

  return {
    date: event.createdAt,
    channel,
    success: event.success !== false,
  }
}
const getSettingsDocument = async () => {
  let settings = await AgencyCommissionSettings.findOne()

  if (!settings) {
    settings = new AgencyCommissionSettings()
    await settings.save()
  }

  return settings
}

const computeCommissionData = async (
  year: number,
  month: number,
  filters: bookcarsTypes.CommissionListPayload,
  page: number,
  size: number,
): Promise<CommissionComputationResult> => {
  const { start, end } = getPeriodBoundaries(year, month)
  const config = getCommissionConfig()
  const effectiveStart = start.getTime() < config.effectiveDate.getTime() ? config.effectiveDate : start

  if (effectiveStart.getTime() >= end.getTime()) {
    return {
      summary: {
        grossTurnover: 0,
        commissionDue: 0,
        commissionCollected: 0,
        agenciesAboveThreshold: 0,
        threshold: config.monthlyThreshold,
      },
      rows: [],
      total: 0,
    }
  }

  const bookingsAggregation = await Booking.aggregate([
    {
      $match: {
        expireAt: null,
        from: { $lt: end },
        to: { $gte: effectiveStart },
      },
    },
    {
      $group: {
        _id: '$supplier',
        reservations: { $sum: 1 },
        grossTurnover: {
          $sum: {
            $cond: [
              { $in: ['$status', COMMISSION_ELIGIBLE_STATUSES] },
              { $ifNull: ['$price', 0] },
              0,
            ],
          },
        },
        commissionDue: {
          $sum: {
            $cond: [
              { $in: ['$status', COMMISSION_ELIGIBLE_STATUSES] },
              { $ifNull: ['$commissionTotal', 0] },
              0,
            ],
          },
        },
      },
    },
  ])

  const supplierIds = bookingsAggregation.map((item) => item._id as mongoose.Types.ObjectId)
  const suppliers = await User.find({ _id: { $in: supplierIds } })
  const states = await AgencyCommissionState.find({ agency: { $in: supplierIds } })
  const events = await AgencyCommissionEvent.find({
    agency: { $in: supplierIds },
    month,
    year,
  })
    .sort({ createdAt: 1 })
    .lean<CommissionEventRecord[]>()

  const supplierMap = new Map<string, env.User>()
  suppliers.forEach((supplier) => {
    const supplierId = getUserId(supplier)
    if (supplierId) {
      supplierMap.set(supplierId, supplier)
    }
  })

  const stateMap = new Map<string, env.AgencyCommissionState>()
  states.forEach((state) => {
    stateMap.set(state.agency.toString(), state)
  })

  const paymentTotals = new Map<string, number>()
  const lastPayment = new Map<string, Date>()
  const lastReminder = new Map<string, CommissionEventRecord>()

  events.forEach((event) => {
    const agencyId = event.agency.toString()
    if (event.type === bookcarsTypes.AgencyCommissionEventType.Payment) {
      const amount = event.amount || 0
      const total = paymentTotals.get(agencyId) || 0
      paymentTotals.set(agencyId, total + amount)
      const paymentDate = event.paymentDate || event.createdAt
      const currentLastPayment = lastPayment.get(agencyId)
      if (!currentLastPayment || (paymentDate && paymentDate > currentLastPayment)) {
        lastPayment.set(agencyId, paymentDate)
      }
    } else if (event.type === bookcarsTypes.AgencyCommissionEventType.Reminder) {
      const current = lastReminder.get(agencyId)
      if (!current || current.createdAt < event.createdAt) {
        lastReminder.set(agencyId, event)
      }
    }
  })

  const rows: bookcarsTypes.AgencyCommissionRow[] = []

  let totalGross = 0
  let totalDue = 0
  let totalCollected = 0
  let agenciesAboveThreshold = 0

  bookingsAggregation.forEach((item) => {
    const supplierId = (item._id as mongoose.Types.ObjectId).toString()
    const supplier = supplierMap.get(supplierId)
    if (!supplier) {
      return
    }

    const grossTurnover = normalizeNumber(item.grossTurnover)
    const commissionDue = normalizeNumber(item.commissionDue)
    const collected = normalizeNumber(paymentTotals.get(supplierId) || 0)
    const balance = commissionDue - collected
    const aboveThreshold = commissionDue >= config.monthlyThreshold
    const state = stateMap.get(supplierId)
    const blocked = (state && state.blocked) || supplier.blacklisted || false

    totalGross += grossTurnover
    totalDue += commissionDue
    totalCollected += collected

    if (aboveThreshold) {
      agenciesAboveThreshold += 1
    }

    const status = computeStatus(blocked, balance)

    rows.push({
      agency: toAgency(supplier),
      reservations: item.reservations as number,
      grossTurnover,
      commissionDue,
      commissionCollected: collected,
      balance: normalizeNumber(balance),
      lastPayment: lastPayment.get(supplierId),
      lastReminder: buildReminderInfo(lastReminder.get(supplierId)),
      status,
      aboveThreshold,
    })
  })

  let filteredRows = rows
  const search = filters.search ? filters.search.trim() : ''
  if (search) {
    const escaped = escapeStringRegexp(search)
    const regex = new RegExp(escaped, 'i')
    filteredRows = filteredRows.filter((row) => (
      regex.test(row.agency.name)
      || regex.test(row.agency.id)
      || (row.agency.city ? regex.test(row.agency.city) : false)
      || (row.agency.slug ? regex.test(row.agency.slug) : false)
    ))
  }

  if (filters.status && filters.status !== 'all') {
    filteredRows = filteredRows.filter((row) => row.status === filters.status)
  }

  if (filters.aboveThreshold) {
    filteredRows = filteredRows.filter((row) => row.aboveThreshold)
  }

  filteredRows.sort((a, b) => b.commissionDue - a.commissionDue || a.agency.name.localeCompare(b.agency.name))

  const total = filteredRows.length
  const offset = (page - 1) * size
  const paginatedRows = size > 0 ? filteredRows.slice(offset, offset + size) : filteredRows

  return {
    summary: {
      grossTurnover: normalizeNumber(totalGross),
      commissionDue: normalizeNumber(totalDue),
      commissionCollected: normalizeNumber(totalCollected),
      agenciesAboveThreshold,
      threshold: config.monthlyThreshold,
    },
    rows: paginatedRows,
    total,
  }
}

const formatDate = (value?: Date) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().split('T')[0]
}

const mapEventToLogEntry = (
  event: CommissionEventRecord,
): bookcarsTypes.AgencyCommissionLogEntry => {
  const admin = event.admin && typeof event.admin === 'object' && 'fullName' in event.admin
    ? (event.admin as env.User)
    : undefined

  return {
    id: event._id.toString(),
    type: event.type,
    date: event.createdAt,
    admin: admin ? toAgency(admin) : undefined,
    channel: event.channel || undefined,
    success: event.success,
    amount: event.amount,
    paymentDate: event.paymentDate,
    reference: event.reference || undefined,
    note: event.note || undefined,
    metadata: event.metadata || undefined,
  }
}

const getMonthLabel = (year: number, month: number, locale = 'fr-FR') => new Date(
  Date.UTC(year, month - 1, 1),
).toLocaleString(locale, { month: 'long' })

const formatCsvCell = (value: unknown) => {
  const stringValue = value === undefined || value === null ? '' : String(value)
  return `"${stringValue.replace(/"/g, '""')}"`
}

export const getMonthlyCommissions = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const page = Math.max(Number.parseInt(req.params.page, 10) || 1, 1)
    const size = Math.max(Number.parseInt(req.params.size, 10) || 10, 1)
    const { body }: { body: bookcarsTypes.CommissionListPayload } = req

    if (!body || !body.month || !body.year || body.month < 1 || body.month > 12) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const { rows, summary, total } = await computeCommissionData(body.year, body.month, body, page, size)

    return res.json({
      summary,
      agencies: rows,
      total,
      page,
      size,
    })
  } catch (err) {
    logger.error('[commission.getMonthlyCommissions]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const exportMonthlyCommissions = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const page = Math.max(Number.parseInt(req.params.page, 10) || 1, 1)
    const size = Math.max(Number.parseInt(req.params.size, 10) || 10, 1)
    const { body }: { body: bookcarsTypes.CommissionListPayload } = req

    if (!body || !body.month || !body.year || body.month < 1 || body.month > 12) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const { rows, summary } = await computeCommissionData(body.year, body.month, body, page, size)

    const headers = [
      'Agence',
      'Ville',
      'Identifiant',
      'Réservations',
      'CA brut (TND)',
      'Commission due (TND)',
      'Commission encaissée (TND)',
      'Solde (TND)',
      'Statut',
      'Dernière relance',
      'Dernier paiement',
    ]

    const rowsData = rows.map((row) => {
      const reminder = row.lastReminder
        ? `${formatDate(row.lastReminder.date)} (${row.lastReminder.channel})`
        : ''

      const lastPayment = row.lastPayment ? formatDate(row.lastPayment) : ''

      let statusLabel = 'Active'
      if (row.status === bookcarsTypes.AgencyCommissionStatus.Blocked) {
        statusLabel = 'Bloquée'
      } else if (row.status === bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp) {
        statusLabel = 'À relancer'
      }

      return [
        row.agency.name,
        row.agency.city || '',
        row.agency.id,
        row.reservations,
        row.grossTurnover,
        row.commissionDue,
        row.commissionCollected,
        row.balance,
        statusLabel,
        reminder,
        lastPayment,
      ]
    })

    const csvContent = [
      headers.map(formatCsvCell).join(CSV_SEPARATOR),
      ...rowsData.map((line) => line.map(formatCsvCell).join(CSV_SEPARATOR)),
      ['Totaux', '', '', '', summary.grossTurnover, summary.commissionDue, summary.commissionCollected, summary.commissionDue - summary.commissionCollected, '', '', ''].map(formatCsvCell).join(CSV_SEPARATOR),
    ].join('\n')

    const filename = `commissions_${body.year}_${String(body.month).padStart(2, '0')}.csv`

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    return res.send(`\ufeff${csvContent}`)
  } catch (err) {
    logger.error('[commission.exportMonthlyCommissions]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

const loadAgencyCommissionDetail = async (
  agencyId: string,
  year: number,
  month: number,
): Promise<bookcarsTypes.AgencyCommissionDetail | null> => {
  const supplier = await User.findById(agencyId)
  if (!supplier) {
    return null
  }

  const supplierObjectId = ensureObjectId(supplier._id)
  if (!supplierObjectId) {
    return null
  }

  const config = getCommissionConfig()
  const { start, end } = getPeriodBoundaries(year, month)
  const effectiveStart = start.getTime() < config.effectiveDate.getTime() ? config.effectiveDate : start

  const state = await AgencyCommissionState.findOne({ agency: supplierObjectId })

  const events = await AgencyCommissionEvent.find({
    agency: supplierObjectId,
    month,
    year,
  })
    .sort({ createdAt: -1 })
    .populate<{ admin: env.User }>('admin')
    .lean<CommissionEventRecord[]>()

  const bookings = effectiveStart.getTime() < end.getTime()
    ? await Booking.find({
      supplier: supplierObjectId,
      expireAt: null,
      from: { $lt: end },
      to: { $gte: effectiveStart },
    })
      .populate<{ driver: env.User }>('driver')
      .sort({ from: 1 })
      .lean()
    : []

  let grossTurnover = 0
  let commissionDue = 0

  bookings.forEach((booking) => {
    const bookingStatus = booking.status as bookcarsTypes.BookingStatus | undefined
    if (isCommissionEligibleStatus(bookingStatus)) {
      grossTurnover += booking.price || 0
      commissionDue += booking.commissionTotal || 0
    }
  })

  let commissionCollected = 0

  events.forEach((event) => {
    if (event.type === bookcarsTypes.AgencyCommissionEventType.Payment) {
      commissionCollected += event.amount || 0
    }
  })

  const balance = commissionDue - commissionCollected
  const aboveThreshold = commissionDue >= config.monthlyThreshold
  const blocked = (state && state.blocked) || supplier.blacklisted || false
  const status = computeStatus(blocked, balance)

  const bookingInfos: bookcarsTypes.AgencyCommissionBookingInfo[] = []
  let remainingCommission = commissionCollected

  bookings.forEach((booking) => {
    const bookingStatus = booking.status as bookcarsTypes.BookingStatus | undefined
    const eligible = isCommissionEligibleStatus(bookingStatus)
    const commission = eligible ? normalizeNumber(booking.commissionTotal || 0) : 0
    const totalPrice = normalizeNumber(booking.price || 0)
    let paymentStatus = bookcarsTypes.CommissionPaymentStatus.Unpaid

    if (commission <= 0) {
      paymentStatus = bookcarsTypes.CommissionPaymentStatus.Paid
    } else if (remainingCommission >= commission) {
      paymentStatus = bookcarsTypes.CommissionPaymentStatus.Paid
      remainingCommission -= commission
    } else if (remainingCommission > 0) {
      paymentStatus = bookcarsTypes.CommissionPaymentStatus.Partial
      remainingCommission = 0
    }

    const driverRecord = booking.driver as env.User | undefined
    const driverName = driverRecord?.fullName || driverRecord?.email || undefined

    bookingInfos.push({
      id: booking._id.toString(),
      from: booking.from,
      to: booking.to,
      totalPrice,
      commission,
      status: bookingStatus || bookcarsTypes.BookingStatus.Pending,
      paymentStatus,
      driverName,
    })
  })

  const logs: bookcarsTypes.AgencyCommissionLogEntry[] = events.map((event) => mapEventToLogEntry(event))

  return {
    agency: { ...toAgency(supplier), status, blocked },
    summary: {
      reservations: bookings.length,
      grossTurnover: normalizeNumber(grossTurnover),
      commissionDue: normalizeNumber(commissionDue),
      commissionCollected: normalizeNumber(commissionCollected),
      balance: normalizeNumber(balance),
      threshold: config.monthlyThreshold,
      aboveThreshold,
    },
    logs,
    bookings: bookingInfos,
    month,
    year,
  }
}

export const getAgencyCommissionBookings = async (req: Request, res: Response) => {
  try {
    const user = await ensureCommissionUser(req)

    if (!user || user.type !== bookcarsTypes.UserType.Supplier) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { body }: { body: bookcarsTypes.AgencyCommissionBookingsPayload } = req

    if (!body) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const parsedYear = Number.parseInt(String(body.year), 10)
    const parsedMonthIndex = Number.parseInt(String(body.month), 10)

    if (
      Number.isNaN(parsedYear)
      || Number.isNaN(parsedMonthIndex)
      || parsedMonthIndex < 0
      || parsedMonthIndex > 11
    ) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const supplierId = getUserId(user)
    const supplierObjectId = ensureObjectId(supplierId)

    if (!supplierObjectId) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const month = parsedMonthIndex + 1
    const { start, end } = getPeriodBoundaries(parsedYear, month)
    const config = getCommissionConfig()
    const effectiveStart = start.getTime() < config.effectiveDate.getTime() ? config.effectiveDate : start

    const bookings = await Booking.find({
      supplier: supplierObjectId,
      expireAt: null,
      from: { $lt: end },
      to: { $gte: effectiveStart },
    })
      .sort({ from: 1 })
      .populate<{ driver: env.User }>('driver')
      .lean()

    const events = await AgencyCommissionEvent.find({
      agency: supplierObjectId,
      month,
      year: parsedYear,
    }).lean()

    let collected = 0
    events.forEach((event) => {
      if (event.type === bookcarsTypes.AgencyCommissionEventType.Payment) {
        collected += event.amount || 0
      }
    })

    let remainingCommission = normalizeNumber(collected)
    const msPerDay = 24 * 60 * 60 * 1000
    const rows: bookcarsTypes.AgencyCommissionBooking[] = []

    bookings.forEach((booking) => {
      const bookingStatus = booking.status as bookcarsTypes.BookingStatus | undefined
      const status = bookingStatus || bookcarsTypes.BookingStatus.Pending
      const eligible = isCommissionEligibleStatus(status)
      const totalClient = normalizeNumber(booking.price || 0)
      const commissionValue = eligible ? normalizeNumber(booking.commissionTotal || 0) : 0
      const netAgency = normalizeNumber(Math.max(totalClient - commissionValue, 0))
      const fromDate = booking.from instanceof Date ? booking.from : new Date(booking.from)
      const toDate = booking.to instanceof Date ? booking.to : new Date(booking.to)
      const duration = Math.max(toDate.getTime() - fromDate.getTime(), 0)
      const days = Math.max(1, Math.ceil(duration / msPerDay))
      const pricePerDay = Math.round(totalClient / days)

      let paymentStatus = bookcarsTypes.CommissionPaymentStatus.Unpaid

      if (commissionValue <= 0) {
        paymentStatus = bookcarsTypes.CommissionPaymentStatus.Paid
      } else if (remainingCommission >= commissionValue) {
        paymentStatus = bookcarsTypes.CommissionPaymentStatus.Paid
        remainingCommission -= commissionValue
      } else if (remainingCommission > 0) {
        paymentStatus = bookcarsTypes.CommissionPaymentStatus.Partial
        remainingCommission = 0
      }

      const commissionStatus = paymentStatus === bookcarsTypes.CommissionPaymentStatus.Paid
        ? bookcarsTypes.CommissionStatus.Paid
        : bookcarsTypes.CommissionStatus.Pending

      const driverRecord = booking.driver as env.User | undefined
      const driverId = driverRecord ? getUserId(driverRecord) : ''
      const driverName = driverRecord?.fullName || driverRecord?.email || ''

      rows.push({
        bookingId: booking._id.toString(),
        bookingNumber: booking._id.toString(),
        driver: {
          _id: driverId,
          fullName: driverName,
        },
        from: fromDate,
        to: toDate,
        days,
        pricePerDay,
        totalClient,
        commission: commissionValue,
        netAgency,
        bookingStatus: status,
        commissionStatus,
      })
    })

    const normalizedQuery = (body.query || '').trim().toLowerCase()
    const filteredRows = normalizedQuery
      ? rows.filter((row) => (
        row.bookingNumber.toLowerCase().includes(normalizedQuery)
        || row.driver.fullName.toLowerCase().includes(normalizedQuery)
      ))
      : rows

    const summary: bookcarsTypes.AgencyCommissionMonthlySummary = {
      gross: 0,
      grossAll: 0,
      commission: 0,
      net: 0,
      reservations: 0,
      commissionPercentage: config.rate,
    }

    filteredRows.forEach((row) => {
      summary.grossAll += row.totalClient
      if (isCommissionEligibleStatus(row.bookingStatus)) {
        summary.gross += row.totalClient
        summary.commission += row.commission
        summary.net += row.netAgency
        summary.reservations += 1
      }
    })

    summary.gross = normalizeNumber(summary.gross)
    summary.grossAll = normalizeNumber(summary.grossAll)
    summary.commission = normalizeNumber(summary.commission)
    summary.net = normalizeNumber(summary.net)

    return res.json({
      bookings: filteredRows,
      summary,
    })
  } catch (err) {
    logger.error('[commission.getAgencyCommissionBookings]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

const serializeSettings = async (
  settings: env.AgencyCommissionSettings,
): Promise<bookcarsTypes.CommissionSettings> => {
  const updatedByUser = settings.updatedBy ? await User.findById(settings.updatedBy) : null
  const paymentOptions = buildPaymentOptions(settings)

  return {
    reminderChannel: settings.reminderChannel || bookcarsTypes.CommissionReminderChannel.Email,
    emailTemplate: settings.emailTemplate,
    smsTemplate: settings.smsTemplate,
    ...paymentOptions,
    updatedAt: settings.updatedAt || undefined,
    updatedBy: updatedByUser ? toAgency(updatedByUser) : undefined,
  }
}

const streamCommissionInvoice = async (
  detail: bookcarsTypes.AgencyCommissionDetail,
  res: Response,
  year: number,
  month: number,
) => {
  const doc = new PDFDocument({ margin: 50 })
  const filename = `commission_${detail.agency.slug || detail.agency.id}_${year}_${String(month).padStart(2, '0')}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  doc.pipe(res)

  const logo = await fetchLogo()

  const marginLeft = doc.page.margins.left
  const marginRight = doc.page.margins.right
  const contentWidth = doc.page.width - marginLeft - marginRight
  const rightColumnWidth = 220
  const rightColumnX = marginLeft + contentWidth - rightColumnWidth
  const headerStartY = doc.y

  if (logo) {
    doc.image(logo, marginLeft, headerStartY, { height: 80 })
  }

  let agencyInfoY = headerStartY
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text(
    detail.agency.name,
    rightColumnX,
    agencyInfoY,
    { width: rightColumnWidth, align: 'right' },
  )
  agencyInfoY = doc.y
  doc.font('Helvetica').fontSize(10)
  const agencyLocation = detail.agency.city || 'Tunisie'
  doc.text(
    agencyLocation,
    rightColumnX,
    agencyInfoY,
    { width: rightColumnWidth, align: 'right' },
  )
  agencyInfoY = doc.y
  if (detail.agency.email) {
    doc.text(
      detail.agency.email,
      rightColumnX,
      agencyInfoY,
      { width: rightColumnWidth, align: 'right' },
    )
    agencyInfoY = doc.y
  }
  if (detail.agency.phone) {
    doc.text(
      detail.agency.phone,
      rightColumnX,
      agencyInfoY,
      { width: rightColumnWidth, align: 'right' },
    )
    agencyInfoY = doc.y
  }

  const headerBottom = Math.max(headerStartY + (logo ? 80 : 0), agencyInfoY)
  const infoSectionY = headerBottom + 20
  const today = new Date()
  doc.font('Helvetica').fontSize(10).fillColor('#000000').text(
    `Date : ${today.toLocaleDateString('fr-FR')}`,
    marginLeft,
    infoSectionY,
  )

  const invoiceSequence = Math.max(detail.summary.reservations || 0, 1)
  const invoiceNumber = `FACT-${year}-${String(month).padStart(2, '0')}-${String(invoiceSequence).padStart(3, '0')}`
  doc.font('Helvetica-Bold').text(
    `Facture n° : ${invoiceNumber}`,
    rightColumnX,
    infoSectionY,
    { width: rightColumnWidth, align: 'right' },
  )

  doc.y = infoSectionY + 40
  doc.font('Helvetica-Bold').fontSize(22).text(
    'FACTURE DE COMMISSION',
    marginLeft,
    doc.y,
    { width: contentWidth, align: 'center' },
  )

  doc.moveDown(1)
  doc.font('Helvetica').fontSize(11)
  doc.text(`Agence : ${detail.agency.name}`, marginLeft, doc.y)
  doc.text(`Période : ${getMonthLabel(year, month)} ${year}`, marginLeft, doc.y)
  doc.text(`Nombre de réservations : ${detail.summary.reservations}`, marginLeft, doc.y)

  const tableX = marginLeft
  const colWidths = [130, 110, 60, 110, 90]
  const columnAlign: ('left' | 'center' | 'right')[] = ['left', 'left', 'center', 'right', 'right']
  const rowHeight = 28
  const headerRowHeight = 36
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
  const headerLabels = [
    'Numéro de réservation',
    'Nom du client',
    'Nombre de jours',
    'Montant de la réservation (TND)',
    'Commission (TND)',
  ]
  const getPageBottom = () => doc.page.height - doc.page.margins.bottom

  let tableY = doc.y + 20

  const drawTableHeader = (y: number) => {
    doc.save()
    doc.fillColor('#007BFF').rect(tableX, y, tableWidth, headerRowHeight).fill()
    doc.restore()

    doc.save()
    doc.lineWidth(1)
    doc.strokeColor('#007BFF').rect(tableX, y, tableWidth, headerRowHeight).stroke()
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF')
    const headerTextHeight = doc.currentLineHeight()
    const textOffsetY = y + (headerRowHeight - headerTextHeight) / 2
    let x = tableX
    headerLabels.forEach((label, index) => {
      doc.text(label, x + 5, textOffsetY, {
        width: colWidths[index] - 10,
        align: 'center',
      })
      x += colWidths[index]
    })
    doc.restore()
    doc.y = y + headerRowHeight
    return y + headerRowHeight
  }

  const drawRow = (
    y: number,
    values: string[],
    backgroundColor: string,
  ) => {
    doc.save()
    doc.fillColor(backgroundColor).rect(tableX, y, tableWidth, rowHeight).fill()
    doc.restore()

    doc.save()
    doc.lineWidth(0.5)
    doc.strokeColor('#D9E2EF').rect(tableX, y, tableWidth, rowHeight).stroke()
    doc.font('Helvetica').fontSize(10).fillColor('#000000')
    const textHeight = doc.currentLineHeight()
    const textOffsetY = y + (rowHeight - textHeight) / 2
    let x = tableX
    values.forEach((value, index) => {
      doc.text(value, x + 5, textOffsetY, {
        width: colWidths[index] - 10,
        align: columnAlign[index] || 'left',
        lineBreak: false,
      })
      x += colWidths[index]
    })
    doc.restore()
    doc.y = y + rowHeight
    return y + rowHeight
  }

  tableY = drawTableHeader(tableY)

  if (detail.bookings.length === 0) {
    tableY = drawRow(
      tableY,
      ['Aucune réservation pour cette période', '', '', '', ''],
      '#FFFFFF',
    )
  } else {
    detail.bookings.forEach((booking, index) => {
      if (tableY + rowHeight > getPageBottom()) {
        doc.addPage()
        tableY = drawTableHeader(doc.y)
      }

      const fromDate = booking.from instanceof Date ? booking.from : new Date(booking.from)
      const toDate = booking.to instanceof Date ? booking.to : new Date(booking.to)
      const duration = Math.max(toDate.getTime() - fromDate.getTime(), 0)
      const days = Math.max(1, Math.ceil(duration / (24 * 60 * 60 * 1000)))
      const backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9FA'

      tableY = drawRow(
        tableY,
        [
          booking.id,
          booking.driverName || 'N/A',
          String(days),
          formatCurrency(booking.totalPrice),
          formatCurrency(booking.commission),
        ],
        backgroundColor,
      )
    })
  }

  const totalBoxHeight = 55
  doc.y = tableY + 20
  if (doc.y + totalBoxHeight > getPageBottom()) {
    doc.addPage()
    doc.y = doc.page.margins.top
  }
  const totalCommissionDue = Math.max(detail.summary.balance, 0)
  const formattedTotal = formatCurrency(totalCommissionDue)

  doc.save()
  doc.fillColor('#E6F0FF').rect(tableX, doc.y, tableWidth, totalBoxHeight).fill()
  doc.restore()

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text(
    `TOTAL COMMISSION À PAYER : ${formattedTotal} TND`,
    tableX + 15,
    doc.y + 15,
  )
  doc.font('Helvetica').fontSize(10).fillColor('#D9534F').text(
    'Ce montant doit être réglé au plus tard le 15 du mois prochain.',
    tableX + 15,
    doc.y + 32,
  )

  doc.y += totalBoxHeight + 30
  if (doc.y > getPageBottom()) {
    doc.addPage()
    doc.y = doc.page.margins.top
  }
  doc.font('Helvetica').fontSize(9).fillColor('#6C757D').text(
    'Plany.tn – Location de voitures en Tunisie',
    marginLeft,
    doc.y,
    { width: contentWidth, align: 'center' },
  )

  doc.end()
}

type BookingInvoiceRecord = Omit<env.Booking, 'supplier' | 'driver' | 'car'> & {
  supplier: env.User | mongoose.Types.ObjectId
  driver: env.User | mongoose.Types.ObjectId
  car: env.Car | mongoose.Types.ObjectId
}

const streamBookingCommissionInvoice = async (
  booking: BookingInvoiceRecord,
  res: Response,
) => {
  const doc = new PDFDocument({ margin: 50 })
  const bookingId = booking._id.toString()
  const filename = `commission_booking_${bookingId}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  doc.pipe(res)

  const logo = await fetchLogo()

  const supplierRecord = booking.supplier as unknown as env.User | undefined
  const driverRecord = booking.driver as unknown as env.User | undefined

  const marginLeft = doc.page.margins.left
  const marginRight = doc.page.margins.right
  const contentWidth = doc.page.width - marginLeft - marginRight
  const rightColumnWidth = 220
  const rightColumnX = marginLeft + contentWidth - rightColumnWidth
  const headerStartY = doc.y

  if (logo) {
    doc.image(logo, marginLeft, headerStartY, { height: 80 })
  }

  let agencyInfoY = headerStartY
  const agencyName = supplierRecord?.fullName || 'Agence partenaire'
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text(
    agencyName,
    rightColumnX,
    agencyInfoY,
    { width: rightColumnWidth, align: 'right' },
  )
  agencyInfoY = doc.y
  doc.font('Helvetica').fontSize(10)
  const agencyLocation = supplierRecord?.location || 'Tunisie'
  doc.text(
    agencyLocation,
    rightColumnX,
    agencyInfoY,
    { width: rightColumnWidth, align: 'right' },
  )
  agencyInfoY = doc.y
  if (supplierRecord?.email) {
    doc.text(
      supplierRecord.email,
      rightColumnX,
      agencyInfoY,
      { width: rightColumnWidth, align: 'right' },
    )
    agencyInfoY = doc.y
  }
  if (supplierRecord?.phone) {
    doc.text(
      supplierRecord.phone,
      rightColumnX,
      agencyInfoY,
      { width: rightColumnWidth, align: 'right' },
    )
    agencyInfoY = doc.y
  }

  const headerBottom = Math.max(headerStartY + (logo ? 80 : 0), agencyInfoY)
  const infoSectionY = headerBottom + 20
  const today = new Date()

  doc.font('Helvetica').fontSize(10).fillColor('#000000').text(
    `Date : ${today.toLocaleDateString('fr-FR')}`,
    marginLeft,
    infoSectionY,
  )

  const invoiceNumber = `FACT-RES-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${bookingId.slice(-6).toUpperCase()}`
  doc.font('Helvetica-Bold').text(
    `Facture n° : ${invoiceNumber}`,
    rightColumnX,
    infoSectionY,
    { width: rightColumnWidth, align: 'right' },
  )

  doc.y = infoSectionY + 40
  doc.font('Helvetica-Bold').fontSize(22).text(
    'FACTURE DE COMMISSION',
    marginLeft,
    doc.y,
    { width: contentWidth, align: 'center' },
  )

  const fromDate = booking.from instanceof Date ? booking.from : new Date(booking.from)
  const toDate = booking.to instanceof Date ? booking.to : new Date(booking.to)
  const duration = Math.max(toDate.getTime() - fromDate.getTime(), 0)
  const days = Math.max(1, Math.ceil(duration / (24 * 60 * 60 * 1000)))
  const totalClient = normalizeNumber(booking.price || 0)
  const commissionDue = normalizeNumber(booking.commissionTotal || 0)
  const driverName = driverRecord?.fullName || driverRecord?.email || 'N/A'

  doc.moveDown(2)

  const tableX = marginLeft
  const colWidths = [130, 110, 60, 110, 90]
  const columnAlign: ('left' | 'center' | 'right')[] = ['left', 'left', 'center', 'right', 'right']
  const rowHeight = 28
  const headerRowHeight = 36
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
  const headerLabels = [
    'Numéro de réservation',
    'Nom du client',
    'Nombre de jours',
    'Montant de la réservation (TND)',
    'Commission (TND)',
  ]
  const getPageBottom = () => doc.page.height - doc.page.margins.bottom

  let tableY = doc.y + 20

  const drawTableHeader = (y: number) => {
    doc.save()
    doc.fillColor('#007BFF').rect(tableX, y, tableWidth, headerRowHeight).fill()
    doc.restore()

    doc.save()
    doc.lineWidth(1)
    doc.strokeColor('#007BFF').rect(tableX, y, tableWidth, headerRowHeight).stroke()
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF')
    const textHeight = doc.currentLineHeight()
    const textOffsetY = y + (headerRowHeight - textHeight) / 2
    let x = tableX

    headerLabels.forEach((label, index) => {
      doc.text(label, x + 5, textOffsetY, {
        width: colWidths[index] - 10,
        align: 'center',
      })
      x += colWidths[index]
    })
    doc.restore()
    doc.y = y + headerRowHeight
    return y + headerRowHeight
  }

  const drawRow = (
    y: number,
    values: string[],
  ) => {
    doc.save()
    doc.fillColor('#FFFFFF').rect(tableX, y, tableWidth, rowHeight).fill()
    doc.restore()

    doc.save()
    doc.lineWidth(0.5)
    doc.strokeColor('#D9E2EF').rect(tableX, y, tableWidth, rowHeight).stroke()
    doc.font('Helvetica').fontSize(10).fillColor('#000000')
    const textHeight = doc.currentLineHeight()
    const textOffsetY = y + (rowHeight - textHeight) / 2
    let x = tableX
    values.forEach((value, index) => {
      doc.text(value, x + 5, textOffsetY, {
        width: colWidths[index] - 10,
        align: columnAlign[index] || 'left',
        lineBreak: false,
      })
      x += colWidths[index]
    })
    doc.restore()
    doc.y = y + rowHeight
    return y + rowHeight
  }

  tableY = drawTableHeader(tableY)

  tableY = drawRow(
    tableY,
    [
      bookingId,
      driverName,
      String(days),
      formatCurrency(totalClient),
      formatCurrency(commissionDue),
    ],
  )

  const totalBoxHeight = 55
  doc.y = tableY + 20
  if (doc.y + totalBoxHeight > getPageBottom()) {
    doc.addPage()
    doc.y = doc.page.margins.top
  }
  const formattedTotal = formatCurrency(Math.max(commissionDue, 0))

  doc.save()
  doc.fillColor('#E6F0FF').rect(tableX, doc.y, tableWidth, totalBoxHeight).fill()
  doc.restore()

  doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text(
    `TOTAL COMMISSION À PAYER : ${formattedTotal} TND`,
    tableX + 15,
    doc.y + 15,
  )
  doc.font('Helvetica').fontSize(10).fillColor('#D9534F').text(
    'Ce montant doit être réglé au plus tard le 15 du mois prochain.',
    tableX + 15,
    doc.y + 32,
  )

  doc.y += totalBoxHeight + 30
  if (doc.y > getPageBottom()) {
    doc.addPage()
    doc.y = doc.page.margins.top
  }

  doc.font('Helvetica').fontSize(9).fillColor('#6C757D').text(
    'Plany.tn – Location de voitures en Tunisie',
    marginLeft,
    doc.y,
    { width: contentWidth, align: 'center' },
  )

  doc.end()
}

export const getAgencyCommissionDetails = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { agencyId, year, month } = req.params
    const parsedYear = Number.parseInt(year, 10)
    const parsedMonth = Number.parseInt(month, 10)

    if (!agencyId || Number.isNaN(parsedYear) || Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const detail = await loadAgencyCommissionDetail(agencyId, parsedYear, parsedMonth)

    if (!detail) {
      return res.status(404).send(i18n.t('USER_NOT_FOUND'))
    }

    return res.json(detail)
  } catch (err) {
    logger.error('[commission.getAgencyCommissionDetails]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const sendCommissionReminder = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { body }: { body: bookcarsTypes.CommissionReminderPayload } = req

    if (
      !body
      || !body.agencyId
      || !body.month
      || !body.year
      || !body.message
      || body.month < 1
      || body.month > 12
    ) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const channel = body.channel || (await getSettingsDocument()).reminderChannel
    const supplier = await User.findById(body.agencyId)

    if (!supplier) {
      return res.status(404).send(i18n.t('USER_NOT_FOUND'))
    }

    const supplierObjectId = ensureObjectId(supplier._id)
    const adminObjectId = ensureObjectId(admin._id)

    if (!supplierObjectId || !adminObjectId) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const payload: Partial<env.AgencyCommissionEvent> = {
      agency: supplierObjectId,
      month: body.month,
      year: body.year,
      type: bookcarsTypes.AgencyCommissionEventType.Reminder,
      admin: adminObjectId,
      channel,
      message: body.message,
    }

    let success = true

    try {
      if (
        channel === bookcarsTypes.CommissionReminderChannel.Email
        || channel === bookcarsTypes.CommissionReminderChannel.EmailAndSms
      ) {
        if (!supplier.email) {
          throw new Error('EMAIL_NOT_FOUND')
        }
        const subject = body.subject || `Relance commission ${getMonthLabel(body.year, body.month)} ${body.year}`
        await mailHelper.sendMail({ to: supplier.email, subject, html: body.message })
        payload.metadata = { ...(payload.metadata || {}), subject }
      }

      if (
        channel === bookcarsTypes.CommissionReminderChannel.Sms
        || channel === bookcarsTypes.CommissionReminderChannel.EmailAndSms
      ) {
        const phone = validateAndFormatPhoneNumber(supplier.phone)
        if (!phone.isValide) {
          throw new Error('INVALID_PHONE')
        }
        const plainMessage = body.message.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        await sendSms(phone.phone, plainMessage)
      }
    } catch (error) {
      success = false
      logger.error('[commission.sendCommissionReminder] failed', error)
    }

    await AgencyCommissionEvent.create({
      ...payload,
      success,
    })

    if (!success) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    return res.sendStatus(200)
  } catch (err) {
    logger.error('[commission.sendCommissionReminder]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const recordCommissionPayment = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { body }: { body: bookcarsTypes.CommissionPaymentPayload } = req

    if (
      !body
      || !body.agencyId
      || !body.month
      || !body.year
      || body.month < 1
      || body.month > 12
      || body.amount === undefined
      || !body.paymentDate
    ) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const amount = Math.round(Number(body.amount))
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const paymentDate = new Date(body.paymentDate)
    if (Number.isNaN(paymentDate.getTime())) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const supplier = await User.findById(body.agencyId)
    if (!supplier) {
      return res.status(404).send(i18n.t('USER_NOT_FOUND'))
    }

    const supplierObjectId = ensureObjectId(supplier._id)
    const adminObjectId = ensureObjectId(admin._id)

    if (!supplierObjectId || !adminObjectId) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    await AgencyCommissionEvent.create({
      agency: supplierObjectId,
      month: body.month,
      year: body.year,
      type: bookcarsTypes.AgencyCommissionEventType.Payment,
      admin: adminObjectId,
      amount,
      paymentDate,
      reference: body.reference,
      success: true,
    })

    return res.sendStatus(200)
  } catch (err) {
    logger.error('[commission.recordCommissionPayment]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const toggleAgencyCommissionBlock = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { body }: { body: bookcarsTypes.CommissionBlockPayload } = req

    if (
      !body
      || !body.agencyId
      || !body.month
      || !body.year
      || body.month < 1
      || body.month > 12
    ) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const supplier = await User.findById(body.agencyId)
    if (!supplier) {
      return res.status(404).send(i18n.t('USER_NOT_FOUND'))
    }

    const supplierObjectId = ensureObjectId(supplier._id)
    const adminObjectId = ensureObjectId(admin._id)

    if (!supplierObjectId || !adminObjectId) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    let state = await AgencyCommissionState.findOne({ agency: supplierObjectId })
    if (!state) {
      state = new AgencyCommissionState({ agency: supplierObjectId, blocked: false, disabledCars: [] })
    }

    if (body.block) {
      const cars = await Car.find({ supplier: supplierObjectId })
      const disabledCars = cars.filter((car) => car.available).map((car) => car._id)

      if (disabledCars.length > 0) {
        await Car.updateMany({ _id: { $in: disabledCars } }, { $set: { available: false } })
      }

      state.blocked = true
      state.blockedAt = new Date()
      state.blockedBy = adminObjectId
      state.disabledCars = disabledCars
      await state.save()

      supplier.blacklisted = true
      await supplier.save()

      await AgencyCommissionEvent.create({
        agency: supplierObjectId,
        month: body.month,
        year: body.year,
        type: bookcarsTypes.AgencyCommissionEventType.Block,
        admin: adminObjectId,
        metadata: { disabledCars: disabledCars.map((id) => id.toString()) },
        success: true,
      })

      return res.json({ blocked: true })
    }

    const disabledCars = state.disabledCars || []

    if (disabledCars.length > 0) {
      await Car.updateMany({ _id: { $in: disabledCars } }, { $set: { available: true } })
    }

    state.blocked = false
    state.blockedAt = undefined
    state.blockedBy = undefined
    state.disabledCars = []
    await state.save()

    supplier.blacklisted = false
    await supplier.save()

    await AgencyCommissionEvent.create({
      agency: supplierObjectId,
      month: body.month,
      year: body.year,
      type: bookcarsTypes.AgencyCommissionEventType.Unblock,
      admin: adminObjectId,
      metadata: { reactivatedCars: disabledCars.map((id) => id.toString()) },
      success: true,
    })

    return res.json({ blocked: false })
  } catch (err) {
    logger.error('[commission.toggleAgencyCommissionBlock]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const addCommissionNote = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { body }: { body: bookcarsTypes.CommissionNotePayload } = req

    if (
      !body
      || !body.agencyId
      || !body.month
      || !body.year
      || body.month < 1
      || body.month > 12
      || !body.note
    ) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const supplier = await User.findById(body.agencyId)
    if (!supplier) {
      return res.status(404).send(i18n.t('USER_NOT_FOUND'))
    }

    const supplierObjectId = ensureObjectId(supplier._id)
    const adminObjectId = ensureObjectId(admin._id)

    if (!supplierObjectId || !adminObjectId) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    await AgencyCommissionEvent.create({
      agency: supplierObjectId,
      month: body.month,
      year: body.year,
      type: bookcarsTypes.AgencyCommissionEventType.Note,
      admin: adminObjectId,
      note: body.note,
      success: true,
    })

    return res.sendStatus(200)
  } catch (err) {
    logger.error('[commission.addCommissionNote]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const getCommissionSettings = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const settings = await getSettingsDocument()
    const payload = await serializeSettings(settings)

    return res.json(payload)
  } catch (err) {
    logger.error('[commission.getCommissionSettings]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const updateCommissionSettings = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { body }: { body: bookcarsTypes.CommissionSettingsPayload } = req

    if (!body || !body.emailTemplate || !body.smsTemplate || !body.reminderChannel) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const settings = await getSettingsDocument()
    settings.reminderChannel = body.reminderChannel
    settings.emailTemplate = body.emailTemplate
    settings.smsTemplate = body.smsTemplate
    if (typeof body.bankTransferEnabled === 'boolean') {
      settings.bankTransferEnabled = body.bankTransferEnabled
    } else if (typeof settings.bankTransferEnabled === 'undefined') {
      settings.bankTransferEnabled = true
    }
    if (typeof body.cardPaymentEnabled === 'boolean') {
      settings.cardPaymentEnabled = body.cardPaymentEnabled
    } else if (typeof settings.cardPaymentEnabled === 'undefined') {
      settings.cardPaymentEnabled = false
    }
    if (typeof body.d17PaymentEnabled === 'boolean') {
      settings.d17PaymentEnabled = body.d17PaymentEnabled
    } else if (typeof settings.d17PaymentEnabled === 'undefined') {
      settings.d17PaymentEnabled = false
    }
    if (typeof body.bankTransferRibInformation === 'string') {
      settings.bankTransferRibInformation = body.bankTransferRibInformation
    } else if (typeof settings.bankTransferRibInformation === 'undefined') {
      settings.bankTransferRibInformation = ''
    }
    if (body.bankTransferRibDetails !== undefined) {
      if (body.bankTransferRibDetails === null) {
        settings.bankTransferRibDetails = null
      } else {
        const ribDetails = validateRibDetails(body.bankTransferRibDetails)
        if (!ribDetails) {
          return res.status(400).send(i18n.t('COMMISSION_RIB_INVALID'))
        }
        settings.bankTransferRibDetails = ribDetails
      }
    } else if (settings.bankTransferRibDetails) {
      settings.bankTransferRibDetails = sanitizeRibDetails(settings.bankTransferRibDetails)
    }

    if (settings.bankTransferEnabled !== false) {
      const currentRib = sanitizeRibDetails(settings.bankTransferRibDetails)
      if (!currentRib) {
        return res.status(400).send(i18n.t('COMMISSION_RIB_REQUIRED'))
      }
      settings.bankTransferRibDetails = currentRib
    }
    settings.updatedBy = ensureObjectId(admin._id)
    await settings.save()

    const payload = await serializeSettings(settings)

    return res.json(payload)
  } catch (err) {
    logger.error('[commission.updateCommissionSettings]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const getCommissionPaymentOptions = async (req: Request, res: Response) => {
  try {
    const user = await ensureCommissionUser(req)
    if (!user) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const settings = await getSettingsDocument()
    const payload = buildPaymentOptions(settings)

    return res.json(payload)
  } catch (err) {
    logger.error('[commission.getCommissionPaymentOptions]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const downloadCommissionRib = async (req: Request, res: Response) => {
  try {
    const user = await ensureCommissionUser(req)
    if (!user) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const settings = await getSettingsDocument()
    if (settings.bankTransferEnabled === false) {
      return res.status(404).send(i18n.t('COMMISSION_RIB_DISABLED'))
    }

    const ribDetails = sanitizeRibDetails(settings.bankTransferRibDetails)
    if (!ribDetails) {
      return res.status(404).send(i18n.t('COMMISSION_RIB_UNAVAILABLE'))
    }

    const doc = new PDFDocument({ margin: 50 })
    const filename = `rib_${Date.now()}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    doc.pipe(res)

    const logo = await fetchLogo()
    const startX = doc.page.margins.left
    if (logo) {
      const top = doc.y
      const logoHeight = 56
      const spacingAfterLogo = 24
      doc.image(logo, startX, top, { height: logoHeight })
      doc.y = top + logoHeight + spacingAfterLogo
    } else {
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#0A66FF')
        .text('Plany', startX, doc.y)
      doc.moveDown(2)
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#0A66FF')
      .text(i18n.t('COMMISSION_RIB_TITLE'), { align: 'left' })
    doc.moveDown(1.25)
    doc.font('Helvetica').fontSize(12).fillColor('#1F2937')

    const entries: { label: string; value?: string }[] = [
      { label: i18n.t('COMMISSION_RIB_ACCOUNT_HOLDER'), value: ribDetails.accountHolder },
      { label: i18n.t('COMMISSION_RIB_BANK_NAME'), value: ribDetails.bankName },
      { label: i18n.t('COMMISSION_RIB_BANK_ADDRESS'), value: ribDetails.bankAddress },
      { label: i18n.t('COMMISSION_RIB_IBAN'), value: ribDetails.iban },
      { label: i18n.t('COMMISSION_RIB_BIC'), value: ribDetails.bic },
      { label: i18n.t('COMMISSION_RIB_ACCOUNT_NUMBER'), value: ribDetails.accountNumber },
    ]

    entries.forEach((entry) => {
      if (!entry.value) {
        return
      }

      doc
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text(`${entry.label} :`, { continued: true })
      doc
        .font('Helvetica')
        .fillColor('#111827')
        .text(entry.value)
      doc.moveDown(0.5)
    })

    if (settings.bankTransferRibInformation) {
      doc.moveDown(0.75)
      doc
        .font('Helvetica-Bold')
        .fillColor('#0A66FF')
        .text(i18n.t('COMMISSION_RIB_INSTRUCTIONS'))
      doc
        .font('Helvetica')
        .fillColor('#1F2937')
        .text(settings.bankTransferRibInformation, { align: 'left' })
    }

    doc.end()

    return undefined
  } catch (err) {
    logger.error('[commission.downloadCommissionRib]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const generateCommissionInvoice = async (req: Request, res: Response) => {
  try {
    const admin = await ensureAdmin(req)
    if (!admin) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { agencyId, year, month } = req.params
    const parsedYear = Number.parseInt(year, 10)
    const parsedMonth = Number.parseInt(month, 10)

    if (!agencyId || Number.isNaN(parsedYear) || Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const detail = await loadAgencyCommissionDetail(agencyId, parsedYear, parsedMonth)

    if (!detail) {
      return res.status(404).send(i18n.t('USER_NOT_FOUND'))
    }

    await streamCommissionInvoice(detail, res, parsedYear, parsedMonth)

    return undefined
  } catch (err) {
    logger.error('[commission.generateCommissionInvoice]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const downloadAgencyCommissionInvoice = async (req: Request, res: Response) => {
  try {
    const user = await ensureCommissionUser(req)

    if (!user) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { agencyId, year, month } = req.params
    const parsedYear = Number.parseInt(year, 10)
    const parsedMonthIndex = Number.parseInt(month, 10)

    if (
      !agencyId
      || Number.isNaN(parsedYear)
      || Number.isNaN(parsedMonthIndex)
      || parsedMonthIndex < 0
      || parsedMonthIndex > 11
    ) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const monthValue = parsedMonthIndex + 1
    const userId = getUserId(user)

    if (
      user.type !== bookcarsTypes.UserType.Admin
      && userId !== agencyId
    ) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const detail = await loadAgencyCommissionDetail(agencyId, parsedYear, monthValue)

    if (!detail) {
      return res.status(404).send(i18n.t('USER_NOT_FOUND'))
    }

    await streamCommissionInvoice(detail, res, parsedYear, monthValue)

    return undefined
  } catch (err) {
    logger.error('[commission.downloadAgencyCommissionInvoice]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}

export const downloadAgencyBookingInvoice = async (req: Request, res: Response) => {
  try {
    const user = await ensureCommissionUser(req)

    if (!user) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const { bookingId } = req.params

    if (!bookingId) {
      return res.status(400).send(i18n.t('DB_ERROR'))
    }

    const booking = await Booking.findById(bookingId)
      .populate<{ driver: env.User }>('driver')
      .populate<{ supplier: env.User }>('supplier')
      .populate<{ car: env.Car }>('car')

    if (!booking || booking.expireAt) {
      return res.status(404).send(i18n.t('BOOKING_NOT_FOUND'))
    }

    const supplierRecord = booking.supplier as env.User | undefined
    const supplierId = supplierRecord ? getUserId(supplierRecord) : ''
    const userId = getUserId(user)

    if (
      user.type !== bookcarsTypes.UserType.Admin
      && supplierId
      && supplierId !== userId
    ) {
      return res.status(403).send(i18n.t('NOT_AUTHORIZED'))
    }

    const bookingRecord = booking.toObject() as BookingInvoiceRecord

    await streamBookingCommissionInvoice(bookingRecord, res)

    return undefined
  } catch (err) {
    logger.error('[commission.downloadAgencyBookingInvoice]', err)
    return res.status(400).send(i18n.t('DB_ERROR') + err)
  }
}
