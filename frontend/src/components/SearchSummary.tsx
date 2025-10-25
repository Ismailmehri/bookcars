import React from 'react'
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/search'

type SearchSummaryProps = {
  pickupLocation?: bookcarsTypes.Location;
  dropOffLocation?: bookcarsTypes.Location;
  from?: Date;
  to?: Date;
  loading?: boolean;
  onEdit?: () => void;
  onOpenMap?: () => void;
}

const formatDate = (date?: Date) => {
  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const SearchSummary = ({ pickupLocation, dropOffLocation, from, to, loading, onEdit, onOpenMap }: SearchSummaryProps) => {
  if (loading) {
    return (
      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: 'common.white', boxShadow: 1 }}>
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        backgroundColor: 'common.white',
        boxShadow: 1,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
      }}
    >
      <Stack spacing={1}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {strings.SUMMARY_TITLE}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {strings.SUMMARY_SUBTITLE}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
          {pickupLocation && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {strings.SUMMARY_PICKUP}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {pickupLocation.name}
              </Typography>
            </Box>
          )}
          {dropOffLocation && dropOffLocation._id !== pickupLocation?._id && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {strings.SUMMARY_DROPOFF}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {dropOffLocation.name}
              </Typography>
            </Box>
          )}
          {from && to && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {strings.SUMMARY_DATES}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {`${formatDate(from)} → ${formatDate(to)}`}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
        <Button variant="outlined" color="primary" onClick={onEdit} fullWidth>
          {strings.EDIT_SEARCH}
        </Button>
        <Button variant="contained" color="primary" onClick={onOpenMap} fullWidth>
          {strings.VIEW_ON_MAP}
        </Button>
      </Stack>
    </Box>
  )
}

export default SearchSummary
