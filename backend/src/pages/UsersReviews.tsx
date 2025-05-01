import React, { useState, useEffect, useCallback } from 'react'
import {
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Container,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  Snackbar
} from '@mui/material'
import Rating from '@mui/material/Rating'
import { CommentOutlined, PersonOutline, DateRangeOutlined } from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import * as bookcarsTypes from ':bookcars-types'
import Avatar from '@/components/Avatar'
import Pager from '@/components/Pager'
import * as UserService from '@/services/UserService'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'

import '@/assets/css/users-reviews.css'

// Interface pour les types d'avis
interface ReviewData {
  _id: string
  receiverFullName: string
  receiverEmail: string
  reviewerFullName: string
  reviewerEmail: string
  reviewerAvatar: string
  rating: number
  comments: string
  createdAt: string
  booking: string
  rentedCar: boolean
  answeredCall: boolean
  canceledLastMinute: boolean
}

interface ReviewsResponse {
  currentPage: number
  totalReviews: number
  reviews: ReviewData[]
}

const UsersReviews = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: '', // user ou supplier
    search: '',
  })

  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [totalRecords, setTotalRecords] = useState(0)
  const [toastOpen, setToastOpen] = useState(false)
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [admin, setAdmin] = useState(false)

const onLoad = (_user?: bookcarsTypes.User) => {
  if (_user) {
    setUser(_user)
    setAdmin(helper.admin(_user))
  }
}

// Mémoriser fetchReviews avec useCallback
const fetchReviews = useCallback(async () => {
  setLoading(true)
  setError(null)
  try {
    const response = await UserService.getUsersReviews({
      type: filters.type,
      search: filters.search,
      page,
      limit,
    }) as ReviewsResponse

    setReviews(response.reviews || [])
    setTotalRecords(response.totalReviews)

    if (response.reviews.length === 0 && response.totalReviews > 0) {
      setPage(1)
    }
  } catch (err) {
    console.error('Erreur lors du chargement des avis:', err)
    setError('Impossible de charger les avis. Veuillez réessayer plus tard.')
    setToastOpen(true)
  } finally {
    setLoading(false)
  }
}, [filters.type, filters.search, page, limit, setLoading, setError, setReviews, setTotalRecords, setPage, setToastOpen])

// Ensuite dans useEffect
useEffect(() => {
  fetchReviews()
}, [fetchReviews]) // fetchReviews sera recréée uniquement quand ses dépendances changent

  // Gérer les changements dans les filtres
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }))
  }

  // Appliquer les filtres
  const applyFilters = () => {
    setPage(1) // Réinitialiser à la première page lors de l'application des filtres
    fetchReviews()
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      type: '',
      search: '',
    })
    setPage(1)
    fetchReviews()
  }

  // Gérer la pagination
  const handleNextPage = () => {
    setPage(page + 1)
  }

  const handlePreviousPage = () => {
    setPage(Math.max(1, page - 1))
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Layout onLoad={onLoad} user={user} strict>
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, mb: 6 }}>
          <Divider sx={{ mb: 4 }} />

          {/* Section de filtres */}
          <Paper sx={{ p: 3, mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              {commonStrings.FILTER_REVIEWS}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <TextField
                  label={commonStrings.SEARCH_BY_NAME_OR_EMAIL}
                  fullWidth
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="type-select-label">{commonStrings.USER_TYPE}</InputLabel>
                  <Select
                    labelId="type-select-label"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label={commonStrings.USER_TYPE}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">{commonStrings.ALL_TYPES}</MenuItem>
                    <MenuItem value="user">{commonStrings.USER}</MenuItem>
                    <MenuItem value="supplier">{commonStrings.SUPPLIER}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={applyFilters}
                    sx={{
                      borderRadius: 2,
                      height: '56px'
                    }}
                  >
                    {commonStrings.APPLY_FILTERS}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={resetFilters}
                    sx={{
                      borderRadius: 2,
                      height: '56px'
                    }}
                  >
                    {commonStrings.RESET}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Section d'affichage des avis */}
          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {commonStrings.LOADING_REVIEWS}
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 4 }}>
              {error}
            </Alert>
          ) : reviews.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {reviews.map((review) => (
                  <Grid item xs={12} md={4} key={`${review?._id}-${review.createdAt}`}>
                    <Card
                      elevation={3}
                      sx={{
                      borderRadius: 3,
                      overflow: 'visible',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }
                    }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* Informations de l'évaluateur */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar record={{ fullName: review?.reviewerFullName, avatar: review?.reviewerAvatar }} readonly size="medium" />
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="h6">{review?.reviewerFullName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {review?.reviewerEmail}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <PersonOutline fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {commonStrings.REVIEW_FOR}
                                :
                                <strong>{review?.receiverFullName}</strong>
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Note et commentaires */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {commonStrings.RATING}
                            :
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating
                              value={review?.rating}
                              precision={0.5}
                              readOnly
                              size="large"
                            />
                            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                              {review?.rating}
                              /5
                            </Typography>
                          </Box>
                        </Box>

                        {review?.comments && (
                          <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                              <CommentOutlined fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                              <Typography variant="subtitle1" fontWeight="medium">
                                {commonStrings.COMMENTS}
                                :
                              </Typography>
                            </Box>
                            <Typography variant="body1">
                              {review?.comments}
                            </Typography>
                          </Box>
                        )}

                        {/* Informations supplémentaires */}
                        <Box sx={{ mt: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Chip
                                icon={review?.rentedCar ? <CheckCircleIcon /> : <CancelIcon />}
                                label={`${commonStrings.RENTED_CAR}: ${review?.rentedCar ? commonStrings.YES : commonStrings.NO}`}
                                color={review?.rentedCar ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ width: '100%' }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Chip
                                icon={review?.answeredCall ? <CheckCircleIcon /> : <CancelIcon />}
                                label={`${commonStrings.ANSWERED_CALL}: ${review.answeredCall ? commonStrings.YES : commonStrings.NO}`}
                                color={review?.answeredCall ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ width: '100%' }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Chip
                                icon={review?.canceledLastMinute ? <CheckCircleIcon /> : <CancelIcon />}
                                label={`${commonStrings.CANCELED_LAST_MINUTE}: ${review?.canceledLastMinute ? commonStrings.YES : commonStrings.NO}`}
                                color={!review?.canceledLastMinute ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ width: '100%' }}
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Date de création */}
                        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <DateRangeOutlined fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(review?.createdAt)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              <Box sx={{ mt: 4 }}>
                <Pager
                  page={page}
                  pageSize={limit}
                  totalRecords={totalRecords}
                  rowCount={reviews.length}
                  onNext={handleNextPage}
                  onPrevious={handlePreviousPage}
                />
              </Box>
            </>
          ) : (
            <Paper
              sx={{
                p: 4,
                mt: 4,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: 'rgba(0,0,0,0.02)'
              }}
            >
              <Typography variant="h6" color="text.secondary">
                {commonStrings.NO_REVIEWS_FOUND}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {commonStrings.TRY_DIFFERENT_FILTERS}
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>

      {/* Notification toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  )
}

export default UsersReviews
