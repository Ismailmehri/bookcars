import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Ben Arous | Plany'
const description = 'Louez une voiture à Ben Arous avec Plany en quelques clics. Disponibilité immédiate.'

const faqItems = [
  {
    question: 'Peut-on louer pour entreprises ?',
    answer: 'Oui, des formules professionnelles avec facturation détaillée sont proposées pour les entreprises de Ben Arous et de la zone industrielle de Mégrine.',
  },
  {
    question: 'Y a-t-il des agences ouvertes le week-end ?',
    answer: 'Plusieurs agences partenaires assurent un service le samedi et le dimanche, notamment près de la route de Mornag et de la zone portuaire de Radès.',
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
  name: 'Plany Ben Arous',
  description,
  areaServed: 'Ben Arous',
  url: 'https://plany.tn/location-voiture-pas-cher-a-ben-arous',
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
  '/location-voiture-pas-cher-a-bizerte',
  '/location-voiture-pas-cher-a-gabes',
  '/location-voiture-pas-cher-a-gafsa',
  '/location-voiture-pas-cher-a-tozeur',
  '/location-voiture-pas-cher-a-kasserine',
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Située au sud de Tunis, Ben Arous est un carrefour industriel et logistique. Avec Plany, trouvez rapidement une location voiture Ben Arous pour vos déplacements entre Mégrine, Radès, Ezzahra ou Mornag.',
  'Notre moteur compare les offres des agences locales afin de vous proposer une location voiture pas cher Ben Arous avec des véhicules entretenus, climatisés et adaptés aux trajets professionnels comme aux déplacements familiaux.',
  'Grâce à la plateforme responsive, vous pouvez réserver depuis votre bureau, votre dépôt ou votre smartphone en mission. Notre équipe accompagne les professionnels pour gérer les flottes temporaires ou les besoins ponctuels d’utilitaires.',
]

const sections = [
  {
    title: 'Pourquoi louer à Ben Arous ?',
    paragraphs: [
      'Le gouvernorat de Ben Arous englobe des zones industrielles majeures telles que Mégrine, Radès et Mornag. Disposer d’une voiture de location permet de relier facilement les sièges sociaux, les dépôts et le port de Radès sans attendre un taxi collectif. Plany vous propose des véhicules fiables pour assurer vos tournées commerciales ou vos visites de chantiers.',
      'La location est également intéressante pour les habitants qui souhaitent rejoindre rapidement Tunis centre, la banlieue sud ou les plages de Soliman. Les voitures automatiques et diesel sont populaires pour affronter le trafic de la RN1 et de l’autoroute A1, surtout aux heures de pointe. Un GPS intégré vous aide à naviguer entre les zones en travaux et les bretelles vers la route de Mornag.',
    ],
  },
  {
    title: 'Offres disponibles',
    paragraphs: [
      'Les agences partenaires de Plany à Ben Arous proposent des citadines économiques pour les déplacements quotidiens, des berlines confortables pour les managers et des utilitaires légers pour les artisans. Les tarifs débutent autour de 55 TND par jour, avec des remises progressives pour les locations de plusieurs semaines.',
      'Pour les entreprises, Plany permet d’établir des contrats personnalisés avec facturation mensuelle, suivi des conducteurs et assistance prioritaire. Vous pouvez ajouter des options comme les dispositifs de géolocalisation, les sièges enfant ou la livraison sur site à Radès port ou à la zone logistique de Bir El Bey.',
    ],
  },
  {
    title: 'Réserver en ligne',
    paragraphs: [
      'La réservation Plany est rapide : indiquez vos dates, sélectionnez Ben Arous comme lieu de prise en charge et comparez les véhicules disponibles. Chaque offre détaille la caution, la politique carburant et les assurances pour vous aider à choisir en toute transparence.',
      'Une fois la location validée, vous recevez les instructions de récupération par email et SMS. Les entreprises peuvent partager l’accès au dossier avec leurs collaborateurs pour faciliter la prise en main. Notre support est joignable pour prolonger la location, ajouter un conducteur ou organiser un aller-simple vers Tunis ou Nabeul.',
    ],
  },
  {
    title: 'Conduite locale',
    paragraphs: [
      'Ben Arous est traversée par des axes dynamiques comme la RN1, la GP1 et l’autoroute A1. Prévoyez de partir en avance durant les heures de pointe et privilégiez les voies rapides pour rejoindre Tunis. Les radars fixes sont fréquents, notamment près de Hammam Lif ; respectez les limitations pour éviter les amendes.',
      'Pour accéder aux zones portuaires de Radès, préparez vos autorisations et utilisez un véhicule adapté si vous transportez du matériel. Les parkings sont sécurisés dans la plupart des zones industrielles, mais pensez à verrouiller votre véhicule et à laisser vos documents dans la boîte à gants. En direction de Mornag, la route devient plus rurale : un SUV peut être utile en saison pluvieuse.',
    ],
  },
  {
    title: 'Questions fréquentes',
    paragraphs: [],
  },
]

const LocationABenArous = () => (
  <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
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
          {section.title.includes('Questions fréquentes') ? (
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
      Planifiez vos trajets à Ben Arous dès maintenant : remplissez le formulaire de recherche Plany pour comparer les offres disponibles et réserver la voiture idéale.
    </Typography>
  </Container>
)

export default LocationABenArous
