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

interface CommissionBooking {
  id: string
  bookingNumber: string
  bookingHref: string
  customer: string
  customerHref: string
  start: string
  end: string
  days: number
  pricePerDay: number
  totalClient: number
  commission: number
  status: 'confirmed' | 'inProgress' | 'completed' | 'cancelled'
  commissionStatus: 'paid' | 'pending'
}

const COMMISSION_BOOKINGS: CommissionBooking[] = [
  {
    id: '1',
    bookingNumber: 'PL-23001',
    bookingHref: '/update-booking?b=1',
    customer: 'Aymen B.',
    customerHref: '/user?u=u-1',
    start: '2025-10-03',
    end: '2025-10-06',
    days: 3,
    pricePerDay: 150,
    totalClient: 450,
    commission: 24,
    status: 'completed',
    commissionStatus: 'paid',
  },
  {
    id: '2',
    bookingNumber: 'PL-23002',
    bookingHref: '/update-booking?b=2',
    customer: 'Sarra K.',
    customerHref: '/user?u=u-2',
    start: '2025-10-07',
    end: '2025-10-10',
    days: 3,
    pricePerDay: 180,
    totalClient: 540,
    commission: 27,
    status: 'confirmed',
    commissionStatus: 'pending',
  },
  {
    id: '3',
    bookingNumber: 'PL-23003',
    bookingHref: '/update-booking?b=3',
    customer: 'Med R.',
    customerHref: '/user?u=u-3',
    start: '2025-10-18',
    end: '2025-10-21',
    days: 3,
    pricePerDay: 95,
    totalClient: 285,
    commission: 15,
    status: 'confirmed',
    commissionStatus: 'pending',
  },
]

const formatter = new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 })
const formatCurrency = (value: number) => `${formatter.format(Math.round(value || 0))} ${strings.CURRENCY}`
const LOCALE_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  es: 'es-ES',
}

type DrawerState = CommissionBooking | null

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

const statusColor = (status: CommissionBooking['status']): 'default' | 'warning' | 'info' | 'success' => {
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

const paymentColor = (status: CommissionBooking['commissionStatus']): 'success' | 'warning' => (status === 'paid' ? 'success' : 'warning')

const AgencyCommissions = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [status, setStatus] = useState<'all' | CommissionBooking['status']>('all')
  const [query, setQuery] = useState('')
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [drawer, setDrawer] = useState<DrawerState>(null)

  const locale = LOCALE_MAP[user?.language || 'fr'] || 'fr-FR'
  const months = strings.MONTHS as string[]
  const statusLabels = strings.STATUS_LABELS as Record<CommissionBooking['status'], string>
  const commissionPaymentLabels = strings.COMMISSION_PAYMENT_LABELS as Record<CommissionBooking['commissionStatus'], string>

  useEffect(() => {
    if (!user) {
      return
    }
    setLoading(true)
    const timeout = window.setTimeout(() => {
      setLoading(false)
    }, 400)
    return () => window.clearTimeout(timeout)
  }, [user, status, query, month, year])

  const normalizedQuery = query.trim().toLowerCase()

  const rows = useMemo(() => {
    const filteredByPeriod = COMMISSION_BOOKINGS.filter((booking) => {
      const start = new Date(booking.start)
      return start.getMonth() === month && start.getFullYear() === year
    })

    const filteredByStatus = status === 'all'
      ? filteredByPeriod
      : filteredByPeriod.filter((booking) => booking.status === status)

    if (!normalizedQuery) {
      return filteredByStatus
    }

    return filteredByStatus.filter((booking) => {
      const searchTarget = `${booking.bookingNumber} ${booking.customer}`.toLowerCase()
      return searchTarget.includes(normalizedQuery)
    })
  }, [month, normalizedQuery, status, year])

  const metrics = useMemo(() => {
    const totalGross = rows.reduce((acc, booking) => acc + booking.totalClient, 0)
    const totalCommission = rows.reduce((acc, booking) => acc + booking.commission, 0)
    const totalNet = totalGross - totalCommission

    return {
      gross: formatCurrency(totalGross),
      net: formatCurrency(totalNet),
      commission: formatCurrency(totalCommission),
      reservations: `${rows.length}`,
    }
  }, [rows])

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
              <Button variant="outlined" startIcon={<ReceiptLongIcon />}>{strings.EXPORT_CSV}</Button>
              <Button variant="contained" startIcon={<DownloadIcon />}>{strings.DOWNLOAD_MONTH_INVOICE}</Button>
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
                  onChange={(event) => setStatus(event.target.value as CommissionBooking['status'] | 'all')}
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
                {rows.map((booking) => {
                  const net = booking.totalClient - booking.commission
                  return (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Link
                          href={booking.bookingHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          {booking.bookingNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={booking.customerHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          {booking.customer}
                        </Link>
                      </TableCell>
                      <TableCell>{renderDate(booking.start)}</TableCell>
                      <TableCell>{renderDate(booking.end)}</TableCell>
                      <TableCell align="right">{booking.days}</TableCell>
                      <TableCell align="right">{formatCurrency(booking.pricePerDay)}</TableCell>
                      <TableCell align="right">{formatCurrency(booking.totalClient)}</TableCell>
                      <TableCell align="right">{formatCurrency(booking.commission)}</TableCell>
                      <TableCell align="right">{formatCurrency(net)}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={statusLabels[booking.status]} color={statusColor(booking.status)} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={commissionPaymentLabels[booking.commissionStatus]}
                          color={paymentColor(booking.commissionStatus)}
                          variant={booking.commissionStatus === 'paid' ? 'filled' : 'outlined'}
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
                            <IconButton size="small">
                              <ReceiptLongIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
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
                <Button variant="outlined" startIcon={<ReceiptLongIcon />}>{strings.DOWNLOAD_INVOICE}</Button>
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
                      <ListItemText primary={strings.CLIENT} secondary={drawer.customer} />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={strings.DRAWER_PERIOD}
                        secondary={`${renderDate(drawer.start)} → ${renderDate(drawer.end)}`}
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
                      <ListItemText primary={strings.NET_AGENCY} secondary={formatCurrency(drawer.totalClient - drawer.commission)} />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>{strings.DRAWER_STATUS_SECTION}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={statusLabels[drawer.status]} color={statusColor(drawer.status)} />
                    <Chip
                      size="small"
                      label={commissionPaymentLabels[drawer.commissionStatus]}
                      color={paymentColor(drawer.commissionStatus)}
                      variant={drawer.commissionStatus === 'paid' ? 'filled' : 'outlined'}
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
