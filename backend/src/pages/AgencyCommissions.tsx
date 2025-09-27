import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  ChipProps,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
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
  SxProps,
  Theme,
} from '@mui/material'
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
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import { strings } from '@/lang/agency-commissions'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import * as CommissionService from '@/services/CommissionService'

const formatter = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 })
const formatCurrency = (value: number) => `${formatter.format(Math.round(value || 0))} ${strings.CURRENCY}`
const formatPercentage = (value: number) => `${formatter.format(Math.round(Number.isFinite(value) ? value : 0))} %`
const COMMISSION_STATUS_PAID: bookcarsTypes.CommissionStatus = 'paid'
const COMMISSION_STATUS_PENDING: bookcarsTypes.CommissionStatus = 'pending'
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

const MONTHLY_PAYMENT_STATUS_COLOR: Record<bookcarsTypes.AgencyCommissionPaymentStatus, ChipProps['color']> = {
  [bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid]: 'error',
  [bookcarsTypes.AgencyCommissionPaymentStatus.FollowUp]: 'warning',
  [bookcarsTypes.AgencyCommissionPaymentStatus.Partial]: 'info',
  [bookcarsTypes.AgencyCommissionPaymentStatus.Paid]: 'success',
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
        <Typography variant="overline" color="text.secondary">{title}</Typography>
      </Stack>
      {loading ? (
        <Skeleton width="60%" height={36} />
      ) : (
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={900}>{value}</Typography>
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

const paymentColor = (status?: bookcarsTypes.CommissionStatus): 'success' | 'warning' => (
  status === COMMISSION_STATUS_PAID ? 'success' : 'warning'
)

const AgencyCommissions = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [status, setStatus] = useState<'all' | bookcarsTypes.BookingStatus>('all')
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CommissionRow[]>([])
  const [summary, setSummary] = useState<bookcarsTypes.AgencyCommissionSummary | null>(null)
  const [drawer, setDrawer] = useState<DrawerState>(null)
  const [monthInvoiceLoading, setMonthInvoiceLoading] = useState(false)
  const [bookingInvoiceLoading, setBookingInvoiceLoading] = useState<string | null>(null)

  const locale = LOCALE_MAP[user?.language || 'fr'] || 'fr-FR'
  const months = strings.MONTHS as string[]
  const language = strings.getLanguage()
  const commissionPaymentLabels = strings.COMMISSION_PAYMENT_LABELS as Record<bookcarsTypes.CommissionStatus, string>
  const agencyPaymentStatusLabels = strings.AGENCY_PAYMENT_STATUS_LABELS as Record<bookcarsTypes.AgencyCommissionPaymentStatus, string>
  const bookingStatusOptions = useMemo(() => helper.getBookingStatuses(), [language])

  useEffect(() => {
    if (!user?._id) {
      setData([])
      setSummary(null)
      return
    }

    let active = true
    setLoading(true)
    const timeout = window.setTimeout(() => {
      CommissionService.getAgencyCommissions({
        suppliers: [user._id],
        month,
        year,
        query: query.trim() || undefined,
      })
        .then((response) => {
          if (!active) {
            return
          }

          const rows = response.bookings.map((booking) => ({
            ...booking,
            commissionStatus: booking.commissionStatus || COMMISSION_STATUS_PENDING,
          }))

          setData(rows)
          setSummary(response.summary)
        })
        .catch((err) => {
          if (active) {
            helper.error(err)
            setData([])
            setSummary(null)
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false)
          }
        })
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [user?._id, month, year, query])

  const filteredRows = useMemo(() => (
    status === 'all'
      ? data
      : data.filter((booking) => booking.bookingStatus === status)
  ), [data, status])

  const sortedRows = useMemo(() => [...filteredRows].sort((a, b) => b.totalClient - a.totalClient), [filteredRows])

  const computedSummary = useMemo(() => {
    if (summary) {
      return summary
    }

    return data.reduce<bookcarsTypes.AgencyCommissionSummary>((acc, booking) => {
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
      commissionPercentage: env.PLANY_COMMISSION_PERCENTAGE,
      paymentStatus: bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid,
      commissionPaid: 0,
    })
  }, [data, summary])

  const metrics = useMemo(() => ({
    grossAll: formatCurrency(computedSummary.grossAll),
    gross: formatCurrency(computedSummary.gross),
    net: formatCurrency(computedSummary.net),
    commission: formatCurrency(computedSummary.commission),
    commissionRate: formatPercentage(computedSummary.commissionPercentage),
    reservations: `${computedSummary.reservations}`,
    commissionPaid: formatCurrency(computedSummary.commissionPaid),
  }), [computedSummary])

  const monthlyPaymentStatus = computedSummary.paymentStatus
    || bookcarsTypes.AgencyCommissionPaymentStatus.Unpaid
  const monthlyPaymentStatusLabel = agencyPaymentStatusLabels[monthlyPaymentStatus]
    || monthlyPaymentStatus
  const monthlyPaymentChipColor = MONTHLY_PAYMENT_STATUS_COLOR[monthlyPaymentStatus] || 'default'
  const monthlyPaymentChipVariant = monthlyPaymentStatus === bookcarsTypes.AgencyCommissionPaymentStatus.Paid
    ? 'filled'
    : 'outlined'
  const monthlyPaymentChipLabel = strings.MONTHLY_PAYMENT_STATUS.replace('{status}', monthlyPaymentStatusLabel)

  const kpiItems = useMemo(() => ([
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
      helperText: (() => {
        const parts = [strings.KPI_COMMISSION_PERCENTAGE.replace('{value}', metrics.commissionRate)]
        if (computedSummary.commissionPaid > 0) {
          parts.push(strings.COMMISSION_PAID_HELPER.replace('{value}', metrics.commissionPaid))
        }
        return parts.join(' • ')
      })(),
    },
    {
      key: 'reservations',
      title: strings.KPI_RESERVATIONS,
      value: metrics.reservations,
      icon: <PeopleAltOutlinedIcon />,
    },
  ]), [metrics, strings, language, computedSummary.commissionPaid])

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

  const renderDate = (date: string) => new Date(date).toLocaleDateString(locale)

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
          '& .MuiChip-label': {
            fontWeight: 600,
          },
        }}
      />
    )
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
      commissionPaymentLabels[booking.commissionStatus || COMMISSION_STATUS_PENDING],
    ])

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(';'))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `commissions_${year}_${String(month + 1).padStart(2, '0')}.csv`)
  }

  const handleDownloadMonthlyInvoice = async () => {
    if (!user?._id) {
      return
    }

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

  return (
    <Layout onLoad={handleLoad} strict>
      {user && (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f7f9fc', minHeight: '100vh' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" fontWeight={800}>{strings.HEADER}</Typography>
            <Chip size="small" variant="outlined" label={`${strings.PERIOD_LABEL} ${months[month]} ${year}`} />
            <Chip
              size="small"
              color={monthlyPaymentChipColor}
              variant={monthlyPaymentChipVariant}
              label={monthlyPaymentChipLabel}
            />
          </Stack>
            <Stack direction="row" spacing={1}>
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

          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 6px 24px rgba(10,102,255,0.06)' }}>
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
                  onChange={(event) => setStatus(event.target.value as ('all' | bookcarsTypes.BookingStatus))}
                >
                  <MenuItem value="all">{strings.STATUS_ALL}</MenuItem>
                  {bookingStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Select
                  size="small"
                  fullWidth
                  value={month.toString()}
                  onChange={(event) => setMonth(Number(event.target.value))}
                >
                  {months.map((label, index) => (
                    <MenuItem key={label} value={index.toString()}>{label}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={8} sm={4} md={2}>
                <Select
                  size="small"
                  fullWidth
                  value={year.toString()}
                  onChange={(event) => setYear(Number(event.target.value))}
                >
                  {yearOptions.map((option) => (
                    <MenuItem key={option} value={option.toString()}>{option}</MenuItem>
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

          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: 'repeat(auto-fit, minmax(220px, 1fr))',
                lg: 'repeat(5, 1fr)',
              },
            }}
          >
            {kpiItems.map((item) => (
              <Kpi
                key={item.key}
                title={item.title}
                value={item.value}
                icon={item.icon}
                helperText={item.helperText}
                loading={loading}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>{strings.MONTHLY_BOOKINGS}</Typography>

          <Paper elevation={0}>
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
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={commissionPaymentLabels[booking.commissionStatus || COMMISSION_STATUS_PENDING]}
                        color={paymentColor(booking.commissionStatus)}
                        variant={booking.commissionStatus === COMMISSION_STATUS_PAID ? 'filled' : 'outlined'}
                      />
                    </TableCell>
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
                              {bookingInvoiceLoading === booking.bookingId ? <CircularProgress size={16} /> : <ReceiptLongIcon fontSize="small" />}
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
            anchor="right"
            open={Boolean(drawer)}
            onClose={() => setDrawer(null)}
            PaperProps={{ sx: { width: { xs: '100%', md: 520 } } }}
          >
            <Box sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={800}>{strings.DRAWER_TITLE}</Typography>
                {drawer && (
                  <Button
                    variant="outlined"
                    startIcon={bookingInvoiceLoading === drawer.bookingId ? <CircularProgress size={18} /> : <ReceiptLongIcon />}
                    onClick={() => handleDownloadBookingInvoice(drawer.bookingId)}
                    disabled={bookingInvoiceLoading === drawer.bookingId}
                  >
                    {strings.DOWNLOAD_INVOICE}
                  </Button>
                )}
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {drawer && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">{strings.DRAWER_BOOKING_SECTION}</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary={strings.BOOKING_NUMBER} secondary={drawer.bookingNumber} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={strings.CLIENT} secondary={drawer.driver.fullName} />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={strings.DRAWER_PERIOD}
                        secondary={`${renderDate(drawer.from)} → ${renderDate(drawer.to)}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={strings.DAYS} secondary={drawer.days} />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>{strings.DRAWER_AMOUNTS_SECTION}</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary={strings.PRICE_PER_DAY} secondary={formatCurrency(drawer.pricePerDay)} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={strings.TOTAL_CLIENT} secondary={formatCurrency(drawer.totalClient)} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={strings.COMMISSION} secondary={formatCurrency(drawer.commission)} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={strings.NET_AGENCY} secondary={formatCurrency(drawer.netAgency)} />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>{strings.DRAWER_STATUS_SECTION}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={monthlyPaymentChipLabel}
                      color={monthlyPaymentChipColor}
                      variant={monthlyPaymentChipVariant}
                    />
                    {drawer && renderBookingStatusChip(drawer.bookingStatus)}
                    <Chip
                      size="small"
                      label={commissionPaymentLabels[drawer.commissionStatus || COMMISSION_STATUS_PENDING]}
                      color={paymentColor(drawer.commissionStatus)}
                      variant={drawer.commissionStatus === COMMISSION_STATUS_PAID ? 'filled' : 'outlined'}
                    />
                  </Stack>
                </>
              )}
            </Box>
          </Drawer>
        </Box>
      )}
    </Layout>
  )
}

export default AgencyCommissions
