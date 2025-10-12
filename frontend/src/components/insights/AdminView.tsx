import React from 'react'
import { Grid, Box } from '@mui/material'

import KpiCard from '@/components/insights/KpiCard'
import TableSimple from '@/components/insights/TableSimple'
import { FunnelBarChart, StatusBarChart, ViewsLineChart } from '@/components/insights/Charts'
import {
  type AdminInsights,
  type AgencyRanking,
  type AsyncDataState,
  type DataStatus,
  type PricingIndexRow,
  type RiskFlag
} from '@/types/insights'
import {
  formatCurrency,
  formatPercentage,
  formatHours,
  computeTrendDirection,
  computePercentageDelta,
  formatLevel
} from '@/common/format'
import { strings as insightsStrings } from '@/lang/insights'

interface AdminViewProps {
  state: AsyncDataState<AdminInsights>
}

const resolveTableStatus = <T, >(
  state: AsyncDataState<AdminInsights>,
  extractor: (data: AdminInsights) => T[]
): DataStatus => {
  if (state.status === 'success' && state.data && extractor(state.data).length === 0) {
    return 'empty'
  }

  return state.status
}

const AdminView = ({ state }: AdminViewProps) => {
  const { data, status: kpiStatus } = state

  const revenueTrend = data?.revenueTrend ?? []
  const latestRevenue = revenueTrend[revenueTrend.length - 1]?.revenue ?? 0
  const previousRevenue = revenueTrend[revenueTrend.length - 2]?.revenue ?? latestRevenue
  const revenueDelta = computePercentageDelta(latestRevenue, previousRevenue)
  const revenueDirection = computeTrendDirection(latestRevenue, previousRevenue)
  const overview = data?.overview
  const averageRating = overview?.avgRating ?? 0
  const revenueTrendLabel = `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)} %`
  const revenueStatus: DataStatus = kpiStatus === 'success' && revenueTrend.length === 0 ? 'empty' : kpiStatus
  const statusHistoryStatus: DataStatus = kpiStatus === 'success' && (data?.statusHistory?.length ?? 0) === 0
    ? 'empty'
    : kpiStatus
  const funnelStatus: DataStatus = kpiStatus === 'success' && (data?.funnel?.length ?? 0) === 0
    ? 'empty'
    : kpiStatus

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Grid container spacing={3}>
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
            title={insightsStrings.KPI_BOOKINGS_TOTAL}
            value={overview ? overview.bookings30d.toString() : '0'}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_ACTIVE_AGENCIES}
            value={overview ? overview.activeAgencies.toString() : '0'}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_AVG_ACCEPTANCE}
            value={formatPercentage(overview?.avgAcceptanceRate ?? 0, 1)}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_AVG_CANCELLATION}
            value={formatPercentage(overview?.avgCancellationRate ?? 0, 1)}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_AVG_RATING}
            value={`${averageRating.toFixed(1)} / 5`}
            status={kpiStatus}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_AVG_OCCUPANCY}
            value={formatPercentage(overview?.avgOccupancyRate ?? 0, 1)}
            status={kpiStatus}
            helperText={`${insightsStrings.KPI_AVG_REVENUE_PER_CAR}: ${formatCurrency(overview?.avgRevenuePerCar ?? 0)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title={insightsStrings.KPI_RESPONSE_DELAY_AVG}
            value={formatHours(overview?.medianResponseDelayH ?? 0)}
            status={kpiStatus}
            helperText={`${insightsStrings.KPI_UPDATE_DELAY_AVG}: ${formatHours(overview?.medianUpdateDelayH ?? 0)}`}
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
          <FunnelBarChart data={data?.funnel ?? []} status={funnelStatus} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableSimple<AgencyRanking>
            title={insightsStrings.TABLE_RANKING}
            columns={[
              { key: 'position', label: insightsStrings.COLUMN_POSITION },
              { key: 'agency', label: insightsStrings.COLUMN_AGENCY },
              { key: 'score', label: insightsStrings.COLUMN_SCORE },
              { key: 'bookings', label: insightsStrings.COLUMN_BOOKINGS },
              { key: 'fleetSize', label: insightsStrings.COLUMN_FLEET },
              {
                key: 'revenue',
                label: insightsStrings.COLUMN_REVENUE,
                render: (row) => formatCurrency(row.revenue),
              },
              {
                key: 'acceptanceRate',
                label: insightsStrings.COLUMN_ACCEPTANCE,
                render: (row) => formatPercentage(row.acceptanceRate, 1),
              },
              {
                key: 'cancellationRate',
                label: insightsStrings.COLUMN_CANCELLATION,
                render: (row) => formatPercentage(row.cancellationRate, 1),
              },
              { key: 'lateUpdates', label: insightsStrings.COLUMN_LATE },
              { key: 'lastActivity', label: insightsStrings.LAST_UPDATE },
            ]}
            data={data?.ranking ?? []}
            status={resolveTableStatus(state, (content) => content.ranking)}
            getRowKey={(row) => `${row.position}-${row.agency}`}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TableSimple<RiskFlag>
            title={insightsStrings.TABLE_RISKS}
            columns={[
              { key: 'agency', label: insightsStrings.COLUMN_AGENCY },
              { key: 'signal', label: insightsStrings.COLUMN_SIGNAL },
              {
                key: 'level',
                label: insightsStrings.COLUMN_LEVEL,
                render: (row) => formatLevel(row.level),
              },
            ]}
            data={data?.riskFlags ?? []}
            status={resolveTableStatus(state, (content) => content.riskFlags)}
            getRowKey={(row) => `${row.agency}-${row.signal}`}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TableSimple<PricingIndexRow>
            title={insightsStrings.TABLE_PRICING}
            columns={[
              { key: 'agency', label: insightsStrings.COLUMN_AGENCY },
              {
                key: 'pricingIndex',
                label: insightsStrings.COLUMN_INDEX,
                render: (row) => row.pricingIndex.toFixed(2),
              },
              {
                key: 'dispersion',
                label: insightsStrings.COLUMN_DISPERSION,
                render: (row) => formatPercentage(row.dispersion, 1),
              },
              {
                key: 'pricingDaysShare',
                label: insightsStrings.COLUMN_PRICING_DAYS,
                render: (row) => formatPercentage(row.pricingDaysShare, 0),
              },
            ]}
            data={data?.pricingIndex ?? []}
            status={resolveTableStatus(state, (content) => content.pricingIndex)}
            getRowKey={(row) => row.agency}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminView
