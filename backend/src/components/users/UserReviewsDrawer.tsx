import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Button,
  Pagination,
} from '@mui/material'
import { Close as CloseIcon, Download as DownloadIcon } from '@mui/icons-material'
import * as bookcarsTypes from ':bookcars-types'
import { strings as commonStrings } from '@/lang/common'
import { strings as usersStrings } from '@/lang/users'
import * as UserService from '@/services/UserService'
import { formatDateTime } from '@/common/format'

interface UserReviewsDrawerProps {
  user?: bookcarsTypes.User
  open: boolean
  onClose: () => void
  canExport?: boolean
}

const PAGE_SIZE = 10

const UserReviewsDrawer = ({ user, open, onClose, canExport }: UserReviewsDrawerProps) => {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [reviews, setReviews] = useState<bookcarsTypes.UserReview[]>([])
  const [total, setTotal] = useState(0)
  const userId = user?._id

  const getErrorMessage = (error: unknown) => (
    error instanceof Error ? error.message : commonStrings.GENERIC_ERROR
  )

  const handleExport = () => {
    if (!reviews.length) {
      return
    }
    const headers = ['title', 'content', 'rating', 'createdAt', 'vehicle', 'reservationId']
    const csvRows = [headers.join(',')]
    reviews.forEach((review) => {
      csvRows.push([
        JSON.stringify(review.title ?? ''),
        JSON.stringify(review.content ?? ''),
        review.rating.toString(),
        JSON.stringify(review.createdAt),
        JSON.stringify(review.vehicle?.title ?? ''),
        JSON.stringify(review.reservationId ?? ''),
      ].join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${user?.fullName || 'user'}-reviews.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const loadReviews = useCallback(async () => {
    if (!userId) {
      return
    }
    try {
      setLoading(true)
      setError(undefined)
      const response = await UserService.getUserReviewsById(userId, page, PAGE_SIZE)
      setReviews(response.items)
      setTotal(response.total)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [page, userId])

  useEffect(() => {
    if (open) {
      setPage(1)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      loadReviews()
    }
  }, [open, page, loadReviews])

  const pageCount = Math.ceil(total / PAGE_SIZE)

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Box>
            <Typography variant="h6">{user?.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {usersStrings.REVIEWS_COUNT}
            </Typography>
          </Box>
          <IconButton aria-label={commonStrings.CLOSE} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {canExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ alignSelf: 'flex-start', mb: 2 }}
            onClick={handleExport}
          >
            {usersStrings.EXPORT_REVIEWS}
          </Button>
        )}
        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <CircularProgress />
          </Stack>
        )}
        {!loading && error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {!loading && !error && reviews.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {commonStrings.NO_REVIEWS_FOUND}
          </Typography>
        )}
        {!loading && !error && reviews.length > 0 && (
          <>
            <List sx={{ flex: 1, overflowY: 'auto' }}>
              {reviews.map((review) => (
                <ListItem key={review.id} alignItems="flex-start" divider>
                  <ListItemText
                    primary={(
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">{review.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(review.createdAt)}
                        </Typography>
                      </Stack>
                    )}
                    secondary={(
                      <Stack spacing={1} mt={1}>
                        <Typography variant="body2">{review.content}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {`⭐ ${review.rating.toFixed(1)}`}
                        </Typography>
                        {review.vehicle && (
                          <Typography variant="caption" color="text.secondary">
                            {`${review.vehicle.title}`}
                          </Typography>
                        )}
                      </Stack>
                    )}
                  />
                </ListItem>
              ))}
            </List>
            {pageCount > 1 && (
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                sx={{ mt: 2, alignSelf: 'center' }}
                color="primary"
              />
            )}
          </>
        )}
      </Box>
    </Drawer>
  )
}

export default UserReviewsDrawer
