import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { subMonths } from 'date-fns'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import DateTimePicker from '@/components/DateTimePicker'
import * as helper from '@/common/helper'
import * as CarStatsService from '@/services/CarStatsService'
import * as BookingService from '@/services/BookingService'
import env from '@/config/env.config'
import { strings } from '@/lang/insights'
import {
  aggregateBookingsByStatus,
  calculateOccupancyRate,
  countBookings,
  extractTotalRecords,
  groupMonthlyRevenue,
  sumBookingsRevenue,
  sumViewsByDate,
} from './insights.helpers'
import AgencyView from '@/components/insights/AgencyView'
import AdminView from '@/components/insights/AdminView'

const BOOKINGS_PAGE_SIZE = 200
const ALL_BOOKING_STATUSES = Object.values(bookcarsTypes.BookingStatus) as bookcarsTypes.BookingStatus[]
const ACCEPTED_STATUSES = [
  bookcarsTypes.BookingStatus.Paid,
  bookcarsTypes.BookingStatus.Deposit,
  bookcarsTypes.BookingStatus.Reserved,
]

const CANCELLED_STATUSES = [
  bookcarsTypes.BookingStatus.Cancelled,
  bookcarsTypes.BookingStatus.Void,
]

interface AgencyOption {
  id: string
  name: string
}

const Insights = () => {
  const [user, setUser] = useState<bookcarsTypes.User | undefined>()
  const [isAdmin, setIsAdmin] = useState(false)
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 2))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [selectedAgency, setSelectedAgency] = useState<string>('')
  const [agencyOptions, setAgencyOptions] = useState<AgencyOption[]>([])
  const [adminOverview, setAdminOverview] = useState<bookcarsTypes.AdminStatisticsOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'agency' | 'admin'>('agency')
  const [adminTabLoaded, setAdminTabLoaded] = useState(false)
  const initialLoadDone = useRef(false)

  const [agencyMetrics, setAgencyMetrics] = useState({
    revenue: 0,
    bookings: 0,
    acceptanceRate: 0,
    cancellationRate: 0,
    rating: undefined as { average: number; reviews: number } | undefined,
    occupancyRate: 0,
    pendingUpdates: 0,
    pendingUpdatesRows: [] as bookcarsTypes.AgencyBookingUpdate[],
    topModels: [] as bookcarsTypes.TopModelStat[],
    monthlyRevenue: [] as ReturnType<typeof groupMonthlyRevenue>,
    viewsOverTime: [] as ReturnType<typeof sumViewsByDate>,
    statusCounts: [] as bookcarsTypes.BookingStat[],
    statusRevenue: [] as bookcarsTypes.BookingStat[],
    lastBookingAt: undefined as string | undefined,
    lastConnectionAt: undefined as string | undefined,
  })

  const [adminMetrics, setAdminMetrics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeAgencies: 0,
    acceptanceRate: 0,
    cancellationRate: 0,
    averageRating: undefined as number | undefined,
    occupancyRate: 0,
    acceptedBookings: 0,
    cancelledBookings: 0,
    monthlyRevenue: [] as ReturnType<typeof groupMonthlyRevenue>,
    viewsOverTime: [] as ReturnType<typeof sumViewsByDate>,
    statusCounts: [] as bookcarsTypes.BookingStat[],
    statusRevenue: [] as bookcarsTypes.BookingStat[],
    ranking: [] as bookcarsTypes.AgencyRankingItem[],
  })

  const loadBookings = useCallback(
    async (
      suppliers: string[] | undefined,
      from: Date,
      to: Date,
      statuses: bookcarsTypes.BookingStatus[] = ALL_BOOKING_STATUSES,
    ) => {
      if (!suppliers || suppliers.length === 0) {
        return []
      }

      const payload: bookcarsTypes.GetBookingsPayload = {
        suppliers,
        filter: {
          from,
          to,
        },
        statuses: statuses.map((status) => status.toString()),
      }

      const bookings: bookcarsTypes.Booking[] = []
      let page = 1
      let totalRecords = Number.POSITIVE_INFINITY

      while (bookings.length < totalRecords) {
        // eslint-disable-next-line no-await-in-loop
        const response = await BookingService.getBookings(payload, page, BOOKINGS_PAGE_SIZE)
        const pageData = response && response.length > 0 ? response[0] : undefined
        if (!pageData) {
          break
        }

        const pageInfo = extractTotalRecords(pageData.pageInfo)
        if (Number.isFinite(pageInfo)) {
          totalRecords = pageInfo
        }

        const rows = pageData.resultData ?? []
        bookings.push(...rows)

        if (rows.length < BOOKINGS_PAGE_SIZE) {
          break
        }

        page += 1
      }

      return bookings
    },
    [],
  )

  const loadAdminOverview = useCallback(async (): Promise<bookcarsTypes.AdminStatisticsOverview | null> => {
    try {
      const overview = await CarStatsService.getAdminOverview()
      setAdminOverview(overview)
      const options = overview.ranking.map((item) => ({ id: item.agencyId, name: item.agencyName }))
      setAgencyOptions(options)
      if (options.length > 0) {
        setSelectedAgency((current) => (current ? current : options[0].id))
      }
      setAdminMetrics((prev) => ({
        ...prev,
        activeAgencies: overview.summary.totalAgencies,
        ranking: overview.ranking,
      }))
      return overview
    } catch (err) {
      helper.error(err, strings.ERROR)
      setError(strings.ERROR)
      return null
    }
  }, [])

  const selectedAgencyRanking = useMemo(
    () => (adminOverview ? adminOverview.ranking.find((item) => item.agencyId === selectedAgency) ?? null : null),
    [adminOverview, selectedAgency],
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

      const includeAdmin = Boolean(options?.includeAdmin && isAdmin)

      setLoading(true)
      setError(null)

      try {
        const [agencyOverviewData, carStats, bookings] = await Promise.all([
          CarStatsService.getAgencyOverview(selectedAgency),
          CarStatsService.getCarStats(selectedAgency, undefined, startDate, endDate),
          loadBookings([selectedAgency], startDate, endDate),
        ])

        const acceptedAgencyBookings = bookings.filter((booking) =>
          ACCEPTED_STATUSES.includes((booking.status ?? bookcarsTypes.BookingStatus.Pending) as bookcarsTypes.BookingStatus),
        )
        const statusStats = aggregateBookingsByStatus(bookings)
        const agencyMonthlyRevenue = groupMonthlyRevenue(acceptedAgencyBookings, startDate, endDate)
        const agencyViews = sumViewsByDate(carStats)
        const occupancyRate = calculateOccupancyRate(
          acceptedAgencyBookings,
          agencyOverviewData.totalCars,
          startDate,
          endDate,
        )
        const revenueTotal = sumBookingsRevenue(acceptedAgencyBookings)
        const bookingsCount = countBookings(acceptedAgencyBookings)

        setAgencyMetrics({
          revenue: revenueTotal,
          bookings: bookingsCount,
          acceptanceRate: agencyOverviewData.acceptanceRate,
          cancellationRate: agencyOverviewData.cancellationRate,
          rating:
            selectedAgencyRanking && selectedAgencyRanking.averageRating !== null
              ? {
                average: selectedAgencyRanking.averageRating,
                reviews: selectedAgencyRanking.reviewCount,
              }
              : undefined,
          occupancyRate,
          pendingUpdates: agencyOverviewData.pendingUpdateCount,
          pendingUpdatesRows: agencyOverviewData.pendingUpdates,
          topModels: agencyOverviewData.topModels,
          monthlyRevenue: agencyMonthlyRevenue,
          viewsOverTime: agencyViews,
          statusCounts: statusStats,
          statusRevenue: statusStats,
          lastBookingAt: selectedAgencyRanking?.lastBookingAt,
          lastConnectionAt: selectedAgencyRanking?.lastConnectionAt,
        })

        if (includeAdmin) {
          const overview = adminOverview ?? (await loadAdminOverview())

          if (!overview) {
            throw new Error('ADMIN_OVERVIEW_UNAVAILABLE')
          }

          const supplierIds = overview.ranking.map((item) => item.agencyId)
          const [adminBookings, carStatsCollection] = await Promise.all([
            loadBookings(supplierIds, startDate, endDate),
            supplierIds.length > 0
              ? Promise.all(
                supplierIds.map((id) => CarStatsService.getCarStats(id, undefined, startDate, endDate)),
              )
              : Promise.resolve([] as bookcarsTypes.CarStat[][]),
          ])

          const acceptedAdminBookings = adminBookings.filter((booking) =>
            ACCEPTED_STATUSES.includes((booking.status ?? bookcarsTypes.BookingStatus.Pending) as bookcarsTypes.BookingStatus),
          )

          const monthlyRevenueGlobal = groupMonthlyRevenue(acceptedAdminBookings, startDate, endDate)
          const totalRevenue = sumBookingsRevenue(acceptedAdminBookings)
          const totalBookings = countBookings(acceptedAdminBookings)
          const totalCars = overview.ranking.reduce((total, item) => total + item.totalCars, 0)
          const occupancy = calculateOccupancyRate(acceptedAdminBookings, totalCars, startDate, endDate)
          const statusSummary = aggregateBookingsByStatus(adminBookings)

          const accepted = statusSummary
            .filter((item) => ACCEPTED_STATUSES.includes(item.status))
            .reduce((total, item) => total + (item.count ?? 0), 0)
          const cancelled = statusSummary
            .filter((item) => CANCELLED_STATUSES.includes(item.status))
            .reduce((total, item) => total + (item.count ?? 0), 0)

          const mergedViews = sumViewsByDate(carStatsCollection.flat())

          const weightedAcceptance = overview.ranking.reduce(
            (acc, item) => ({
              total: acc.total + item.acceptanceRate * item.totalBookings,
              weight: acc.weight + item.totalBookings,
            }),
            { total: 0, weight: 0 },
          )
          const weightedCancellation = overview.ranking.reduce(
            (acc, item) => ({
              total: acc.total + item.cancellationRate * item.totalBookings,
              weight: acc.weight + item.totalBookings,
            }),
            { total: 0, weight: 0 },
          )
          const weightedRating = overview.ranking.reduce(
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

          setAdminMetrics({
            totalRevenue,
            totalBookings,
            activeAgencies: overview.summary.totalAgencies,
            acceptanceRate: weightedAcceptance.weight > 0 ? weightedAcceptance.total / weightedAcceptance.weight : 0,
            cancellationRate: weightedCancellation.weight > 0 ? weightedCancellation.total / weightedCancellation.weight : 0,
            averageRating: weightedRating.weight > 0 ? weightedRating.total / weightedRating.weight : undefined,
            occupancyRate: occupancy,
            acceptedBookings: accepted,
            cancelledBookings: cancelled,
            monthlyRevenue: monthlyRevenueGlobal,
            viewsOverTime: mergedViews,
            statusCounts: statusSummary,
            statusRevenue: statusSummary,
            ranking: overview.ranking,
          })

          setAdminTabLoaded(true)
        }
      } catch (err) {
        helper.error(err, strings.ERROR)
        setError(strings.ERROR)

        if (includeAdmin) {
          setAdminTabLoaded(false)
        }
      } finally {
        setLoading(false)
      }
    }, [
      selectedAgency,
      endDate,
      startDate,
      loadBookings,
      isAdmin,
      adminOverview,
      selectedAgencyRanking,
      loadAdminOverview,
    ])

  useEffect(() => {
    if (isAdmin) {
      void loadAdminOverview()
    }
  }, [isAdmin, loadAdminOverview])

  useEffect(() => {
    if (!initialLoadDone.current && selectedAgency) {
      initialLoadDone.current = true
      void applyFilters()
    }
  }, [applyFilters, selectedAgency])

  const handleApply = () => {
    const includeAdmin = isAdmin && tab === 'admin'

    if (isAdmin && tab !== 'admin') {
      setAdminTabLoaded(false)
    }

    void applyFilters({ includeAdmin })
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

  const handleAgencyChange = (event: SelectChangeEvent<string>) => {
    setSelectedAgency(event.target.value)
  }

  const onLoad = (loadedUser?: bookcarsTypes.User) => {
    setUser(loadedUser)
    setIsAdmin(helper.admin(loadedUser))
    if (loadedUser && !helper.admin(loadedUser)) {
      setSelectedAgency(loadedUser._id || '')
    }
  }

  const content = (
    <Stack spacing={4}>
      <Box sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: '#fff',
        p: 3,
        boxShadow: '0 12px 32px rgba(30, 136, 229, 0.08)',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E88E5' }}>
              {strings.TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {strings.FILTERS_DESCRIPTION}
            </Typography>
          </Stack>
        </Stack>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={3}>
            <DateTimePicker
              label={strings.START_DATE}
              value={startDate}
              minDate={subMonths(new Date(), 12)}
              maxDate={endDate}
              onChange={handleStartDateChange}
              showTime={false}
              language={env.DEFAULT_LANGUAGE}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DateTimePicker
              label={strings.END_DATE}
              value={endDate}
              minDate={startDate}
              maxDate={new Date()}
              onChange={handleEndDateChange}
              showTime={false}
              language={env.DEFAULT_LANGUAGE}
            />
          </Grid>
          {isAdmin ? (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{strings.AGENCY_PLACEHOLDER}</InputLabel>
                <Select value={selectedAgency} label={strings.AGENCY_PLACEHOLDER} onChange={handleAgencyChange}>
                  {agencyOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ) : null}
          <Grid item xs={12} md={3} display="flex" alignItems="center">
            <Button variant="contained" color="primary" onClick={handleApply} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}>
              {strings.APPLY}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={280}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isAdmin ? (
            <Tabs
              value={tab}
              onChange={(_event, value: 'agency' | 'admin') => {
                setTab(value)
                if (value === 'admin' && !adminTabLoaded) {
                  void applyFilters({ includeAdmin: true })
                }
              }}
            >
              <Tab value="agency" label={strings.TAB_AGENCY} />
              <Tab value="admin" label={strings.TAB_ADMIN} />
            </Tabs>
          ) : null}

          {(!isAdmin || tab === 'agency') && selectedAgency ? (
            <AgencyView
              loading={loading}
              agencyName={agencyOptions.find((option) => option.id === selectedAgency)?.name || user?.fullName || ''}
              revenue={agencyMetrics.revenue}
              bookings={agencyMetrics.bookings}
              acceptanceRate={agencyMetrics.acceptanceRate}
              cancellationRate={agencyMetrics.cancellationRate}
              rating={agencyMetrics.rating}
              occupancyRate={agencyMetrics.occupancyRate}
              pendingUpdates={agencyMetrics.pendingUpdates}
              pendingUpdatesRows={agencyMetrics.pendingUpdatesRows}
              topModels={agencyMetrics.topModels}
              monthlyRevenue={agencyMetrics.monthlyRevenue}
              viewsOverTime={agencyMetrics.viewsOverTime}
              statusCounts={agencyMetrics.statusCounts}
              statusRevenue={agencyMetrics.statusRevenue}
              lastBookingAt={agencyMetrics.lastBookingAt}
              lastConnectionAt={agencyMetrics.lastConnectionAt}
            />
          ) : null}

          {isAdmin && tab === 'admin' ? (
            <AdminView
              loading={loading}
              totalRevenue={adminMetrics.totalRevenue}
              totalBookings={adminMetrics.totalBookings}
              activeAgencies={adminMetrics.activeAgencies}
              acceptanceRate={adminMetrics.acceptanceRate}
              cancellationRate={adminMetrics.cancellationRate}
              averageRating={adminMetrics.averageRating}
              occupancyRate={adminMetrics.occupancyRate}
              acceptedBookings={adminMetrics.acceptedBookings}
              cancelledBookings={adminMetrics.cancelledBookings}
              monthlyRevenue={adminMetrics.monthlyRevenue}
              viewsOverTime={adminMetrics.viewsOverTime}
              statusCounts={adminMetrics.statusCounts}
              statusRevenue={adminMetrics.statusRevenue}
              ranking={adminMetrics.ranking}
            />
          ) : null}
        </>
      )}
    </Stack>
  )

  return (
    <Layout onLoad={onLoad} strict>
      {content}
    </Layout>
  )
}

export default Insights
