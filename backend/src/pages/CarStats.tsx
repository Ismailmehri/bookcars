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
  TableSortLabel,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
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
import { averagePriceAcrossCategories, formatPercentage, sumViewsByDate } from './car-stats.helpers'

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

type RankingOrderKey =
  | 'score'
  | 'totalBookings'
  | 'totalCars'
  | 'acceptanceRate'
  | 'cancellationRate'
  | 'pendingUpdates'
  | 'revenue'
  | 'lastBookingAt'
  | 'lastConnectionAt'
  | 'reviewCount'
  | 'averageRating'

const formatPrice = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '—'
  }

  return helper.formatNumber(value)
}

const formatInteger = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '—'
  }

  return new Intl.NumberFormat(localeForDate, {
    maximumFractionDigits: 0,
  }).format(value)
}

const formatRatingValue = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return '—'
  }

  return new Intl.NumberFormat(localeForDate, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)
}

const getRankingValue = (
  item: bookcarsTypes.AgencyRankingItem,
  key: RankingOrderKey,
) => {
  switch (key) {
    case 'score':
      return item.score
    case 'totalBookings':
      return item.totalBookings
    case 'totalCars':
      return item.totalCars
    case 'acceptanceRate':
      return item.acceptanceRate
    case 'cancellationRate':
      return item.cancellationRate
    case 'pendingUpdates':
      return item.pendingUpdates
    case 'revenue':
      return item.revenue
    case 'lastBookingAt':
      return item.lastBookingAt ? new Date(item.lastBookingAt).getTime() : 0
    case 'lastConnectionAt':
      return item.lastConnectionAt ? new Date(item.lastConnectionAt).getTime() : 0
    case 'reviewCount':
      return item.reviewCount
    case 'averageRating':
      return item.averageRating ?? -1
    default:
      return 0
  }
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

const StatCard: React.FC<{ label: string; value: React.ReactNode; helperText?: string }> = ({
  label,
  value,
  helperText,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title={label} />
    <CardContent>
      <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
      {helperText ? (
        <Typography variant="body2" color="text.secondary" mt={1}>
          {helperText}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
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
  const [rankingOrderBy, setRankingOrderBy] = useState<RankingOrderKey>('score')
  const [rankingOrder, setRankingOrder] = useState<'asc' | 'desc'>('desc')

  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

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
    } catch (error) {
      setChartError(strings.ERROR_FETCHING_DATA)
      setStats([])
      setBookingStats([])
      helper.error(error)
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
    } catch (error) {
      setAdminOverviewError(strings.ERROR_LOADING_OVERVIEW)
      setAdminOverview(null)
      helper.error(error)
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
    } catch (error) {
      setAgencyOverviewError(strings.ERROR_LOADING_OVERVIEW)
      setAgencyOverview(null)
      helper.error(error)
    } finally {
      setAgencyOverviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadAdminOverview().catch((error) => {
        helper.error(error)
      })
    } else if (user?._id) {
      setSelectedSupplier('')
      loadAgencyOverview(user._id).catch((error) => {
        helper.error(error)
      })
    }
  }, [isAdmin, user?._id, loadAdminOverview, loadAgencyOverview])

    useEffect(() => {
      if (!effectiveSupplierId) {
        return
      }

      setCars([])
      setSelectedCar(ALL_CARS_VALUE)
      loadAgencyOverview(effectiveSupplierId).catch((error) => {
        helper.error(error)
      })
    }, [effectiveSupplierId, loadAgencyOverview])

    useEffect(() => {
      if (!effectiveSupplierId) {
        return
      }

      loadChartData(effectiveSupplierId, selectedCar, startDate, endDate).catch((error) => {
        helper.error(error)
      })
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

  const handleRankingSort = (column: RankingOrderKey) => {
    if (rankingOrderBy === column) {
      setRankingOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setRankingOrderBy(column)
    setRankingOrder('desc')
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

  const ranking = useMemo(
    () => adminOverview?.ranking ?? [],
    [adminOverview],
  )
  const inactiveAgencies = useMemo(
    () => adminOverview?.inactiveAgencies ?? [],
    [adminOverview],
  )
  const highlights = useMemo(
    () => adminOverview?.highlights ?? { topPerformers: [], watchList: [] },
    [adminOverview],
  )

  const adminAveragePrices = useMemo(
    () => adminOverview?.averagePrices ?? [],
    [adminOverview],
  )
  const agencyAveragePrices = useMemo(
    () => agencyOverview?.averagePrices ?? [],
    [agencyOverview],
  )
  const globalTopModels = useMemo(
    () => adminOverview?.topModels ?? [],
    [adminOverview],
  )
  const agencyTopModels = useMemo(
    () => agencyOverview?.topModels ?? [],
    [agencyOverview],
  )
  const pendingUpdates = useMemo(
    () => agencyOverview?.pendingUpdates ?? [],
    [agencyOverview],
  )
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

  const selectedAgencyRanking = useMemo(
    () => (effectiveSupplierId
      ? ranking.find((item) => item.agencyId === effectiveSupplierId) ?? null
      : null),
    [effectiveSupplierId, ranking],
  )

  const pendingUpdateDisplayCount = selectedAgencyRanking?.pendingUpdates
    ?? agencyOverview?.pendingUpdateCount
    ?? 0
  const lastConnectionDate = selectedAgencyRanking?.lastConnectionAt
    ?? agencyOverview?.lastConnectionAt
  const lastActivityDate = selectedAgencyRanking?.lastBookingAt
    ?? agencyOverview?.lastBookingAt
  const reviewCount = selectedAgencyRanking?.reviewCount ?? 0
  const averageRating = selectedAgencyRanking?.averageRating ?? null

  const sortedRanking = useMemo(() => {
    const data = [...ranking]
    data.sort((a, b) => {
      const valueA = getRankingValue(a, rankingOrderBy)
      const valueB = getRankingValue(b, rankingOrderBy)
      const safeA = Number.isFinite(valueA) ? valueA : 0
      const safeB = Number.isFinite(valueB) ? valueB : 0

      if (safeA === safeB) {
        return a.agencyName.localeCompare(b.agencyName)
      }

      if (rankingOrder === 'asc') {
        return safeA - safeB
      }

      return safeB - safeA
    })

    return data
  }, [ranking, rankingOrderBy, rankingOrder])

  const paginatedRanking = useMemo(
    () =>
      sortedRanking.slice(
        rankingPage * rankingRowsPerPage,
        rankingPage * rankingRowsPerPage + rankingRowsPerPage,
      ),
    [sortedRanking, rankingPage, rankingRowsPerPage],
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

  const summaryCards = useMemo(
    () => [
      {
        key: 'revenue',
        label: strings.METRIC_TOTAL_REVENUE,
        value: formatPrice(summary.total),
        background: '#EEF3FF',
      },
      {
        key: 'bookings',
        label: strings.METRIC_TOTAL_BOOKINGS,
        value: formatInteger(agencyOverview?.totalBookings ?? null),
        background: '#E8F5E9',
      },
      {
        key: 'acceptance',
        label: strings.METRIC_ACCEPTANCE_RATE,
        value: agencyOverview
          ? formatPercentage(agencyOverview.acceptanceRate, localeForDate)
          : '—',
        background: '#FFF8E1',
      },
      {
        key: 'cancellation',
        label: strings.METRIC_CANCELLATION_RATE,
        value: agencyOverview
          ? formatPercentage(agencyOverview.cancellationRate, localeForDate)
          : '—',
        background: '#E3F2FD',
      },
    ],
    [agencyOverview, summary.total],
  )

  const aggregatedPriceAverages = useMemo(
    () => ({
      daily: averagePriceAcrossCategories(agencyAveragePrices, 'averageDailyPrice'),
      monthly: averagePriceAcrossCategories(agencyAveragePrices, 'averageMonthlyPrice'),
    }),
    [agencyAveragePrices],
  )

  const averageBookingValue = useMemo(() => {
    if (!agencyOverview || agencyOverview.totalBookings === 0) {
      return null
    }

    return agencyOverview.totalRevenue / agencyOverview.totalBookings
  }, [agencyOverview])

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
  }, [ranking, rankingOrderBy, rankingOrder])

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
        <Box sx={{ padding: isSmallScreen ? 2 : 4, backgroundColor: '#f8fafc', minHeight: '100%' }}>
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

            <Grid container spacing={isSmallScreen ? 2 : 3}>
              {summaryCards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.key}>
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: card.background,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardHeader
                      title={(
                        <Typography variant="subtitle2" color="text.secondary">
                          {card.label}
                        </Typography>
                      )}
                      subheader={card.key === 'revenue' && selectedAgencyName ? selectedAgencyName : undefined}
                      subheaderTypographyProps={{ variant: 'caption' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
                        {card.value}
                      </Typography>
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
                        <Typography variant="h4">
                          {formatInteger(adminOverview.summary.totalAgencies)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title={strings.SUMMARY_TOTAL_CARS} />
                      <CardContent>
                        <Typography variant="h4">
                          {formatInteger(adminOverview.summary.totalCars)}
                        </Typography>
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
                <SectionTitle
                  title={strings.SECTION_SELECTED_AGENCY}
                  subtitle={performanceSubtitle}
                />
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={4}>
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
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {strings.TOTAL_CARS_LABEL}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {formatInteger(totalCarsForAgency)}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {strings.METRIC_PENDING_UPDATES}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {formatInteger(pendingUpdateDisplayCount)}
                              </Typography>
                              {pendingUpdates.length > 0 ? (
                                <Typography variant="caption" color="text.secondary">
                                  {strings.METRIC_PENDING_UPDATES_HELP.replace(
                                    '{count}',
                                    formatInteger(pendingUpdates.length),
                                  )}
                                </Typography>
                              ) : null}
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {strings.METRIC_LAST_CONNECTION}
                              </Typography>
                              <Typography variant="subtitle1">
                                {formatDate(lastConnectionDate)}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                {strings.METRIC_LAST_ACTIVITY}
                              </Typography>
                              <Typography variant="subtitle1">
                                {formatDate(lastActivityDate)}
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} lg={8}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                          label={strings.AVERAGE_BOOKING_VALUE}
                          value={averageBookingValue !== null ? formatPrice(averageBookingValue) : '—'}
                          helperText={agencyOverview
                            ? strings.AVERAGE_BOOKING_VALUE_HELP.replace(
                                '{count}',
                                formatInteger(agencyOverview.totalBookings),
                              )
                            : undefined}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                          label={strings.AVERAGE_DAILY_PRICE_LABEL}
                          value={aggregatedPriceAverages.daily !== null
                            ? formatPrice(aggregatedPriceAverages.daily)
                            : '—'}
                          helperText={agencyAveragePrices.length > 0
                            ? strings.AVERAGE_PRICE_AGGREGATE_HELP.replace(
                                '{count}',
                                formatInteger(agencyAveragePrices.length),
                              )
                            : undefined}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                          label={strings.AVERAGE_MONTHLY_PRICE_LABEL}
                          value={aggregatedPriceAverages.monthly !== null
                            ? formatPrice(aggregatedPriceAverages.monthly)
                            : '—'}
                          helperText={agencyAveragePrices.length > 0
                            ? strings.AVERAGE_PRICE_AGGREGATE_HELP.replace(
                                '{count}',
                                formatInteger(agencyAveragePrices.length),
                              )
                            : undefined}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                          label={strings.METRIC_REVIEW_QUALITY}
                          value={averageRating !== null
                            ? `${formatRatingValue(averageRating)} / 5`
                            : '—'}
                          helperText={strings.METRIC_REVIEW_COUNT_LABEL.replace(
                            '{count}',
                            formatInteger(reviewCount),
                          )}
                        />
                      </Grid>
                    </Grid>
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
                        <TableContainer sx={{ overflowX: 'auto' }}>
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
                      <TableContainer sx={{ overflowX: 'auto' }}>
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
                        <TableContainer sx={{ overflowX: 'auto' }}>
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
                          <TableContainer sx={{ overflowX: 'auto' }}>
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
                                  const absoluteIndex = globalTopModelsPage * globalTopModelsRowsPerPage + index + 1
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
                        <TableContainer sx={{ overflowX: 'auto' }}>
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
                                const absoluteIndex = agencyTopModelsPage * agencyTopModelsRowsPerPage + index + 1
                                return (
                                  <TableRow key={model.modelId ?? model.model}>
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
                            height={isSmallScreen ? 400 : 320}
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
                              isSmallScreen
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
                            height={isSmallScreen ? 400 : 320}
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
                              isSmallScreen
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
                            <TableContainer sx={{ overflowX: 'auto' }}>
                              <Table size="small" aria-label={strings.RANKING_TITLE}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>{strings.RANKING_POSITION}</TableCell>
                                    <TableCell>{strings.RANKING_AGENCY}</TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'score' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'score'}
                                        direction={rankingOrderBy === 'score' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('score')}
                                      >
                                        {strings.RANKING_SCORE}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'revenue' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'revenue'}
                                        direction={rankingOrderBy === 'revenue' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('revenue')}
                                      >
                                        {strings.RANKING_REVENUE}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'totalCars' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'totalCars'}
                                        direction={rankingOrderBy === 'totalCars' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('totalCars')}
                                      >
                                        {strings.RANKING_CARS}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'totalBookings' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'totalBookings'}
                                        direction={rankingOrderBy === 'totalBookings' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('totalBookings')}
                                      >
                                        {strings.RANKING_BOOKINGS}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'acceptanceRate' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'acceptanceRate'}
                                        direction={rankingOrderBy === 'acceptanceRate' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('acceptanceRate')}
                                      >
                                        {strings.METRIC_ACCEPTANCE_RATE}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'cancellationRate' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'cancellationRate'}
                                        direction={rankingOrderBy === 'cancellationRate' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('cancellationRate')}
                                      >
                                        {strings.METRIC_CANCELLATION_RATE}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'pendingUpdates' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'pendingUpdates'}
                                        direction={rankingOrderBy === 'pendingUpdates' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('pendingUpdates')}
                                      >
                                        {strings.PENDING_UPDATES_SHORT}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      sortDirection={rankingOrderBy === 'lastConnectionAt' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'lastConnectionAt'}
                                        direction={rankingOrderBy === 'lastConnectionAt' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('lastConnectionAt')}
                                      >
                                        {strings.RANKING_LAST_CONNECTION}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      sortDirection={rankingOrderBy === 'lastBookingAt' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'lastBookingAt'}
                                        direction={rankingOrderBy === 'lastBookingAt' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('lastBookingAt')}
                                      >
                                        {strings.LAST_ACTIVITY}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'reviewCount' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'reviewCount'}
                                        direction={rankingOrderBy === 'reviewCount' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('reviewCount')}
                                      >
                                        {strings.RANKING_REVIEWS}
                                      </TableSortLabel>
                                    </TableCell>
                                    <TableCell
                                      align="right"
                                      sortDirection={rankingOrderBy === 'averageRating' ? rankingOrder : false}
                                    >
                                      <TableSortLabel
                                        active={rankingOrderBy === 'averageRating'}
                                        direction={rankingOrderBy === 'averageRating' ? rankingOrder : 'desc'}
                                        onClick={() => handleRankingSort('averageRating')}
                                      >
                                        {strings.RANKING_RATING}
                                      </TableSortLabel>
                                    </TableCell>
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
                                        <TableCell align="right">{formatPrice(item.revenue)}</TableCell>
                                        <TableCell align="right">{formatInteger(item.totalCars)}</TableCell>
                                        <TableCell align="right">{formatInteger(item.totalBookings)}</TableCell>
                                        <TableCell align="right">
                                          {formatPercentage(item.acceptanceRate)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatPercentage(item.cancellationRate)}
                                        </TableCell>
                                        <TableCell align="right">{formatInteger(item.pendingUpdates)}</TableCell>
                                        <TableCell>{formatDate(item.lastConnectionAt)}</TableCell>
                                        <TableCell>{formatDate(item.lastBookingAt)}</TableCell>
                                        <TableCell align="right">{formatInteger(item.reviewCount)}</TableCell>
                                        <TableCell align="right">{formatRatingValue(item.averageRating)}</TableCell>
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
                                <Tooltip
                                  key={item.agencyId}
                                  title={`${strings.METRIC_TOTAL_REVENUE}: ${formatPrice(item.revenue)}`}
                                >
                                  <Chip
                                    label={`${item.agencyName} · ${Math.round(item.score)}`}
                                    color="success"
                                  />
                                </Tooltip>
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
                                  title={strings.WATCHLIST_TOOLTIP.replace(
                                    '{bookings}',
                                    formatInteger(item.totalBookings),
                                  )}
                                >
                                  <Chip
                                    label={`${item.agencyName} · ${Math.round(item.score)} · ${formatInteger(item.pendingUpdates)} ${strings.PENDING_UPDATES_SHORT}`}
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
                                      .replace('{score}', String(Math.round(agency.score)))
                                      .replace('{lastConnection}', formatDate(agency.lastConnectionAt))}
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
}

export default CarStats
