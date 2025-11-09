import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemAvatar,
  ListItem,
  ListItemText,
  Pagination,
  Rating,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  DirectionsCarFilled,
  LocationOnOutlined,
  Verified as VerifiedIcon,
  StarRounded,
} from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { Helmet } from 'react-helmet'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as SupplierService from '@/services/SupplierService'
import {
  buildSupplierStructuredData,
  getReviewAuthorName,
  getReviewCount,
  getRecentReviews,
  getSortedReviews,
  resolveReviewAuthorNames,
  sortSuppliers,
  truncateText,
  type SupplierReviewRecord,
  type SupplierWithReviews,
} from '@/common/supplier'

import '@/assets/css/supplier-list.css'

const SKELETON_PLACEHOLDERS = ['one', 'two', 'three', 'four', 'five', 'six']
const REVIEWS_PAGE_SIZE = 5
const REVIEW_SKELETON_PLACEHOLDERS = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']

interface SupplierCardProps {
  supplier: SupplierWithReviews
  onOpenReviews: (supplier: SupplierWithReviews) => void
}

const SupplierCard = memo(({ supplier, onOpenReviews }: SupplierCardProps) => {
  const imageSrc = supplier.avatar ? bookcarsHelper.joinURL(env.CDN_USERS, supplier.avatar) : undefined
  const reviewCount = getReviewCount(supplier)
  const numericScore = typeof supplier.score === 'number' ? supplier.score : Number(supplier.score ?? 0)
  const boundedRating = Math.min(Math.max(Number.isFinite(numericScore) ? numericScore : 0, 0), 5)
  const supplierUrl = supplier.slug ? `https://plany.tn/search/agence/${supplier.slug}` : undefined
  const recentReviews = useMemo(() => getRecentReviews(supplier), [supplier])
  const hasReviews = reviewCount > 0
  const locationLabel = supplier.location?.trim()
  const displayName = supplier.fullName || 'Agence partenaire Plany'
  const supplierInitial = displayName.charAt(0)

  const handleReviewsClick = useCallback(() => {
    onOpenReviews(supplier)
  }, [onOpenReviews, supplier])

  return (
    <Card className="supplier-card" elevation={4}>
      <Box className="supplier-card__hero">
        <Avatar
          src={imageSrc}
          alt={`Logo de l'agence ${displayName}`}
          className="supplier-card__avatar"
          imgProps={{ loading: 'lazy' }}
        >
          {!imageSrc && supplierInitial}
        </Avatar>
      </Box>
      <CardContent className="supplier-card__content">
        <Box className="supplier-card__header">
          <Box className="supplier-card__title-wrapper">
            <Typography variant="h6" component="p" className="supplier-card__title">
              {displayName}
            </Typography>
            {supplier.agencyVerified && (
              <Chip
                icon={<VerifiedIcon fontSize="small" />}
                label="Agence vérifiée"
                color="primary"
                size="small"
                className="supplier-card__badge"
              />
            )}
          </Box>
          {locationLabel && (
            <Stack direction="row" spacing={0.5} alignItems="center" className="supplier-card__location">
              <LocationOnOutlined fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {locationLabel}
              </Typography>
            </Stack>
          )}
        </Box>

        <Box className="supplier-card__stats" role="list">
          <Stack direction="row" spacing={1.5} alignItems="center" role="listitem" className="supplier-card__stats-item">
            <Rating
              name={`rating-${supplier._id ?? supplier.slug}`}
              value={boundedRating}
              precision={0.5}
              readOnly
              size="small"
              aria-label={`Note moyenne ${boundedRating.toFixed(1)} sur 5`}
            />
            {hasReviews ? (
              <Stack direction="row" spacing={0.5} alignItems="center" className="supplier-card__stats-rating">
                <StarRounded fontSize="small" />
                <Typography variant="subtitle2" className="supplier-card__stats-score">
                  {boundedRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`(${reviewCount} avis)`}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucun avis
              </Typography>
            )}
          </Stack>
          <Divider orientation="vertical" flexItem className="supplier-card__stats-divider" />
          <Stack direction="row" spacing={1} alignItems="center" role="listitem" className="supplier-card__stats-item">
            <DirectionsCarFilled fontSize="small" className="supplier-card__stats-icon" />
            <Typography variant="subtitle2" className="supplier-card__stats-value">
              {`${supplier.carCount ?? 0} voitures dispo`}
            </Typography>
          </Stack>
        </Box>

        <Box className="supplier-card__reviews" aria-label="Avis récents">
          <Typography variant="subtitle2" className="supplier-card__reviews-title">
            Avis récents
          </Typography>
          {recentReviews.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Soyez le premier à laisser un avis sur cette agence.
            </Typography>
          )}
          {recentReviews.map((preview) => (
            <Box
              key={`${supplier._id ?? supplier.slug}-${preview.review._id ?? preview.review.booking}`}
              className="supplier-card__review"
            >
              <Typography variant="body2" fontWeight={600} className="supplier-card__review-author">
                {preview.authorName}
              </Typography>
              {preview.review.comments ? (
                <Tooltip title={preview.review.comments} placement="top" arrow>
                  <Typography variant="body2" className="supplier-card__review-text">
                    {truncateText(preview.review.comments, 140)}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="body2" className="supplier-card__review-text supplier-card__review-text--muted">
                  Avis sans commentaire
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
      <CardActions className="supplier-card__actions">
        {hasReviews && (
          <Button
            variant="outlined"
            size="large"
            onClick={handleReviewsClick}
            className="supplier-card__reviews-button"
          >
            Voir les avis
          </Button>
        )}
        {supplierUrl && (
          <Button
            href={supplierUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="large"
            className="supplier-card__primary-button"
          >
            Voir l’agence
          </Button>
        )}
        {!supplierUrl && (
          <Button
            disabled
            variant="outlined"
            className="supplier-card__secondary-button"
          >
            Bientôt disponible
          </Button>
        )}
      </CardActions>
    </Card>
  )
})

SupplierCard.displayName = 'SupplierCard'

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<SupplierWithReviews[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithReviews | null>(null)
  const [dialogReviews, setDialogReviews] = useState<SupplierReviewRecord[]>([])
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [reviewsPage, setReviewsPage] = useState<number>(1)
  const [reviewsTotalPages, setReviewsTotalPages] = useState<number>(1)
  const [reviewsReloadKey, setReviewsReloadKey] = useState<number>(0)
  const dialogContentRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    let mounted = true

    const fetch = async () => {
      setLoading(true)
      try {
        const response = await SupplierService.getAllSuppliers() as SupplierWithReviews[]
        if (!mounted) {
          return
        }

        const filteredSuppliers = response
          .filter((supplier) => (
            (supplier.carCount ?? 0) > 0
            && supplier.active !== false
            && supplier.blacklisted !== true
          ))

        const sortedSuppliers = filteredSuppliers.sort(sortSuppliers)

        setSuppliers(sortedSuppliers)
        setError(null)
      } catch (err) {
        console.error('[SupplierList] Failed to fetch suppliers', err)
        if (mounted) {
          setError('Impossible de récupérer les agences pour le moment. Merci de réessayer plus tard.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetch()

    return () => {
      mounted = false
    }
  }, [])

  const structuredData = useMemo(
    () => suppliers.map((supplier) => buildSupplierStructuredData(supplier)),
    [suppliers],
  )

  const selectedSupplierReviewCount = selectedSupplier ? getReviewCount(selectedSupplier) : 0

  const closeReviewsDialog = useCallback(() => {
    setReviewsDialogOpen(false)
    setSelectedSupplier(null)
    setDialogReviews([])
    setReviewsError(null)
    setReviewsPage(1)
    setReviewsTotalPages(1)
  }, [])

  const openReviewsDialog = useCallback((supplier: SupplierWithReviews) => {
    setSelectedSupplier(supplier)
    setDialogReviews([])
    setReviewsError(null)
    setReviewsPage(1)
    setReviewsTotalPages(1)
    setReviewsDialogOpen(true)
    setReviewsReloadKey((value) => value + 1)
  }, [])

  const handleReviewsPageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setReviewsPage(value)
    setReviewsReloadKey((current) => current + 1)
  }, [])

  const handleRetryReviews = useCallback(() => {
    setReviewsError(null)
    setReviewsReloadKey((current) => current + 1)
  }, [])

  useEffect(() => {
    if (reviewsDialogOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [reviewsDialogOpen])

  useEffect(() => {
    if (reviewsDialogOpen && dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0
    }
  }, [reviewsDialogOpen, reviewsPage])

  useEffect(() => {
    if (!reviewsDialogOpen || !selectedSupplier) {
      return undefined
    }

    let isActive = true
    const supplier = selectedSupplier

    const applyFallbackReviews = () => {
      if (!isActive) {
        return false
      }

      const sorted = getSortedReviews(supplier)
      if (sorted.length === 0) {
        setDialogReviews([])
        setReviewsTotalPages(1)
        return false
      }

      const startIndex = (reviewsPage - 1) * REVIEWS_PAGE_SIZE
      const paginated = sorted
        .slice(startIndex, startIndex + REVIEWS_PAGE_SIZE)
        .map((review) => ({
          ...review,
          reviewerFullName: getReviewAuthorName(supplier, review),
        }))

      setDialogReviews(paginated)
      setReviewsTotalPages(Math.max(1, Math.ceil(sorted.length / REVIEWS_PAGE_SIZE)))
      return true
    }

    const loadReviews = async () => {
      setReviewsLoading(true)
      setReviewsError(null)

      try {
        if (!supplier._id) {
          applyFallbackReviews()
          return
        }

        const response = await SupplierService.getSupplierReviews(supplier._id, {
          page: reviewsPage,
          limit: REVIEWS_PAGE_SIZE,
        })

        if (!isActive) {
          return
        }

        const fetched = response?.resultData ?? []
        const totalRecords = response?.pageInfo?.[0]?.totalRecords ?? fetched.length

        if (fetched.length === 0 && totalRecords === 0) {
          applyFallbackReviews()
          return
        }

        const normalized = fetched.map((review) => ({
          ...review,
          reviewerFullName: review.reviewerFullName ?? getReviewAuthorName(supplier, review),
        }))

        setDialogReviews(normalized)
        setReviewsTotalPages(Math.max(1, Math.ceil(Math.max(totalRecords, normalized.length) / REVIEWS_PAGE_SIZE)))
      } catch (err) {
        console.error('[SupplierList] Unable to fetch supplier reviews', err)
        if (!applyFallbackReviews() && isActive) {
          setReviewsError('Impossible de charger les avis pour le moment. Merci de réessayer.')
        }
      } finally {
        if (isActive) {
          setReviewsLoading(false)
        }
      }
    }

    loadReviews().catch((err) => {
      console.error('[SupplierList] Unexpected reviews fetch error', err)
      if (!applyFallbackReviews() && isActive) {
        setReviewsError('Impossible de charger les avis pour le moment. Merci de réessayer.')
      }
      if (isActive) {
        setReviewsLoading(false)
      }
    })

    return () => {
      isActive = false
    }
  }, [reviewsDialogOpen, selectedSupplier, reviewsPage, reviewsReloadKey])

  if (loading) {
    return (
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        className="supplier-grid"
        columns={{ xs: 4, sm: 8, md: 12, lg: 16, xl: 20 }}
      >
        {SKELETON_PLACEHOLDERS.map((placeholder) => (
          <Grid item xs={4} sm={4} md={4} lg={4} xl={4} key={`supplier-skeleton-${placeholder}`}>
            <Card className="supplier-card" elevation={4}>
              <Box className="supplier-card__hero">
                <Skeleton variant="circular" width={72} height={72} />
              </Box>
              <CardContent className="supplier-card__content">
                <Skeleton variant="text" width="70%" height={28} />
                <Skeleton variant="text" width="45%" />
                <Box className="supplier-card__stats supplier-card__stats--skeleton">
                  <Skeleton variant="rectangular" height={28} width="100%" />
                </Box>
                <Box className="supplier-card__reviews">
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="65%" />
                </Box>
              </CardContent>
              <CardActions className="supplier-card__actions">
                <Skeleton variant="rectangular" height={36} width="48%" />
                <Skeleton variant="rectangular" height={36} width="48%" />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (error) {
    return <Alert severity="error" className="supplier-alert">{error}</Alert>
  }

  if (suppliers.length === 0) {
    return (
      <Box className="supplier-empty-state">
        <Typography variant="h6" component="p" gutterBottom>
          Aucune agence disponible pour le moment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revenez prochainement pour découvrir les nouvelles agences partenaires de Plany.tn.
        </Typography>
      </Box>
    )
  }

  return (
    <>
      {structuredData.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
      )}
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        className="supplier-grid"
        columns={{ xs: 4, sm: 8, md: 12, lg: 16, xl: 20 }}
      >
        {suppliers.map((supplier) => (
          <Grid item xs={4} sm={4} md={4} lg={4} xl={4} key={supplier._id ?? supplier.slug}>
            <SupplierCard supplier={supplier} onOpenReviews={openReviewsDialog} />
          </Grid>
        ))}
      </Grid>
      <Dialog
        open={reviewsDialogOpen}
        onClose={closeReviewsDialog}
        fullWidth
        keepMounted
        maxWidth="sm"
        aria-labelledby="supplier-reviews-title"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Box>
            <Typography id="supplier-reviews-title" variant="h6" fontWeight={700} color="text.primary">
              {selectedSupplier ? `Avis — ${selectedSupplier.fullName}` : 'Avis de l’agence'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSupplierReviewCount > 0
                ? `${selectedSupplierReviewCount} avis disponibles`
                : 'Aucun avis à afficher'}
            </Typography>
          </Box>
          <IconButton
            onClick={closeReviewsDialog}
            aria-label="Fermer la fenêtre des avis"
            ref={closeButtonRef}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent dividers ref={dialogContentRef} sx={{ px: 3 }}>
          {reviewsLoading && (
            <List disablePadding>
              {REVIEW_SKELETON_PLACEHOLDERS.map((placeholder) => (
                <ListItem key={`review-skeleton-${placeholder}`} alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={44} height={44} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton variant="text" width="60%" />}
                    secondary={(
                      <>
                        <Skeleton variant="text" width="90%" />
                        <Skeleton variant="text" width="70%" />
                      </>
                    )}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {!reviewsLoading && reviewsError && (
            <Alert
              severity="error"
              action={(
                <Button color="inherit" size="small" onClick={handleRetryReviews}>
                  Réessayer
                </Button>
              )}
              sx={{ mb: dialogReviews.length > 0 ? 3 : 0 }}
            >
              {reviewsError}
            </Alert>
          )}

          {!reviewsLoading && !reviewsError && dialogReviews.length === 0 && (
            <Alert severity="info">Aucun avis n’est disponible pour cette agence.</Alert>
          )}

          {!reviewsLoading && dialogReviews.length > 0 && (
            <List disablePadding>
              {dialogReviews.map((review, index) => {
                const parsedDate = review.createdAt ? new Date(review.createdAt) : undefined
                const dateIsValid = parsedDate && !Number.isNaN(parsedDate.getTime())
                const formattedDate = dateIsValid
                  ? `${bookcarsHelper.formatDatePart(parsedDate.getDate())}/${bookcarsHelper.formatDatePart(parsedDate.getMonth() + 1)}/${parsedDate.getFullYear()}`
                  : undefined
                const names = resolveReviewAuthorNames(selectedSupplier, review)
                const reviewRatingRaw = typeof review.rating === 'number' ? review.rating : Number(review.rating ?? 0)
                const reviewRating = Number.isFinite(reviewRatingRaw) ? reviewRatingRaw : 0

                return (
                  <React.Fragment key={review._id ?? `${review.booking}-${index}`}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#e6f0ff', color: '#003c82', fontWeight: 600 }}>
                          {names.abbreviated.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={(
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                {names.fullName}
                              </Typography>
                              {formattedDate && (
                                <Typography variant="caption" color="text.secondary">
                                  {`Avis du ${formattedDate}`}
                                </Typography>
                              )}
                            </Box>
                            <Rating
                              value={reviewRating}
                              precision={0.5}
                              readOnly
                              size="small"
                              aria-label={`Note de ${reviewRating} sur 5`}
                            />
                          </Stack>
                        )}
                        secondary={review.comments ? (
                          <Typography variant="body2" color="text.primary" sx={{ mt: 1.5 }}>
                            {review.comments}
                          </Typography>
                        ) : null}
                      />
                    </ListItem>
                    {index < dialogReviews.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                )
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          {reviewsTotalPages > 1 && (
            <Pagination
              color="primary"
              count={reviewsTotalPages}
              page={reviewsPage}
              onChange={handleReviewsPageChange}
              disabled={reviewsLoading}
              shape="rounded"
              size="medium"
            />
          )}
          <Button
            onClick={closeReviewsDialog}
            variant="contained"
            sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600 }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SupplierList
