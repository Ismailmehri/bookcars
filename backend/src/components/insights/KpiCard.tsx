import React from 'react'
import { Box, Card, CardContent, Skeleton, Tooltip, Typography } from '@mui/material'

interface KpiCardProps {
  label: string
  value: React.ReactNode
  tooltip?: string
  accent?: 'primary' | 'warning'
  loading?: boolean
}

const accentColors: Record<NonNullable<KpiCardProps['accent']>, string> = {
  primary: '#1E88E5',
  warning: '#FF7A00',
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, tooltip, accent = 'primary', loading }) => {
  const content = (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardContent>
        <Typography
          variant="body2"
          component="h3"
          data-testid="kpi-card-label"
          sx={{
            fontWeight: 600,
            color: accentColors[accent],
            mb: 1,
          }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="rectangular" height={32} width="60%" />
        ) : (
          <Typography
            variant="h5"
            component="p"
            data-testid="kpi-card-value"
            sx={{ fontWeight: 700 }}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top" enterTouchDelay={0} enterDelay={0}>
        <Box data-testid="kpi-card-tooltip-trigger" sx={{ display: 'block' }}>
          {content}
        </Box>
      </Tooltip>
    )
  }

  return content
}

export default KpiCard
