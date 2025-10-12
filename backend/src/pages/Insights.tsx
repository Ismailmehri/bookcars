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
  calculateOccupancyRate,
  countBookings,
  extractTotalRecords,
  groupMonthlyRevenue,
  mergeBookingStats,
  sumBookingsRevenue,
  sumViewsByDate,
} from './insights.helpers'
import AgencyView from '@/components/insights/AgencyView'
import AdminView from '@/components/insights/AdminView'

const BOOKINGS_PAGE_SIZE = 200
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

  const loadBookings = useCallback(async (
    suppliers: string[] | undefined,
    from: Date,
    to: Date,
  ) => {
    const payload: bookcarsTypes.GetBookingsPayload = {
      suppliers,
      statuses: ACCEPTED_STATUSES,
      filter: {
        from,
        to,
      },
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
  }, [])

  const loadAdminOverview = useCallback(async () => {
    setError(null)
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
    } catch (err) {
      helper.error(err, strings.ERROR)
      setError(strings.ERROR)
    }
  }, [])

  const selectedAgencyRanking = useMemo(
    () => (adminOverview ? adminOverview.ranking.find((item) => item.agencyId === selectedAgency) ?? null : null),
    [adminOverview, selectedAgency],
  )

  const applyFilters = useCallback(async () => {
    if (!selectedAgency) {
      return
    }

    if (endDate.getTime() < startDate.getTime()) {
      setError(strings.SELECT_PERIOD_ERROR)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [agencyOverviewData, carStats, bookingStats, bookings] = await Promise.all([
        CarStatsService.getAgencyOverview(selectedAgency),
        CarStatsService.getCarStats(selectedAgency, undefined, startDate, endDate),
        CarStatsService.getBookingStats(selectedAgency, undefined, startDate, endDate),
        loadBookings([selectedAgency], startDate, endDate),
      ])

      const agencyMonthlyRevenue = groupMonthlyRevenue(bookings, startDate, endDate)
      const agencyViews = sumViewsByDate(carStats)
      const occupancyRate = calculateOccupancyRate(bookings, agencyOverviewData.totalCars, startDate, endDate)
      const revenueTotal = sumBookingsRevenue(bookings)
      const bookingsCount = countBookings(bookings)

      setAgencyMetrics({
        revenue: revenueTotal,
        bookings: bookingsCount,
        acceptanceRate: agencyOverviewData.acceptanceRate,
        cancellationRate: agencyOverviewData.cancellationRate,
        rating: selectedAgencyRanking && selectedAgencyRanking.averageRating !== null
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
        statusCounts: bookingStats,
        statusRevenue: bookingStats,
        lastBookingAt: selectedAgencyRanking?.lastBookingAt,
        lastConnectionAt: selectedAgencyRanking?.lastConnectionAt,
      })

      if (isAdmin) {
        const supplierIds = adminOverview?.ranking.map((item) => item.agencyId) ?? []
        const [adminBookings, carStatsCollection, bookingStatsCollection] = await Promise.all([
          loadBookings(undefined, startDate, endDate),
          Promise.all(supplierIds.map((id) => CarStatsService.getCarStats(id, undefined, startDate, endDate))),
          Promise.all(supplierIds.map((id) => CarStatsService.getBookingStats(id, undefined, startDate, endDate))),
        ])

        const mergedViews = sumViewsByDate(carStatsCollection.flat())
        const mergedStats = mergeBookingStats(bookingStatsCollection)
        const monthlyRevenueGlobal = groupMonthlyRevenue(adminBookings, startDate, endDate)
        const totalRevenue = sumBookingsRevenue(adminBookings)
        const totalBookings = countBookings(adminBookings)
        const totalCars = (adminOverview?.ranking ?? []).reduce((total, item) => total + item.totalCars, 0)
        const occupancy = calculateOccupancyRate(adminBookings, totalCars, startDate, endDate)

        const weightedAcceptance = (adminOverview?.ranking ?? []).reduce(
          (acc, item) => ({
            total: acc.total + item.acceptanceRate * item.totalBookings,
            weight: acc.weight + item.totalBookings,
          }),
          { total: 0, weight: 0 },
        )
        const weightedCancellation = (adminOverview?.ranking ?? []).reduce(
          (acc, item) => ({
            total: acc.total + item.cancellationRate * item.totalBookings,
            weight: acc.weight + item.totalBookings,
          }),
          { total: 0, weight: 0 },
        )
        const weightedRating = (adminOverview?.ranking ?? []).reduce(
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

        const accepted = mergedStats
          .filter((item) => ACCEPTED_STATUSES.includes(item.status))
          .reduce((total, item) => total + item.count, 0)
        const cancelled = mergedStats
          .filter((item) => CANCELLED_STATUSES.includes(item.status))
          .reduce((total, item) => total + item.count, 0)

        setAdminMetrics({
          totalRevenue,
          totalBookings,
          activeAgencies: adminOverview?.summary.totalAgencies ?? 0,
          acceptanceRate: weightedAcceptance.weight > 0 ? weightedAcceptance.total / weightedAcceptance.weight : 0,
          cancellationRate: weightedCancellation.weight > 0 ? weightedCancellation.total / weightedCancellation.weight : 0,
          averageRating: weightedRating.weight > 0 ? weightedRating.total / weightedRating.weight : undefined,
          occupancyRate: occupancy,
          acceptedBookings: accepted,
          cancelledBookings: cancelled,
          monthlyRevenue: monthlyRevenueGlobal,
          viewsOverTime: mergedViews,
          statusCounts: mergedStats,
          statusRevenue: mergedStats,
          ranking: adminOverview?.ranking ?? [],
        })
      }
    } catch (err) {
      helper.error(err, strings.ERROR)
      setError(strings.ERROR)
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
    void applyFilters()
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
            <Tabs value={tab} onChange={(_event, value) => setTab(value)}>
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
