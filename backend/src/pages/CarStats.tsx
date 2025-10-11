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
  Avatar,
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
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableSortLabel,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import WatchLaterIcon from '@mui/icons-material/WatchLater'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import StarRateIcon from '@mui/icons-material/StarRate'
import TimelineIcon from '@mui/icons-material/Timeline'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import RateReviewIcon from '@mui/icons-material/RateReview'
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
import {
  computeTrendPercentage,
  formatPercentage,
  sumBookingCount,
  sumViewsByDate,
} from './car-stats.helpers'

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

interface DashboardKpi {
  key: string
  label: string
  value: React.ReactNode
  helperText?: string
  trend?: number | null
  icon: React.ReactNode
}

const TrendChip: React.FC<{ value: number }> = ({ value }) => (
  <Chip
    size="small"
    color={value >= 0 ? 'success' : 'error'}
    icon={value >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
    label={`${value > 0 ? '+' : ''}${value}%`}
    variant="outlined"
  />
)

const DashboardKpiCard: React.FC<DashboardKpi> = ({ label, value, helperText, trend, icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader
      avatar={(
        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 40, height: 40 }}>
          {icon}
        </Avatar>
      )}
      titleTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
      title={label}
    />
    <CardContent>
      <Stack spacing={1}>
        <Typography variant="h4" component="p" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
        {(typeof trend === 'number' || helperText) ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {typeof trend === 'number' ? <TrendChip value={trend} /> : null}
            {helperText ? (
              <Typography variant="body2" color="text.secondary">
                {helperText}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
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
  const [activeTab, setActiveTab] = useState<'admin' | 'agency'>('agency')

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
    setActiveTab(isAdmin ? 'admin' : 'agency')
  }, [isAdmin])

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
  const lastActivityDate = selectedAgencyRanking?.lastBookingAt
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

  const totalViews = useMemo(
    () => sortedStats.reduce((total, stat) => total + stat.views, 0),
    [sortedStats],
  )

  const viewTrend = useMemo(
    () => computeTrendPercentage(sortedStats.map((stat) => stat.views)),
    [sortedStats],
  )

  const totalBookingCount = useMemo(
    () => sumBookingCount(bookingStats),
    [bookingStats],
  )

  const paidRevenueShare = useMemo(() => {
    if (!summary.total) {
      return null
    }

    return Math.round((summary.paid / summary.total) * 100)
  }, [summary.paid, summary.total])

  const adminPriceChartData = useMemo(
    () =>
      adminAveragePrices.map((item) => ({
        category: carRangeLabels[item.category],
        daily: item.averageDailyPrice,
        monthly: item.averageMonthlyPrice ?? 0,
      })),
    [adminAveragePrices],
  )

  const agencyPriceChartData = useMemo(
    () =>
      agencyAveragePrices.map((item) => ({
        category: carRangeLabels[item.category],
        daily: item.averageDailyPrice,
        monthly: item.averageMonthlyPrice ?? 0,
      })),
    [agencyAveragePrices],
  )

  const averageBookingValue = useMemo(() => {
    if (!agencyOverview || agencyOverview.totalBookings === 0) {
      return null
    }

    return agencyOverview.totalRevenue / agencyOverview.totalBookings
  }, [agencyOverview])

  const revenuePerCar = useMemo(() => {
    if (!agencyOverview || agencyOverview.totalCars === 0) {
      return null
    }

    return agencyOverview.totalRevenue / agencyOverview.totalCars
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

  const adminKpis = useMemo<DashboardKpi[]>(() => {
    if (!adminOverview) {
      return []
    }

    const totalAgencies = adminOverview.summary.totalAgencies
    const activeAgencies = totalAgencies - inactiveAgencies.length
    const activeRate = totalAgencies
      ? formatPercentage(Math.round((activeAgencies / totalAgencies) * 100), localeForDate)
      : null
    const totalCarsCount = adminOverview.summary.totalCars
    const globalRevenue = ranking.reduce((sum, item) => sum + item.revenue, 0)
    const acceptanceAverage = ranking.length
      ? Math.round(ranking.reduce((sum, item) => sum + item.acceptanceRate, 0) / ranking.length)
      : null
    const pendingUpdatesTotal = ranking.reduce((sum, item) => sum + item.pendingUpdates, 0)
    const reviewsTotal = ranking.reduce((sum, item) => sum + item.reviewCount, 0)

    return [
      {
        key: 'agencies',
        label: strings.SUMMARY_TOTAL_AGENCIES,
        value: formatInteger(activeAgencies),
        helperText: activeRate
          ? strings.ACTIVE_AGENCIES_RATIO.replace('{rate}', activeRate)
          : undefined,
        icon: <PeopleAltIcon fontSize="small" />, 
      },
      {
        key: 'cars',
        label: strings.SUMMARY_TOTAL_CARS,
        value: formatInteger(totalCarsCount),
        icon: <DirectionsCarIcon fontSize="small" />, 
      },
      {
        key: 'revenue',
        label: strings.SUMMARY_TOTAL_REVENUE,
        value: formatPrice(globalRevenue),
        helperText: strings.KPI_REVENUE_GLOBAL_HELP.replace(
          '{count}',
          formatInteger(ranking.length),
        ),
        icon: <MonetizationOnIcon fontSize="small" />, 
      },
      {
        key: 'score',
        label: strings.SUMMARY_AVERAGE_SCORE,
        value: Math.round(adminOverview.summary.averageScore),
        icon: <StarRateIcon fontSize="small" />, 
      },
      {
        key: 'acceptance',
        label: strings.METRIC_ACCEPTANCE_RATE,
        value: acceptanceAverage !== null
          ? formatPercentage(acceptanceAverage, localeForDate)
          : '—',
        helperText: totalBookingCount
          ? strings.KPI_TOTAL_BOOKINGS_HELP.replace(
              '{count}',
              formatInteger(totalBookingCount),
            )
          : undefined,
        icon: <PlaylistAddCheckIcon fontSize="small" />, 
      },
      {
        key: 'views',
        label: strings.TOTAL_VIEWS,
        value: formatInteger(totalViews),
        trend: viewTrend ?? undefined,
        helperText: viewTrend !== null
          ? strings.VIEWS_TREND_LABEL.replace(
              '{value}',
              `${viewTrend > 0 ? '+' : ''}${viewTrend}%`,
            )
          : undefined,
        icon: <TimelineIcon fontSize="small" />, 
      },
      {
        key: 'pending',
        label: strings.METRIC_PENDING_UPDATES,
        value: formatInteger(pendingUpdatesTotal),
        helperText: strings.KPI_PENDING_UPDATES_GLOBAL_HELP.replace(
          '{count}',
          formatInteger(inactiveAgencies.length),
        ),
        icon: <WatchLaterIcon fontSize="small" />, 
      },
      {
        key: 'reviews',
        label: strings.METRIC_REVIEW_QUALITY,
        value: formatInteger(reviewsTotal),
        helperText: strings.METRIC_REVIEW_COUNT_LABEL.replace(
          '{count}',
          formatInteger(reviewsTotal),
        ),
        icon: <RateReviewIcon fontSize="small" />, 
      },
    ]
  }, [adminOverview, inactiveAgencies, localeForDate, ranking, totalBookingCount, totalViews, viewTrend])

  const agencyKpis = useMemo<DashboardKpi[]>(() => {
    const bookingsValue = formatInteger(agencyOverview?.totalBookings ?? null)
    const revenueValue = formatPrice(agencyOverview?.totalRevenue ?? 0)
    const acceptanceValue = agencyOverview
      ? formatPercentage(agencyOverview.acceptanceRate, localeForDate)
      : '—'
    const cancellationValue = agencyOverview
      ? formatPercentage(agencyOverview.cancellationRate, localeForDate)
      : '—'
    const averageBasket = averageBookingValue !== null ? formatPrice(averageBookingValue) : '—'
    const perCar = revenuePerCar !== null ? formatPrice(revenuePerCar) : '—'
    const paidShare = paidRevenueShare !== null
      ? formatPercentage(paidRevenueShare, localeForDate)
      : null

    return [
      {
        key: 'bookings',
        label: strings.METRIC_TOTAL_BOOKINGS,
        value: bookingsValue,
        helperText: totalBookingCount
          ? strings.KPI_TOTAL_BOOKINGS_HELP.replace(
              '{count}',
              formatInteger(totalBookingCount),
            )
          : undefined,
        icon: <PlaylistAddCheckIcon fontSize="small" />, 
      },
      {
        key: 'revenue',
        label: strings.METRIC_TOTAL_REVENUE,
        value: revenueValue,
        helperText: averageBookingValue !== null
          ? strings.AVERAGE_BOOKING_VALUE_HELP.replace(
              '{count}',
              formatInteger(agencyOverview?.totalBookings ?? 0),
            )
          : undefined,
        icon: <MonetizationOnIcon fontSize="small" />, 
      },
      {
        key: 'paid',
        label: strings.SUMMARY_PAID,
        value: formatPrice(summary.paid),
        helperText: paidShare
          ? strings.PAID_REVENUE_SHARE_HELP.replace('{value}', paidShare)
          : undefined,
        icon: <MonetizationOnIcon fontSize="small" />, 
      },
      {
        key: 'acceptance',
        label: strings.METRIC_ACCEPTANCE_RATE,
        value: acceptanceValue,
        icon: <EmojiEventsIcon fontSize="small" />, 
      },
      {
        key: 'cancellation',
        label: strings.METRIC_CANCELLATION_RATE,
        value: cancellationValue,
        icon: <WatchLaterIcon fontSize="small" />, 
      },
      {
        key: 'views',
        label: strings.TOTAL_VIEWS,
        value: formatInteger(totalViews),
        trend: viewTrend ?? undefined,
        helperText: viewTrend !== null
          ? strings.VIEWS_TREND_LABEL.replace(
              '{value}',
              `${viewTrend > 0 ? '+' : ''}${viewTrend}%`,
            )
          : undefined,
        icon: <TimelineIcon fontSize="small" />, 
      },
      {
        key: 'averageBooking',
        label: strings.AVERAGE_BOOKING_VALUE,
        value: averageBasket,
        icon: <StarRateIcon fontSize="small" />, 
      },
      {
        key: 'revenuePerCar',
        label: strings.REVENUE_PER_CAR,
        value: perCar,
        helperText: strings.REVENUE_PER_CAR_HELP.replace(
          '{count}',
          formatInteger(totalCarsForAgency),
        ),
        icon: <DirectionsCarIcon fontSize="small" />, 
      },
    ]
  }, [
    agencyOverview,
    averageBookingValue,
    localeForDate,
    paidRevenueShare,
    revenuePerCar,
    summary,
    totalBookingCount,
    totalCarsForAgency,
    totalViews,
    viewTrend,
  ])

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

  const renderAdminView = () => (
    <Stack spacing={4}>
      <Grid container spacing={isSmallScreen ? 2 : 3}>
        {adminOverviewLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={`admin-kpi-skeleton-${index}`}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" height={18} width="60%" sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={36} width="80%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : adminKpis.map((kpi) => (
              <Grid item xs={12} sm={6} md={3} key={kpi.key}>
                <DashboardKpiCard {...kpi} />
              </Grid>
            ))}
      </Grid>

      {adminOverview && !adminOverviewLoading ? (
        <Stack spacing={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
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
                              <TableCell>{strings.RANKING_LAST_CONNECTION}</TableCell>
                              <TableCell>{strings.LAST_ACTIVITY}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paginatedRanking.map((item, index) => {
                              const absoluteIndex = rankingPage * rankingRowsPerPage + index + 1
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

            {isAdmin ? (
              <Stack spacing={3}>
                <Tabs
                  value={activeTab}
                  onChange={(_event, value) => setActiveTab(value as 'admin' | 'agency')}
                  variant="scrollable"
                  allowScrollButtonsMobile
                >
                  <Tab value="admin" label={strings.ADMIN_TAB_LABEL} />
                  <Tab value="agency" label={strings.AGENCY_TAB_LABEL} />
                </Tabs>
                <Divider />
                {activeTab === 'admin' ? renderAdminView() : null}
                {activeTab === 'agency' ? renderAgencyView() : null}
              </Stack>
            ) : (
              renderAgencyView()
            )}
          </Stack>
        </Box>
      ) : null}

      {(!user || isBusy) && <SimpleBackdrop text={strings.LOADING} />}
    </Layout>
  )

}

export default CarStats
