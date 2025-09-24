import mongoose from 'mongoose'
import PDFDocument from 'pdfkit'
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

const BOOKING_STATUS_LABELS_FR: Record<bookcarsTypes.BookingStatus, string> = {
  [bookcarsTypes.BookingStatus.Void]: 'Brouillon',
  [bookcarsTypes.BookingStatus.Pending]: 'En attente',
  [bookcarsTypes.BookingStatus.Deposit]: 'Acompte',
  [bookcarsTypes.BookingStatus.Paid]: 'Payée',
  [bookcarsTypes.BookingStatus.Reserved]: 'Confirmée',
  [bookcarsTypes.BookingStatus.Cancelled]: 'Annulée',
}

const COMMISSION_STATUS_LABELS_FR: Record<bookcarsTypes.CommissionStatus, string> = {
  [bookcarsTypes.CommissionStatus.Pending]: 'Commission en attente',
  [bookcarsTypes.CommissionStatus.Paid]: 'Commission payée',
}

export const calculateCommissionAmount = (price?: number) => Math.round((price || 0) * env.PLANY_COMMISSION_RATE)

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
        commission: 0,
        net: 0,
        reservations: 0,
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
        commission: 0,
        net: 0,
        reservations: 0,
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

  const bookings = filtered.map<bookcarsTypes.AgencyCommissionBooking>((booking) => {
    const fromDate = new Date(booking.from)
    const toDate = new Date(booking.to)
    const days = Math.max(getRentalDays(fromDate, toDate), 1)
    const totalClient = Math.round(booking.price || 0)
    const commissionAmount = typeof booking.commission === 'number'
      ? Math.round(booking.commission)
      : calculateCommissionAmount(booking.price)
    const netAgency = totalClient - commissionAmount
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
      commission: commissionAmount,
      netAgency,
    }
  })

  const summary = bookings.reduce<bookcarsTypes.AgencyCommissionSummary>((acc, booking) => ({
    gross: acc.gross + booking.totalClient,
    commission: acc.commission + booking.commission,
    net: acc.net + booking.netAgency,
    reservations: acc.reservations + 1,
  }), {
    gross: 0,
    commission: 0,
    net: 0,
    reservations: 0,
  })

  const supplierInfo = rawBookings.length > 0 ? rawBookings[0].supplier : null

  return {
    bookings,
    summary: {
      gross: summary.gross,
      commission: summary.commission,
      net: summary.net,
      reservations: summary.reservations,
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
  const commissionAmount = typeof booking.commission === 'number'
    ? Math.round(booking.commission)
    : calculateCommissionAmount(booking.price)
  const netAgency = totalClient - commissionAmount
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
    commission: commissionAmount,
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

export const generateMonthlyInvoice = (
  res: Response,
  data: bookcarsTypes.AgencyCommissionsResponse,
  supplier: Pick<bookcarsTypes.User, '_id' | 'fullName'>,
  month: number,
  year: number,
) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const filename = `commission_${supplier._id}_${year}_${String(month + 1).padStart(2, '0')}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

  doc.pipe(res)

  doc.fontSize(18).text('Facture des commissions agence', { align: 'center' })
  doc.moveDown()

  doc.fontSize(12).text(`Agence : ${supplier.fullName}`)
  doc.text(`Période : ${MONTHS_FR[Math.max(0, Math.min(11, month))]} ${year}`)
  doc.text(`Commission Plany : ${env.PLANY_COMMISSION_PERCENTAGE}%`)
  doc.moveDown()

  if (data.bookings.length === 0) {
    doc.text('Aucune réservation pour cette période.')
  } else {
    doc.font('Helvetica-Bold').text('Réservations :')
    doc.moveDown(0.5)
    data.bookings.forEach((booking) => {
      doc.font('Helvetica-Bold').text(`Réservation ${booking.bookingNumber}`)
      doc.font('Helvetica').text(`Client : ${booking.driver.fullName}`)
      doc.text(`Période : ${formatDate(booking.from)} → ${formatDate(booking.to)}`)
      doc.text(`Jours : ${booking.days}`)
      doc.text(`Total client : ${formatAmount(booking.totalClient)}`)
      doc.text(`Commission Plany : ${formatAmount(booking.commission)}`)
      doc.text(`Net agence : ${formatAmount(booking.netAgency)}`)
      doc.moveDown()
    })
  }

  doc.moveDown()
  doc.font('Helvetica-Bold').text('Récapitulatif :')
  doc.font('Helvetica').text(`CA brut : ${formatAmount(data.summary.gross)}`)
  doc.text(`Commission Plany : ${formatAmount(data.summary.commission)}`)
  doc.text(`Net agence : ${formatAmount(data.summary.net)}`)
  doc.text(`Nombre de réservations : ${data.summary.reservations}`)

  doc.moveDown()
  doc.fontSize(10).text('Document généré automatiquement – Merci d\'utiliser Plany', { align: 'center' })

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
