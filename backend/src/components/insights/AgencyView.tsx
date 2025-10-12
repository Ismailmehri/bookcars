import React from 'react'
import { Button, Grid, Stack, Typography } from '@mui/material'
import DownloadIcon from '@mui/icons-material/DownloadOutlined'
import { formatCurrency, formatDateTime, formatNumber, formatPercentage } from '@/common/format'
import TableSimple, { TableColumn } from './TableSimple'
import KpiCard from './KpiCard'
import {
  RevenueLineChart,
  ViewsLineChart,
  StatusPieChart,
  StatusRevenuePieChart,
  WeeklyTrendChart,
  ModelRevenueBarChart,
  ModelOccupancyBarChart,
  CancellationByPaymentBarChart,
} from './Charts'
import { strings } from '@/lang/insights'
import * as bookcarsTypes from ':bookcars-types'
import { type AgencyMetricsViewModel } from '@/pages/insights.types'

const statusLabels: Record<bookcarsTypes.BookingStatus, string> = {
  [bookcarsTypes.BookingStatus.Paid]: strings.STATUS_PAID,
  [bookcarsTypes.BookingStatus.Deposit]: strings.STATUS_DEPOSIT,
  [bookcarsTypes.BookingStatus.Reserved]: strings.STATUS_RESERVED,
  [bookcarsTypes.BookingStatus.Cancelled]: strings.STATUS_CANCELLED,
  [bookcarsTypes.BookingStatus.Pending]: strings.STATUS_PENDING,
  [bookcarsTypes.BookingStatus.Void]: strings.STATUS_VOID,
}

interface AgencyViewProps {
  loading: boolean
  agencyName: string
  metrics: AgencyMetricsViewModel
  onExport: () => void
}

const AgencyView: React.FC<AgencyViewProps> = ({ loading, agencyName, metrics, onExport }) => {
  const topModelsColumns: TableColumn<bookcarsTypes.TopModelStat>[] = [
    { key: 'model', label: strings.TABLE_COL_MODEL },
    { key: 'bookings', label: strings.TABLE_COL_BOOKINGS, align: 'right', render: (row) => formatNumber(row.bookings, { maximumFractionDigits: 0 }) },
  ]

  const pendingUpdatesColumns: TableColumn<bookcarsTypes.AgencyBookingUpdate>[] = [
    { key: 'bookingId', label: 'ID' },
    {
      key: 'carName',
      label: strings.TABLE_COL_MODEL,
    },
    {
      key: 'status',
      label: strings.TABLE_COL_STATUS,
      render: (row) => statusLabels[row.status] ?? row.status,
    },
    {
      key: 'endDate',
      label: strings.END_DATE,
      render: (row) => formatDateTime(row.endDate),
    },
    {
      key: 'overdueDays',
      label: strings.TABLE_COL_PENDING,
      align: 'right',
      render: (row) => formatNumber(row.overdueDays, { maximumFractionDigits: 0 }),
    },
  ]

  const { summary } = metrics

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
        <Stack spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {agencyName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strings.AGENCY_TAB_INFO}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {`${strings.LAST_BOOKING_AT}: ${formatDateTime(metrics.lastBookingAt)}`} · {`${strings.LAST_CONNECTION_AT}: ${formatDateTime(metrics.lastConnectionAt)}`}
          </Typography>
        </Stack>
        <Button variant="outlined" color="primary" startIcon={<DownloadIcon />} onClick={onExport}>
          {strings.EXPORT}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_REVENUE}
            value={formatCurrency(summary.totalRevenue)}
            tooltip={strings.KPI_REVENUE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_BOOKINGS}
            value={formatNumber(summary.totalBookings, { maximumFractionDigits: 0 })}
            tooltip={strings.KPI_BOOKINGS_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_ACCEPTANCE}
            value={formatPercentage(summary.acceptanceRate)}
            tooltip={strings.KPI_ACCEPTANCE_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_CANCELLATION}
            value={formatPercentage(summary.cancellationRate)}
            tooltip={strings.KPI_CANCELLATION_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_RATING}
            value={metrics.rating ? `${metrics.rating.average.toFixed(1)} / 5` : strings.RATING_PLACEHOLDER}
            helperText={
              metrics.rating
                ? strings.REVIEWS_COUNT.replace(
                    '{count}',
                    formatNumber(metrics.rating.reviews, { maximumFractionDigits: 0 }),
                  )
                : undefined
            }
            tooltip={strings.KPI_RATING_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_OCCUPANCY}
            value={formatPercentage(summary.occupancyRate * 100)}
            tooltip={strings.OCCUPANCY_TOOLTIP}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_REVENUE_PER_BOOKING}
            value={formatCurrency(summary.averageRevenuePerBooking)}
            helperText={strings.KPI_AVG_REVENUE_PER_BOOKING_HELPER}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_AVG_DURATION}
            value={formatNumber(summary.averageDuration, { maximumFractionDigits: 1 })}
            helperText={strings.KPI_AVG_DURATION_HELPER}
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
            helperText={strings.KPI_LEAD_TIME_HELPER}
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
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {strings.TABLE_PENDING}
          </Typography>
          <TableSimple
            columns={pendingUpdatesColumns}
            data={metrics.pendingUpdatesRows}
            emptyLabel={strings.EMPTY}
            rowsPerPageOptions={[5, 10, 20]}
            initialRowsPerPage={5}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {strings.TABLE_TOP_MODELS}
          </Typography>
          <TableSimple
            columns={topModelsColumns}
            data={metrics.topModels}
            emptyLabel={strings.EMPTY}
            rowsPerPageOptions={[5, 10, 20]}
            initialRowsPerPage={5}
          />
        </Grid>
      </Grid>

      <KpiCard
        label={strings.KPI_PENDING}
        value={formatNumber(metrics.pendingUpdates, { maximumFractionDigits: 0 })}
        accent="warning"
        helperText={strings.DATA_REFRESHED}
        loading={loading}
      />
    </Stack>
  )
}

export default AgencyView
