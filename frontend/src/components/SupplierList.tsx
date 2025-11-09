import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Rating,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  DirectionsCarFilled,
  RateReview as RateReviewIcon,
  Verified as VerifiedIcon,
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
  sortSuppliers,
  truncateText,
  type SupplierWithReviews,
} from '@/common/supplier'

import '@/assets/css/supplier-list.css'

const SKELETON_PLACEHOLDERS = ['one', 'two', 'three', 'four', 'five', 'six']

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<SupplierWithReviews[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithReviews | null>(null)

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

  const dialogReviews = useMemo(
    () => (selectedSupplier ? getSortedReviews(selectedSupplier) : []),
    [selectedSupplier],
  )

  const selectedSupplierReviewCount = selectedSupplier ? getReviewCount(selectedSupplier) : 0

  const closeReviewsDialog = () => {
    setReviewsDialogOpen(false)
    setSelectedSupplier(null)
  }

  const openReviewsDialog = (supplier: SupplierWithReviews) => {
    setSelectedSupplier(supplier)
    setReviewsDialogOpen(true)
  }

  if (loading) {
    return (
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        className="supplier-grid"
        columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 20 }}
      >
        {SKELETON_PLACEHOLDERS.map((placeholder) => (
          <Grid item xs={4} sm={4} md={4} lg={4} xl={4} key={`supplier-skeleton-${placeholder}`}>
            <Card className="supplier-card">
              <Skeleton variant="rectangular" height={140} animation="wave" />
              <CardHeader
                className="supplier-card__header"
                avatar={<Skeleton variant="circular" width={48} height={48} />}
                title={<Skeleton variant="text" width="60%" />}
                subheader={<Skeleton variant="text" width="40%" />}
              />
              <CardContent className="supplier-card__content">
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="rectangular" height={64} sx={{ mt: 2 }} />
              </CardContent>
              <CardActions className="supplier-card__actions">
                <Skeleton variant="rectangular" height={36} width="50%" />
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

  const renderSupplierCard = (supplier: SupplierWithReviews) => {
    const imageSrc = supplier.avatar ? bookcarsHelper.joinURL(env.CDN_USERS, supplier.avatar) : undefined
    const reviewCount = getReviewCount(supplier)
    const ratingValue = Math.min(Math.max(typeof supplier.score === 'number' ? supplier.score : Number(supplier.score ?? 0), 0), 5)
    const recentReviews = getRecentReviews(supplier)
    const supplierUrl = supplier.slug ? `https://plany.tn/search/agence/${supplier.slug}` : undefined
    const hasReviews = reviewCount > 0

    return (
      <Grid item xs={4} sm={4} md={4} lg={4} xl={4} key={supplier._id ?? supplier.slug}>
        <Card className="supplier-card" elevation={4}>
          {imageSrc ? (
            <CardMedia
              component="img"
              className="supplier-card__logo"
              image={imageSrc}
              alt={`Logo de l'agence ${supplier.fullName}`}
            />
          ) : (
            <Box className="supplier-card__media" aria-label={`Initiales de ${supplier.fullName}`}>
              <Avatar className="supplier-card__avatar">
                {supplier.fullName.charAt(0)}
              </Avatar>
            </Box>
          )}

          <CardHeader
            className="supplier-card__header"
            avatar={(
              <Avatar
                src={imageSrc}
                alt={supplier.fullName}
                sx={{ bgcolor: '#e9f2ff', color: '#003c82', fontWeight: 600 }}
              >
                {!imageSrc && supplier.fullName.charAt(0)}
              </Avatar>
            )}
            title={(
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" component="span" className="supplier-card__title">
                  {supplier.fullName}
                </Typography>
                {supplier.agencyVerified && (
                  <Chip
                    icon={<VerifiedIcon fontSize="small" />}
                    label="Agence validée"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
            )}
            subheader={(
              <Stack direction="row" spacing={1} alignItems="center" className="supplier-card__rating">
                <Rating
                  name={`rating-${supplier._id}`}
                  value={Number.isFinite(ratingValue) ? ratingValue : 0}
                  precision={0.1}
                  readOnly
                  size="small"
                  aria-label={`Note moyenne ${ratingValue.toFixed(1)} sur 5`}
                />
                <Typography variant="body2" color="text.secondary">
                  {hasReviews ? `(${reviewCount} avis)` : 'Aucun avis pour le moment'}
                </Typography>
              </Stack>
            )}
          />

          <CardContent className="supplier-card__content">
            <Box className="supplier-card__stats" mb={2}>
              <Chip
                className="supplier-card__stat supplier-card__stat--cars"
                icon={<DirectionsCarFilled fontSize="small" />}
                label={`${supplier.carCount ?? 0} voitures disponibles`}
              />
              <Chip
                className="supplier-card__stat supplier-card__stat--reviews"
                icon={<RateReviewIcon fontSize="small" />}
                label={`${reviewCount} avis`}
              />
            </Box>

            <Box className="supplier-card__reviews" aria-label="Avis récents">
              <Typography variant="subtitle1" className="supplier-card__reviews-title" gutterBottom>
                Avis récents
              </Typography>
              {recentReviews.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Soyez le premier à laisser un avis sur cette agence.
                </Typography>
              )}
              {recentReviews.map((preview) => (
                <Box key={`${supplier._id}-${preview.review._id ?? preview.review.booking}`} className="supplier-card__review">
                  <Typography variant="body2" fontWeight={600} className="supplier-card__review-author">
                    {preview.authorName}
                  </Typography>
                  <Tooltip title={preview.review.comments} placement="top" arrow>
                    <Typography variant="body2" className="supplier-card__review-text">
                      {truncateText(preview.review.comments, 140)}
                    </Typography>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </CardContent>

          <CardActions className="supplier-card__actions">
            {hasReviews && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => openReviewsDialog(supplier)}
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
      </Grid>
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
        columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 20 }}
      >
        {suppliers.map((supplier) => renderSupplierCard(supplier))}
      </Grid>
      <Dialog
        open={reviewsDialogOpen}
        onClose={closeReviewsDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="supplier-reviews-title"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          <Box>
            <Typography id="supplier-reviews-title" variant="h6" fontWeight={700} color="text.primary">
              {selectedSupplier?.fullName ?? 'Avis de l’agence'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSupplierReviewCount > 0
                ? `${selectedSupplierReviewCount} avis disponibles`
                : 'Aucun avis à afficher'}
            </Typography>
          </Box>
          <IconButton onClick={closeReviewsDialog} aria-label="Fermer la fenêtre des avis">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          {selectedSupplier && dialogReviews.length === 0 && (
            <Alert severity="info">Aucun avis n’est disponible pour cette agence.</Alert>
          )}
          {dialogReviews.length > 0 && (
            <List disablePadding>
              {dialogReviews.map((review, index) => {
                const parsedDate = review.createdAt ? new Date(review.createdAt) : undefined
                const dateIsValid = parsedDate && !Number.isNaN(parsedDate.getTime())
                const formattedDate = dateIsValid
                  ? `${bookcarsHelper.formatDatePart(parsedDate.getDate())}/${bookcarsHelper.formatDatePart(parsedDate.getMonth() + 1)}/${parsedDate.getFullYear()}`
                  : ''
                const authorName = selectedSupplier ? getReviewAuthorName(selectedSupplier, review) : undefined
                const reviewRatingRaw = typeof review.rating === 'number' ? review.rating : Number(review.rating ?? 0)
                const reviewRating = Number.isFinite(reviewRatingRaw) ? reviewRatingRaw : 0

                return (
                  <React.Fragment key={review._id ?? `${review.booking}-${index}`}>
                    <ListItem alignItems="flex-start" sx={{ pb: 2 }}>
                      <ListItemText
                        primary={(
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                              {authorName || 'Client Plany'}
                            </Typography>
                            <Rating value={reviewRating} precision={0.5} readOnly size="small" aria-label={`Note de ${reviewRating} sur 5`} />
                          </Stack>
                        )}
                        secondary={(
                          <Box mt={1}>
                            {review.comments && (
                              <Typography variant="body2" color="text.primary" sx={{ mb: formattedDate ? 1 : 0 }}>
                                {review.comments}
                              </Typography>
                            )}
                            {formattedDate && (
                              <Typography variant="caption" color="text.secondary">
                                {`Avis du ${formattedDate}`}
                              </Typography>
                            )}
                          </Box>
                        )}
                      />
                    </ListItem>
                    {index < dialogReviews.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                )
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeReviewsDialog} variant="contained" sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600 }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SupplierList
