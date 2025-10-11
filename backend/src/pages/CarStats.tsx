import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WatchLaterIcon from '@mui/icons-material/WatchLater'
import { subDays, subMonths } from 'date-fns'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import DateTimePicker from '@/components/DateTimePicker'
import SimpleBackdrop from '@/components/SimpleBackdrop'
import * as CarStatsService from '@/services/CarStatsService'
import AgencyScore from '@/components/AgencyScore'
import * as helper from '@/common/helper'
import env from '@/config/env.config'
import { strings } from '@/lang/stats'
import { formatPercentage, sumViewsByDate } from './car-stats.helpers'

const LineChart = lazy(() => import('@mui/x-charts').then((module) => ({ default: module.LineChart })))
const PieChart = lazy(() => import('@mui/x-charts').then((module) => ({ default: module.PieChart })))

const ALL_CARS_VALUE = 'ALL_CARS'

const chartFallback = (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
    <CircularProgress size={24} />
  </Box>
)

const localeForDate = env.DEFAULT_LANGUAGE === 'fr'
  ? 'fr-FR'
  : env.DEFAULT_LANGUAGE === 'es'
    ? 'es-ES'
    : 'en-US'

const formatDate = (value?: Date | string) => {
  if (!value) {
    return '—'
  }

  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat(localeForDate, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const statusColors: Record<bookcarsTypes.BookingStatus, string> = {
  [bookcarsTypes.BookingStatus.Void]: '#FF6F61',
  [bookcarsTypes.BookingStatus.Pending]: '#FFB74D',
  [bookcarsTypes.BookingStatus.Deposit]: '#3CB371',
  [bookcarsTypes.BookingStatus.Paid]: '#77BC23',
  [bookcarsTypes.BookingStatus.Reserved]: '#1E88E5',
  [bookcarsTypes.BookingStatus.Cancelled]: '#EF5350',
}

const formatPrice = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '—'
  }

  return helper.formatNumber(value)
}

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <Box component="header" mb={1}>
    <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    ) : null}
  </Box>
)

const carRangeLabels: Record<bookcarsTypes.CarRange, string> = {
  [bookcarsTypes.CarRange.Mini]: 'Mini',
  [bookcarsTypes.CarRange.Midi]: 'Midi',
  [bookcarsTypes.CarRange.Maxi]: 'Maxi',
  [bookcarsTypes.CarRange.Scooter]: 'Scooter',
}

interface RevenueSummary {
  total: number
  paid: number
  deposit: number
  reserved: number
}

const CarStats = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<bookcarsTypes.SummedStat[]>([])
  const [bookingStats, setBookingStats] = useState<bookcarsTypes.BookingStat[]>([])
  const [summary, setSummary] = useState<RevenueSummary>({ total: 0, paid: 0, deposit: 0, reserved: 0 })
  const [cars, setCars] = useState<bookcarsTypes.ICar[]>([])
  const [selectedCar, setSelectedCar] = useState<string>(ALL_CARS_VALUE)
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 2))
  const [endDate, setEndDate] = useState<Date>(subDays(new Date(), 1))
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)

  const [adminOverview, setAdminOverview] = useState<bookcarsTypes.AdminStatisticsOverview | null>(null)
  const [adminOverviewLoading, setAdminOverviewLoading] = useState(false)
  const [adminOverviewError, setAdminOverviewError] = useState<string | null>(null)

  const [agencyOverview, setAgencyOverview] = useState<bookcarsTypes.AgencyStatisticsOverview | null>(null)
  const [agencyOverviewLoading, setAgencyOverviewLoading] = useState(false)
  const [agencyOverviewError, setAgencyOverviewError] = useState<string | null>(null)

  const [suppliers, setSuppliers] = useState<bookcarsTypes.SuppliersStat[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')

  const [rankingPage, setRankingPage] = useState(0)
  const [rankingRowsPerPage, setRankingRowsPerPage] = useState(5)
  const [globalTopModelsPage, setGlobalTopModelsPage] = useState(0)
  const [globalTopModelsRowsPerPage, setGlobalTopModelsRowsPerPage] = useState(5)
  const [agencyTopModelsPage, setAgencyTopModelsPage] = useState(0)
  const [agencyTopModelsRowsPerPage, setAgencyTopModelsRowsPerPage] = useState(5)
  const [pendingUpdatesPage, setPendingUpdatesPage] = useState(0)
  const [pendingUpdatesRowsPerPage, setPendingUpdatesRowsPerPage] = useState(5)

  const sortedStats = useMemo(
    () => [...stats].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [stats],
  )

  const effectiveSupplierId = isAdmin ? selectedSupplier : user?._id

  const loadChartData = useCallback(async (
    supplierId: string,
    targetCar: string,
    from: Date,
    to: Date,
  ) => {
    setChartLoading(true)
    setChartError(null)
    try {
      const carId = targetCar === ALL_CARS_VALUE ? undefined : targetCar
      const [carStatsData, bookingStatsData, summaryData] = await Promise.all([
        CarStatsService.getCarStats(supplierId, carId, from, to),
        CarStatsService.getBookingStats(supplierId, carId, from, to),
        CarStatsService.getBookingSummary(supplierId),
      ])

      setStats(sumViewsByDate(carStatsData))
      setBookingStats(bookingStatsData)
      setSummary(summaryData)

      if (targetCar === ALL_CARS_VALUE) {
        const uniqueCars = Array.from(
          new Map(carStatsData.map((stat) => [stat.carId, { id: stat.carId, name: stat.carName }])).values(),
        )
        setCars(uniqueCars)
      }
    } catch (err) {
      setChartError(strings.ERROR_FETCHING_DATA)
      setStats([])
      setBookingStats([])
    } finally {
      setChartLoading(false)
    }
  }, [])

  const loadAdminOverview = useCallback(async () => {
    if (!isAdmin) {
      return
    }

    setAdminOverviewLoading(true)
    setAdminOverviewError(null)
    try {
      const overview = await CarStatsService.getAdminOverview()
      setAdminOverview(overview)

      const supplierOptions = overview.ranking.map((item) => ({
        supplierId: item.agencyId,
        supplierName: item.agencyName,
      }))

      setSuppliers(supplierOptions)

      if (supplierOptions.length > 0) {
        const hasSelected = supplierOptions.some((option) => option.supplierId === selectedSupplier)
        if (!hasSelected) {
          setSelectedSupplier(supplierOptions[0].supplierId)
        }
      }
    } catch (err) {
      setAdminOverviewError(strings.ERROR_LOADING_OVERVIEW)
      setAdminOverview(null)
    } finally {
      setAdminOverviewLoading(false)
    }
  }, [isAdmin, selectedSupplier])

  const loadAgencyOverview = useCallback(async (supplierId: string) => {
    setAgencyOverviewLoading(true)
    setAgencyOverviewError(null)
    try {
      const overview = await CarStatsService.getAgencyOverview(supplierId)
      setAgencyOverview(overview)
    } catch (err) {
      setAgencyOverviewError(strings.ERROR_LOADING_OVERVIEW)
      setAgencyOverview(null)
    } finally {
      setAgencyOverviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      void loadAdminOverview()
    } else if (user?._id) {
      setSelectedSupplier('')
      void loadAgencyOverview(user._id)
    }
  }, [isAdmin, user?._id, loadAdminOverview, loadAgencyOverview])

  useEffect(() => {
    if (!effectiveSupplierId) {
      return
    }

    setCars([])
    setSelectedCar(ALL_CARS_VALUE)
    void loadAgencyOverview(effectiveSupplierId)
  }, [effectiveSupplierId, loadAgencyOverview])

  useEffect(() => {
    if (!effectiveSupplierId) {
      return
    }

    void loadChartData(effectiveSupplierId, selectedCar, startDate, endDate)
  }, [effectiveSupplierId, selectedCar, startDate, endDate, loadChartData])

  const handleCarChange = (event: SelectChangeEvent<string>) => {
    setSelectedCar(event.target.value)
  }

  const handleSupplierChange = (event: SelectChangeEvent<string>) => {
    setSelectedSupplier(event.target.value)
  }

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date)
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date)
    }
  }

  const handleRankingPageChange = (_event: unknown, newPage: number) => {
    setRankingPage(newPage)
  }

  const handleRankingRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRankingRowsPerPage(Number(event.target.value))
    setRankingPage(0)
  }

  const handleGlobalTopModelsPageChange = (_event: unknown, newPage: number) => {
    setGlobalTopModelsPage(newPage)
  }

  const handleGlobalTopModelsRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalTopModelsRowsPerPage(Number(event.target.value))
    setGlobalTopModelsPage(0)
  }

  const handleAgencyTopModelsPageChange = (_event: unknown, newPage: number) => {
    setAgencyTopModelsPage(newPage)
  }

  const handleAgencyTopModelsRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgencyTopModelsRowsPerPage(Number(event.target.value))
    setAgencyTopModelsPage(0)
  }

  const handlePendingUpdatesPageChange = (_event: unknown, newPage: number) => {
    setPendingUpdatesPage(newPage)
  }

  const handlePendingUpdatesRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingUpdatesRowsPerPage(Number(event.target.value))
    setPendingUpdatesPage(0)
  }

  const onLoad = (_user?: bookcarsTypes.User) => {
    setUser(_user)
    setIsAdmin(helper.admin(_user))
  }

  const isBusy = chartLoading || adminOverviewLoading || agencyOverviewLoading

  const ranking = adminOverview?.ranking ?? []
  const inactiveAgencies = adminOverview?.inactiveAgencies ?? []
  const highlights = adminOverview?.highlights ?? { topPerformers: [], watchList: [] }

  const adminAveragePrices = adminOverview?.averagePrices ?? []
  const agencyAveragePrices = agencyOverview?.averagePrices ?? []
  const globalTopModels = adminOverview?.topModels ?? []
  const agencyTopModels = agencyOverview?.topModels ?? []
  const pendingUpdates = agencyOverview?.pendingUpdates ?? []
  const totalCarsForAgency = agencyOverview?.totalCars ?? 0

  const selectedAgencyName = useMemo(() => {
    if (!effectiveSupplierId) {
      return ''
    }

    if (isAdmin) {
      const supplier = suppliers.find((item) => item.supplierId === effectiveSupplierId)
      return supplier?.supplierName ?? ''
    }

    return user?.fullName ?? ''
  }, [effectiveSupplierId, isAdmin, suppliers, user?.fullName])

  const paginatedRanking = useMemo(
    () =>
      ranking.slice(
        rankingPage * rankingRowsPerPage,
        rankingPage * rankingRowsPerPage + rankingRowsPerPage,
      ),
    [ranking, rankingPage, rankingRowsPerPage],
  )

  const paginatedGlobalTopModels = useMemo(
    () =>
      globalTopModels.slice(
        globalTopModelsPage * globalTopModelsRowsPerPage,
        globalTopModelsPage * globalTopModelsRowsPerPage + globalTopModelsRowsPerPage,
      ),
    [globalTopModels, globalTopModelsPage, globalTopModelsRowsPerPage],
  )

  const paginatedAgencyTopModels = useMemo(
    () =>
      agencyTopModels.slice(
        agencyTopModelsPage * agencyTopModelsRowsPerPage,
        agencyTopModelsPage * agencyTopModelsRowsPerPage + agencyTopModelsRowsPerPage,
      ),
    [agencyTopModels, agencyTopModelsPage, agencyTopModelsRowsPerPage],
  )

  const paginatedPendingUpdates = useMemo(
    () =>
      pendingUpdates.slice(
        pendingUpdatesPage * pendingUpdatesRowsPerPage,
        pendingUpdatesPage * pendingUpdatesRowsPerPage + pendingUpdatesRowsPerPage,
      ),
    [pendingUpdates, pendingUpdatesPage, pendingUpdatesRowsPerPage],
  )

  const revenueCards = useMemo(
    () => [
      {
        label: strings.SUMMARY_TOTAL_REVENUE,
        value: summary.total,
        background: '#EEF3FF',
      },
      {
        label: strings.SUMMARY_PAID,
        value: summary.paid,
        background: '#E8F5E9',
      },
      {
        label: strings.SUMMARY_DEPOSIT,
        value: summary.deposit,
        background: '#FFF8E1',
      },
      {
        label: strings.SUMMARY_RESERVED,
        value: summary.reserved,
        background: '#E3F2FD',
      },
    ],
    [summary.deposit, summary.paid, summary.reserved, summary.total],
  )

  const performanceSubtitle = useMemo(
    () =>
      (isAdmin
        ? strings.SECTION_PERFORMANCE_SUBTITLE_ADMIN.replace(
            '{agency}',
            selectedAgencyName || strings.PAGE_SUBTITLE_ADMIN_PLACEHOLDER,
          )
        : strings.SECTION_PERFORMANCE_SUBTITLE_AGENCY),
    [isAdmin, selectedAgencyName],
  )

  useEffect(() => {
    setRankingPage(0)
  }, [ranking])

  useEffect(() => {
    setGlobalTopModelsPage(0)
  }, [globalTopModels])

  useEffect(() => {
    setAgencyTopModelsPage(0)
  }, [agencyTopModels])

  useEffect(() => {
    setPendingUpdatesPage(0)
  }, [pendingUpdates])

  return (
    <Layout onLoad={onLoad} strict>
      {user && !isBusy ? (
        <Box sx={{ padding: env.isMobile() ? 2 : 4, backgroundColor: '#f8fafc', minHeight: '100%' }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
                {strings.CAR_STATS}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isAdmin
                  ? strings.PAGE_SUBTITLE_ADMIN.replace(
                      '{agency}',
                      selectedAgencyName || strings.PAGE_SUBTITLE_ADMIN_PLACEHOLDER,
                    )
                  : strings.PAGE_SUBTITLE_AGENCY}
              </Typography>
            </Box>

            <Stack spacing={1}>
              {chartError && <Alert severity="error">{chartError}</Alert>}
              {adminOverviewError && <Alert severity="error">{adminOverviewError}</Alert>}
              {agencyOverviewError && <Alert severity="error">{agencyOverviewError}</Alert>}
            </Stack>

            <Grid container spacing={2}>
              {revenueCards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.label}>
                  <Card sx={{ height: '100%', backgroundColor: card.background }}>
                    <CardHeader
                      title={(
                        <Typography variant="subtitle2" color="text.secondary">
                          {card.label}
                        </Typography>
                      )}
                    />
                    <CardContent>
                      <Typography variant="h4">{helper.formatNumber(card.value)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {isAdmin && adminOverview ? (
              <Box>
                <SectionTitle title={strings.SECTION_ADMIN_SUMMARY} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title={strings.SUMMARY_TOTAL_AGENCIES} />
                      <CardContent>
                        <Typography variant="h4">{adminOverview.summary.totalAgencies}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title={strings.SUMMARY_TOTAL_CARS} />
                      <CardContent>
                        <Typography variant="h4">{adminOverview.summary.totalCars}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title={strings.SUMMARY_AVERAGE_SCORE} />
                      <CardContent>
                        <Typography variant="h4">
                          {Math.round(adminOverview.summary.averageScore)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : null}

            <Card>
              <CardHeader title={strings.SECTION_FILTERS} />
              <CardContent>
                <Grid container spacing={3}>
                  {isAdmin ? (
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="supplier-select-label">{strings.SELECT_SUPPLIER}</InputLabel>
                        <Select
                          labelId="supplier-select-label"
                          value={selectedSupplier}
                          label={strings.SELECT_SUPPLIER}
                          onChange={handleSupplierChange}
                        >
                          {suppliers.map((supplier) => (
                            <MenuItem key={supplier.supplierId} value={supplier.supplierId}>
                              {supplier.supplierName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ) : null}

                  <Grid item xs={12} md={isAdmin ? 3 : 4}>
                    <FormControl fullWidth>
                      <InputLabel id="car-select-label">{strings.SELECT_CAR}</InputLabel>
                      <Select
                        labelId="car-select-label"
                        value={selectedCar}
                        label={strings.SELECT_CAR}
                        onChange={handleCarChange}
                      >
                        <MenuItem value={ALL_CARS_VALUE}>
                          <em>{strings.ALL_CARS}</em>
                        </MenuItem>
                        {cars.map((car) => (
                          <MenuItem key={car.id} value={car.id}>
                            {car.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={isAdmin ? 3 : 4}>
                    <DateTimePicker
                      label={strings.START_DATE}
                      value={startDate}
                      minDate={subMonths(new Date(), 6)}
                      maxDate={subDays(new Date(), 1)}
                      onChange={handleStartDateChange}
                      showTime={false}
                      language={env.DEFAULT_LANGUAGE}
                    />
                  </Grid>

                  <Grid item xs={12} md={isAdmin ? 3 : 4}>
                    <DateTimePicker
                      label={strings.END_DATE}
                      value={endDate}
                      minDate={subMonths(new Date(), 6)}
                      maxDate={subDays(new Date(), 1)}
                      onChange={handleEndDateChange}
                      showTime={false}
                      language={env.DEFAULT_LANGUAGE}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {agencyOverview ? (
              <Box>
                <SectionTitle title={strings.SECTION_PERFORMANCE} subtitle={performanceSubtitle} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader
                        title={strings.SCORE_SECTION_TITLE}
                        subheader={strings.SCORE_SECTION_SUBTITLE}
                      />
                      <CardContent>
                        <AgencyScore
                          agencyId={effectiveSupplierId || ''}
                          initialScoreBreakdown={agencyOverview.score}
                        />
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {strings.TOTAL_CARS_LABEL}
                          </Typography>
                          <Typography variant="h5">{totalCarsForAgency}</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title={strings.SECTION_PERFORMANCE_METRICS_TITLE} />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {strings.TOTAL_BOOKINGS}
                              </Typography>
                              <Typography variant="h5">{agencyOverview.totalBookings}</Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {strings.ACCEPTANCE_RATE}
                              </Typography>
                              <Typography variant="h5">
                                {formatPercentage(agencyOverview.acceptanceRate)}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {strings.CANCELLATION_RATE}
                              </Typography>
                              <Typography variant="h5">
                                {formatPercentage(agencyOverview.cancellationRate)}
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : null}

            <Grid container spacing={3}>
              {isAdmin ? (
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title={strings.SECTION_AVERAGE_PRICES_GLOBAL} />
                    <CardContent>
                      {adminAveragePrices.length > 0 ? (
                        <TableContainer>
                          <Table size="small" aria-label={strings.SECTION_AVERAGE_PRICES_GLOBAL}>
                            <TableHead>
                              <TableRow>
                                <TableCell>{strings.AVERAGE_PRICE_CATEGORY}</TableCell>
                                <TableCell>{strings.AVERAGE_DAILY_PRICE_LABEL}</TableCell>
                                <TableCell>{strings.AVERAGE_MONTHLY_PRICE_LABEL}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {adminAveragePrices.map((item) => (
                                <TableRow key={item.category}>
                                  <TableCell>{carRangeLabels[item.category]}</TableCell>
                                  <TableCell>{formatPrice(item.averageDailyPrice)}</TableCell>
                                  <TableCell>{formatPrice(item.averageMonthlyPrice)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info">{strings.NO_DATA}</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ) : null}

              <Grid item xs={12} md={isAdmin ? 6 : 12}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title={isAdmin ? strings.SECTION_AVERAGE_PRICES_AGENCY : strings.AVERAGE_PRICES_BY_CATEGORY}
                    subheader={selectedAgencyName}
                  />
                  <CardContent>
                    {agencyAveragePrices.length > 0 ? (
                      <TableContainer>
                        <Table size="small" aria-label={strings.SECTION_AVERAGE_PRICES_AGENCY}>
                          <TableHead>
                            <TableRow>
                              <TableCell>{strings.AVERAGE_PRICE_CATEGORY}</TableCell>
                              <TableCell>{strings.AVERAGE_DAILY_PRICE_LABEL}</TableCell>
                              <TableCell>{strings.AVERAGE_MONTHLY_PRICE_LABEL}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {agencyAveragePrices.map((item) => (
                              <TableRow key={item.category}>
                                <TableCell>{carRangeLabels[item.category]}</TableCell>
                                <TableCell>{formatPrice(item.averageDailyPrice)}</TableCell>
                                <TableCell>{formatPrice(item.averageMonthlyPrice)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">{strings.NO_DATA}</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title={strings.PENDING_UPDATES_TITLE} subheader={selectedAgencyName} />
                  <CardContent>
                    {pendingUpdates.length > 0 ? (
                      <>
                        <TableContainer>
                          <Table size="small" aria-label={strings.PENDING_UPDATES_TITLE}>
                            <TableHead>
                              <TableRow>
                                <TableCell>{strings.CAR}</TableCell>
                                <TableCell>{strings.END_DATE_LABEL}</TableCell>
                                <TableCell>{strings.STATUS_LABEL}</TableCell>
                                <TableCell>{strings.OVERDUE_HEADER}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paginatedPendingUpdates.map((booking) => (
                                <TableRow key={booking.bookingId}>
                                  <TableCell>{booking.carName}</TableCell>
                                  <TableCell>{formatDate(booking.endDate)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={helper.getBookingStatus(booking.status)}
                                      size="small"
                                      sx={{ backgroundColor: statusColors[booking.status], color: '#fff' }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {booking.overdueDays > 0
                                      ? strings.OVERDUE_DAYS_LABEL.replace('{count}', String(booking.overdueDays))
                                      : strings.ON_TIME_LABEL}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <TablePagination
                          component="div"
                          rowsPerPageOptions={[5, 10]}
                          count={pendingUpdates.length}
                          rowsPerPage={pendingUpdatesRowsPerPage}
                          page={pendingUpdatesPage}
                          onPageChange={handlePendingUpdatesPageChange}
                          onRowsPerPageChange={handlePendingUpdatesRowsPerPageChange}
                        />
                      </>
                    ) : (
                      <Alert severity="success">{strings.NO_PENDING_UPDATES}</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {isAdmin ? (
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title={strings.SECTION_TOP_MODELS_GLOBAL} />
                    <CardContent>
                      {globalTopModels.length > 0 ? (
                        <>
                          <TableContainer>
                            <Table size="small" aria-label={strings.SECTION_TOP_MODELS_GLOBAL}>
                              <TableHead>
                                <TableRow>
                                  <TableCell>#</TableCell>
                                  <TableCell>{strings.MODEL_LABEL}</TableCell>
                                  <TableCell>{strings.BOOKINGS_LABEL}</TableCell>
                                  <TableCell>{strings.RANKING_AGENCY}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {paginatedGlobalTopModels.map((model, index) => {
                                  const absoluteIndex =
                                    globalTopModelsPage * globalTopModelsRowsPerPage + index + 1
                                  return (
                                    <TableRow key={`${model.agencyId}-${model.model}`}>
                                      <TableCell>{absoluteIndex}</TableCell>
                                      <TableCell>{model.model}</TableCell>
                                      <TableCell>{model.bookings}</TableCell>
                                      <TableCell>{model.agencyName ?? '—'}</TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          <TablePagination
                            component="div"
                            rowsPerPageOptions={[5, 10]}
                            count={globalTopModels.length}
                            rowsPerPage={globalTopModelsRowsPerPage}
                            page={globalTopModelsPage}
                            onPageChange={handleGlobalTopModelsPageChange}
                            onRowsPerPageChange={handleGlobalTopModelsRowsPerPageChange}
                          />
                        </>
                      ) : (
                        <Alert severity="info">{strings.NO_TOP_MODELS}</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ) : null}

              <Grid item xs={12} md={isAdmin ? 6 : 12}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader title={strings.SECTION_TOP_MODELS_AGENCY} subheader={selectedAgencyName} />
                  <CardContent>
                    {agencyTopModels.length > 0 ? (
                      <>
                        <TableContainer>
                          <Table size="small" aria-label={strings.SECTION_TOP_MODELS_AGENCY}>
                            <TableHead>
                              <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>{strings.MODEL_LABEL}</TableCell>
                                <TableCell>{strings.BOOKINGS_LABEL}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paginatedAgencyTopModels.map((model, index) => {
                                const absoluteIndex =
                                  agencyTopModelsPage * agencyTopModelsRowsPerPage + index + 1
                                return (
                                  <TableRow key={`${model.model}-${index}`}>
                                    <TableCell>{absoluteIndex}</TableCell>
                                    <TableCell>{model.model}</TableCell>
                                    <TableCell>{model.bookings}</TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <TablePagination
                          component="div"
                          rowsPerPageOptions={[5, 10]}
                          count={agencyTopModels.length}
                          rowsPerPage={agencyTopModelsRowsPerPage}
                          page={agencyTopModelsPage}
                          onPageChange={handleAgencyTopModelsPageChange}
                          onRowsPerPageChange={handleAgencyTopModelsRowsPerPageChange}
                        />
                      </>
                    ) : (
                      <Alert severity="info">{strings.NO_TOP_MODELS}</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box>
              <SectionTitle title={strings.SECTION_CHARTS} />
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title={strings.VIEWS_OVER_TIME} />
                    <CardContent>
                      {sortedStats.length > 0 ? (
                        <Suspense fallback={chartFallback}>
                          <LineChart
                            xAxis={[{ data: sortedStats.map((stat) => stat.date), scaleType: 'band', label: strings.DATE }]}
                            yAxis={[{ tickMinStep: 1 }]}
                            series={[
                              {
                                data: sortedStats.map((stat) => stat.organiqueViews),
                                label: strings.ORGANIC_VIEWS,
                                color: '#1E88E5',
                                stack: 'total',
                                area: true,
                                showMark: false,
                              },
                              {
                                data: sortedStats.map((stat) => stat.payedViews),
                                label: strings.PAID_VIEWS,
                                color: '#77BC23',
                                stack: 'total',
                                area: true,
                                showMark: false,
                              },
                              {
                                data: sortedStats.map((stat) => stat.views),
                                label: strings.TOTAL_VIEWS,
                                color: '#EF6C00',
                                area: false,
                                showMark: false,
                              },
                            ]}
                            height={400}
                          />
                        </Suspense>
                      ) : (
                        <Alert severity="info">{strings.NO_DATA}</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title={strings.STATUS_DISTRIBUTION} />
                    <CardContent>
                      {bookingStats.length > 0 ? (
                        <Suspense fallback={chartFallback}>
                          <PieChart
                            height={env.isMobile() ? 400 : 320}
                            series={[
                              {
                                data: bookingStats.map((item) => ({
                                  value: item.count,
                                  label: `${helper.getBookingStatus(item.status)} (${item.count})`,
                                  color: statusColors[item.status],
                                })),
                                highlightScope: { faded: 'global', highlighted: 'item' },
                                arcLabel: (params) => params.label,
                              },
                            ]}
                            legend={
                              env.isMobile()
                                ? { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } }
                                : {}
                            }
                          />
                        </Suspense>
                      ) : (
                        <Alert severity="info">{strings.NO_DATA}</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title={strings.REVENUE_DISTRIBUTION} />
                    <CardContent>
                      {bookingStats.length > 0 ? (
                        <Suspense fallback={chartFallback}>
                          <PieChart
                            height={env.isMobile() ? 400 : 320}
                            series={[
                              {
                                data: bookingStats.map((item) => ({
                                  value: item.totalPrice,
                                  label: helper.getBookingStatus(item.status),
                                  color: statusColors[item.status],
                                })),
                                highlightScope: { faded: 'global', highlighted: 'item' },
                                arcLabel: (params) => `${Math.round(Number(params.value))} DT`,
                              },
                            ]}
                            legend={
                              env.isMobile()
                                ? { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } }
                                : {}
                            }
                          />
                        </Suspense>
                      ) : (
                        <Alert severity="info">{strings.NO_DATA}</Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {isAdmin && adminOverview ? (
              <Box>
                <SectionTitle title={strings.SECTION_RANKING} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardHeader title={strings.RANKING_TITLE} />
                      <CardContent>
                        {ranking.length > 0 ? (
                          <>
                            <TableContainer>
                              <Table size="small" aria-label={strings.RANKING_TITLE}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>{strings.RANKING_POSITION}</TableCell>
                                    <TableCell>{strings.RANKING_AGENCY}</TableCell>
                                    <TableCell align="right">{strings.RANKING_SCORE}</TableCell>
                                    <TableCell align="right">{strings.RANKING_CARS}</TableCell>
                                    <TableCell align="right">{strings.RANKING_BOOKINGS}</TableCell>
                                    <TableCell align="right">{strings.ACCEPTANCE_RATE}</TableCell>
                                    <TableCell align="right">{strings.CANCELLATION_RATE}</TableCell>
                                    <TableCell align="right">{strings.PENDING_UPDATES_SHORT}</TableCell>
                                    <TableCell>{strings.LAST_ACTIVITY}</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {paginatedRanking.map((item, index) => {
                                    const absoluteIndex = rankingPage * rankingRowsPerPage + index + 1
                                    return (
                                      <TableRow key={item.agencyId} hover>
                                        <TableCell>{absoluteIndex}</TableCell>
                                        <TableCell>{item.agencyName}</TableCell>
                                        <TableCell align="right">{Math.round(item.score)}</TableCell>
                                        <TableCell align="right">{item.totalCars}</TableCell>
                                        <TableCell align="right">{item.totalBookings}</TableCell>
                                        <TableCell align="right">
                                          {formatPercentage(item.acceptanceRate)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatPercentage(item.cancellationRate)}
                                        </TableCell>
                                        <TableCell align="right">{item.pendingUpdates}</TableCell>
                                        <TableCell>{formatDate(item.lastBookingAt)}</TableCell>
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <TablePagination
                              component="div"
                              rowsPerPageOptions={[5, 10]}
                              count={ranking.length}
                              rowsPerPage={rankingRowsPerPage}
                              page={rankingPage}
                              onPageChange={handleRankingPageChange}
                              onRowsPerPageChange={handleRankingRowsPerPageChange}
                            />
                          </>
                        ) : (
                          <Alert severity="info">{strings.NO_DATA}</Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                      <Card>
                        <CardHeader
                          avatar={<EmojiEventsIcon color="primary" />}
                          title={strings.TOP_PERFORMERS_TITLE}
                        />
                        <CardContent>
                          {highlights.topPerformers.length > 0 ? (
                            <Stack spacing={1}>
                              {highlights.topPerformers.map((item) => (
                                <Chip
                                  key={item.agencyId}
                                  label={`${item.agencyName} · ${Math.round(item.score)}`}
                                  color="success"
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {strings.NO_TOP_PERFORMERS}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader
                          avatar={<WatchLaterIcon color="warning" />}
                          title={strings.WATCHLIST_TITLE}
                        />
                        <CardContent>
                          {highlights.watchList.length > 0 ? (
                            <Stack spacing={1}>
                              {highlights.watchList.map((item) => (
                                <Tooltip
                                  key={item.agencyId}
                                  title={strings.WATCHLIST_TOOLTIP.replace('{bookings}', String(item.totalBookings))}
                                >
                                  <Chip
                                    label={`${item.agencyName} · ${Math.round(item.score)}`}
                                    color="warning"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {strings.NO_WATCHLIST}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader title={strings.INACTIVE_AGENCIES_TITLE} />
                        <CardContent>
                          {inactiveAgencies.length > 0 ? (
                            <List dense>
                              {inactiveAgencies.map((agency) => (
                                <ListItem key={agency.agencyId} disableGutters>
                                  <ListItemText
                                    primary={agency.agencyName}
                                    secondary={strings.INACTIVE_AGENCY_DETAILS
                                      .replace('{count}', String(agency.pendingUpdates))
                                      .replace('{score}', String(Math.round(agency.score)))}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {strings.NO_INACTIVE_AGENCIES}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            ) : null}
          </Stack>
        </Box>
      ) : null}

      {(!user || isBusy) && <SimpleBackdrop text={strings.LOADING} />}
    </Layout>
  )

export default CarStats
