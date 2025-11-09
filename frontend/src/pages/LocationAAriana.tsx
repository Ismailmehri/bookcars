import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Ariana | Plany'
const description = 'Réservez une voiture à Ariana avec Plany. Accès facile, bons prix, service rapide.'

const faqItems = [
  {
    question: 'Y a-t-il des agences au centre-ville ?',
    answer: 'Oui, plusieurs partenaires se situent près des stations de métro léger et des grands axes d’Ariana Ville.',
  },
  {
    question: 'Citadines disponibles ?',
    answer: 'Vous trouverez un large choix de citadines et de compactes idéales pour circuler dans les quartiers résidentiels et les zones d’affaires.',
  },
  {
    question: 'Assistance en ligne ?',
    answer: 'Plany propose un support client en ligne pour modifier votre réservation, ajouter un conducteur ou prolonger la location.',
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
  name: 'Plany Ariana',
  description,
  areaServed: 'Ariana',
  url: 'https://plany.tn/location-voiture-pas-cher-a-ariana',
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
  '/location-voiture-pas-cher-a-ben-arous',
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
  'Besoin d’une location voiture Ariana pour gérer vos déplacements professionnels ou familiaux dans le Grand Tunis ? Plany compare pour vous les offres des agences situées près de l’avenue Habib Bourguiba d’Ariana, d’Ennasr ou de la Soukra afin de trouver le véhicule qui répond à vos attentes.',
  'Notre priorité est de proposer une location voiture pas cher Ariana sans sacrifier la qualité : véhicules récents, climatisation efficace et assistance 24/7. Que vous deviez rejoindre le centre de Tunis, l’aéroport ou les zones industrielles du Kram, vous disposez d’une voiture prête à démarrer quand vous le souhaitez.',
  'L’expérience Plany est responsive et sécurisée. Depuis votre smartphone, validez votre réservation, suivez votre dossier et recevez les confirmations de prise en charge. Le support client reste disponible pour adapter vos horaires et faciliter vos trajets dans la banlieue nord.',
]

const sections = [
  {
    title: 'Pourquoi louer à Ariana ?',
    paragraphs: [
      'Ariana bénéficie d’un emplacement stratégique à quelques minutes du centre de Tunis, tout en offrant un cadre résidentiel verdoyant. Louer une voiture vous permet d’enchaîner vos rendez-vous dans les quartiers d’Ennasr, de Menzah et de la Soukra sans dépendre du métro léger souvent bondé aux heures de pointe. Avec Plany, vous choisissez un véhicule parfaitement adapté à vos trajets quotidiens comme à vos escapades vers la Marsa ou La Goulette.',
      'La ville compte de nombreux centres commerciaux tels que Carrefour La Marsa ou Tunis City, ainsi que des établissements d’enseignement et de santé. Une voiture de location vous offre la liberté de déposer les enfants à l’école, de faire vos courses et de rejoindre l’aéroport Tunis-Carthage en moins de quinze minutes. Les options hybrides ou automatiques, très demandées, sont disponibles pour réduire la consommation sur les boulevards urbains.',
    ],
  },
  {
    title: 'Offres locales Plany',
    paragraphs: [
      'Les agences partenaires de Plany à Ariana proposent un large éventail de catégories : citadines économiques pour se garer facilement près de la municipalité, berlines confortables pour les rendez-vous d’affaires et SUV pour les familles. Les tarifs commencent autour de 60 TND par jour, avec des remises pour les réservations hebdomadaires et les formules longue durée dédiées aux expatriés.',
      'Vous pouvez personnaliser votre location en ajoutant un siège enfant, un Wi-Fi embarqué ou un système GPS couvrant le Grand Tunis. Certaines agences offrent la livraison du véhicule à domicile à Ennasr ou à l’aéroport, ainsi qu’une assistance multilingue. Les contrats incluent des assurances claires et la possibilité de sélectionner un kilométrage illimité pour vos trajets vers les plages de Gammarth.',
    ],
  },
  {
    title: 'Réserver une voiture',
    paragraphs: [
      'Le processus Plany est intuitif : indiquez vos dates et lieux de prise en charge, comparez les offres détaillées et choisissez celle qui correspond à votre budget. Chaque fiche précise le dépôt de garantie, la politique carburant et les options de paiement pour garantir une transparence totale.',
      'Après confirmation, vous recevez un email récapitulatif et des rappels automatiques avant votre départ. Si votre vol atterrit à Tunis-Carthage tard dans la nuit, demandez une récupération 24/7 ou planifiez une livraison à votre domicile. Notre équipe reste joignable pour prolonger votre location ou ajouter un conducteur si vos plans changent.',
    ],
  },
  {
    title: 'Conduite à Ariana',
    paragraphs: [
      'La circulation à Ariana peut être dense aux heures de pointe, en particulier sur l’avenue de l’UMA et la route X20. Anticipez vos trajets en choisissant une voiture compacte pour faciliter les manœuvres et utilisez les parkings structurés autour des centres commerciaux. Les voies sont bien éclairées, mais restez vigilant aux scooters qui circulent entre les files.',
      'Pour vos déplacements vers la Soukra ou les jardins d’El Menzah, privilégiez les itinéraires via la route de l’aéroport afin d’éviter les zones en travaux. Les stations-service sont nombreuses, notamment le long de la GP9. Pensez à vérifier la disponibilité des parkings résidentiels si vous séjournez dans des quartiers privés et respectez les limitations de vitesse proches des établissements scolaires.',
    ],
  },
  {
    title: 'Questions fréquentes',
    paragraphs: [],
  },
]

const LocationAAriana = () => (
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
      Pour vos trajets quotidiens ou vos escapades vers la banlieue nord, remplissez le formulaire Plany et réservez rapidement la voiture idéale à Ariana.
    </Typography>
  </Container>
)

export default LocationAAriana
