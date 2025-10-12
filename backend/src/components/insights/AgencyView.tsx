import React from 'react'
import { Grid, Stack, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { MonthlyRevenuePoint, ViewsTimePoint } from '@/pages/insights.helpers'
import { formatCurrency, formatDateTime, formatNumber, formatPercentage } from '@/common/format'
import KpiCard from './KpiCard'
import TableSimple, { TableColumn } from './TableSimple'
import {
  RevenueLineChart,
  ViewsLineChart,
  StatusPieChart,
  StatusRevenueBarChart,
} from './Charts'
import { strings } from '@/lang/insights'

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
  revenue: number
  bookings: number
  acceptanceRate?: number
  cancellationRate?: number
  rating?: { average: number; reviews: number }
  occupancyRate: number
  pendingUpdates: number
  pendingUpdatesRows: bookcarsTypes.AgencyBookingUpdate[]
  topModels: bookcarsTypes.TopModelStat[]
  monthlyRevenue: MonthlyRevenuePoint[]
  viewsOverTime: ViewsTimePoint[]
  statusCounts: bookcarsTypes.BookingStat[]
  statusRevenue: bookcarsTypes.BookingStat[]
  lastBookingAt?: string
  lastConnectionAt?: string
}

const AgencyView: React.FC<AgencyViewProps> = ({
  loading,
  agencyName,
  revenue,
  bookings,
  acceptanceRate,
  cancellationRate,
  rating,
  occupancyRate,
  pendingUpdates,
  pendingUpdatesRows,
  topModels,
  monthlyRevenue,
  viewsOverTime,
  statusCounts,
  statusRevenue,
  lastBookingAt,
  lastConnectionAt,
}) => {
  const topModelsColumns: TableColumn<bookcarsTypes.TopModelStat>[] = [
    { key: 'model', label: strings.TABLE_COL_MODEL },
    { key: 'bookings', label: strings.TABLE_COL_BOOKINGS, align: 'right' },
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

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {agencyName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {strings.AGENCY_TAB_INFO}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {`${strings.LAST_BOOKING_AT}: ${formatDateTime(lastBookingAt)}`} · {`${strings.LAST_CONNECTION_AT}: ${formatDateTime(lastConnectionAt)}`}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_REVENUE} value={formatCurrency(revenue)} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_BOOKINGS} value={formatNumber(bookings, { maximumFractionDigits: 0 })} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_ACCEPTANCE} value={formatPercentage(acceptanceRate)} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_CANCELLATION} value={formatPercentage(cancellationRate)} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_RATING}
            value={rating ? `${rating.average.toFixed(1)} / 5` : strings.RATING_PLACEHOLDER}
            helperText={rating ? strings.REVIEWS_COUNT.replace('{count}', formatNumber(rating.reviews, { maximumFractionDigits: 0 })) : undefined}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard
            label={strings.KPI_OCCUPANCY}
            value={formatPercentage(occupancyRate)}
            tooltip={strings.OCCUPANCY_TOOLTIP}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <RevenueLineChart data={monthlyRevenue} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ViewsLineChart data={viewsOverTime} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusPieChart data={statusCounts} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatusRevenueBarChart data={statusRevenue} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {strings.TABLE_PENDING}
          </Typography>
          <TableSimple columns={pendingUpdatesColumns} data={pendingUpdatesRows} emptyLabel={strings.EMPTY} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {strings.TABLE_TOP_MODELS}
          </Typography>
          <TableSimple columns={topModelsColumns} data={topModels} emptyLabel={strings.EMPTY} />
        </Grid>
      </Grid>

      <KpiCard
        label={strings.KPI_PENDING}
        value={formatNumber(pendingUpdates, { maximumFractionDigits: 0 })}
        accent="warning"
        helperText={strings.DATA_REFRESHED}
        loading={loading}
      />
    </Stack>
  )
}

export default AgencyView
