import React from 'react'
import { Avatar, Box, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material'
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
    gradient: string
    iconBg: string
    iconColor: string
  }> = [
    {
      key: 'totalUsers',
      title: strings.TOTAL_USERS_LABEL,
      iconLabel: '👥',
      gradient: 'linear-gradient(135deg, #E0ECFF 0%, #F5F9FF 100%)',
      iconBg: 'rgba(37, 99, 235, 0.15)',
      iconColor: '#0F172A',
    },
    {
      key: 'suppliers',
      title: strings.SUPPLIERS_LABEL,
      iconLabel: '🏢',
      gradient: 'linear-gradient(135deg, #FFE8D8 0%, #FFF4EA 100%)',
      iconBg: 'rgba(249, 115, 22, 0.15)',
      iconColor: '#7C2D12',
    },
    {
      key: 'clients',
      title: strings.CLIENTS_LABEL,
      iconLabel: '💬',
      gradient: 'linear-gradient(135deg, #E5F8E5 0%, #F4FFF4 100%)',
      iconBg: 'rgba(16, 185, 129, 0.18)',
      iconColor: '#064E3B',
    },
  ]

  return (
    <Grid container spacing={3} data-testid="users-stats">
      {metrics.map((metricConfig) => {
        const metric = stats ? stats[metricConfig.key] : undefined
        const growthPositive = metric ? metric.growth >= 0 : true

        return (
          <Grid item xs={12} md={4} key={metricConfig.key}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.75, md: 3.25 },
                borderRadius: 4,
                height: '100%',
                background: metricConfig.gradient,
                border: '1px solid rgba(15, 23, 42, 0.06)',
                boxShadow: '0 18px 34px rgba(15, 23, 42, 0.08)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 24px 45px rgba(15, 23, 42, 0.12)',
                },
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    variant="rounded"
                    sx={{
                      bgcolor: metricConfig.iconBg,
                      color: metricConfig.iconColor,
                      width: 48,
                      height: 48,
                      fontSize: '1.65rem',
                      fontWeight: 600,
                    }}
                    aria-hidden
                  >
                    {metricConfig.iconLabel}
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    {metricConfig.title}
                  </Typography>
                </Stack>

                {loading ? (
                  <Skeleton variant="text" width="55%" height={42} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F172A' }}>
                    {metric ? metric.current.toLocaleString() : strings.NO_DATA}
                  </Typography>
                )}

                <Box display="flex" alignItems="center" gap={1.5}>
                  {loading ? (
                    <Skeleton variant="text" width={160} height={22} />
                  ) : metric ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="span"
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '999px',
                          backgroundColor: growthPositive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(211, 47, 47, 0.14)',
                          color: growthPositive ? '#047857' : '#B91C1C',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {growthPositive ? <NorthEast fontSize="small" /> : <SouthEast fontSize="small" />}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: growthPositive ? '#047857' : '#B91C1C' }}>
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

                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    {strings.STATS_REFRESH_HINT}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default UsersStatsCards
