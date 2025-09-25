import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import PDFDocument from 'pdfkit'
import axios from 'axios'
import { Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import User from '../models/User'
import * as env from '../config/env.config'

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

const INVOICE_FONT_NAME = 'HeiseiMin-W3'
const FALLBACK_FONT_NAME = 'Helvetica'

const getInvoiceFontCandidates = () => {
  const candidates = new Set<string>()
  const configured = (env.COMMISSION_INVOICE_FONT_PATH || '').trim()
  const fileNames = [
    'HeiseiMin-W3.ttf',
    'HeiseiMin-W3.TTF',
    'HeiseiMin-W3.otf',
    'HeiseiMin-W3.OTF',
    INVOICE_FONT_NAME,
  ]

  if (configured) {
    const resolvedConfigured = path.resolve(configured)
    candidates.add(resolvedConfigured)

    try {
      const configuredStats = fs.statSync(resolvedConfigured)
      if (configuredStats.isDirectory()) {
        fileNames.forEach((fileName) => {
          candidates.add(path.resolve(resolvedConfigured, fileName))
        })
      }
    } catch (err) {
      console.warn(`[commission.generateMonthlyInvoice] Unable to access configured font path '${resolvedConfigured}'`, err)
    }
  }

  const searchDirectories = [
    path.resolve(__dirname, '..', 'assets', 'fonts'),
    path.resolve(process.cwd(), 'assets', 'fonts'),
    path.resolve(process.cwd(), 'fonts'),
    process.cwd(),
  ]

  searchDirectories.forEach((directory) => {
    fileNames.forEach((fileName) => {
      candidates.add(path.resolve(directory, fileName))
    })
  })

  return Array.from(candidates)
}

const applyInvoiceFont = (doc: PDFDocument) => {
  const candidates = getInvoiceFontCandidates()

  for (const candidate of candidates) {
    if (candidate) {
      try {
        const exists = fs.existsSync(candidate)
        if (exists) {
          const stats = fs.statSync(candidate)
          if (stats.isFile()) {
            doc.registerFont(INVOICE_FONT_NAME, candidate)
            doc.font(INVOICE_FONT_NAME)
            return INVOICE_FONT_NAME
          }
        }
      } catch (err) {
        console.warn(`[commission.generateMonthlyInvoice] Unable to register font '${candidate}'`, err)
      }
    }
  }

  doc.font(FALLBACK_FONT_NAME)
  console.warn('[commission.generateMonthlyInvoice] Falling back to Helvetica font. Set BC_COMMISSION_INVOICE_FONT_PATH to provide HeiseiMin-W3.')
  return FALLBACK_FONT_NAME
}

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

const COMMISSION_STATUS_LABELS_FR: Record<bookcarsTypes.CommissionStatus, string> = {
  [bookcarsTypes.CommissionStatus.Pending]: 'Commission en attente',
  [bookcarsTypes.CommissionStatus.Paid]: 'Commission payée',
}

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

  const rawBookings = await Booking.aggregate<{
    _id: mongoose.Types.ObjectId
    from: Date
    to: Date
    price?: number
    status: bookcarsTypes.BookingStatus
    commission?: number
    commissionTotal?: number
    commissionRate?: number
    commissionStatus?: bookcarsTypes.CommissionStatus
    driver: { _id: mongoose.Types.ObjectId; fullName: string }
    supplier: { _id: mongoose.Types.ObjectId; fullName: string }
  }>(pipeline)

  const normalizedQuery = (query || '').trim().toLowerCase()
  const filtered = normalizedQuery
    ? rawBookings.filter((booking) => {
      const bookingId = booking._id.toString().toLowerCase()
      const driverName = (booking.driver?.fullName || '').toLowerCase()
      return bookingId.includes(normalizedQuery) || driverName.includes(normalizedQuery)
    })
    : rawBookings

  let effectiveCommissionPercentage = env.PLANY_COMMISSION_PERCENTAGE

  const bookings = filtered.map<bookcarsTypes.AgencyCommissionBooking>((booking) => {
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
    if (typeof commissionPercentage === 'number' && !Number.isNaN(commissionPercentage)) {
      effectiveCommissionPercentage = commissionPercentage
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

    return {
      bookingId: booking._id.toString(),
      bookingNumber: booking._id.toString(),
      bookingStatus: booking.status,
      commissionStatus: booking.commissionStatus || bookcarsTypes.CommissionStatus.Pending,
      driver: {
        _id: booking.driver?._id.toString() || '',
        fullName: booking.driver?.fullName || '',
      },
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      days,
      pricePerDay,
      totalClient,
      commission: commissionDue,
      netAgency,
    }
  })

  const summary = bookings.reduce<bookcarsTypes.AgencyCommissionSummary>((acc, booking) => {
    const isBillable = BILLABLE_STATUSES.has(booking.bookingStatus)

    acc.grossAll += booking.totalClient

    if (isBillable) {
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

export const fetchCommissionBookingById = async (bookingId: string) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return null
  }

  const booking = await Booking
    .findById(new mongoose.Types.ObjectId(bookingId))
    .populate('driver', 'fullName')
    .populate('supplier', 'fullName')
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
      driver?: { _id: mongoose.Types.ObjectId; fullName: string }
      supplier?: { _id: mongoose.Types.ObjectId; fullName: string }
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
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    days,
    pricePerDay,
    totalClient,
    commission: commissionDue,
    netAgency,
  }

  const supplier = booking.supplier
    ? { _id: booking.supplier._id.toString(), fullName: booking.supplier.fullName }
    : undefined

  return {
    booking: commissionBooking,
    supplier,
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

  applyInvoiceFont(doc)
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
