import React from 'react'
import { Grid, Box } from '@mui/material'

import KpiCard from '@/components/insights/KpiCard'
import TableSimple from '@/components/insights/TableSimple'
import { PricesBarChart, StatusBarChart, ViewsLineChart } from '@/components/insights/Charts'
import {
  type AgencyInsights,
  type AsyncDataState,
  type DataStatus,
  type PendingUpdate,
  type TopModelRow
} from '@/types/insights'
import {
  formatCurrency,
  formatPercentage,
  formatHours,
  formatDays,
  formatDate,
  computeTrendDirection,
  computePercentageDelta
} from '@/common/format'
import { strings as insightsStrings } from '@/lang/insights'

interface AgencyViewProps {
  state: AsyncDataState<AgencyInsights>
}

const resolveStatus = (state: AsyncDataState<AgencyInsights>): DataStatus => {
  if (state.status === 'success' && state.data && state.data.pendingUpdates.length === 0) {
    return 'empty'
  }
  return state.status
}

const resolveTopModelsStatus = (state: AsyncDataState<AgencyInsights>): DataStatus => {
  if (state.status === 'success' && state.data && state.data.topModels.length === 0) {
    return 'empty'
  }
  return state.status
}

const AgencyView = ({ state }: AgencyViewProps) => {
  const { data, status: kpiStatus } = state

  const revenueTrend = data?.revenueTrend ?? []
  const latestRevenue = revenueTrend[revenueTrend.length - 1]?.revenue ?? 0
  const previousRevenue = revenueTrend[revenueTrend.length - 2]?.revenue ?? latestRevenue
  const revenueDelta = computePercentageDelta(latestRevenue, previousRevenue)
  const revenueDirection = computeTrendDirection(latestRevenue, previousRevenue)
  const overview = data?.overview
  const averageRating = overview?.averageRating ?? 0
  const reviewCount = overview?.reviewCount ?? 0
  const revenueTrendLabel = `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)} %`
  const revenueStatus: DataStatus = kpiStatus === 'success' && revenueTrend.length === 0 ? 'empty' : kpiStatus
  const statusHistoryStatus: DataStatus = kpiStatus === 'success' && (data?.statusHistory?.length ?? 0) === 0
    ? 'empty'
    : kpiStatus
  const priceStatus: DataStatus = kpiStatus === 'success' && (data?.priceDistribution?.length ?? 0) === 0
    ? 'empty'
    : kpiStatus

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_RESERVATIONS_30D}
            value={overview ? overview.bookings30d.toString() : '0'}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_REVENUE_30D}
            value={formatCurrency(overview?.revenue30d ?? 0)}
            status={kpiStatus}
            trend={{ value: revenueDelta, direction: revenueDirection, label: revenueTrendLabel }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_ACCEPTANCE_RATE}
            value={formatPercentage(overview?.acceptanceRate ?? 0, 1)}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_CANCELLATION_RATE}
            value={formatPercentage(overview?.cancellationRate ?? 0, 1)}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_AVERAGE_RATING}
            value={`${averageRating.toFixed(1)} / 5`}
            status={kpiStatus}
            helperText={`${reviewCount} avis`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_OCCUPANCY_RATE}
            value={formatPercentage(overview?.occupancyRate ?? 0, 1)}
            status={kpiStatus}
            helperText={`${insightsStrings.KPI_REVENUE_PER_CAR}: ${formatCurrency(overview?.revenuePerCar ?? 0)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_RESPONSE_DELAY}
            value={formatHours(overview?.medianResponseDelayH ?? 0)}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_UPDATE_DELAY}
            value={formatHours(overview?.medianUpdateDelayH ?? 0)}
            status={kpiStatus}
            helperText={`${insightsStrings.LATE_UPDATE_RATE}: ${formatPercentage(overview?.lateUpdateRate ?? 0, 1)} · ${insightsStrings.ON_TIME_RATE}: ${formatPercentage(overview?.onTimeUpdateRate ?? 0, 1)}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ViewsLineChart data={data?.revenueTrend ?? []} status={revenueStatus} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusBarChart data={data?.statusHistory ?? []} status={statusHistoryStatus} />
        </Grid>
        <Grid item xs={12}>
          <PricesBarChart data={data?.priceDistribution ?? []} status={priceStatus} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TableSimple<PendingUpdate>
            title={insightsStrings.TABLE_PENDING_UPDATES}
            columns={[
              { key: 'bookingCode', label: insightsStrings.COLUMN_BOOKING },
              { key: 'plannedEnd', label: insightsStrings.COLUMN_END, render: (row) => formatDate(row.plannedEnd) },
              { key: 'status', label: insightsStrings.COLUMN_STATUS },
              {
                key: 'delayDays',
                label: insightsStrings.COLUMN_DELAY,
                render: (row) => formatDays(row.delayDays),
              },
            ]}
            data={data?.pendingUpdates ?? []}
            status={resolveStatus(state)}
            emptyMessage={insightsStrings.TABLE_PENDING_EMPTY}
            getRowKey={(row) => row.bookingCode}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TableSimple<TopModelRow>
            title={insightsStrings.TABLE_TOP_MODELS}
            columns={[
              { key: 'model', label: insightsStrings.COLUMN_MODEL },
              { key: 'bookings', label: insightsStrings.COLUMN_BOOKINGS },
            ]}
            data={data?.topModels ?? []}
            status={resolveTopModelsStatus(state)}
            getRowKey={(row) => row.model}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default AgencyView
