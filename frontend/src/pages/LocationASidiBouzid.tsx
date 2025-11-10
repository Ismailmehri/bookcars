import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Sidi Bouzid | Plany'
const description = 'Réservez une voiture à Sidi Bouzid avec Plany à tarif compétitif.'

const faqItems = [
  {
    question: 'Possibilité de louer pour 2 jours ?',
    answer: 'Oui, les agences partenaires acceptent les locations courtes durées à partir d’une journée.',
  },
  {
    question: 'Voiture diesel dispo ?',
    answer: 'Oui, des véhicules diesel sont disponibles sur demande selon les stocks.',
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
  name: 'Plany Sidi Bouzid',
  description,
  areaServed: 'Sidi Bouzid',
  url: 'https://plany.tn/location-voiture-pas-cher-a-sidi-bouzid',
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
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Plany facilite la location voiture Sidi Bouzid pour vos missions professionnelles, vos déplacements administratifs ou vos visites familiales. Grâce à nos partenaires locaux, vous obtenez une location pas cher et fiable, disponible en ville comme dans les villages voisins.',
  'Les agriculteurs et entrepreneurs de la région apprécient la flexibilité des véhicules utilitaires ou des pick-up disponibles sur demande. Nous proposons également des citadines économiques pour circuler dans le centre-ville et rejoindre Kasserine, Gafsa ou Sfax.',
  'Utilisez le SearchForm pour comparer instantanément les offres, vérifier la disponibilité d’un véhicule diesel ou essence, et réserver la durée exacte dont vous avez besoin.',
]

const sections = [
  {
    title: 'Pourquoi louer ici ?',
    paragraphs: [
      'Sidi Bouzid est un hub agricole majeur : louer une voiture vous permet d’organiser vos tournées sur les exploitations, de visiter les marchés hebdomadaires ou de rejoindre rapidement les délégations voisines. Les transports collectifs restent limités, surtout tôt le matin.',
      'Une auto Sidi Bouzid permet aussi de relier facilement Tunis ou Sfax via les routes nationales. Vous gérez votre agenda sans dépendre des horaires de louage, tout en bénéficiant d’un confort appréciable lors des longues distances.',
    ],
  },
  {
    title: 'Offres Plany',
    paragraphs: [
      'Plany négocie pour vous des tarifs préférentiels sur des citadines, berlines, monospaces et utilitaires légers. Chaque location inclut un contrôle technique récent et la possibilité d’ajouter des options comme le GPS ou le siège enfant.',
      'Des réductions sont proposées pour les locations de plusieurs semaines ainsi que pour les réservations professionnelles récurrentes. Nos partenaires assurent un suivi régulier et un service client réactif en cas d’imprévu.',
    ],
  },
  {
    title: 'Comment réserver ?',
    paragraphs: [
      'Renseignez vos dates sur Plany, choisissez le lieu de retrait (centre-ville, gare routière ou livraison à domicile) et comparez les disponibilités. Vous pouvez filtrer par type de carburant ou transmission.',
      'Après confirmation, vous recevez les documents nécessaires ainsi que les coordonnées du loueur pour préparer la remise des clés. Le service client peut ajuster vos horaires ou prolonger le contrat en quelques minutes.',
    ],
  },
  {
    title: 'Circulation régionale',
    paragraphs: [
      'Les routes rurales autour de Sidi Bouzid sont praticables, mais nécessitent parfois une conduite vigilante à cause des tracteurs et charrettes. Prévoir un véhicule adapté selon votre chargement est conseillé.',
      'En centre-ville, le trafic reste fluide sauf aux heures de marché. Respectez les limitations de vitesse et faites une pause régulière lors de longs trajets vers Tunis ou Sfax pour garder votre vigilance.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationASidiBouzid: React.FC = () => (
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
      Utilisez le SearchForm Plany et réservez votre location voiture Sidi Bouzid en toute simplicité pour rester mobile dans toute la région.
    </Typography>
  </Container>
)

export default LocationASidiBouzid
