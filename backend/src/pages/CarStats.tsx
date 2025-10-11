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
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
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
const BarChart = lazy(() => import('@mui/x-charts').then((module) => ({ default: module.BarChart })))

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

  const onLoad = (_user?: bookcarsTypes.User) => {
    setUser(_user)
    setIsAdmin(helper.admin(_user))
  }

  const isBusy = chartLoading || adminOverviewLoading || agencyOverviewLoading

  const ranking = adminOverview?.ranking ?? []
  const inactiveAgencies = adminOverview?.inactiveAgencies ?? []
  const highlights = adminOverview?.highlights ?? { topPerformers: [], watchList: [] }

  const averagePriceData = isAdmin
    ? adminOverview?.averagePrices ?? []
    : agencyOverview?.averagePrices ?? []

  const topModelsData = isAdmin
    ? adminOverview?.topModels ?? []
    : agencyOverview?.topModels ?? []

  return (
    <Layout onLoad={onLoad} strict>
      {user && !isBusy && (
        <Box sx={{ padding: env.isMobile() ? 2 : 3 }}>
          <Stack spacing={2} mb={2}>
            {chartError && <Alert severity="error">{chartError}</Alert>}
            {adminOverviewError && <Alert severity="error">{adminOverviewError}</Alert>}
            {agencyOverviewError && <Alert severity="error">{agencyOverviewError}</Alert>}
          </Stack>

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', height: '100%' }}>
                <Typography variant="subtitle2">{strings.SUMMARY_TOTAL_REVENUE}</Typography>
                <Typography variant="h4">{helper.formatNumber(summary.total)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#e8f5e9', height: '100%' }}>
                <Typography variant="subtitle2">{strings.SUMMARY_PAID}</Typography>
                <Typography variant="h4">{helper.formatNumber(summary.paid)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#fff3e0', height: '100%' }}>
                <Typography variant="subtitle2">{strings.SUMMARY_DEPOSIT}</Typography>
                <Typography variant="h4">{helper.formatNumber(summary.deposit)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: '#e3f2fd', height: '100%' }}>
                <Typography variant="subtitle2">{strings.SUMMARY_RESERVED}</Typography>
                <Typography variant="h4">{helper.formatNumber(summary.reserved)}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {isAdmin && adminOverview && (
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2">{strings.SUMMARY_TOTAL_AGENCIES}</Typography>
                  <Typography variant="h4">{adminOverview.summary.totalAgencies}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2">{strings.SUMMARY_TOTAL_CARS}</Typography>
                  <Typography variant="h4">{adminOverview.summary.totalCars}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2">{strings.SUMMARY_AVERAGE_SCORE}</Typography>
                  <Typography variant="h4">{Math.round(adminOverview.summary.averageScore)}</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Typography variant="h1" sx={{ fontSize: '2rem', marginBottom: 3 }} gutterBottom>
              {strings.CAR_STATS}
            </Typography>
            <Grid container spacing={3}>
              {isAdmin && (
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
              )}

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
          </Paper>

          {agencyOverview && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={4}>
                <AgencyScore
                  agencyId={effectiveSupplierId || ''}
                  initialScoreBreakdown={agencyOverview.score}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2">{strings.TOTAL_BOOKINGS}</Typography>
                      <Typography variant="h4">{agencyOverview.totalBookings}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2">{strings.ACCEPTANCE_RATE}</Typography>
                      <Typography variant="h4">{formatPercentage(agencyOverview.acceptanceRate)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2">{strings.CANCELLATION_RATE}</Typography>
                      <Typography variant="h4">{formatPercentage(agencyOverview.cancellationRate)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {strings.AVERAGE_PRICES_BY_CATEGORY}
                  </Typography>
                  {averagePriceData.length > 0 ? (
                    <Suspense fallback={chartFallback}>
                      <BarChart
                        height={300}
                        series={[
                          {
                            data: averagePriceData.map((item) => item.averageDailyPrice),
                            label: strings.AVERAGE_PRICE_LABEL,
                            color: '#1E88E5',
                          },
                        ]}
                        xAxis={[
                          {
                            data: averagePriceData.map((item) => carRangeLabels[item.category] || item.category),
                            scaleType: 'band',
                          },
                        ]}
                      />
                    </Suspense>
                  ) : (
                    <Alert severity="info">{strings.NO_DATA}</Alert>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {strings.TOP_MODELS_TITLE}
                  </Typography>
                  {topModelsData.length > 0 ? (
                    <List dense>
                      {topModelsData.map((model) => (
                        <ListItem key={`${model.model}-${model.agencyId ?? ''}`}>
                          <ListItemText
                            primary={model.model}
                            secondary={`${strings.BOOKINGS_LABEL}: ${model.bookings}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">{strings.NO_DATA}</Alert>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {strings.PENDING_UPDATES_TITLE}
                  </Typography>
                  {agencyOverview.pendingUpdates.length > 0 ? (
                    <List>
                      {agencyOverview.pendingUpdates.map((booking) => (
                        <ListItem key={booking.bookingId}>
                          <WarningAmberIcon color="warning" sx={{ mr: 2 }} />
                          <ListItemText
                            primary={booking.carName}
                            secondary={`${strings.STATUS_LABEL}: ${helper.getBookingStatus(booking.status)} · ${strings.END_DATE_LABEL}: ${formatDate(booking.endDate)} · ${strings.OVERDUE_DAYS_LABEL.replace('{count}', String(booking.overdueDays))}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="success">{strings.NO_PENDING_UPDATES}</Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {strings.VIEWS_OVER_TIME}
                </Typography>
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
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {strings.STATUS_DISTRIBUTION}
                </Typography>
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
                      legend={env.isMobile() ? { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } } : {}}
                    />
                  </Suspense>
                ) : (
                  <Alert severity="info">{strings.NO_DATA}</Alert>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {strings.REVENUE_DISTRIBUTION}
                </Typography>
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
                      legend={env.isMobile() ? { direction: 'row', position: { vertical: 'bottom', horizontal: 'middle' } } : {}}
                    />
                  </Suspense>
                ) : (
                  <Alert severity="info">{strings.NO_DATA}</Alert>
                )}
              </Paper>
            </Grid>
          </Grid>

          {isAdmin && adminOverview && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {strings.RANKING_TITLE}
                  </Typography>
                  {ranking.length > 0 ? (
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }} aria-label={strings.RANKING_TITLE}>
                      <Box component="thead">
                        <Box component="tr">
                          <Box component="th" sx={{ textAlign: 'left', padding: 1 }}>{strings.RANKING_POSITION}</Box>
                          <Box component="th" sx={{ textAlign: 'left', padding: 1 }}>{strings.RANKING_AGENCY}</Box>
                          <Box component="th" sx={{ textAlign: 'right', padding: 1 }}>{strings.RANKING_SCORE}</Box>
                          <Box component="th" sx={{ textAlign: 'right', padding: 1 }}>{strings.RANKING_CARS}</Box>
                          <Box component="th" sx={{ textAlign: 'right', padding: 1 }}>{strings.RANKING_BOOKINGS}</Box>
                          <Box component="th" sx={{ textAlign: 'right', padding: 1 }}>{strings.ACCEPTANCE_RATE}</Box>
                          <Box component="th" sx={{ textAlign: 'right', padding: 1 }}>{strings.CANCELLATION_RATE}</Box>
                          <Box component="th" sx={{ textAlign: 'right', padding: 1 }}>{strings.PENDING_UPDATES_SHORT}</Box>
                          <Box component="th" sx={{ textAlign: 'left', padding: 1 }}>{strings.LAST_ACTIVITY}</Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {ranking.map((item, index) => (
                          <Box component="tr" key={item.agencyId} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                            <Box component="td" sx={{ padding: 1 }}>{index + 1}</Box>
                            <Box component="td" sx={{ padding: 1 }}>{item.agencyName}</Box>
                            <Box component="td" sx={{ padding: 1, textAlign: 'right' }}>{Math.round(item.score)}</Box>
                            <Box component="td" sx={{ padding: 1, textAlign: 'right' }}>{item.totalCars}</Box>
                            <Box component="td" sx={{ padding: 1, textAlign: 'right' }}>{item.totalBookings}</Box>
                            <Box component="td" sx={{ padding: 1, textAlign: 'right' }}>{formatPercentage(item.acceptanceRate)}</Box>
                            <Box component="td" sx={{ padding: 1, textAlign: 'right' }}>{formatPercentage(item.cancellationRate)}</Box>
                            <Box component="td" sx={{ padding: 1, textAlign: 'right' }}>{item.pendingUpdates}</Box>
                            <Box component="td" sx={{ padding: 1 }}>{formatDate(item.lastBookingAt)}</Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info">{strings.NO_DATA}</Alert>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                  <Paper sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <EmojiEventsIcon color="primary" />
                      <Typography variant="h6">{strings.TOP_PERFORMERS_TITLE}</Typography>
                    </Stack>
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
                      <Typography variant="body2">{strings.NO_TOP_PERFORMERS}</Typography>
                    )}
                  </Paper>

                  <Paper sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <WatchLaterIcon color="warning" />
                      <Typography variant="h6">{strings.WATCHLIST_TITLE}</Typography>
                    </Stack>
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
                      <Typography variant="body2">{strings.NO_WATCHLIST}</Typography>
                    )}
                  </Paper>

                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {strings.INACTIVE_AGENCIES_TITLE}
                    </Typography>
                    {inactiveAgencies.length > 0 ? (
                      <List dense>
                        {inactiveAgencies.map((agency) => (
                          <ListItem key={agency.agencyId}>
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
                      <Typography variant="body2">{strings.NO_INACTIVE_AGENCIES}</Typography>
                    )}
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {(!user || isBusy) && <SimpleBackdrop text={strings.LOADING} />}
    </Layout>
  )
}

export default CarStats
