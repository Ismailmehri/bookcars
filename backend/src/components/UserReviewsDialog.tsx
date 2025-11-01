import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Rating,
  Stack,
  Typography,
  Button,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/users'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'

interface UserReviewsDialogProps {
  open: boolean
  user?: bookcarsTypes.User
  onClose: () => void
}

const REVIEWS_PAGE_SIZE = 5

const UserReviewsDialog = ({ open, user, onClose }: UserReviewsDialogProps) => {
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [reviews, setReviews] = useState<bookcarsTypes.Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const loadReviews = async (currentPage: number) => {
    if (!user?._id) {
      return
    }

    try {
      setLoading(true)
      setError(undefined)
      const scope = user.type === bookcarsTypes.UserType.Supplier ? 'supplier' : 'user'

      const response = await UserService.getUserReviews(
        user._id,
        currentPage,
        REVIEWS_PAGE_SIZE,
        scope,
      )

      setReviews(response.resultData ?? [])
      const total = response.pageInfo?.totalRecords ?? 0
      setTotalRecords(total)
    } catch (err) {
      setError(strings.REVIEWS_ERROR)
      helper.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setPage(1)
    }
  }, [open, user?._id])

  useEffect(() => {
    if (open) {
      loadReviews(page)
    }
  }, [open, page])

  const totalPages = Math.max(1, Math.ceil(totalRecords / REVIEWS_PAGE_SIZE))

  const title = strings.formatString(strings.REVIEWS_TITLE, user?.fullName || strings.ANONYMOUS_USER) as string

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionProps={{ onExited: () => setReviews([]) }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <IconButton onClick={onClose} aria-label={commonStrings.CLOSE} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 240 }}>
        {loading && (
          <Stack alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={32} />
          </Stack>
        )}

        {!loading && error && (
          <Alert severity="error">{error}</Alert>
        )}

        {!loading && !error && reviews.length === 0 && (
          <Alert severity="info">{strings.NO_REVIEWS}</Alert>
        )}

        {!loading && !error && reviews.length > 0 && (
          <List disablePadding>
            {reviews.map((review, index) => (
              <React.Fragment key={review._id ?? `${review.booking}-${index}`}>
                <ListItem alignItems="flex-start" sx={{ alignItems: 'stretch', py: 2 }}>
                  <ListItemText
                    primary={(
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {strings.formatString(strings.REVIEW_ENTRY_TITLE, index + 1, review.booking) as string}
                        </Typography>
                        <Rating value={review.rating ?? 0} precision={0.5} readOnly size="small" />
                      </Stack>
                    )}
                    secondary={(
                      <Box mt={1.5}>
                        {review.comments && (
                          <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                            {review.comments}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {strings.formatString(strings.REVIEW_DATE, new Date(review.createdAt).toLocaleString()) as string}
                        </Typography>
                      </Box>
                    )}
                  />
                </ListItem>
                {index < reviews.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {strings.formatString(strings.REVIEWS_SUMMARY, totalRecords) as string}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
          <Button onClick={onClose}>{commonStrings.CLOSE}</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}

export default UserReviewsDialog
