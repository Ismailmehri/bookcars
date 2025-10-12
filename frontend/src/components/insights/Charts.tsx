import React from 'react'
import { Box, Paper, Typography, CircularProgress } from '@mui/material'

import {
  type DataStatus,
  type RevenuePoint,
  type StatusHistoryPoint,
  type PriceDistributionPoint,
  type FunnelStep
} from '@/types/insights'
import { strings as insightsStrings } from '@/lang/insights'
import { formatCurrency, formatFunnelValue } from '@/common/format'

interface ChartContainerProps {
  title: string
  status: DataStatus
  children: React.ReactNode
  emptyMessage?: string
}

const ChartContainer = ({ title, status, children, emptyMessage }: ChartContainerProps) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      border: '1px solid rgba(30, 136, 229, 0.12)',
      padding: 3,
      boxShadow: '0 18px 36px rgba(17, 24, 39, 0.08)',
      height: '100%',
    }}
    role="region"
    aria-label={title}
  >
    <Typography variant="subtitle1" fontWeight={600} mb={2} color="#1E2A45">
      {title}
    </Typography>
    {status === 'loading' || status === 'idle' ? (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={220} aria-live="polite">
        <CircularProgress size={24} color="primary" />
        <Typography variant="body2" ml={1} color="text.secondary">
          {insightsStrings.STATUS_LOADING}
        </Typography>
      </Box>
    ) : status === 'error' ? (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={220} aria-live="assertive">
        <Typography variant="body2" color="error">
          {insightsStrings.STATUS_ERROR}
        </Typography>
      </Box>
    ) : status === 'empty' ? (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={220} aria-live="polite">
        <Typography variant="body2" color="text.secondary">
          {emptyMessage ?? insightsStrings.STATUS_EMPTY}
        </Typography>
      </Box>
    ) : (
      children
    )}
  </Paper>
)

const buildLinePath = (data: RevenuePoint[], width: number, height: number) => {
  if (!data.length) {
    return ''
  }

  const paddingX = 24
  const paddingY = 16
  const max = Math.max(...data.map((item) => item.revenue))
  const min = Math.min(...data.map((item) => item.revenue))
  const range = max - min || 1

  return data
    .map((item, index) => {
      const x = paddingX + (index / (data.length - 1 || 1)) * (width - paddingX * 2)
      const y = height - paddingY - ((item.revenue - min) / range) * (height - paddingY * 2)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

interface ViewsLineChartProps {
  data: RevenuePoint[]
  status: DataStatus
}

export const ViewsLineChart = ({ data, status }: ViewsLineChartProps) => (
  <ChartContainer title={insightsStrings.REVENUE_TREND_TITLE} status={status}>
    <Box display="flex" flexDirection="column" gap={2}>
      <svg viewBox="0 0 480 240" width="100%" height="240" role="img" aria-label={insightsStrings.REVENUE_TREND_TITLE}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1E88E5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={buildLinePath(data, 480, 240)}
          fill="none"
          stroke="#1E88E5"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((item, index) => {
          const width = 480
          const height = 240
          const paddingX = 24
          const paddingY = 16
          const max = Math.max(...data.map((point) => point.revenue))
          const min = Math.min(...data.map((point) => point.revenue))
          const range = max - min || 1
          const x = paddingX + (index / (data.length - 1 || 1)) * (width - paddingX * 2)
          const y = height - paddingY - ((item.revenue - min) / range) * (height - paddingY * 2)

          return (
            <g key={item.month}>
              <circle cx={x} cy={y} r={5} fill="#1E88E5" />
              <text x={x} y={y - 12} textAnchor="middle" fontSize={12} fill="#1E2A45">
                {formatCurrency(item.revenue)}
              </text>
            </g>
          )
        })}
      </svg>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" px={0.5}>
        {data.map((item) => (
          <Typography key={item.month} variant="caption" color="text.secondary" fontWeight={600}>
            {item.month}
          </Typography>
        ))}
      </Box>
    </Box>
  </ChartContainer>
)

interface StatusBarChartProps {
  data: StatusHistoryPoint[]
  status: DataStatus
}

export const StatusBarChart = ({ data, status }: StatusBarChartProps) => (
  <ChartContainer title={insightsStrings.STATUS_TREND_TITLE} status={status}>
    <Box display="flex" flexDirection="column" gap={2}>
      <svg viewBox="0 0 480 240" width="100%" height="240" role="img" aria-label={insightsStrings.STATUS_TREND_TITLE}>
        {data.map((item, index) => {
          const barWidth = 24
          const barGap = 48
          const startX = 48 + index * barGap * 2
          const maxValue = Math.max(...data.map((point) => point.accepted + point.cancelled)) || 1
          const acceptedHeight = (item.accepted / maxValue) * 160
          const cancelledHeight = (item.cancelled / maxValue) * 160
          const baseY = 200

          return (
            <g key={item.month}>
              <rect
                x={startX}
                y={baseY - acceptedHeight}
                width={barWidth}
                height={acceptedHeight}
                rx={6}
                fill="#1E88E5"
              />
              <rect
                x={startX + barWidth + 8}
                y={baseY - cancelledHeight}
                width={barWidth}
                height={cancelledHeight}
                rx={6}
                fill="#FF7A00"
              />
              <text x={startX + barWidth / 2} y={baseY - acceptedHeight - 8} textAnchor="middle" fontSize={12} fill="#1E2A45">
                {item.accepted}
              </text>
              <text
                x={startX + barWidth * 1.5 + 8}
                y={baseY - cancelledHeight - 8}
                textAnchor="middle"
                fontSize={12}
                fill="#1E2A45"
              >
                {item.cancelled}
              </text>
              <text x={startX + barWidth} y={220} textAnchor="middle" fontSize={12} fill="#4B5563">
                {item.month}
              </text>
            </g>
          )
        })}
      </svg>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={12} height={12} borderRadius={2} bgcolor="#1E88E5" />
          <Typography variant="caption" color="text.secondary">
            Acceptées
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={12} height={12} borderRadius={2} bgcolor="#FF7A00" />
          <Typography variant="caption" color="text.secondary">
            Annulées
          </Typography>
        </Box>
      </Box>
    </Box>
  </ChartContainer>
)

interface PricesBarChartProps {
  data: PriceDistributionPoint[]
  status: DataStatus
}

export const PricesBarChart = ({ data, status }: PricesBarChartProps) => (
  <ChartContainer title={insightsStrings.PRICE_DISTRIBUTION_TITLE} status={status}>
    <Box display="flex" flexDirection="column" gap={2}>
      <svg viewBox="0 0 480 240" width="100%" height="240" role="img" aria-label={insightsStrings.PRICE_DISTRIBUTION_TITLE}>
        {data.map((item, index) => {
          const barWidth = 48
          const gap = 48
          const x = 48 + index * (barWidth + gap)
          const maxValue = Math.max(...data.map((point) => point.averagePrice)) || 1
          const height = (item.averagePrice / maxValue) * 160
          const baseY = 200

          return (
            <g key={item.category}>
              <rect x={x} y={baseY - height} width={barWidth} height={height} rx={8} fill="#1E88E5" />
              <text x={x + barWidth / 2} y={baseY - height - 8} textAnchor="middle" fontSize={12} fill="#1E2A45">
                {`${item.averagePrice} DT`}
              </text>
              <text x={x + barWidth / 2} y={220} textAnchor="middle" fontSize={12} fill="#4B5563">
                {item.category}
              </text>
            </g>
          )
        })}
      </svg>
    </Box>
  </ChartContainer>
)

interface FunnelChartProps {
  data: FunnelStep[]
  status: DataStatus
}

export const FunnelBarChart = ({ data, status }: FunnelChartProps) => (
  <ChartContainer title={insightsStrings.FUNNEL_TITLE} status={status}>
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" flexDirection="column" gap={2}>
        {data.map((step, index) => {
          const maxValue = Math.max(...data.map((item) => item.value)) || 1
          const width = `${(step.value / maxValue) * 100}%`
          const color = index === data.length - 1 ? '#FF7A00' : '#1E88E5'

          return (
            <Box key={step.label}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                {`${step.label} · ${formatFunnelValue(step.value)}`}
              </Typography>
              <Box
                height={32}
                borderRadius={3}
                bgcolor="rgba(30, 136, 229, 0.12)"
                display="flex"
                alignItems="center"
                role="presentation"
              >
                <Box
                  sx={{
                    width,
                    transition: 'width 0.3s ease',
                    background: `linear-gradient(90deg, ${color}, ${color === '#1E88E5' ? '#63A4FF' : '#FF9B3D'})`,
                    borderRadius: 12,
                    height: '100%',
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  </ChartContainer>
)
