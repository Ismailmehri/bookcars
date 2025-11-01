import React from 'react'
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { TrendingDown, TrendingUp } from '@mui/icons-material'
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
  const theme = useTheme()

  const metrics: Array<{
    key: keyof bookcarsTypes.UsersStatsResponse
    title: string
    gradient: string
  }> = [
    {
      key: 'totalUsers',
      title: strings.TOTAL_USERS_LABEL,
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    },
    {
      key: 'suppliers',
      title: strings.SUPPLIERS_LABEL,
      gradient: 'linear-gradient(135deg, #ff6b35 0%, #ff9640 100%)',
    },
    {
      key: 'clients',
      title: strings.CLIENTS_LABEL,
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
    },
  ]

  return (
    <Grid container spacing={3}>
      {metrics.map(({ key, title, gradient }) => {
        const metric = stats ? stats[key] : undefined
        const growthPositive = metric ? metric.growth >= 0 : true

        return (
          <Grid item xs={12} md={4} key={key}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                height: '100%',
                background: gradient,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, textTransform: 'uppercase', fontWeight: 600 }}>
                  {title}
                </Typography>

                {loading ? (
                  <Skeleton variant="text" width="60%" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.4)' }} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {metric ? metric.current.toLocaleString() : strings.NO_DATA}
                  </Typography>
                )}

                <Box display="flex" alignItems="center" gap={1}>
                  {loading ? (
                    <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.4)' }} />
                  ) : metric ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {growthPositive ? (
                        <TrendingUp sx={{ color: theme.palette.success.light }} />
                      ) : (
                        <TrendingDown sx={{ color: theme.palette.error.light }} />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatGrowth(metric.growth)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {strings.COMPARED_TO_PREVIOUS_MONTH}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {strings.NO_DATA}
                    </Typography>
                  )}
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
