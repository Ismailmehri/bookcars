import React from 'react'
import {
  Container,
  Box,
  Typography,
  Stack,
  Link,
  Divider,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { pickCrosslinks, labelFromSlug } from '@/components/location/utils'

export interface SectionContent {
  title: string
  paragraphs: string[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface LocationPageTemplateProps {
  city: string
  slug: string
  title: string
  description: string
  introductionParagraphs: string[]
  sections: SectionContent[]
  faqItems: FaqItem[]
  internalLinks: string[]
  autoRentalName?: string
}

const defaultIntroduction = [
  'Réservez votre voiture de location au meilleur prix sur Plany. Comparez les offres locales, choisissez un véhicule adapté (citadine, SUV, familiale) et découvrez la ville en toute liberté.',
  'Processus simple et sécurisé : sélection, options, validation. Tarifs transparents, partenaires vérifiés, assistance en ligne.',
]

const defaultSectionParagraphs = [
  'Compléter un paragraphe utile et localisé : avantages de la location (flexibilité), sites/axes/parkings pertinents, conseils concrets.',
  'Deuxième paragraphe avec informations pratiques : circulation, périodes, options utiles (automatique, clim, siège bébé).',
]

const LocationPageTemplate: React.FC<LocationPageTemplateProps> = ({
  city,
  slug,
  title,
  description,
  introductionParagraphs,
  sections,
  faqItems,
  internalLinks,
  autoRentalName,
}) => {
  const canonicalUrl = `https://plany.tn${slug}`
  const resolvedIntroduction = introductionParagraphs.length > 0 ? introductionParagraphs : defaultIntroduction
  const resolvedSections = sections.length > 0 ? sections : [{ title: 'Informations pratiques', paragraphs: defaultSectionParagraphs }]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  const autoRentalJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: autoRentalName ?? `Plany ${city}`,
    description,
    areaServed: city,
    url: canonicalUrl,
    sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
  }

  const crossLinks = pickCrosslinks(internalLinks, 3)

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <SearchForm />
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(autoRentalJsonLd)}</script>
      </Helmet>
      <Box
        sx={{
          mt: 2,
          mb: 4,
          p: { xs: 2.5, md: 4 },
          borderRadius: 3,
          background: (theme) => `linear-gradient(180deg, ${theme.palette.primary.light}22 0%, ${theme.palette.background.paper} 100%)`,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => (
            theme.palette.mode === 'light'
              ? '0 6px 24px rgba(0,0,0,0.06)'
              : '0 6px 24px rgba(0,0,0,0.3)'
          ),
        }}
      >
        <Typography variant="h1" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 1, fontSize: { xs: 32, sm: 38, md: 48 } }}>
          {title}
        </Typography>
        <Stack spacing={1.5}>
          {resolvedIntroduction.map((paragraph, index) => (
            <Typography key={paragraph + index.toString()} variant="body1" sx={{ fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.7 }}>
              {paragraph}
            </Typography>
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Chip label="Meilleurs prix" size="small" color="primary" variant="outlined" />
          <Chip label="Réservation en ligne" size="small" variant="outlined" />
          <Chip label="Partenaires vérifiés" size="small" variant="outlined" />
          <Chip label="Annulation flexible (selon offre)" size="small" variant="outlined" />
        </Stack>
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Stack spacing={3}>
        {resolvedSections.map((section) => (
          <Paper
            key={section.title}
            component="section"
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700, fontSize: { xs: 22, md: 28 }, mb: 1.5 }}>
              {section.title}
            </Typography>
            {section.paragraphs.length > 0 && (
              <Stack spacing={1.5}>
                {section.paragraphs.map((paragraph) => (
                  <Typography key={paragraph} variant="body1" sx={{ fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.7 }}>
                    {paragraph}
                  </Typography>
                ))}
              </Stack>
            )}
            {section.title.toLowerCase().includes('questions fréquentes') && (
              <Stack spacing={1.25} sx={{ mt: section.paragraphs.length > 0 ? 2 : 0 }}>
                {faqItems.map((faqItem) => (
                  <Accordion key={faqItem.question} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: 16, md: 17 } }}>
                        {faqItem.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ fontSize: { xs: 15, md: 16 }, lineHeight: 1.7 }}>
                        {faqItem.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>
      {crossLinks.length > 0 && (
        <Typography variant="body1" sx={{ mt: 4, fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.7 }}>
          <Box component="span">Besoin d’idées pour prolonger votre séjour ? Jetez un œil à nos offres à </Box>
          {crossLinks.map((link, index) => (
            <React.Fragment key={link}>
              <Link href={link} underline="hover">
                {labelFromSlug(link)}
              </Link>
              {index < crossLinks.length - 1 ? <Box component="span">, </Box> : <Box component="span"> </Box>}
            </React.Fragment>
          ))}
          <Box component="span">ou parcourez nos conseils pratiques sur </Box>
          <Link href="https://blog.plany.tn" underline="hover">
            le blog Plany
          </Link>
          <Box component="span">.</Box>
        </Typography>
      )}
      <Typography variant="body1" sx={{ mt: 2, fontSize: { xs: 15.5, md: 16.5 }, lineHeight: 1.7 }}>
        {`Prêt à découvrir ${city} en toute liberté ? Comparez les offres et réservez votre voiture dès maintenant avec Plany via le formulaire ci-dessus.`}
      </Typography>
    </Container>
  )
}

export default LocationPageTemplate
