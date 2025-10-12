import React from 'react'
import { Box, Skeleton, Typography } from '@mui/material'
import { LineChart, BarChart, PieChart } from '@mui/x-charts'
import * as bookcarsTypes from ':bookcars-types'
import {
  MonthlyRevenuePoint,
  ViewsTimePoint,
  type AgencyAverageDurationPoint,
} from '@/pages/insights.helpers'
import { strings } from '@/lang/insights'
import {
  BOOKING_STATUS_CHIP_STYLES,
  FALLBACK_STATUS_CHIP_STYLE,
} from '@/constants/bookingStatusStyles'

const chartPalette = {
  primary: '#1E88E5',
  secondary: '#FF7A00',
  neutral: '#394867',
  success: '#34A853',
  danger: '#E53935',
}

const statusLabels: Record<bookcarsTypes.BookingStatus, string> = {
  [bookcarsTypes.BookingStatus.Paid]: strings.STATUS_PAID,
  [bookcarsTypes.BookingStatus.Deposit]: strings.STATUS_DEPOSIT,
  [bookcarsTypes.BookingStatus.Reserved]: strings.STATUS_RESERVED,
  [bookcarsTypes.BookingStatus.Cancelled]: strings.STATUS_CANCELLED,
  [bookcarsTypes.BookingStatus.Pending]: strings.STATUS_PENDING,
  [bookcarsTypes.BookingStatus.Void]: strings.STATUS_VOID,
}

const getStatusColor = (status: bookcarsTypes.BookingStatus) =>
  BOOKING_STATUS_CHIP_STYLES[status]?.color ?? FALLBACK_STATUS_CHIP_STYLE.color

const getStatusBackground = (status: bookcarsTypes.BookingStatus) =>
  BOOKING_STATUS_CHIP_STYLES[status]?.background ?? FALLBACK_STATUS_CHIP_STYLE.background

interface BaseChartProps {
  loading?: boolean
  emptyLabel?: string
}

interface RevenueLineChartProps extends BaseChartProps {
  data: MonthlyRevenuePoint[]
}

export const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data, loading }) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, background: '#fff', height: '100%' }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
      {strings.CHART_REVENUE}
    </Typography>
    {loading ? (
      <Skeleton variant="rectangular" height={260} />
    ) : data.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        {strings.GLOBAL_REVENUE_EMPTY}
      </Typography>
    ) : (
      <LineChart
        height={260}
        series={[{ data: data.map((item) => item.total), color: chartPalette.primary, label: strings.KPI_REVENUE }]}
        xAxis={[{ scaleType: 'point', data: data.map((item) => item.month) }]}
        slotProps={{ legend: { hidden: true } }}
      />
    )}
  </Box>
)

interface ViewsChartProps extends BaseChartProps {
  data: ViewsTimePoint[]
}

export const ViewsLineChart: React.FC<ViewsChartProps> = ({ data, loading }) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, background: '#fff', height: '100%' }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
      {strings.CHART_VIEWS}
    </Typography>
    {loading ? (
      <Skeleton variant="rectangular" height={260} />
    ) : data.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        {strings.GLOBAL_VIEWS_EMPTY}
      </Typography>
    ) : (
      <LineChart
        height={260}
        series={[
          { data: data.map((item) => item.organique), label: strings.CHART_LABEL_ORGANIC, color: chartPalette.primary },
          { data: data.map((item) => item.paid), label: strings.CHART_LABEL_PAID, color: chartPalette.secondary },
          { data: data.map((item) => item.total), label: strings.CHART_LABEL_TOTAL, color: chartPalette.neutral },
        ]}
        xAxis={[{ scaleType: 'point', data: data.map((item) => item.date) }]}
      />
    )}
  </Box>
)

interface StatusChartProps extends BaseChartProps {
  data: bookcarsTypes.BookingStat[]
}

export const StatusPieChart: React.FC<StatusChartProps> = ({ data, loading }) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, background: '#fff', height: '100%' }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
      {strings.CHART_STATUS_COUNT}
    </Typography>
    {loading ? (
      <Skeleton variant="rectangular" height={260} />
    ) : data.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        {strings.EMPTY}
      </Typography>
    ) : (
      <PieChart
        height={260}
        series={[{
          data: data.map((item) => ({
            id: item.status,
            value: item.count,
            label: statusLabels[item.status] ?? item.status,
            color: getStatusColor(item.status),
            data: {
              backgroundColor: getStatusBackground(item.status),
            },
          })),
          innerRadius: 40,
          outerRadius: 100,
        }]}
        slotProps={{ legend: { hidden: false } }}
      />
    )}
  </Box>
)

export const StatusRevenueBarChart: React.FC<StatusChartProps> = ({ data, loading }) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, background: '#fff', height: '100%' }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
      {strings.CHART_STATUS_REVENUE}
    </Typography>
    {loading ? (
      <Skeleton variant="rectangular" height={260} />
    ) : data.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        {strings.EMPTY}
      </Typography>
    ) : (
      <PieChart
        height={260}
        series={[{
          data: data.map((item) => ({
            id: item.status,
            value: item.totalPrice,
            label: statusLabels[item.status] ?? item.status,
            color: getStatusColor(item.status),
          })),
          innerRadius: 40,
          outerRadius: 100,
        }]}
      />
    )}
  </Box>
)

interface AcceptCancelChartProps extends BaseChartProps {
  accepted: number
  cancelled: number
}

export const AcceptCancelBarChart: React.FC<AcceptCancelChartProps> = ({ accepted, cancelled, loading }) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, background: '#fff', height: '100%' }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
      {strings.CHART_ACCEPT_CANCEL}
    </Typography>
    {loading ? (
      <Skeleton variant="rectangular" height={260} />
    ) : (
      <BarChart
        height={260}
        series={[{ data: [accepted, cancelled], color: chartPalette.primary }]}
        xAxis={[{ scaleType: 'band', data: [strings.CHART_LABEL_ACCEPTED, strings.CHART_LABEL_CANCELLED] }]}
      />
    )}
  </Box>
)

interface AverageDurationChartProps extends BaseChartProps {
  data: AgencyAverageDurationPoint[]
}

export const AverageDurationBarChart: React.FC<AverageDurationChartProps> = ({ data, loading }) => (
  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, background: '#fff', height: '100%' }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
      {strings.CHART_AVG_DURATION}
    </Typography>
    {loading ? (
      <Skeleton variant="rectangular" height={260} />
    ) : data.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        {strings.EMPTY}
      </Typography>
    ) : (
      <BarChart
        height={260}
        series={[{ data: data.map((item) => Number(item.averageDuration.toFixed(2))), color: chartPalette.primary }]}
        xAxis={[{ scaleType: 'band', data: data.map((item) => item.agencyName) }]}
      />
    )}
  </Box>
)
