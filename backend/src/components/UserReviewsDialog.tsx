import React, { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Rating,
  Stack,
  Typography,
  Button,
  Divider,
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
      const total = Array.isArray(response.pageInfo) && response.pageInfo[0]?.totalRecords
        ? response.pageInfo[0].totalRecords
        : response.pageInfo?.totalRecords ?? 0
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

  useEffect(() => {
    if (!open) {
      setReviews([])
      setError(undefined)
    }
  }, [open])

  const totalPages = Math.max(1, Math.ceil(totalRecords / REVIEWS_PAGE_SIZE))

  const title = strings.formatString(strings.REVIEWS_TITLE, user?.fullName || strings.ANONYMOUS_USER) as string

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380, md: 420 },
          borderRadius: { xs: '24px 24px 0 0', sm: '24px 0 0 24px' },
          borderLeft: '1px solid #E8EEF4',
          backgroundColor: '#fff',
          zIndex: 1401,
        },
      }}
      ModalProps={{ keepMounted: true }}
      sx={{
        zIndex: 1401,
        '& .MuiBackdrop-root': {
          zIndex: 1401,
        },
        '& .MuiDrawer-paper': {
          zIndex: 1402,
          marginTop: { xs: '56px', sm: '64px' },
          height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
        },
      }}
    >
      <Stack height="100%">
        <Box px={3} py={3} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {strings.formatString(strings.REVIEWS_SUMMARY, totalRecords) as string}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label={commonStrings.CLOSE} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box flex={1} overflow="auto" px={3} py={2} data-testid="reviews-drawer">
          {loading && (
            <Stack alignItems="center" justifyContent="center" py={4} spacing={2}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                {commonStrings.PLEASE_WAIT}
              </Typography>
            </Stack>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

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
                            {strings.formatString(
                              strings.REVIEW_DATE,
                              new Date(review.createdAt).toLocaleString(),
                            ) as string}
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
        </Box>

        <Divider />

        <Box px={3} py={2} display="flex" justifyContent="space-between" alignItems="center">
          <Button href="/users-reviews" target="_blank" rel="noopener noreferrer">
            {strings.REVIEWS_VIEW_ALL}
          </Button>
          <Stack direction="row" spacing={2} alignItems="center">
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
            <Button onClick={onClose}>{commonStrings.CLOSE}</Button>
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  )
}

export default UserReviewsDialog
