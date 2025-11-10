import React, { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Paper,
  Stack,
  Chip,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import StarIcon from '@mui/icons-material/Star'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import RouteIcon from '@mui/icons-material/Route'
import { Helmet } from 'react-helmet'
import type { LatLngExpression } from 'leaflet'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'
import Seo from '@/components/Seo'
import SearchForm from '@/components/SearchForm'
import Map from '@/components/Map'
import HowItWorks from '@/components/HowItWorks'
import SupplierCarrousel from '@/components/SupplierCarrousel'
import RentalAgencySection from '@/components/RentalAgencySection'
import * as SupplierService from '@/services/SupplierService'
import type * as bookcarsTypes from ':bookcars-types'
import MiniImage from '@/assets/img/mini.png'
import MidiImage from '@/assets/img/midi.png'
import MaxiImage from '@/assets/img/maxi.png'
import { pickCrosslinks, labelFromSlug } from '@/components/location/utils'
import {
  buildFaqSchema,
  buildOfferCatalogSchema,
  buildLocalBusinessSchema,
} from '@/components/location/schema'

export type AdvantageIcon = 'price' | 'car' | 'support' | 'experience' | 'comfort'

export interface AdvantageItem {
  icon: AdvantageIcon
  title: string
  description: string
}

export interface NearbyDestination {
  name: string
  description: string
  image: string
  link: string
  imageAlt?: string
}

export interface VehicleCategory {
  name: string
  price: number
  description: string
  features: string[]
}

export type StatIcon = 'car' | 'support' | 'star' | 'experience'

export interface StatItem {
  icon: StatIcon
  value: string
  label: string
  description: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface MapConfig {
  position: LatLngExpression
  zoom?: number
  description: string
}

export interface HeroContent {
  headline: string
  subheading: string
  paragraphs: string[]
}

export interface CtaContent {
  title: string
  description: string
}

export interface LocationLandingPageProps {
  city: string
  slug: string
  title: string
  metaDescription: string
  hero: HeroContent
  advantages: AdvantageItem[]
  nearbyDestinations: NearbyDestination[]
  nearbyIntro: string
  vehicleIntro: string
  vehicleCategories: VehicleCategory[]
  map: MapConfig
  stats: StatItem[]
  statsIntro: string
  faqItems: FaqItem[]
  faqIntro: string
  internalLinks: string[]
  blogUrl: string
  cta: CtaContent
  crosslinkIntro?: string
  seoKeywords?: {
    principal?: string[]
    secondaires?: string[]
    semantiques?: string[]
  }
  jsonLd?: Array<Record<string, unknown>> | Record<string, unknown>
  seoNote?: string
}

const iconForAdvantage = (icon: AdvantageIcon) => {
  switch (icon) {
    case 'price':
      return <AttachMoneyIcon color="primary" />
    case 'support':
      return <SupportAgentIcon color="primary" />
    case 'experience':
      return <EmojiEventsIcon color="primary" />
    case 'comfort':
      return <RouteIcon color="primary" />
    case 'car':
    default:
      return <DirectionsCarIcon color="primary" />
  }
}

const iconForStat = (icon: StatIcon) => {
  switch (icon) {
    case 'support':
      return <SupportAgentIcon />
    case 'star':
      return <StarIcon />
    case 'experience':
      return <EmojiEventsIcon />
    case 'car':
    default:
      return <DirectionsCarIcon />
  }
}

const formatVehicleImage = (name: string) => {
  if (/mini/i.test(name)) {
    return MiniImage
  }
  if (/midi/i.test(name)) {
    return MidiImage
  }
  return MaxiImage
}

const LocationLandingPage: React.FC<LocationLandingPageProps> = ({
  city,
  slug,
  title,
  metaDescription,
  hero,
  advantages,
  nearbyDestinations,
  nearbyIntro,
  vehicleIntro,
  vehicleCategories,
  map,
  stats,
  statsIntro,
  faqItems,
  faqIntro,
  internalLinks,
  blogUrl,
  cta,
  crosslinkIntro,
  seoKeywords,
  jsonLd,
  seoNote,
}) => {
  const canonicalUrl = useMemo(() => `https://plany.tn${slug}`, [slug])
  const [suppliers, setSuppliers] = useState<bookcarsTypes.User[]>([])
  const [supplierState, setSupplierState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')

  useEffect(() => {
    let mounted = true
    const loadSuppliers = async () => {
      setSupplierState('loading')
      try {
        const result = await SupplierService.getAllSuppliers()
        if (!mounted) {
          return
        }
        setSuppliers(result)
        setSupplierState('success')
      } catch {
        if (mounted) {
          setSupplierState('error')
        }
      }
    }

    loadSuppliers()

    return () => {
      mounted = false
    }
  }, [])

  const defaultJsonLd = useMemo(() => {
    const faqSchema = buildFaqSchema(faqItems)
    const offerCatalogSchema = buildOfferCatalogSchema(city, canonicalUrl, vehicleCategories)
    const localBusinessSchema = buildLocalBusinessSchema(city, canonicalUrl, metaDescription, blogUrl)
    return [localBusinessSchema, faqSchema, offerCatalogSchema]
  }, [blogUrl, canonicalUrl, city, faqItems, metaDescription, vehicleCategories])

  const additionalJsonLd = useMemo(() => {
    if (!jsonLd) {
      return []
    }
    if (Array.isArray(jsonLd)) {
      return jsonLd
    }
    return [jsonLd]
  }, [jsonLd])

  const allJsonLd = useMemo(() => [...defaultJsonLd, ...additionalJsonLd], [additionalJsonLd, defaultJsonLd])

  const crosslinks = useMemo(() => pickCrosslinks(internalLinks, 4), [internalLinks])

  const keywordList = useMemo(() => {
    if (!seoKeywords) {
      return undefined
    }
    const { principal = [], secondaires = [], semantiques = [] } = seoKeywords
    return [...new Set([...principal, ...secondaires, ...semantiques])]
  }, [seoKeywords])

  return (
    <Layout strict={false}>
      <Seo title={title} description={metaDescription} canonical={canonicalUrl} keywords={keywordList} />
      <Helmet>
        {allJsonLd.map((schema) => {
          const record = schema as Record<string, unknown>
          const key = typeof record['@type'] === 'string' ? (record['@type'] as string) : JSON.stringify(record)

          return (
            <script key={key} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          )
        })}
      </Helmet>

      <Box
        component="section"
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #0f4c81 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography
              variant="h1"
              sx={{ fontWeight: 800, fontSize: { xs: 32, sm: 38, md: 48 }, lineHeight: 1.15 }}
            >
              {hero.headline}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 500, opacity: 0.9 }}>
              {hero.subheading}
            </Typography>
            {hero.paragraphs.map((paragraph) => (
              <Typography
                key={paragraph}
                variant="body1"
                sx={{ fontSize: { xs: 16, md: 17 }, maxWidth: 840, lineHeight: 1.8 }}
              >
                {paragraph}
              </Typography>
            ))}
            <Box
              sx={{
                width: '100%',
                maxWidth: 880,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 3,
                boxShadow: '0 10px 30px rgba(10,30,80,0.25)',
                p: { xs: 2, md: 3 },
              }}
            >
              <SearchForm />
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <Chip label="Tarifs transparents" color="primary" variant="outlined" />
              <Chip label="Annulation flexible" variant="outlined" />
              <Chip label="Assistance locale 7j/7" variant="outlined" />
              <Chip label="Partenaires vérifiés" variant="outlined" />
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1.5 }}>
          {`Pourquoi choisir Plany à ${city} ?`}
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: 'center', mb: 5, color: 'text.secondary', maxWidth: 840, mx: 'auto' }}
        >
          {`Un réseau d'agences locales certifiées, une plateforme fluide et des options adaptées à vos projets à ${city}.`}
        </Typography>
        <Grid container spacing={3}>
          {advantages.map((advantage) => (
            <Grid item xs={12} md={6} lg={3} key={advantage.title}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 2,
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  {iconForAdvantage(advantage.icon)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {advantage.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {advantage.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: '#f5f8fb', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
            {`Explorer les environs de ${city}`}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 720 }}>
            {nearbyIntro}
          </Typography>
          <Grid container spacing={4}>
            {nearbyDestinations.map((destination) => (
              <Grid item xs={12} md={4} key={destination.name}>
                <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea href={destination.link} sx={{ flexGrow: 1 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={destination.image}
                      alt={destination.imageAlt ?? destination.name}
                    />
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {destination.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.7 }}>
                        {destination.description}
                      </Typography>
                      <Button variant="contained" color="primary">
                        Louer une voiture
                      </Button>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          {crosslinkIntro && crosslinks.length > 0 && (
            <Typography variant="body1" sx={{ mt: 4, color: 'text.secondary' }}>
              {`${crosslinkIntro} `}
              {crosslinks.map((link, index) => (
                <React.Fragment key={link}>
                  <Link href={link} underline="hover">
                    {labelFromSlug(link)}
                  </Link>
                  {index < crosslinks.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
              .
            </Typography>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
          {`Les véhicules préférés à ${city}`}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 720 }}>
          {vehicleIntro}
        </Typography>
        <Grid container spacing={4}>
          {vehicleCategories.map((vehicle) => (
            <Grid item xs={12} md={4} key={vehicle.name}>
              <Paper
                elevation={2}
                sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <Box
                  component="img"
                  src={formatVehicleImage(vehicle.name)}
                  alt={vehicle.name}
                  sx={{ height: 120, objectFit: 'contain', alignSelf: 'center' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {vehicle.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
                  {`À partir de ${vehicle.price} TND / jour`}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {vehicle.description}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {vehicle.features.map((feature) => (
                    <Chip key={feature} label={feature} size="small" />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: '#0f172a', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1.5 }}>
            Les loueurs plébiscitent Plany
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: 4, opacity: 0.85 }}
          >
            {`Nos partenaires partagent leurs flottes afin d'offrir le meilleur choix à ${city}. Découvrez-les ci-dessous.`}
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: 'rgba(15,23,42,0.6)' }}>
            {supplierState === 'loading' && (
              <Stack alignItems="center" spacing={2}>
                <CircularProgress color="inherit" />
                <Typography variant="body2">Chargement des agences partenaires...</Typography>
              </Stack>
            )}
            {supplierState === 'error' && (
              <Typography variant="body2" color="error" textAlign="center">
                Impossible de charger les logos des partenaires pour le moment. Réessayez plus tard.
              </Typography>
            )}
            {supplierState === 'success' && suppliers.length === 0 && (
              <Typography variant="body2" textAlign="center">
                Les agences locales seront bientôt affichées ici.
              </Typography>
            )}
            {supplierState === 'success' && suppliers.length > 0 && (
              <SupplierCarrousel suppliers={suppliers} />
            )}
          </Paper>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#f5f8fb' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
            {`Nos points de retrait à ${city}`}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 720 }}>
            {map.description}
          </Typography>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Map position={map.position} initialZoom={map.zoom ?? 11} className="location-map" />
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1.5 }}>
          {`Plany ${city} en chiffres`}
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: 'center', mb: 5, color: 'text.secondary', maxWidth: 720, mx: 'auto' }}
        >
          {statsIntro}
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 48, height: 48 }}>
                  {iconForStat(stat.icon)}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {stat.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {stat.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: '#f9fafc', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1.5 }}>
            {`FAQ location voiture ${city}`}
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
            {faqIntro}
          </Typography>
          {faqItems.map((faqItem) => (
            <Accordion key={faqItem.question} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {faqItem.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {faqItem.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <HowItWorks />
      </Container>

      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: 'linear-gradient(135deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.05) 100%)',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
              {cta.title}
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', maxWidth: 680 }}>
              {cta.description}
            </Typography>
            <Box sx={{ width: '100%', backgroundColor: 'white', borderRadius: 3, p: { xs: 2, md: 3 }, boxShadow: 3 }}>
              <SearchForm />
            </Box>
            {crosslinks.length > 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                <Box component="span">Envie de comparer d’autres destinations ? Découvrez aussi </Box>
                {crosslinks.map((link, index) => (
                  <React.Fragment key={link}>
                    <Link href={link} underline="hover">
                      {labelFromSlug(link)}
                    </Link>
                    {index < crosslinks.length - 1 ? ', ' : ''}
                  </React.Fragment>
                ))}
                <Box component="span"> ou consultez nos conseils sur </Box>
                <Link href={blogUrl} underline="hover">
                  le blog Plany
                </Link>
                <Box component="span">.</Box>
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      {seoNote && (
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 5 } }}>
          <Paper elevation={1} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
              {seoNote}
            </Typography>
          </Paper>
        </Container>
      )}

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <RentalAgencySection />
      </Container>

      <Footer />
    </Layout>
  )
}

export default LocationLandingPage
