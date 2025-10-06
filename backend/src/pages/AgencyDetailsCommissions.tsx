import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Skeleton,
  Link,
  CircularProgress,
  useMediaQuery,
  SxProps,
  Theme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import DownloadIcon from '@mui/icons-material/Download'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/agency-commissions-details'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import * as CommissionService from '@/services/CommissionService'

const formatter = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 })
const formatCurrency = (value: number) => `${formatter.format(Math.round(value || 0))} ${strings.CURRENCY}`
const formatPercentage = (value: number) => `${formatter.format(Math.round(Number.isFinite(value) ? value : 0))} %`
const COMMISSION_STATUS_PAID = bookcarsTypes.CommissionStatus.Paid
const COMMISSION_STATUS_PENDING = bookcarsTypes.CommissionStatus.Pending
const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
}

const BILLABLE_STATUSES = new Set<bookcarsTypes.BookingStatus>([
  bookcarsTypes.BookingStatus.Deposit,
  bookcarsTypes.BookingStatus.Reserved,
  bookcarsTypes.BookingStatus.Paid,
])

const BOOKING_STATUS_CHIP_STYLES: Record<bookcarsTypes.BookingStatus, { background: string; color: string }> = {
  [bookcarsTypes.BookingStatus.Void]: { background: '#D9D9D9', color: '#6E7C86' },
  [bookcarsTypes.BookingStatus.Pending]: { background: '#FBDCC2', color: '#EF6C00' },
  [bookcarsTypes.BookingStatus.Deposit]: { background: '#CDECDA', color: '#3CB371' },
  [bookcarsTypes.BookingStatus.Paid]: { background: '#D1F9D1', color: '#77BC23' },
  [bookcarsTypes.BookingStatus.Reserved]: { background: '#D9E7F4', color: '#1E88E5' },
  [bookcarsTypes.BookingStatus.Cancelled]: { background: '#FBDFDE', color: '#E53935' },
}
const FALLBACK_STATUS_CHIP_STYLE = { background: '#ECEFF1', color: '#455A64' }

type ReservationStatusKey = 'paid' | 'reserved' | 'ongoing' | 'completed' | 'cancelled'

const RESERVATION_STATUS_STYLES: Record<ReservationStatusKey, { background: string; color: string }> = {
  paid: { background: '#D1F9D1', color: '#2E7D32' },
  reserved: { background: '#D9E7F4', color: '#1E88E5' },
  ongoing: { background: '#FFF3E0', color: '#EF6C00' },
  completed: { background: '#E0F2F1', color: '#00695C' },
  cancelled: { background: '#ECEFF1', color: '#546E7A' },
}

type MonthlyCommissionStatusKey = 'paid' | 'unpaid' | 'partial' | 'followUp'

const MONTHLY_COMMISSION_STATUS_CONFIG: Record<
  MonthlyCommissionStatusKey,
  { color: 'success' | 'warning' | 'info'; variant: 'filled' | 'outlined' }
> = {
  paid: { color: 'success', variant: 'filled' },
  unpaid: { color: 'warning', variant: 'outlined' },
  partial: { color: 'info', variant: 'filled' },
  followUp: { color: 'warning', variant: 'filled' },
}

type CommissionRow = bookcarsTypes.AgencyCommissionBooking
type DrawerState = CommissionRow | null

type KpiProps = {
  title: string
  value: string
  icon: React.ReactNode
  loading: boolean
  helperText?: string
  sx?: SxProps<Theme>
}

const Kpi = ({ title, value, icon, loading, helperText, sx }: KpiProps) => (
  <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 6px 24px rgba(10,102,255,0.06)', ...sx }}>
    <CardContent>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        {icon}
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>
      </Stack>
      {loading ? (
        <Skeleton width="60%" height={36} />
      ) : (
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={900}>
            {value}
          </Typography>
          {helperText && (
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {helperText}
            </Typography>
          )}
        </Stack>
      )}
    </CardContent>
  </Card>
)

const paymentColor = (status?: bookcarsTypes.CommissionStatus): 'success' | 'warning' =>
  (status === COMMISSION_STATUS_PAID ? 'success' : 'warning')

const hasBillableCommission = (status: bookcarsTypes.BookingStatus) => BILLABLE_STATUSES.has(status)

const hasPaymentRibDetails = (options?: bookcarsTypes.CommissionPaymentOptions | null) => {
  if (!options || !options.bankTransferRibDetails) {
    return false
  }

  const { accountHolder, bankName, iban, bic, accountNumber } = options.bankTransferRibDetails
  return Boolean(accountHolder && bankName && iban && bic && accountNumber)
}

const AgencyDetailsCommissions = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const isMobileOrTablet = !isDesktop
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [status, setStatus] = useState<'all' | bookcarsTypes.BookingStatus>('all')
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CommissionRow[]>([])
  const [summary, setSummary] = useState<bookcarsTypes.AgencyCommissionMonthlySummary | null>(null)
  const [drawer, setDrawer] = useState<DrawerState>(null)
  const [monthInvoiceLoading, setMonthInvoiceLoading] = useState(false)
  const [bookingInvoiceLoading, setBookingInvoiceLoading] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [paymentOptions, setPaymentOptions] = useState<bookcarsTypes.CommissionPaymentOptions>()
  const [paymentOptionsLoading, setPaymentOptionsLoading] = useState(false)
  const [bankTransferDialogOpen, setBankTransferDialogOpen] = useState(false)
  const [downloadingRib, setDownloadingRib] = useState(false)

  const locale = LOCALE_MAP[user?.language || 'fr'] || 'fr-FR'
  const months = strings.MONTHS as string[]
  const commissionPaymentLabels = strings.COMMISSION_PAYMENT_LABELS as Record<bookcarsTypes.CommissionStatus, string>

  // Pas besoin de dépendance "language" ici -> évite l'avertissement react-hooks/exhaustive-deps
  const bookingStatusOptions = useMemo(() => helper.getBookingStatuses(), [])

  useEffect(() => {
    let active = true

    if (!user?._id) {
      setData([])
      setSummary(null)
      setLoading(false)
      // cleanup cohérent pour "consistent-return"
      return () => {
        active = false
      }
    }

    setLoading(true)

    const timeout = window.setTimeout(() => {
      CommissionService.getAgencyCommissions({
        suppliers: [user._id as string],
        month,
        year,
        query: query.trim() || undefined,
      })
        .then((response) => {
          if (!active) return

          const rows = response.bookings.map((booking) => ({
            ...booking,
            commissionStatus: booking.commissionStatus || COMMISSION_STATUS_PENDING,
          }))

          setData(rows)
          setSummary(response.summary || null)
        })
        .catch((err) => {
          if (active) {
            helper.error(err)
            setData([])
            setSummary(null)
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 400)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [user?._id, month, year, query])

  useEffect(() => {
    let active = true

    if (!user?._id) {
      setPaymentOptions(undefined)
      setPaymentOptionsLoading(false)
      return () => {
        active = false
      }
    }

    setPaymentOptionsLoading(true)
    CommissionService.getCommissionPaymentOptions()
      .then((options) => {
        if (active) {
          setPaymentOptions(options)
        }
      })
      .catch((err) => {
        if (active) {
          helper.error(err)
        }
      })
      .finally(() => {
        if (active) {
          setPaymentOptionsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [user?._id])

  const filteredRows = useMemo(
    () => (status === 'all' ? data : data.filter((booking) => booking.bookingStatus === status)),
    [data, status]
  )

  const sortedRows = useMemo(
    () => [...filteredRows].sort((a, b) => b.totalClient - a.totalClient),
    [filteredRows]
  )

  const computedSummary = useMemo(() => {
    if (summary) return summary

    return data.reduce<bookcarsTypes.AgencyCommissionMonthlySummary>(
      (acc, booking) => {
        const isBillable = hasBillableCommission(booking.bookingStatus)

        acc.grossAll += booking.totalClient

        if (isBillable) {
          acc.gross += booking.totalClient
          acc.commission += booking.commission
          acc.net += booking.netAgency
          acc.reservations += 1
        }

        return acc
      },
      {
        gross: 0,
        grossAll: 0,
        commission: 0,
        net: 0,
        reservations: 0,
        commissionPercentage: env.COMMISSION_RATE,
        carryOver: 0,
        totalToPay: 0,
        payable: false,
        threshold: 50,
        carryOverItems: [],
      }
    )
  }, [data, summary])

  const metrics = useMemo(
    () => ({
      grossAll: formatCurrency(computedSummary.grossAll),
      gross: formatCurrency(computedSummary.gross),
      net: formatCurrency(computedSummary.net),
      commission: formatCurrency(computedSummary.commission),
      commissionRate: formatPercentage(computedSummary.commissionPercentage),
      reservations: `${computedSummary.reservations}`,
    }),
    [computedSummary]
  )

  const totalToPayAmount = computedSummary.totalToPay || 0
  const formattedTotalToPay = formatCurrency(totalToPayAmount)
  const isPayable = computedSummary.payable || false
  const carryOverItems = useMemo(() => {
    const items = computedSummary.carryOverItems || []
    return items.slice(-6).reverse()
  }, [computedSummary.carryOverItems])
  const paymentMessage = isPayable
    ? strings.PAYMENT_READY_MESSAGE.replace('{amount}', formattedTotalToPay)
    : strings.PAYMENT_WAITING_MESSAGE

  const kpiItems = useMemo(
    () => [
      {
        key: 'grossAll',
        title: strings.KPI_GROSS_ALL,
        value: metrics.grossAll,
        icon: <InfoOutlinedIcon />,
      },
      {
        key: 'gross',
        title: strings.KPI_GROSS,
        value: metrics.gross,
        icon: <InfoOutlinedIcon />,
      },
      {
        key: 'net',
        title: strings.KPI_NET,
        value: metrics.net,
        icon: <PaidOutlinedIcon />,
      },
      {
        key: 'commission',
        title: strings.KPI_COMMISSION,
        value: metrics.commission,
        icon: <LocalOfferOutlinedIcon />,
        helperText: strings.KPI_COMMISSION_PERCENTAGE.replace('{value}', metrics.commissionRate),
      },
      {
        key: 'reservations',
        title: strings.KPI_RESERVATIONS,
        value: metrics.reservations,
        icon: <PeopleAltOutlinedIcon />,
      },
    ],
    [metrics]
  )

  const displayedKpis = useMemo(() => {
    if (isDesktop) return kpiItems
    const mobileKeys = new Set(['gross', 'net', 'commission', 'reservations'])
    return kpiItems.filter((item) => mobileKeys.has(item.key))
  }, [isDesktop, kpiItems])

  const monthlyCommissionStatus = useMemo(() => {
    const labels = strings.MONTHLY_COMMISSION_STATUS as Record<MonthlyCommissionStatusKey, string>
    const today = new Date()
    let collected = 0
    let due = 0
    let overdue = false

    data.forEach((booking) => {
      if (!hasBillableCommission(booking.bookingStatus)) return

      const commissionValue = booking.commission || 0

      if (booking.commissionStatus === COMMISSION_STATUS_PAID) {
        collected += commissionValue
        return
      }

      due += commissionValue
      if (new Date(booking.to) < today) overdue = true
    })

    if (due <= 0) {
      return { key: 'paid' as MonthlyCommissionStatusKey, label: labels.paid, ...MONTHLY_COMMISSION_STATUS_CONFIG.paid }
    }
    if (overdue) {
      return {
        key: 'followUp' as MonthlyCommissionStatusKey,
        label: labels.followUp,
        ...MONTHLY_COMMISSION_STATUS_CONFIG.followUp,
      }
    }
    if (collected > 0) {
      return {
        key: 'partial' as MonthlyCommissionStatusKey,
        label: labels.partial,
        ...MONTHLY_COMMISSION_STATUS_CONFIG.partial,
      }
    }
    return { key: 'unpaid' as MonthlyCommissionStatusKey, label: labels.unpaid, ...MONTHLY_COMMISSION_STATUS_CONFIG.unpaid }
  }, [data])

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]
  }, [])

  const handlePreviousMonth = () => {
    setMonth((prev) => {
      if (prev === 0) {
        setYear((current) => current - 1)
        return 11
      }
      return prev - 1
    })
  }

  const handleNextMonth = () => {
    setMonth((prev) => {
      if (prev === 11) {
        setYear((current) => current + 1)
        return 0
      }
      return prev + 1
    })
  }

  const handleLoad = (_user?: bookcarsTypes.User) => {
    if (_user) {
      if (helper.admin(_user)) {
        navigate('/admin-commissions', { replace: true })
        return
      }
      setUser(_user)
    }
  }

  const renderDate = (date: string | Date) => new Date(date).toLocaleDateString(locale)

  const renderBookingStatusChip = (bookingStatus: bookcarsTypes.BookingStatus) => {
    const statusStyle = BOOKING_STATUS_CHIP_STYLES[bookingStatus] || FALLBACK_STATUS_CHIP_STYLE
    return (
      <Chip
        size="small"
        label={helper.getBookingStatus(bookingStatus)}
        variant="filled"
        sx={{
          bgcolor: statusStyle.background,
          color: statusStyle.color,
          fontWeight: 600,
          '& .MuiChip-label': { fontWeight: 600 },
        }}
      />
    )
  }

  const getReservationStatus = (booking: CommissionRow, referenceDate: Date): ReservationStatusKey => {
    if (
      booking.bookingStatus === bookcarsTypes.BookingStatus.Cancelled
      || booking.bookingStatus === bookcarsTypes.BookingStatus.Void
    ) {
      return 'cancelled'
    }
    if (booking.bookingStatus === bookcarsTypes.BookingStatus.Paid) return 'paid'

    const fromDate = new Date(booking.from)
    const toDate = new Date(booking.to)

    if (referenceDate < fromDate) return 'reserved'
    if (referenceDate > toDate) return 'completed'
    return 'ongoing'
  }

  const renderReservationStatusChip = (statusKey: ReservationStatusKey) => {
    const labels = strings.RESERVATION_STATUS as Record<ReservationStatusKey, string>
    const style = RESERVATION_STATUS_STYLES[statusKey]
    return (
      <Chip
        size="small"
        label={labels[statusKey]}
        sx={{
          bgcolor: style.background,
          color: style.color,
          fontWeight: 600,
          '& .MuiChip-label': { fontWeight: 600 },
        }}
      />
    )
  }

  const renderCommissionStatus = (booking: CommissionRow) => {
    if (!hasBillableCommission(booking.bookingStatus)) {
      return (
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {strings.COMMISSION_STATUS_NOT_APPLICABLE}
        </Typography>
      )
    }

    return (
      <Chip
        size="small"
        label={commissionPaymentLabels[booking.commissionStatus || COMMISSION_STATUS_PENDING]}
        color={paymentColor(booking.commissionStatus)}
        variant={booking.commissionStatus === COMMISSION_STATUS_PAID ? 'filled' : 'outlined'}
      />
    )
  }

  const getCommissionStatusLabel = (booking: CommissionRow) => {
    if (!hasBillableCommission(booking.bookingStatus)) {
      return strings.COMMISSION_STATUS_NOT_APPLICABLE
    }

    return commissionPaymentLabels[booking.commissionStatus || COMMISSION_STATUS_PENDING]
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const header = [
      strings.BOOKING_NUMBER,
      strings.CLIENT,
      strings.START_DATE,
      strings.END_DATE,
      strings.DAYS,
      strings.PRICE_PER_DAY,
      strings.TOTAL_CLIENT,
      strings.COMMISSION,
      strings.NET_AGENCY,
      strings.BOOKING_STATUS,
      strings.COMMISSION_STATUS,
    ]

    const rows = sortedRows.map((booking) => [
      booking.bookingNumber,
      booking.driver.fullName,
      renderDate(booking.from),
      renderDate(booking.to),
      booking.days.toString(),
      formatCurrency(booking.pricePerDay),
      formatCurrency(booking.totalClient),
      formatCurrency(booking.commission),
      formatCurrency(booking.netAgency),
      helper.getBookingStatus(booking.bookingStatus),
      getCommissionStatusLabel(booking),
    ])

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `commissions_${year}_${String(month + 1).padStart(2, '0')}.csv`)
  }

  const handleDownloadMonthlyInvoice = async () => {
    if (!user?._id) return

    try {
      setMonthInvoiceLoading(true)
      const response = await CommissionService.downloadMonthlyInvoice(user._id, year, month)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      downloadBlob(blob, `commission_${year}_${String(month + 1).padStart(2, '0')}.pdf`)
    } catch (err) {
      helper.error(err)
    } finally {
      setMonthInvoiceLoading(false)
    }
  }

  const handleDownloadBookingInvoice = async (bookingId: string) => {
    try {
      setBookingInvoiceLoading(bookingId)
      const response = await CommissionService.downloadBookingInvoice(bookingId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      downloadBlob(blob, `commission_booking_${bookingId}.pdf`)
    } catch (err) {
      helper.error(err)
    } finally {
      setBookingInvoiceLoading(null)
    }
  }

  const refreshPaymentOptions = async () => {
    setPaymentOptionsLoading(true)
    try {
      const response = await CommissionService.getCommissionPaymentOptions()
      setPaymentOptions(response)
      return response
    } catch (err) {
      helper.error(err)
      throw err
    } finally {
      setPaymentOptionsLoading(false)
    }
  }

  const handleOpenPayDialog = async () => {
    if (!computedSummary.payable) {
      helper.info(strings.PAYMENT_WAITING_MESSAGE)
      return
    }
    try {
      const options = paymentOptions || (await refreshPaymentOptions())
      if (!options.bankTransferEnabled) {
        helper.error(undefined, strings.PAY_BANK_TRANSFER_DISABLED)
        return
      }
      if (!hasPaymentRibDetails(options)) {
        helper.error(undefined, strings.PAY_BANK_TRANSFER_NO_DETAILS)
        return
      }
      setBankTransferDialogOpen(true)
    } catch {
      // errors are handled in refreshPaymentOptions
    }
  }

  const handleClosePayDialog = () => {
    setBankTransferDialogOpen(false)
  }

  const handleDownloadRib = async () => {
    try {
      setDownloadingRib(true)
      const blob = await CommissionService.downloadCommissionRib()
      downloadBlob(blob, strings.PAY_BANK_TRANSFER_FILENAME)
    } catch (err) {
      helper.error(err, strings.PAY_BANK_TRANSFER_DOWNLOAD_ERROR)
    } finally {
      setDownloadingRib(false)
    }
  }

  const handleCopyRibValue = async (value?: string) => {
    if (!value) {
      return
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      }
      helper.info(strings.PAY_BANK_TRANSFER_COPY_SUCCESS)
    } catch (err) {
      helper.error(err)
    }
  }

  // Accepte maintenant string | undefined pour corriger "Type 'string | undefined'..."
  const handleCopyBookingNumber = async (bookingNumber?: string) => {
    try {
      if (!bookingNumber) return
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(bookingNumber)
      }
      helper.info(strings.BOOKING_ID_COPIED)
    } catch (err) {
      helper.error(err)
    }
  }

  return (
    <Layout onLoad={handleLoad} strict>
      {user && (
        <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 10, md: 3 }, bgcolor: '#f7f9fc', minHeight: '100vh' }}>
          <Stack spacing={3}>
            <Box
              sx={{
                display: { xs: 'flex', lg: 'none' },
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                  <Typography variant="h5" fontWeight={800} noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {strings.HEADER}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={0.5}>
                    <Chip size="small" variant="outlined" label={`${months[month]} ${year}`} />
                    {monthlyCommissionStatus && (
                      <Chip
                        size="small"
                        color={monthlyCommissionStatus.color}
                        variant={monthlyCommissionStatus.variant}
                        label={strings.COMMISSION_STATUS_HEADER.replace('{value}', monthlyCommissionStatus.label)}
                        sx={{ fontWeight: 600, '& .MuiChip-label': { fontWeight: 600 } }}
                      />
                    )}
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <IconButton onClick={handlePreviousMonth} aria-label={strings.PREVIOUS_MONTH} sx={{ width: 48, height: 48 }}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <IconButton onClick={handleNextMonth} aria-label={strings.NEXT_MONTH} sx={{ width: 48, height: 48 }}>
                    <ChevronRightIcon />
                  </IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Button variant="contained" startIcon={<FilterListIcon />} onClick={() => setFiltersOpen(true)}>
                  {strings.FILTER_BUTTON}
                </Button>
                <Stack direction="row" spacing={1}>
                  <Tooltip title={isPayable ? strings.PAY_BUTTON : strings.PAYMENT_WAITING_MESSAGE}>
                    <span>
                      <IconButton
                        onClick={handleOpenPayDialog}
                        disabled={paymentOptionsLoading || !isPayable}
                        aria-label={strings.PAY_BUTTON}
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: '#F79009',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: '#DC6803',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#FBC67B',
                            color: '#fff',
                          },
                        }}
                      >
                        {paymentOptionsLoading ? <CircularProgress size={20} /> : <PaidOutlinedIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={strings.EXPORT_CSV}>
                    <span>
                      <IconButton
                        color="primary"
                        onClick={handleExportCsv}
                        disabled={sortedRows.length === 0 && !loading}
                        aria-label={strings.EXPORT_CSV}
                        sx={{ width: 48, height: 48 }}
                      >
                        <ReceiptLongIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={strings.DOWNLOAD_MONTH_INVOICE}>
                    <span>
                      <IconButton
                        color="primary"
                        onClick={handleDownloadMonthlyInvoice}
                        disabled={monthInvoiceLoading}
                        aria-label={strings.DOWNLOAD_MONTH_INVOICE}
                        sx={{ width: 48, height: 48 }}
                      >
                        {monthInvoiceLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ display: { xs: 'none', lg: 'flex' } }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h5" fontWeight={800}>
                  {strings.HEADER}
                </Typography>
                <Chip size="small" variant="outlined" label={`${strings.PERIOD_LABEL} ${months[month]} ${year}`} />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={paymentOptionsLoading ? <CircularProgress size={18} /> : <PaidOutlinedIcon />}
                  onClick={handleOpenPayDialog}
                  disabled={paymentOptionsLoading || !isPayable}
                  sx={{
                    backgroundColor: '#F79009',
                    '&:hover': {
                      backgroundColor: '#DC6803',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#FBC67B',
                      color: '#fff',
                    },
                  }}
                >
                  {strings.PAY_BUTTON}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ReceiptLongIcon />}
                  onClick={handleExportCsv}
                  disabled={sortedRows.length === 0 && !loading}
                >
                  {strings.EXPORT_CSV}
                </Button>
                <Button
                  variant="contained"
                  startIcon={monthInvoiceLoading ? <CircularProgress size={18} /> : <DownloadIcon />}
                  onClick={handleDownloadMonthlyInvoice}
                  disabled={monthInvoiceLoading}
                >
                  {strings.DOWNLOAD_MONTH_INVOICE}
                </Button>
              </Stack>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: '0 6px 24px rgba(10,102,255,0.06)',
                display: { xs: 'none', lg: 'block' },
              }}
            >
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} md>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={strings.SEARCH_PLACEHOLDER}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Select
                    size="small"
                    fullWidth
                    value={status}
                    onChange={(event) => setStatus(event.target.value as 'all' | bookcarsTypes.BookingStatus)}
                  >
                    <MenuItem value="all">{strings.STATUS_ALL}</MenuItem>
                    {bookingStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Select size="small" fullWidth value={month.toString()} onChange={(event) => setMonth(Number(event.target.value))}>
                    {months.map((label, index) => (
                      <MenuItem key={label} value={index.toString()}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={8} sm={4} md={2}>
                  <Select size="small" fullWidth value={year.toString()} onChange={(event) => setYear(Number(event.target.value))}>
                    {yearOptions.map((option) => (
                      <MenuItem key={option} value={option.toString()}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={4} sm={2} md={1}>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton onClick={handlePreviousMonth} aria-label={strings.PREVIOUS_MONTH}>
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton onClick={handleNextMonth} aria-label={strings.NEXT_MONTH}>
                      <ChevronRightIcon />
                    </IconButton>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Dialog
              open={bankTransferDialogOpen}
              onClose={handleClosePayDialog}
              fullWidth
              maxWidth="sm"
              PaperProps={{
                sx: {
                  paddingTop: 5,
                },
              }}
            >
              <DialogTitle>{strings.PAY_BANK_TRANSFER_TITLE}</DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <AccountBalanceIcon color={paymentOptions?.bankTransferEnabled === false ? 'disabled' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={strings.PAYMENT_METHOD_BANK_TRANSFER}
                      secondary={strings.PAYMENT_METHOD_BANK_TRANSFER_DESCRIPTION}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <CreditCardIcon color={paymentOptions?.cardPaymentEnabled ? 'primary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={strings.PAYMENT_METHOD_CARD}
                      secondary={paymentOptions?.cardPaymentEnabled ? undefined : strings.PAYMENT_METHOD_UNAVAILABLE}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon>
                      <QrCode2Icon color={paymentOptions?.d17PaymentEnabled ? 'primary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={strings.PAYMENT_METHOD_D17}
                      secondary={paymentOptions?.d17PaymentEnabled ? undefined : strings.PAYMENT_METHOD_UNAVAILABLE}
                    />
                  </ListItem>
                </List>
                {paymentOptions?.bankTransferRibInformation ? (
                  <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {paymentOptions.bankTransferRibInformation}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {strings.PAY_BANK_TRANSFER_NO_INFORMATION}
                  </Typography>
                )}
                {hasPaymentRibDetails(paymentOptions) ? (
                  <Stack spacing={1.5}>
                    {[{
                      label: strings.PAY_BANK_TRANSFER_ACCOUNT_HOLDER,
                      value: paymentOptions?.bankTransferRibDetails?.accountHolder,
                    }, {
                      label: strings.PAY_BANK_TRANSFER_BANK_NAME,
                      value: paymentOptions?.bankTransferRibDetails?.bankName,
                    }, {
                      label: strings.PAY_BANK_TRANSFER_BANK_ADDRESS,
                      value: paymentOptions?.bankTransferRibDetails?.bankAddress,
                    }, {
                      label: strings.PAY_BANK_TRANSFER_IBAN,
                      value: paymentOptions?.bankTransferRibDetails?.iban,
                    }, {
                      label: strings.PAY_BANK_TRANSFER_BIC,
                      value: paymentOptions?.bankTransferRibDetails?.bic,
                    }, {
                      label: strings.PAY_BANK_TRANSFER_ACCOUNT_NUMBER,
                      value: paymentOptions?.bankTransferRibDetails?.accountNumber,
                    }]
                      .filter((entry) => entry.value)
                      .map((entry) => (
                        <Stack key={entry.label} direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                              {entry.label}
                            </Typography>
                            <Typography variant="body1" fontWeight={700} sx={{ wordBreak: 'break-all' }}>
                              {entry.value}
                            </Typography>
                          </Box>
                          <Tooltip title={strings.PAY_BANK_TRANSFER_COPY}>
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => handleCopyRibValue(entry.value)}
                                size="small"
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      ))}
                    <Button
                      variant="contained"
                      startIcon={downloadingRib ? <CircularProgress size={18} /> : <DownloadIcon />}
                      onClick={handleDownloadRib}
                      disabled={downloadingRib}
                    >
                      {strings.PAY_BANK_TRANSFER_DOWNLOAD}
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {strings.PAY_BANK_TRANSFER_NO_DETAILS}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClosePayDialog}>{commonStrings.CLOSE}</Button>
              </DialogActions>
            </Dialog>

            <Drawer
              anchor="bottom"
              open={filtersOpen && isMobileOrTablet}
              onClose={() => setFiltersOpen(false)}
              PaperProps={{
                sx: {
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  maxHeight: '90vh',
                  p: 3,
                },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{strings.FILTER_BUTTON}</Typography>
                  <IconButton onClick={() => setFiltersOpen(false)} aria-label={commonStrings.CLOSE}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={strings.SEARCH_PLACEHOLDER}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Select
                  size="small"
                  fullWidth
                  value={status}
                  onChange={(event) => setStatus(event.target.value as 'all' | bookcarsTypes.BookingStatus)}
                >
                  <MenuItem value="all">{strings.STATUS_ALL}</MenuItem>
                  {bookingStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Select size="small" fullWidth value={month.toString()} onChange={(event) => setMonth(Number(event.target.value))}>
                      {months.map((label, index) => (
                        <MenuItem key={label} value={index.toString()}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Select size="small" fullWidth value={year.toString()} onChange={(event) => setYear(Number(event.target.value))}>
                      {yearOptions.map((option) => (
                        <MenuItem key={option} value={option.toString()}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="text" onClick={() => setFiltersOpen(false)}>
                    {commonStrings.CLOSE}
                  </Button>
                  <Button variant="contained" onClick={() => setFiltersOpen(false)}>
                    {commonStrings.APPLY_FILTERS}
                  </Button>
                </Stack>
              </Stack>
            </Drawer>

            <Box
              sx={{
                width: '100%',
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                  lg: `repeat(${displayedKpis.length}, minmax(0, 1fr))`,
                },
              }}
            >
              {displayedKpis.map((item) => (
                <Kpi
                  key={item.key}
                  title={item.title}
                  value={item.value}
                  icon={item.icon}
                  helperText={item.helperText}
                  loading={loading}
                  sx={{ height: '100%' }}
                />
              ))}
            </Box>

            <Alert
              severity={isPayable ? 'success' : 'info'}
              iconMapping={{
                success: <PaidOutlinedIcon fontSize="inherit" />,
                info: <InfoOutlinedIcon fontSize="inherit" />,
              }}
              sx={{
                borderRadius: 2,
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                boxShadow: '0 6px 24px rgba(10,102,255,0.06)',
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 2.5 }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                width="100%"
              >
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {paymentMessage}
                </Typography>
                {isPayable && (
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={paymentOptionsLoading ? <CircularProgress size={18} /> : <PaidOutlinedIcon />}
                    onClick={handleOpenPayDialog}
                    disabled={paymentOptionsLoading}
                    sx={{
                      backgroundColor: '#F79009',
                      '&:hover': {
                        backgroundColor: '#DC6803',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#FBC67B',
                        color: '#fff',
                      },
                    }}
                  >
                    {strings.PAY_BUTTON}
                  </Button>
                )}
              </Stack>
            </Alert>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                boxShadow: '0 6px 24px rgba(10,102,255,0.06)',
                bgcolor: 'background.paper',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                  {strings.CARRY_OVER_SECTION_TITLE}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {strings.CARRY_OVER_INFO}
                </Typography>
                {loading ? (
                  <Stack spacing={1}>
                    {[0, 1].map((index) => (
                      <Skeleton key={index} variant="rounded" height={20} />
                    ))}
                  </Stack>
                ) : carryOverItems.length > 0 ? (
                  <List disablePadding dense>
                    {carryOverItems.map((item) => (
                      <ListItem key={`${item.year}-${item.month}`} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                          <ReceiptLongIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${item.year}-${String(item.month).padStart(2, '0')} — ${formatCurrency(item.amount)}`}
                          primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {strings.CARRY_OVER_EMPTY}
                  </Typography>
                )}
              </Stack>
            </Paper>

            <Typography variant="subtitle2" color="text.secondary">
              {strings.MONTHLY_BOOKINGS}
            </Typography>

            {/* LISTE MOBILE */}
            <Box
              sx={{
                display: { xs: 'flex', lg: 'none' },
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {loading && sortedRows.length === 0
                ? [0, 1, 2].map((id) => (
                  <Paper
                    key={`skeleton-${id}`}
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                      }}
                  >
                    <Skeleton variant="text" height={24} width="60%" />
                    <Skeleton variant="text" height={18} width="80%" />
                    <Skeleton variant="rectangular" height={32} />
                  </Paper>
                  ))
                : !loading && sortedRows.length === 0
                ? (
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)' }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {strings.EMPTY_LIST}
                    </Typography>
                  </Paper>
                  )
                : (
                  sortedRows.map((booking) => {
                    const reservationStatus = getReservationStatus(booking, new Date())
                    const isCancelled = reservationStatus === 'cancelled'
                    const detailItems = [
                      { label: strings.DAYS, value: `${booking.days}` },
                      { label: strings.PRICE_PER_DAY, value: formatCurrency(booking.pricePerDay) },
                      { label: strings.TOTAL_CLIENT, value: formatCurrency(booking.totalClient) },
                      { label: strings.COMMISSION_PLANY, value: formatCurrency(booking.commission) },
                      { label: strings.NET_AGENCY, value: formatCurrency(booking.netAgency) },
                    ]

                    return (
                      <Paper
                        key={booking.bookingId}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                          bgcolor: isCancelled ? '#f5f5f5' : 'common.white',
                          opacity: isCancelled ? 0.7 : 1,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="flex-start">
                          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                            <Tooltip title={`#${booking.bookingNumber ?? ''}`}>
                              <Button
                                variant="text"
                                size="small"
                                color="primary"
                                onClick={() => handleCopyBookingNumber(booking.bookingNumber)}
                                startIcon={<ContentCopyIcon fontSize="small" />}
                                sx={{
                                  px: 0,
                                  minWidth: 0,
                                  justifyContent: 'flex-start',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                }}
                                aria-label={`${strings.BOOKING_NUMBER} ${booking.bookingNumber ?? ''}`}
                              >
                                #
                                {booking.bookingNumber}
                              </Button>
                            </Tooltip>
                            <Tooltip title={booking.driver.fullName}>
                              <Typography
                                component={Link}
                                href={`/user?u=${booking.driver._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="none"
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}
                              >
                                {booking.driver.fullName}
                              </Typography>
                            </Tooltip>
                          </Stack>
                          {renderReservationStatusChip(reservationStatus)}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          <Box component="span" fontWeight={600}>{`${strings.DRAWER_PERIOD}: `}</Box>
                          {`${renderDate(booking.from)} → ${renderDate(booking.to)}`}
                        </Typography>
                        <Grid container spacing={1} columns={12}>
                          {detailItems.map((item) => (
                            <Grid item xs={6} key={item.label}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                                {item.label}
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {item.value}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={strings.VIEW_DETAILS}>
                            <IconButton
                              color="primary"
                              onClick={() => setDrawer(booking)}
                              aria-label={strings.VIEW_DETAILS}
                              sx={{ width: 48, height: 48 }}
                            >
                              <OpenInNewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={strings.DOWNLOAD_INVOICE}>
                            <span>
                              <IconButton
                                color="primary"
                                onClick={() => handleDownloadBookingInvoice(booking.bookingId)}
                                disabled={bookingInvoiceLoading === booking.bookingId}
                                aria-label={strings.DOWNLOAD_INVOICE}
                                sx={{ width: 48, height: 48 }}
                              >
                                {bookingInvoiceLoading === booking.bookingId ? <CircularProgress size={20} /> : <ReceiptLongIcon />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    )
                  })
                  )}
            </Box>

            {/* TABLEAU DESKTOP */}
            <Paper elevation={0} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{strings.BOOKING_NUMBER}</TableCell>
                    <TableCell>{strings.CLIENT}</TableCell>
                    <TableCell>{strings.START_DATE}</TableCell>
                    <TableCell>{strings.END_DATE}</TableCell>
                    <TableCell align="right">{strings.DAYS}</TableCell>
                    <TableCell align="right">{strings.PRICE_PER_DAY}</TableCell>
                    <TableCell align="right">{strings.TOTAL_CLIENT}</TableCell>
                    <TableCell align="right">{strings.COMMISSION}</TableCell>
                    <TableCell align="right">{strings.NET_AGENCY}</TableCell>
                    <TableCell align="center">{strings.BOOKING_STATUS}</TableCell>
                    <TableCell align="center">{strings.COMMISSION_STATUS}</TableCell>
                    <TableCell align="center">{strings.ACTIONS}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && sortedRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <Skeleton variant="rectangular" height={40} />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && sortedRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                          {strings.EMPTY_LIST}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedRows.map((booking) => (
                    <TableRow key={booking.bookingId} hover>
                      <TableCell>
                        <Link
                          href={`/update-booking?b=${booking.bookingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          {/* règle jsx-one-expression-per-line */}
                          {booking.bookingNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/user?u=${booking.driver._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          {booking.driver.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>{renderDate(booking.from)}</TableCell>
                      <TableCell>{renderDate(booking.to)}</TableCell>
                      <TableCell align="right">{booking.days}</TableCell>
                      <TableCell align="right">{formatCurrency(booking.pricePerDay)}</TableCell>
                      <TableCell align="right">{formatCurrency(booking.totalClient)}</TableCell>
                      <TableCell align="right">{formatCurrency(booking.commission)}</TableCell>
                      <TableCell align="right">{formatCurrency(booking.netAgency)}</TableCell>
                      <TableCell align="center">{renderBookingStatusChip(booking.bookingStatus)}</TableCell>
                      <TableCell align="center">{renderCommissionStatus(booking)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title={strings.VIEW_DETAILS}>
                            <IconButton size="small" onClick={() => setDrawer(booking)}>
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={strings.DOWNLOAD_INVOICE}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadBookingInvoice(booking.bookingId)}
                                disabled={bookingInvoiceLoading === booking.bookingId}
                              >
                                {bookingInvoiceLoading === booking.bookingId ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <ReceiptLongIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Drawer
              anchor={isDesktop ? 'right' : 'bottom'}
              open={Boolean(drawer)}
              onClose={() => setDrawer(null)}
              PaperProps={{
                sx: {
                  width: isDesktop ? { xs: '100%', md: 520 } : '100%',
                  maxHeight: isDesktop ? '100vh' : '90vh',
                  borderTopLeftRadius: isDesktop ? 0 : 24,
                  borderTopRightRadius: isDesktop ? 0 : 24,
                  paddingTop: isDesktop ? 5 : 0,
                },
              }}
            >
              <Box sx={{ p: 3, maxHeight: isDesktop ? 'none' : '90vh', overflowY: 'auto' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" rowGap={1}>
                  <Typography variant="h6" fontWeight={800}>
                    {strings.DRAWER_TITLE}
                  </Typography>
                  {drawer && (
                    <Button
                      variant="outlined"
                      startIcon={bookingInvoiceLoading === drawer.bookingId ? <CircularProgress size={18} /> : <ReceiptLongIcon />}
                      onClick={() => handleDownloadBookingInvoice(drawer.bookingId)}
                      disabled={bookingInvoiceLoading === drawer.bookingId}
                      fullWidth={!isDesktop}
                    >
                      {strings.DOWNLOAD_INVOICE}
                    </Button>
                  )}
                </Stack>
                <Divider sx={{ mb: 2 }} />
                {drawer && (
                  <>
                    <Grid container spacing={2} columns={12}>
                      {[
                        { label: strings.DAYS, value: `${drawer.days}` },
                        { label: strings.PRICE_PER_DAY, value: formatCurrency(drawer.pricePerDay) },
                        { label: strings.TOTAL_CLIENT, value: formatCurrency(drawer.totalClient) },
                        { label: strings.COMMISSION_PLANY, value: formatCurrency(drawer.commission) },
                        { label: strings.NET_AGENCY, value: formatCurrency(drawer.netAgency) },
                      ].map((item) => (
                        <Grid item xs={6} key={item.label}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body1" fontWeight={700}>
                            {item.value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                        {strings.DRAWER_PERIOD}
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {`${renderDate(drawer.from)} → ${renderDate(drawer.to)}`}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                        {strings.BOOKING_STATUS}
                      </Typography>
                      {renderReservationStatusChip(getReservationStatus(drawer, new Date()))}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle2" color="text.secondary">
                      {strings.DRAWER_BOOKING_SECTION}
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                          {strings.BOOKING_NUMBER}
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {drawer.bookingNumber}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                          {strings.CLIENT}
                        </Typography>
                        <Typography variant="body1" fontWeight={700}>
                          {drawer.driver.fullName}
                        </Typography>
                      </Box>
                    </Stack>
                  </>
                )}
              </Box>
            </Drawer>
          </Stack>
        </Box>
      )}
    </Layout>
  )
}

export default AgencyDetailsCommissions
