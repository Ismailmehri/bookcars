import React from 'react'
import { Box, Skeleton, Tooltip, Typography } from '@mui/material'
import { BarChart, LineChart, PieChart } from '@mui/x-charts'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'
import {
  BOOKING_STATUS_CHIP_STYLES,
  FALLBACK_STATUS_CHIP_STYLE,
} from '@/constants/bookingStatusStyles'
import { getStatusLabel, getCancellationPaymentLabel } from '@/pages/insights.helpers'
import { formatCurrency, formatNumber } from '@/common/format'

const chartPalette = {
  primary: '#1E88E5',
  secondary: '#FF7A00',
  neutral: '#394867',
  success: '#34A853',
  danger: '#E53935',
}

const chartContainerStyles = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  p: 2,
  background: '#fff',
  height: '100%',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'visible',
}

const ensureNumber = (value: number | null | undefined) => (typeof value === 'number' ? value : undefined)

const getStatusColor = (status: bookcarsTypes.BookingStatus) =>
  BOOKING_STATUS_CHIP_STYLES[status]?.color ?? FALLBACK_STATUS_CHIP_STYLE.color

const getStatusBackground = (status: bookcarsTypes.BookingStatus) =>
  BOOKING_STATUS_CHIP_STYLES[status]?.background ?? FALLBACK_STATUS_CHIP_STYLE.background

interface BaseChartProps {
  loading?: boolean
  emptyLabel?: string
}

interface RevenueLineChartProps extends BaseChartProps {
  data: bookcarsTypes.RevenueTimePoint[]
}

export const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_REVENUE_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
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
          series={[{ data: data.map((item) => item.revenue), color: chartPalette.primary, label: strings.KPI_REVENUE }]}
          xAxis={[{ scaleType: 'point', data: data.map((item) => item.period) }]}
          slotProps={{ legend: { hidden: true } }}
        />
      )}
    </Box>
  </Tooltip>
)

interface WeeklyTrendChartProps extends BaseChartProps {
  data: bookcarsTypes.WeeklyTrendPoint[]
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_WEEKLY_TREND_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {strings.CHART_WEEKLY_TREND}
      </Typography>
      {loading ? (
        <Skeleton variant="rectangular" height={260} />
      ) : data.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {strings.EMPTY}
        </Typography>
      ) : (
        <LineChart
          height={260}
          series={[
            {
              data: data.map((item) => item.revenue),
              label: strings.KPI_REVENUE,
              color: chartPalette.primary,
              yAxisKey: 'revenue',
              valueFormatter: (value) => formatCurrency(ensureNumber(value)),
            },
            {
              data: data.map((item) => item.bookings),
              label: strings.KPI_BOOKINGS,
              color: chartPalette.secondary,
              yAxisKey: 'bookings',
              valueFormatter: (value) =>
                formatNumber(ensureNumber(value), { maximumFractionDigits: 0 }),
            },
          ]}
          xAxis={[{ scaleType: 'point', data: data.map((item) => item.week) }]}
          yAxis={[
            {
              id: 'revenue',
              position: 'left',
              label: strings.CHART_AXIS_REVENUE,
              valueFormatter: (value) => formatCurrency(value as number),
            },
            {
              id: 'bookings',
              position: 'right',
              label: strings.CHART_AXIS_BOOKINGS,
              valueFormatter: (value) =>
                formatNumber((value as number) ?? 0, {
                  maximumFractionDigits: 0,
                }),
            },
          ]}
          slotProps={{ legend: { hidden: false } }}
        />
      )}
    </Box>
  </Tooltip>
)

interface ViewsChartProps extends BaseChartProps {
  data: bookcarsTypes.ViewsTimePoint[]
}

export const ViewsLineChart: React.FC<ViewsChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_VIEWS_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
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
  </Tooltip>
)

interface StatusChartProps extends BaseChartProps {
  data: bookcarsTypes.BookingStat[]
}

export const StatusPieChart: React.FC<StatusChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_STATUS_COUNT_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
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
              label: getStatusLabel(item.status),
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
  </Tooltip>
)

export const StatusRevenuePieChart: React.FC<StatusChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_STATUS_REVENUE_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
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
              label: getStatusLabel(item.status),
              color: getStatusColor(item.status),
            })),
            innerRadius: 40,
            outerRadius: 100,
          }]}
        />
      )}
    </Box>
  </Tooltip>
)

interface AcceptCancelChartProps extends BaseChartProps {
  accepted: number
  cancelled: number
}

export const AcceptCancelBarChart: React.FC<AcceptCancelChartProps> = ({ accepted, cancelled, loading }) => (
  <Tooltip title={strings.CHART_ACCEPT_CANCEL_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
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
  </Tooltip>
)

interface AverageDurationChartProps extends BaseChartProps {
  data: bookcarsTypes.AgencyAverageDurationPoint[]
}

export const AverageDurationBarChart: React.FC<AverageDurationChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_AVG_DURATION_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
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
  </Tooltip>
)

interface ModelRevenueChartProps extends BaseChartProps {
  data: bookcarsTypes.AgencyModelRevenueStat[]
}

export const ModelRevenueBarChart: React.FC<ModelRevenueChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_MODEL_REVENUE_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {strings.CHART_MODEL_REVENUE}
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
          series={[{ data: data.map((item) => Number(item.revenue.toFixed(0))), color: chartPalette.primary }]}
          xAxis={[{ scaleType: 'band', data: data.map((item) => item.modelName) }]}
        />
      )}
    </Box>
  </Tooltip>
)

interface ModelOccupancyChartProps extends BaseChartProps {
  data: bookcarsTypes.AgencyModelOccupancyStat[]
}

export const ModelOccupancyBarChart: React.FC<ModelOccupancyChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_MODEL_OCCUPANCY_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {strings.CHART_MODEL_OCCUPANCY}
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
          series={[{ data: data.map((item) => Number((item.occupancyRate * 100).toFixed(1))), color: chartPalette.secondary }]}
          xAxis={[{ scaleType: 'band', data: data.map((item) => item.modelName) }]}
        />
      )}
    </Box>
  </Tooltip>
)

interface CancellationChartProps extends BaseChartProps {
  data: bookcarsTypes.PaymentStatusCancellationStat[]
}

export const CancellationByPaymentBarChart: React.FC<CancellationChartProps> = ({ data, loading }) => (
  <Tooltip title={strings.CHART_CANCELLATION_PAYMENT_HELPER} arrow placement="top-start" enterTouchDelay={0}>
    <Box sx={chartContainerStyles}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {strings.CHART_CANCELLATION_PAYMENT}
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
          series={[{ data: data.map((item) => item.count), color: chartPalette.danger }]}
          xAxis={[{ scaleType: 'band', data: data.map((item) => getCancellationPaymentLabel(item.paymentStatus)) }]}
        />
      )}
    </Box>
  </Tooltip>
)
