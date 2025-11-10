import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Médenine | Plany'
const description = 'Réservez à Médenine une voiture avec Plany et partez à la découverte du sud.'

const faqItems = [
  {
    question: 'Voiture automatique possible ?',
    answer: 'Oui, des modèles automatiques sont disponibles sur demande pour plus de confort sur les longues distances.',
  },
  {
    question: 'Zones proches à visiter ?',
    answer: 'Profitez de votre voiture pour explorer Zarzis, Ben Gardane, les ksour et les oasis du sud tunisien.',
  },
]

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
  name: 'Plany Médenine',
  description,
  areaServed: 'Médenine',
  url: 'https://plany.tn/location-voiture-pas-cher-a-medenine',
  sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
}

const internalLinks = createInternalLinks([
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
  '/location-voiture-pas-cher-a-sfax',
  '/location-voiture-pas-cher-a-nabeul',
  '/location-voiture-pas-cher-a-monastir',
  '/location-voiture-pas-cher-a-mahdia',
  '/location-voiture-pas-cher-a-kairouan',
  '/location-voiture-pas-cher-a-djerba',
  '/location-voiture-pas-cher-a-ariana',
  '/location-voiture-pas-cher-a-ben-arous',
  '/location-voiture-pas-cher-a-bizerte',
  '/location-voiture-pas-cher-a-gabes',
  '/location-voiture-pas-cher-a-gafsa',
  '/location-voiture-pas-cher-a-tozeur',
  '/location-voiture-pas-cher-a-kasserine',
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'La location voiture Médenine avec Plany vous ouvre les portes du sud tunisien : route vers Zarzis, excursion à Ben Gardane ou visite des ksour du désert. Nous proposons des offres adaptées aux voyages professionnels, touristiques ou familiaux.',
  'Vous trouverez une gamme complète de véhicules : citadines économiques pour les trajets urbains, SUV robustes pour les routes désertiques et voitures automatiques pour ceux qui recherchent le confort sur les longues distances.',
  'Grâce au SearchForm Plany, comparez les tarifs, ajoutez des options comme l’assurance tous risques, le Wi-Fi embarqué ou le siège enfant, et finalisez votre réservation en quelques clics.',
]

const sections = [
  {
    title: 'Pourquoi louer ici ?',
    paragraphs: [
      'Médenine est un point de passage stratégique entre le littoral et le désert. Louer une voiture vous permet de gérer vos déplacements vers les zones industrielles, les administrations ou les sites touristiques de la région sans perdre de temps.',
      'Pour les voyageurs se rendant à Djerba ou en Libye via Ras Jedir, disposer d’une auto Médenine fiable garantit un trajet serein. Vous pouvez organiser vos étapes selon votre emploi du temps et profiter d’un confort optimal.',
    ],
  },
  {
    title: 'Nos offres locales',
    paragraphs: [
      'Plany sélectionne des agences partenaires qui entretiennent régulièrement leurs véhicules, proposent des kilomètres adaptés et des options utiles comme le GPS ou la glacière. Les tarifs restent compétitifs, même en haute saison.',
      'Nous offrons également des packages pour les professionnels : location longue durée, flotte d’entreprise, livraison sur site. Chaque contrat est transparent sur les assurances et le dépôt de garantie.',
    ],
  },
  {
    title: 'Réserver facilement',
    paragraphs: [
      'Entrez vos dates dans le formulaire Plany, choisissez votre point de retrait (centre-ville, gare routière, hôtel ou livraison à Zarzis) et comparez les véhicules disponibles. Vous pouvez filtrer par type de carburant ou transmission.',
      'Après validation, vous recevez votre confirmation détaillée, les consignes de prise en charge et les contacts du loueur. Notre support est joignable pour modifier vos horaires ou ajouter des options.',
    ],
  },
  {
    title: 'Conduite et climat',
    paragraphs: [
      'Le climat de Médenine est chaud et sec : privilégiez une voiture climatisée et vérifiez régulièrement vos niveaux d’eau et d’huile. Sur les routes désertiques, adaptez votre vitesse et évitez de circuler aux heures de forte chaleur.',
      'Les axes reliant Médenine à Zarzis et à Ben Gardane sont bien entretenus. Restez toutefois vigilant face aux vents de sable qui peuvent réduire la visibilité. Faites une pause régulière pour rester concentré.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationAMedenine: React.FC = () => (
  <Container component="main" sx={{ py: 4 }}>
    <SearchForm />
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(autoRentalJsonLd)}</script>
    </Helmet>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        {title}
      </Typography>
      <Stack spacing={2}>
        {introductionParagraphs.map((paragraph) => (
          <Typography key={paragraph} variant="body1" paragraph>
            {paragraph}
          </Typography>
        ))}
      </Stack>
    </Box>
    <Stack spacing={4}>
      {sections.map((section) => (
        <Box key={section.title}>
          <Typography variant="h2" component="h2" gutterBottom>
            {section.title}
          </Typography>
          {section.title.includes('FAQ') ? (
            <Stack spacing={2}>
              {faqItems.map((item) => (
                <Accordion key={item.question} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${item.question}-content`} id={`${item.question}-header`}>
                    <Typography variant="subtitle1">{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">{item.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          ) : (
            section.paragraphs.map((paragraph) => (
              <Typography key={paragraph} variant="body1" paragraph>
                {paragraph}
              </Typography>
            ))
          )}
        </Box>
      ))}
    </Stack>
    <Divider sx={{ my: 5 }} />
    <Box>
      <Typography variant="h2" component="h2" gutterBottom>
        Voir aussi
      </Typography>
      <List>
        {internalLinks.map((link) => (
          <ListItem key={link.href} disablePadding>
            <ListItemText>
              <Link href={link.href}>{link.label}</Link>
            </ListItemText>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemText>
            <Link href="https://blog.plany.tn">Conseils & actus : le blog Plany</Link>
          </ListItemText>
        </ListItem>
      </List>
    </Box>
    <Divider sx={{ my: 5 }} />
    <Typography variant="body1" paragraph>
      Complétez le SearchForm Plany et partez à l’aventure : votre location voiture Médenine est prête pour explorer le sud en toute liberté.
    </Typography>
  </Container>
)

export default LocationAMedenine
