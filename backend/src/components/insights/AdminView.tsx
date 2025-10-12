import React from 'react'
import { Grid, Stack, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { MonthlyRevenuePoint, ViewsTimePoint } from '@/pages/insights.helpers'
import { formatCurrency, formatNumber, formatPercentage } from '@/common/format'
import KpiCard from './KpiCard'
import TableSimple, { TableColumn } from './TableSimple'
import {
  RevenueLineChart,
  ViewsLineChart,
  StatusPieChart,
  StatusRevenueBarChart,
  AcceptCancelBarChart,
} from './Charts'
import { strings } from '@/lang/insights'

interface AdminViewProps {
  loading: boolean
  totalRevenue: number
  totalBookings: number
  activeAgencies: number
  acceptanceRate?: number
  cancellationRate?: number
  averageRating?: number
  occupancyRate: number
  acceptedBookings: number
  cancelledBookings: number
  monthlyRevenue: MonthlyRevenuePoint[]
  viewsOverTime: ViewsTimePoint[]
  statusCounts: bookcarsTypes.BookingStat[]
  statusRevenue: bookcarsTypes.BookingStat[]
  ranking: bookcarsTypes.AgencyRankingItem[]
}

const AdminView: React.FC<AdminViewProps> = ({
  loading,
  totalRevenue,
  totalBookings,
  activeAgencies,
  acceptanceRate,
  cancellationRate,
  averageRating,
  occupancyRate,
  acceptedBookings,
  cancelledBookings,
  monthlyRevenue,
  viewsOverTime,
  statusCounts,
  statusRevenue,
  ranking,
}) => {
  const rankingColumns: TableColumn<bookcarsTypes.AgencyRankingItem>[] = [
    {
      key: 'agencyId',
      label: '#',
      render: (_row, index) => index + 1,
    },
    {
      key: 'agencyName',
      label: strings.TABLE_AGENCY_RANKING,
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

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        {strings.ADMIN_TAB_INFO}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_TOTAL_REVENUE} value={formatCurrency(totalRevenue)} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_TOTAL_BOOKINGS} value={formatNumber(totalBookings, { maximumFractionDigits: 0 })} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_AGENCIES} value={formatNumber(activeAgencies, { maximumFractionDigits: 0 })} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_AVG_ACCEPTANCE} value={formatPercentage(acceptanceRate)} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_AVG_CANCELLATION} value={formatPercentage(cancellationRate)} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <KpiCard label={strings.KPI_AVG_RATING} value={averageRating ? averageRating.toFixed(1) : strings.RATING_PLACEHOLDER} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <KpiCard
            label={strings.GLOBAL_OCCUPANCY}
            value={formatPercentage(occupancyRate * 100)}
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
        <Grid item xs={12} md={6}>
          <AcceptCancelBarChart accepted={acceptedBookings} cancelled={cancelledBookings} loading={loading} />
        </Grid>
      </Grid>

      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {strings.TABLE_AGENCY_RANKING}
        </Typography>
        <TableSimple
          columns={rankingColumns}
          data={ranking}
          emptyLabel={strings.EMPTY}
          rowsPerPageOptions={[5, 10, 25, 50]}
          initialRowsPerPage={10}
        />
      </Stack>
    </Stack>
  )
}

export default AdminView
