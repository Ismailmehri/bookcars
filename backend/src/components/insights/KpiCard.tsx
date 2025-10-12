import React from 'react'
import { Card, CardContent, Skeleton, Tooltip, Typography } from '@mui/material'

interface KpiCardProps {
  label: string
  value: React.ReactNode
  helperText?: string
  tooltip?: string
  accent?: 'primary' | 'warning'
  loading?: boolean
}

const accentColors: Record<NonNullable<KpiCardProps['accent']>, string> = {
  primary: '#1E88E5',
  warning: '#FF7A00',
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, helperText, tooltip, accent = 'primary', loading }) => {
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
          variant="subtitle2"
          component="h3"
          sx={{ fontWeight: 600, color: accentColors[accent], mb: 1 }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="rectangular" height={32} width="60%" />
        ) : (
          <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}
        {helperText ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {helperText}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        <div>{content}</div>
      </Tooltip>
    )
  }

  return content
}

export default KpiCard
