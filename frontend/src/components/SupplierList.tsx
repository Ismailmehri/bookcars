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
  Grid,
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
import { Helmet } from 'react-helmet'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as SupplierService from '@/services/SupplierService'
import {
  buildSupplierStructuredData,
  getRecentReviews,
  sortSuppliers,
  truncateText,
  type SupplierWithReviews,
} from '@/common/supplier'

import '@/assets/css/supplier-list.css'

const CARD_BUTTON_BG = '#007bff'
const CARD_BUTTON_HOVER_BG = '#005fcc'
const CARD_BADGE_COLOR = '#F7931E'
const SKELETON_PLACEHOLDERS = ['one', 'two', 'three', 'four', 'five', 'six']

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState<SupplierWithReviews[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <Grid container spacing={3} className="supplier-grid">
        {SKELETON_PLACEHOLDERS.map((placeholder) => (
          <Grid item xs={12} sm={6} lg={4} key={`supplier-skeleton-${placeholder}`}>
            <Card className="supplier-card">
              <Skeleton variant="rectangular" height={160} animation="wave" />
              <CardHeader
                avatar={<Skeleton variant="circular" width={48} height={48} />}
                title={<Skeleton variant="text" width="60%" />}
                subheader={<Skeleton variant="text" width="40%" />}
              />
              <CardContent>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="rectangular" height={64} sx={{ mt: 2 }} />
              </CardContent>
              <CardActions>
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
    const reviewCount = supplier.reviewCount ?? (Array.isArray(supplier.reviews) ? supplier.reviews.length : 0)
    const ratingValue = Math.min(Math.max(typeof supplier.score === 'number' ? supplier.score : Number(supplier.score ?? 0), 0), 5)
    const recentReviews = getRecentReviews(supplier)
    const supplierUrl = supplier.slug ? `https://plany.tn/search/agence/${supplier.slug}` : undefined

    return (
      <Grid item xs={12} sm={6} lg={4} key={supplier._id ?? supplier.slug}>
        <Card className="supplier-card" elevation={4}>
          {imageSrc ? (
            <CardMedia
              component="img"
              height="160"
              image={imageSrc}
              alt={`Logo de l'agence ${supplier.fullName}`}
            />
          ) : (
            <Box className="supplier-card__media" aria-label={`Initiales de ${supplier.fullName}`}>
              <Avatar className="supplier-card__avatar" sx={{ width: 64, height: 64 }}>
                {supplier.fullName.charAt(0)}
              </Avatar>
            </Box>
          )}

          <CardHeader
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
                  {`${ratingValue.toFixed(1)} / 5 (${reviewCount} avis)`}
                </Typography>
              </Stack>
            )}
          />

          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Chip
                icon={<DirectionsCarFilled fontSize="small" />}
                label={`${supplier.carCount ?? 0} voitures disponibles`}
                sx={{
                  backgroundColor: '#eef4ff',
                  color: '#003c82',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<RateReviewIcon fontSize="small" />}
                label={`${reviewCount} avis`}
                sx={{
                  backgroundColor: '#fff3e5',
                  color: CARD_BADGE_COLOR,
                  fontWeight: 600,
                }}
              />
            </Stack>

            <Box className="supplier-card__reviews" aria-label="Avis récents">
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
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
                    <Typography variant="body2" color="text.secondary">
                      {truncateText(preview.review.comments, 140)}
                    </Typography>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </CardContent>

          <CardActions className="supplier-card__actions">
            {supplierUrl && (
              <Button
                href={supplierUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: CARD_BUTTON_BG,
                  color: '#ffffff',
                  borderRadius: '999px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: CARD_BUTTON_HOVER_BG,
                  },
                }}
              >
                Voir l’agence
              </Button>
            )}
            {!supplierUrl && (
              <Button
                disabled
                variant="outlined"
                sx={{ borderRadius: '999px', px: 3, textTransform: 'none' }}
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
      <Grid container spacing={3} className="supplier-grid">
        {suppliers.map((supplier) => renderSupplierCard(supplier))}
      </Grid>
    </>
  )
}

export default SupplierList
