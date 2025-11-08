import React from 'react'
import { Avatar, Box, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { NorthEast, SouthEast } from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/users'

interface UsersStatsCardsProps {
  stats?: bookcarsTypes.UsersStatsResponse
  loading: boolean
}

const formatGrowth = (value: number) => {
  if (Number.isNaN(value)) {
    return '0%'
  }
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

const UsersStatsCards = ({ stats, loading }: UsersStatsCardsProps) => {
  const metrics: Array<{
    key: keyof bookcarsTypes.UsersStatsResponse
    title: string
    iconLabel: string
  }> = [
    {
      key: 'totalUsers',
      title: strings.TOTAL_USERS_LABEL,
      iconLabel: '👥',
    },
    {
      key: 'suppliers',
      title: strings.SUPPLIERS_LABEL,
      iconLabel: '🏢',
    },
    {
      key: 'clients',
      title: strings.CLIENTS_LABEL,
      iconLabel: '💬',
    },
  ]

  return (
    <Box className="users-stats-grid" data-testid="users-stats">
      {metrics.map((metricConfig) => {
        const metric = stats ? stats[metricConfig.key] : undefined
        const growthPositive = metric ? metric.growth >= 0 : true

        return (
          <Paper key={metricConfig.key} className="users-stats-card" elevation={0}>
            <Stack spacing={2.5} height="100%">
              <Stack direction="row" alignItems="center" justifyContent="space-between" className="users-stats-card__header">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar variant="rounded" className="users-stats-card__icon" aria-hidden>
                    {metricConfig.iconLabel}
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    {metricConfig.title}
                  </Typography>
                </Stack>
              </Stack>

              {loading ? (
                <Skeleton variant="text" width="55%" height={42} />
              ) : (
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {metric ? metric.current.toLocaleString() : strings.NO_DATA}
                </Typography>
              )}

              <Box className="users-stats-card__growth">
                {loading ? (
                  <Skeleton variant="text" width={160} height={22} />
                ) : metric ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      component="span"
                      className={`users-stats-card__growth-indicator ${growthPositive
                        ? 'users-stats-card__growth-indicator--positive'
                        : 'users-stats-card__growth-indicator--negative'
                      }`}
                    >
                      {growthPositive ? <NorthEast fontSize="small" /> : <SouthEast fontSize="small" />}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: growthPositive ? '#047857' : '#B91C1C' }}
                    >
                      {formatGrowth(metric.growth)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {strings.COMPARED_TO_PREVIOUS_MONTH}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {strings.NO_DATA}
                  </Typography>
                )}
              </Box>

              <Typography variant="caption" className="users-stats-card__footer">
                {strings.STATS_REFRESH_HINT}
              </Typography>
            </Stack>
          </Paper>
        )
      })}
    </Box>
  )
}

export default UsersStatsCards
