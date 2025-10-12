import React from 'react'
import { Card, CardContent, Typography, Chip, Box, CircularProgress } from '@mui/material'
import { TrendingDown, TrendingFlat, TrendingUp } from '@mui/icons-material'

import { type DataStatus, type TrendBadge } from '@/types/insights'
import { strings as insightsStrings } from '@/lang/insights'

const TREND_ICONS = {
  up: <TrendingUp fontSize="small" />,
  down: <TrendingDown fontSize="small" />,
  flat: <TrendingFlat fontSize="small" />,
}

const TREND_COLORS = {
  up: '#1E88E5',
  down: '#FF7A00',
  flat: '#6B7280',
}

interface KpiCardProps {
  title: string
  value: string
  status: DataStatus
  helperText?: string
  trend?: TrendBadge
}

const renderStatus = (status: DataStatus) => {
  if (status === 'loading' || status === 'idle') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={96} aria-live="polite">
        <CircularProgress size={24} color="primary" />
        <Typography variant="body2" ml={1} color="text.secondary">
          {insightsStrings.STATUS_LOADING}
        </Typography>
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={96} aria-live="assertive">
        <Typography variant="body2" color="error">
          {insightsStrings.STATUS_ERROR}
        </Typography>
      </Box>
    )
  }

  if (status === 'empty') {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height={96} aria-live="polite">
        <Typography variant="body2" color="text.secondary">
          {insightsStrings.STATUS_EMPTY}
        </Typography>
      </Box>
    )
  }

  return null
}

const KpiCard = ({ title, value, status, helperText, trend }: KpiCardProps) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 2,
      height: '100%',
      borderColor: 'rgba(30, 136, 229, 0.15)',
      boxShadow: '0 10px 25px rgba(30, 136, 229, 0.08)',
    }}
  >
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="subtitle2" color="text.secondary" aria-label={title}>
        {title}
      </Typography>

      {status === 'success' ? (
        <>
          <Typography variant="h5" color="text.primary">
            {value}
          </Typography>
          {trend && (
            <Chip
              size="small"
              color="default"
              icon={TREND_ICONS[trend.direction]}
              label={trend.label ?? value}
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: `${TREND_COLORS[trend.direction]}14`,
                color: TREND_COLORS[trend.direction],
                fontWeight: 500,
              }}
            />
          )}
          {helperText && (
            <Typography variant="body2" color="text.secondary">
              {helperText}
            </Typography>
          )}
        </>
      ) : (
        renderStatus(status)
      )}
    </CardContent>
  </Card>
)

export default KpiCard
