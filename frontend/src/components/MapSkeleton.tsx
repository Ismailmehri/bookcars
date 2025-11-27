import React from 'react'
import { Box, Skeleton, Stack, Typography } from '@mui/material'

interface MapSkeletonProps {
  animate?: boolean
  title?: string
  description?: string
}

const MapSkeleton: React.FC<MapSkeletonProps> = ({ animate = false, title, description }) => (
  <Box className="map-skeleton" role="status" aria-live="polite" aria-busy>
    <Stack spacing={1} className="map-skeleton__header">
      {title && (
        <Typography variant="h6" className="map-skeleton__title">
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Stack>
    <Skeleton
      variant="rectangular"
      animation={animate ? 'pulse' : 'wave'}
      width="100%"
      height={560}
      className="map-skeleton__placeholder"
    />
  </Box>
)

export default MapSkeleton
