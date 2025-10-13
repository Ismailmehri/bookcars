import React from 'react'
import { Button, Grid, Stack, Typography } from '@mui/material'
import DownloadIcon from '@mui/icons-material/DownloadOutlined'
import { formatCurrency, formatNumber, formatPercentage } from '@/common/format'
import TableSimple, { TableColumn } from './TableSimple'
import KpiCard from './KpiCard'
import {
  RevenueLineChart,
  ViewsLineChart,
  StatusPieChart,
  StatusRevenuePieChart,
  AcceptCancelBarChart,
  AverageDurationBarChart,
  WeeklyTrendChart,
  ModelRevenueBarChart,
  ModelOccupancyBarChart,
  CancellationByPaymentBarChart,
} from './Charts'
import { strings } from '@/lang/insights'
import * as bookcarsTypes from ':bookcars-types'
import { type AdminMetricsViewModel } from '@/pages/insights.types'

interface AdminViewProps {
  loading: boolean
  metrics: AdminMetricsViewModel
  onExport: () => void
}

const AdminView: React.FC<AdminViewProps> = ({ loading, metrics, onExport }) => {
  const rankingColumns: TableColumn<bookcarsTypes.AgencyRankingItem>[] = [
    {
      key: 'agencyId',
      label: '#',
      render: (_row, index) => index + 1,
      sortable: false,
    },
    {
      key: 'agencyName',
      label: strings.TABLE_AGENCY_RANKING,
      sortValue: (row) => row.agencyName.toLowerCase(),
    },
    {
      key: 'revenue',
      label: strings.TABLE_COL_REVENUE,
      align: 'right',
      render: (row) => formatCurrency(row.revenue),
    },
    {
      key: 'totalCars',
      label: strings.TABLE_COL_CARS,
      align: 'right',
      render: (row) => formatNumber(row.totalCars, { maximumFractionDigits: 0 }),
    },
    {
      key: 'totalBookings',
      label: strings.TABLE_COL_BOOKINGS,
      align: 'right',
      render: (row) => formatNumber(row.totalBookings, { maximumFractionDigits: 0 }),
    },
    {
      key: 'acceptanceRate',
      label: strings.TABLE_COL_ACCEPTANCE,
      align: 'right',
      render: (row) => formatPercentage(row.acceptanceRate),
    },
    {
      key: 'cancellationRate',
      label: strings.TABLE_COL_CANCELLATION,
      align: 'right',
      render: (row) => formatPercentage(row.cancellationRate),
    },
    {
      key: 'pendingUpdates',
      label: strings.TABLE_COL_PENDING,
      align: 'right',
      render: (row) => formatNumber(row.pendingUpdates, { maximumFractionDigits: 0 }),
    },
    {
      key: 'score',
      label: strings.TABLE_COL_SCORE,
      align: 'right',
      render: (row) => formatNumber(row.score, { maximumFractionDigits: 0 }),
    },
  ]

  const { summary } = metrics

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {strings.ADMIN_TAB_INFO}
        </Typography>
        <Button variant="outlined" color="primary" startIcon={<DownloadIcon />} onClick={onExport}>
          {strings.EXPORT}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_TOTAL_REVENUE}
            value={formatCurrency(summary.totalRevenue)}
            tooltip={strings.KPI_REVENUE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_TOTAL_BOOKINGS}
            value={formatNumber(summary.totalBookings, { maximumFractionDigits: 0 })}
            tooltip={strings.KPI_BOOKINGS_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_AGENCIES} value={formatNumber(summary.activeAgencies, { maximumFractionDigits: 0 })} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_ACCEPTANCE}
            value={formatPercentage(summary.acceptanceRate)}
            tooltip={strings.KPI_ACCEPTANCE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_CANCELLATION}
            value={formatPercentage(summary.cancellationRate)}
            tooltip={strings.KPI_CANCELLATION_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_RATING}
            value={metrics.averageRating ? metrics.averageRating.toFixed(1) : strings.RATING_PLACEHOLDER}
            tooltip={strings.KPI_RATING_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.GLOBAL_OCCUPANCY}
            value={formatPercentage(summary.occupancyRate * 100)}
            tooltip={strings.OCCUPANCY_TOOLTIP}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_REVENUE_CURRENT_YEAR}
            value={formatCurrency(summary.currentYearRevenue)}
            tooltip={strings.KPI_REVENUE_CURRENT_YEAR_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_REVENUE_PREVIOUS_YEAR}
            value={formatCurrency(summary.previousYearRevenue)}
            tooltip={strings.KPI_REVENUE_PREVIOUS_YEAR_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_VIEWS_TO_BOOKINGS}
            value={formatPercentage(summary.conversionRate * 100)}
            tooltip={strings.KPI_VIEWS_TO_BOOKINGS_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_REBOOKING_RATE}
            value={formatPercentage(summary.rebookingRate * 100)}
            tooltip={strings.KPI_REBOOKING_RATE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_LEAD_TIME}
            value={formatNumber(summary.averageLeadTime, { maximumFractionDigits: 1 })}
            tooltip={strings.KPI_LEAD_TIME_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_REVENUE_PER_BOOKING}
            value={formatCurrency(summary.averageRevenuePerBooking)}
            tooltip={strings.KPI_AVG_REVENUE_PER_BOOKING_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_DURATION}
            value={formatNumber(summary.averageDuration, { maximumFractionDigits: 1 })}
            tooltip={strings.KPI_AVG_DURATION_HELPER}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <RevenueLineChart data={metrics.monthlyRevenue} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <WeeklyTrendChart data={metrics.weeklyTrend} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ViewsLineChart data={metrics.viewsOverTime} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusPieChart data={metrics.statusBreakdown} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusRevenuePieChart data={metrics.statusBreakdown} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ModelRevenueBarChart data={metrics.revenueByModel} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ModelOccupancyBarChart data={metrics.occupancyByModel} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CancellationByPaymentBarChart data={metrics.cancellationsByPaymentStatus} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <AcceptCancelBarChart
            accepted={summary.acceptedBookings}
            cancelled={summary.cancelledBookings}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <AverageDurationBarChart data={metrics.averageDurationByAgency} loading={loading} />
        </Grid>
      </Grid>

      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {strings.TABLE_AGENCY_RANKING}
        </Typography>
        <TableSimple
          columns={rankingColumns}
          data={metrics.ranking}
          emptyLabel={strings.EMPTY}
          rowsPerPageOptions={[5, 10, 25, 50]}
          initialRowsPerPage={10}
          mobileSortLabel={strings.TABLE_SORT_LABEL}
        />
      </Stack>
    </Stack>
  )
}

export default AdminView
