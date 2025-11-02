import React from 'react'
import {
  Avatar,
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import {
  GroupsOutlined,
  BusinessOutlined,
  PersonOutlined,
  NorthEast,
  SouthEast,
} from '@mui/icons-material'
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
    icon: React.ReactElement
  }> = [
    {
      key: 'totalUsers',
      title: strings.TOTAL_USERS_LABEL,
      icon: <GroupsOutlined fontSize="medium" />,
    },
    {
      key: 'suppliers',
      title: strings.SUPPLIERS_LABEL,
      icon: <BusinessOutlined fontSize="medium" />,
    },
    {
      key: 'clients',
      title: strings.CLIENTS_LABEL,
      icon: <PersonOutlined fontSize="medium" />,
    },
  ]

  return (
    <Grid container spacing={3} data-testid="users-stats">
      {metrics.map(({ key, title, icon }) => {
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
                backgroundColor: '#fff',
                border: '1px solid #E8EEF4',
                boxShadow: '0 8px 24px rgba(15, 38, 71, 0.06)',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    variant="rounded"
                    sx={{
                      bgcolor: '#F1F4F8',
                      color: '#637083',
                      width: 48,
                      height: 48,
                    }}
                  >
                    {icon}
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    {title}
                  </Typography>
                </Stack>

                {loading ? (
                  <Skeleton variant="text" width="50%" height={40} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#0F2647' }}>
                    {metric ? metric.current.toLocaleString() : strings.NO_DATA}
                  </Typography>
                )}

                <Box display="flex" alignItems="center" gap={1.5}>
                  {loading ? (
                    <Skeleton variant="text" width={140} height={20} />
                  ) : metric ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        component="span"
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '999px',
                          backgroundColor: growthPositive ? 'rgba(46, 125, 50, 0.12)' : 'rgba(211, 47, 47, 0.12)',
                          color: growthPositive ? '#2E7D32' : '#D32F2F',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {growthPositive ? <NorthEast fontSize="small" /> : <SouthEast fontSize="small" />}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: growthPositive ? '#2E7D32' : '#D32F2F' }}>
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
