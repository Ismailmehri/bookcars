import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import * as CommissionService from '@/services/CommissionService'

const formatter = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 })
const formatCurrency = (value: number) => `${formatter.format(Math.round(value || 0))} ${strings.CURRENCY}`
const COMMISSION_STATUS_PAID: bookcarsTypes.CommissionStatus = 'paid'
const COMMISSION_STATUS_PENDING: bookcarsTypes.CommissionStatus = 'pending'
const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
}

type StatusCategory = 'confirmed' | 'inProgress' | 'completed' | 'cancelled'
type CommissionRow = bookcarsTypes.AgencyCommissionBooking & { statusCategory: StatusCategory }
type DrawerState = CommissionRow | null

type KpiProps = {
  title: string
  value: string
  icon: React.ReactNode
  loading: boolean
}

const Kpi = ({ title, value, icon, loading }: KpiProps) => (
  <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 6px 24px rgba(10,102,255,0.06)' }}>
    <CardContent>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        {icon}
        <Typography variant="overline" color="text.secondary">{title}</Typography>
      </Stack>
      {loading ? <Skeleton width="60%" height={36} /> : <Typography variant="h5" fontWeight={900}>{value}</Typography>}
    </CardContent>
  </Card>
)

const statusColor = (status: StatusCategory): 'default' | 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'confirmed':
      return 'warning'
    case 'inProgress':
      return 'info'
    case 'completed':
      return 'success'
    case 'cancelled':
    default:
      return 'default'
  }
}

const paymentColor = (status?: bookcarsTypes.CommissionStatus): 'success' | 'warning' => (
  status === COMMISSION_STATUS_PAID ? 'success' : 'warning'
)

const computeStatusCategory = (booking: bookcarsTypes.AgencyCommissionBooking): StatusCategory => {
  if (booking.bookingStatus === bookcarsTypes.BookingStatus.Cancelled) {
    return 'cancelled'
  }

  const now = Date.now()
  const start = new Date(booking.from).getTime()
  const end = new Date(booking.to).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 'confirmed'
  }

  if (end < now) {
    return 'completed'
  }

  if (start > now) {
    return 'confirmed'
  }

  return 'inProgress'
}

const AgencyCommissions = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [status, setStatus] = useState<'all' | StatusCategory>('all')
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
  const statusLabels = strings.STATUS_LABELS as Record<StatusCategory, string>
  const commissionPaymentLabels = strings.COMMISSION_PAYMENT_LABELS as Record<bookcarsTypes.CommissionStatus, string>

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
            statusCategory: computeStatusCategory(booking),
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
      : data.filter((booking) => booking.statusCategory === status)
  ), [data, status])

  const metrics = useMemo(() => {
    if (summary) {
      return {
        gross: formatCurrency(summary.gross),
        net: formatCurrency(summary.net),
        commission: formatCurrency(summary.commission),
        reservations: `${summary.reservations}`,
      }
    }

    const totalGross = filteredRows.reduce((acc, booking) => acc + booking.totalClient, 0)
    const totalCommission = filteredRows.reduce((acc, booking) => acc + booking.commission, 0)
    const totalNet = totalGross - totalCommission

    return {
      gross: formatCurrency(totalGross),
      net: formatCurrency(totalNet),
      commission: formatCurrency(totalCommission),
      reservations: `${filteredRows.length}`,
    }
  }, [filteredRows, summary])

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
      setUser(_user)
    }
  }

  const renderDate = (date: string) => new Date(date).toLocaleDateString(locale)

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

    const rows = filteredRows.map((booking) => [
      booking.bookingNumber,
      booking.driver.fullName,
      renderDate(booking.from),
      renderDate(booking.to),
      booking.days.toString(),
      formatCurrency(booking.pricePerDay),
      formatCurrency(booking.totalClient),
      formatCurrency(booking.commission),
      formatCurrency(booking.netAgency),
      statusLabels[booking.statusCategory],
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
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<ReceiptLongIcon />}
                onClick={handleExportCsv}
                disabled={filteredRows.length === 0 && !loading}
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
                  onChange={(event) => setStatus(event.target.value as StatusCategory | 'all')}
                >
                  <MenuItem value="all">{strings.STATUS_ALL}</MenuItem>
                  <MenuItem value="confirmed">{statusLabels.confirmed}</MenuItem>
                  <MenuItem value="inProgress">{statusLabels.inProgress}</MenuItem>
                  <MenuItem value="completed">{statusLabels.completed}</MenuItem>
                  <MenuItem value="cancelled">{statusLabels.cancelled}</MenuItem>
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

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Kpi title={strings.KPI_GROSS} value={metrics.gross} icon={<InfoOutlinedIcon />} loading={loading} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Kpi title={strings.KPI_NET} value={metrics.net} icon={<PaidOutlinedIcon />} loading={loading} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Kpi title={strings.KPI_COMMISSION} value={metrics.commission} icon={<LocalOfferOutlinedIcon />} loading={loading} />
            </Grid>
            <Grid item xs={12} md={3}>
              <Kpi title={strings.KPI_RESERVATIONS} value={metrics.reservations} icon={<PeopleAltOutlinedIcon />} loading={loading} />
            </Grid>
          </Grid>

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
                {loading && filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12}>
                      <Skeleton variant="rectangular" height={40} />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12}>
                      <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
                        {strings.EMPTY_LIST}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {filteredRows.map((booking) => (
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
                    <TableCell align="center">
                      <Chip size="small" label={statusLabels[booking.statusCategory]} color={statusColor(booking.statusCategory)} />
                    </TableCell>
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
                    <Chip size="small" label={statusLabels[drawer.statusCategory]} color={statusColor(drawer.statusCategory)} />
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
