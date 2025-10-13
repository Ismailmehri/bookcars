import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { subMonths } from 'date-fns'
import * as bookcarsTypes from ':bookcars-types'
import * as helper from '@/common/helper'
import { formatCurrency, formatNumber, formatPercentage } from '@/common/format'
import { strings } from '@/lang/insights'
import * as CarStatsService from '@/services/CarStatsService'
import * as StatsService from '@/services/StatsService'
import { downloadCsv } from '@/common/csv'
import {
  buildAgencyOptions,
  createAgencyOptionFromUser,
  getStatusLabel,
  type AgencyOption,
} from './insights.helpers'
import {
  type AgencyMetricsViewModel,
  type AdminMetricsViewModel,
} from './insights.types'

const FILTER_STORAGE_KEY = 'plany.insights.filters'

interface StoredFilters {
  startDate: string
  endDate: string
  agencyId?: string
  tab?: 'agency' | 'admin'
}

const createInitialAgencySummary = (): bookcarsTypes.AgencyStatsSummary => ({
  totalRevenue: 0,
  totalBookings: 0,
  acceptedBookings: 0,
  cancelledBookings: 0,
  acceptanceRate: 0,
  cancellationRate: 0,
  averageRevenuePerBooking: 0,
  averageDuration: 0,
  occupancyRate: 0,
  rebookingRate: 0,
  averageLeadTime: 0,
})

const createInitialAdminSummary = (): bookcarsTypes.AdminStatsSummary => ({
  totalRevenue: 0,
  totalBookings: 0,
  activeAgencies: 0,
  acceptanceRate: 0,
  cancellationRate: 0,
  occupancyRate: 0,
  acceptedBookings: 0,
  cancelledBookings: 0,
  averageRevenuePerBooking: 0,
  averageDuration: 0,
  currentYearRevenue: 0,
  previousYearRevenue: 0,
  conversionRate: 0,
  rebookingRate: 0,
  averageLeadTime: 0,
})

const createInitialAgencyMetrics = (): AgencyMetricsViewModel => ({
  summary: createInitialAgencySummary(),
  rating: undefined,
  pendingUpdates: 0,
  pendingUpdatesRows: [],
  topModels: [],
  monthlyRevenue: [],
  weeklyTrend: [],
  viewsOverTime: [],
  statusBreakdown: [],
  revenueByModel: [],
  occupancyByModel: [],
  lastBookingAt: undefined,
  lastConnectionAt: undefined,
})

const createInitialAdminMetrics = (): AdminMetricsViewModel => ({
  summary: createInitialAdminSummary(),
  averageRating: undefined,
  ranking: [],
  monthlyRevenue: [],
  weeklyTrend: [],
  viewsOverTime: [],
  statusBreakdown: [],
  revenueByModel: [],
  occupancyByModel: [],
  averageDurationByAgency: [],
  topModels: [],
})

const loadStoredFilters = (): StoredFilters | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredFilters
    if (!parsed.startDate || !parsed.endDate) {
      return null
    }

    return parsed
  } catch (err) {
    console.warn('[insights.loadStoredFilters]', err)
    return null
  }
}

const persistFilters = (filters: StoredFilters) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
  } catch (err) {
    console.warn('[insights.persistFilters]', err)
  }
}

const buildSummaryCsvRows = (
  summary: bookcarsTypes.AgencyStatsSummary | bookcarsTypes.AdminStatsSummary,
  extra: Record<string, string>,
) => {
  const rows: string[][] = [
    [strings.CSV_HEADER_LABEL, strings.CSV_HEADER_VALUE],
    [strings.KPI_REVENUE, formatCurrency(summary.totalRevenue)],
    [strings.KPI_BOOKINGS, formatNumber(summary.totalBookings, { maximumFractionDigits: 0 })],
  ]

  if ('activeAgencies' in summary) {
    rows.push([strings.KPI_AGENCIES, formatNumber(summary.activeAgencies, { maximumFractionDigits: 0 })])
  }

  rows.push(
    [strings.KPI_ACCEPTANCE, formatPercentage(summary.acceptanceRate)],
    [strings.KPI_CANCELLATION, formatPercentage(summary.cancellationRate)],
    [strings.KPI_OCCUPANCY, formatPercentage(summary.occupancyRate * 100)],
    [strings.KPI_AVG_REVENUE_PER_BOOKING, formatCurrency('averageRevenuePerBooking' in summary ? summary.averageRevenuePerBooking : 0)],
    [strings.KPI_AVG_DURATION, formatNumber('averageDuration' in summary ? summary.averageDuration : 0, { maximumFractionDigits: 2 })],
  )

  if ('rebookingRate' in summary) {
    rows.push([strings.KPI_REBOOKING_RATE, formatPercentage(summary.rebookingRate * 100)])
  }

  if ('averageLeadTime' in summary) {
    rows.push([
      strings.KPI_LEAD_TIME,
      formatNumber(summary.averageLeadTime, { maximumFractionDigits: 1 }),
    ])
  }

  Object.entries(extra).forEach(([label, value]) => {
    rows.push([label, value])
  })

  return rows
}

const normalizeDate = (value?: string | Date | null) => {
  if (!value) {
    return undefined
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date.toISOString()
}

export const useInsightsMetrics = () => {
  const [user, setUser] = useState<bookcarsTypes.User | undefined>()
  const [isAdmin, setIsAdmin] = useState(false)
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 2))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedAgency, setSelectedAgency] = useState('')
  const [agencyOptions, setAgencyOptions] = useState<AgencyOption[]>([])
  const [agencyMetrics, setAgencyMetrics] = useState<AgencyMetricsViewModel>(createInitialAgencyMetrics)
  const [adminMetrics, setAdminMetrics] = useState<AdminMetricsViewModel>(createInitialAdminMetrics)
  const [loading, setLoading] = useState(false)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'agency' | 'admin'>('agency')
  const [adminOverview, setAdminOverview] = useState<bookcarsTypes.AdminStatisticsOverview | null>(null)
  const [adminTabLoaded, setAdminTabLoaded] = useState(false)
  const [filtersHydrated, setFiltersHydrated] = useState(false)
  const storedFilters = useMemo(loadStoredFilters, [])
  const storedAgencyRef = useRef<string | null>(storedFilters?.agencyId ?? null)
  const storedTabRef = useRef<'agency' | 'admin' | null>(storedFilters?.tab ?? null)
  const initialFetchPending = useRef(true)

  useEffect(() => {
    if (storedFilters?.startDate) {
      const storedStart = new Date(storedFilters.startDate)
      if (!Number.isNaN(storedStart.getTime())) {
        setStartDate(storedStart)
      }
    }

    if (storedFilters?.endDate) {
      const storedEnd = new Date(storedFilters.endDate)
      if (!Number.isNaN(storedEnd.getTime())) {
        setEndDate(storedEnd)
      }
    }

    if (storedTabRef.current) {
      setTab(storedTabRef.current)
    }
    setFiltersHydrated(true)
  }, [storedFilters])

  const handleUserLoaded = useCallback((loadedUser?: bookcarsTypes.User) => {
    setUser(loadedUser)
    const admin = helper.admin(loadedUser)
    setIsAdmin(admin)

    if (!admin) {
      const option = createAgencyOptionFromUser(loadedUser)
      if (option) {
        setAgencyOptions([option])
        setSelectedAgency(option.id)
      }
    }
  }, [])

  const updateAgencyMetrics = useCallback(
    (
      stats: bookcarsTypes.AgencyStatsResponse,
      overview: bookcarsTypes.AgencyStatisticsOverview,
      rankingItem?: bookcarsTypes.AgencyRankingItem,
    ) => {
      setAgencyMetrics({
        summary: stats.summary,
        rating:
          rankingItem && rankingItem.averageRating !== null
            ? { average: rankingItem.averageRating ?? 0, reviews: rankingItem.reviewCount }
            : undefined,
        pendingUpdates: overview.pendingUpdateCount,
        pendingUpdatesRows: overview.pendingUpdates,
        topModels: stats.topModels,
        monthlyRevenue: stats.monthlyRevenue,
        weeklyTrend: stats.weeklyTrend,
        viewsOverTime: stats.viewsOverTime,
        statusBreakdown: stats.statusBreakdown,
        revenueByModel: stats.revenueByModel,
        occupancyByModel: stats.occupancyByModel,
        lastBookingAt: normalizeDate(
          stats.lastBookingAt ?? rankingItem?.lastBookingAt ?? overview.lastBookingAt,
        ),
        lastConnectionAt: normalizeDate(
          stats.lastConnectionAt ?? rankingItem?.lastConnectionAt ?? overview.lastConnectionAt,
        ),
      })
    },
    [],
  )

  const updateAdminMetrics = useCallback(
    (
      stats: bookcarsTypes.AdminStatsResponse,
      overview: bookcarsTypes.AdminStatisticsOverview | null,
    ) => {
      let averageRating: number | undefined
      if (overview) {
        const weighted = overview.ranking.reduce(
          (acc, item) => {
            if (item.averageRating === null || item.reviewCount === 0) {
              return acc
            }

            return {
              total: acc.total + item.averageRating * item.reviewCount,
              weight: acc.weight + item.reviewCount,
            }
          },
          { total: 0, weight: 0 },
        )

        if (weighted.weight > 0) {
          averageRating = weighted.total / weighted.weight
        }
      }

      setAdminMetrics({
        summary: stats.summary,
        averageRating,
        ranking: overview?.ranking ?? [],
        monthlyRevenue: stats.monthlyRevenue,
        weeklyTrend: stats.weeklyTrend,
        viewsOverTime: stats.viewsOverTime,
        statusBreakdown: stats.statusBreakdown,
        revenueByModel: stats.revenueByModel,
        occupancyByModel: stats.occupancyByModel,
        averageDurationByAgency: stats.averageDurationByAgency,
        topModels: stats.topModels,
      })
    },
    [],
  )

  const applyFilters = useCallback(
    async (options?: { includeAdmin?: boolean }) => {
      if (!selectedAgency) {
        return
      }

      if (endDate.getTime() < startDate.getTime()) {
        setError(strings.SELECT_PERIOD_ERROR)
        return
      }

      setLoading(true)
      setButtonLoading(true)
      setError(null)

      try {
        const [overview, stats] = await Promise.all([
          CarStatsService.getAgencyOverview(selectedAgency),
          StatsService.getAgencyStats(selectedAgency, startDate, endDate),
        ])

        const rankingItem = adminOverview?.ranking.find((item) => item.agencyId === selectedAgency)
        updateAgencyMetrics(stats, overview, rankingItem)

        const includeAdmin = Boolean(options?.includeAdmin && isAdmin)

        if (includeAdmin || (isAdmin && tab === 'admin')) {
          const adminStats = await StatsService.getAdminStats(startDate, endDate)
          updateAdminMetrics(adminStats, adminOverview)
          setAdminTabLoaded(true)
        }

        persistFilters({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          agencyId: selectedAgency,
          tab,
        })
      } catch (err) {
        helper.error(err, strings.ERROR)
        setError(strings.ERROR)
      } finally {
        setLoading(false)
        setButtonLoading(false)
      }
    },
    [
      adminOverview,
      endDate,
      isAdmin,
      selectedAgency,
      startDate,
      tab,
      updateAdminMetrics,
      updateAgencyMetrics,
    ],
  )

  useEffect(() => {
    if (!isAdmin) {
      setTab('agency')
      setAdminTabLoaded(false)
      setAdminMetrics(createInitialAdminMetrics())
      return
    }

    const loadOverview = async () => {
      try {
        const [overview, suppliers] = await Promise.all([
          CarStatsService.getAdminOverview(),
          CarStatsService.getUniqueSuppliers(),
        ])

        setAdminOverview(overview)
        const optionsList = buildAgencyOptions(suppliers, overview.ranking)
        setAgencyOptions(optionsList)

        const preferred = storedAgencyRef.current && optionsList.some((option) => option.id === storedAgencyRef.current)
          ? storedAgencyRef.current
          : optionsList[0]?.id

        if (preferred) {
          setSelectedAgency(preferred)
        }
      } catch (err) {
        helper.error(err, strings.ERROR)
        setError(strings.ERROR)
      }
    }

    void loadOverview()
  }, [isAdmin])

  useEffect(() => {
    if (!filtersHydrated || isAdmin || !user || !initialFetchPending.current) {
      return
    }

    initialFetchPending.current = false
    void applyFilters()
  }, [applyFilters, filtersHydrated, isAdmin, user])

  useEffect(() => {
    if (!filtersHydrated || !isAdmin || !selectedAgency || !adminOverview || !initialFetchPending.current) {
      return
    }

    if (storedTabRef.current && tab !== storedTabRef.current) {
      return
    }

    initialFetchPending.current = false
    storedTabRef.current = null
    void applyFilters({ includeAdmin: tab === 'admin' })
  }, [adminOverview, applyFilters, filtersHydrated, isAdmin, selectedAgency, tab])

  const handleExportAgency = useCallback(() => {
    if (!selectedAgency) {
      return
    }

    const totalViews = agencyMetrics.viewsOverTime.reduce((acc, view) => acc + view.total, 0)
    const extra = {
      [strings.KPI_PENDING]: formatNumber(agencyMetrics.pendingUpdates, { maximumFractionDigits: 0 }),
      [strings.KPI_VIEWS_TO_BOOKINGS]: formatPercentage(
        agencyMetrics.summary.acceptedBookings === 0 || totalViews === 0
          ? 0
          : (agencyMetrics.summary.acceptedBookings / totalViews) * 100,
      ),
    }

    const rows: string[][] = [
      ...buildSummaryCsvRows(agencyMetrics.summary, extra),
      [],
      [strings.TABLE_TOP_MODELS, strings.CSV_HEADER_VALUE],
      ...agencyMetrics.topModels.map((model) => [model.model, formatNumber(model.bookings, { maximumFractionDigits: 0 })]),
      [],
      [strings.CSV_HEADER_STATUS, strings.CSV_HEADER_VALUE],
      ...agencyMetrics.statusBreakdown.map((item) => [
        getStatusLabel(item.status),
        `${formatNumber(item.count, { maximumFractionDigits: 0 })} / ${formatCurrency(item.totalPrice)}`,
      ]),
    ]

    downloadCsv(`insights-agency-${selectedAgency}.csv`, rows)
  }, [agencyMetrics, selectedAgency])

  const handleExportAdmin = useCallback(() => {
    const extra: Record<string, string> = {
      [strings.KPI_REVENUE_CURRENT_YEAR]: formatCurrency(adminMetrics.summary.currentYearRevenue),
      [strings.KPI_REVENUE_PREVIOUS_YEAR]: formatCurrency(adminMetrics.summary.previousYearRevenue),
      [strings.KPI_VIEWS_TO_BOOKINGS]: formatPercentage(adminMetrics.summary.conversionRate * 100),
    }

    const rows: string[][] = [
      ...buildSummaryCsvRows(adminMetrics.summary, extra),
      [],
      [strings.TABLE_AGENCY_RANKING, strings.CSV_HEADER_VALUE],
      ...adminMetrics.ranking.map((item) => [
        item.agencyName,
        `${formatCurrency(item.revenue)} / ${formatPercentage(item.acceptanceRate)}`,
      ]),
    ]

    downloadCsv('insights-admin.csv', rows)
  }, [adminMetrics])

  return {
    user,
    isAdmin,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    selectedAgency,
    setSelectedAgency,
    agencyOptions,
    agencyMetrics,
    adminMetrics,
    loading,
    buttonLoading,
    error,
    tab,
    setTab,
    adminTabLoaded,
    setAdminTabLoaded,
    applyFilters,
    handleUserLoaded,
    handleExportAgency,
    handleExportAdmin,
  }
}
