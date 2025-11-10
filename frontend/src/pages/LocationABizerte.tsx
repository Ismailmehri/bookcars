import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Bizerte | Plany'
const description = 'Réservez votre voiture à Bizerte avec Plany. Prix compétitifs, véhicules récents.'

const faqItems = [
  {
    question: 'Accès au vieux port en voiture ?',
    answer: 'Oui, des parkings surveillés autour du vieux port permettent de stationner votre voiture de location avant de visiter la médina.',
  },
  {
    question: 'Voiture automatique possible ?',
    answer: 'Oui, plusieurs loueurs proposent des modèles automatiques et hybrides pour circuler confortablement sur la corniche de Bizerte.',
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
  name: 'Plany Bizerte',
  description,
  areaServed: 'Bizerte',
  url: 'https://plany.tn/location-voiture-pas-cher-a-bizerte',
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
  'Plany facilite votre location voiture Bizerte en vous connectant aux agences de la ville portuaire. En quelques clics, choisissez le véhicule idéal pour parcourir la corniche, rejoindre les plages de Sidi Salem ou explorer la lagune de Bizerte.',
  'Nous négocions des tarifs transparents pour garantir une location voiture pas cher Bizerte, tout en privilégiant des véhicules récents, climatisés et adaptés au relief côtier. Profitez de la liberté de vous déplacer entre le centre, Zarzouna et Menzel Jemil sans dépendre des taxis.',
  'Grâce à l’interface responsive de Plany, réservez depuis votre smartphone et recevez vos confirmations instantanément. Vous pouvez demander la livraison à votre hôtel, au port de plaisance ou à la gare ferroviaire selon votre programme.',
]

const sections = [
  {
    title: 'Pourquoi louer à Bizerte ?',
    paragraphs: [
      'Bizerte est réputée pour son vieux port, ses plages et ses fortifications. Louer une voiture vous permet d’explorer la corniche, le fort Sidi Salem, le parc Ichkeul et la région de Cap Blanc sans contrainte d’horaire. Les transports publics restent limités dans les zones balnéaires ; disposer d’un véhicule vous donne la flexibilité nécessaire pour profiter du coucher de soleil sur la corniche ou d’un déjeuner de poissons à Zarzouna.',
      'Les professionnels bénéficient aussi de la location pour rejoindre les zones industrielles de Menzel Bourguiba ou Mateur. Les routes nationales RN8 et RN11 relient Bizerte au Grand Tunis ; avec une voiture adaptée, vous gagnez du temps sur vos trajets quotidiens et pouvez transporter votre matériel en toute sécurité.',
    ],
  },
  {
    title: 'Offres à Bizerte',
    paragraphs: [
      'Plany réunit des agences locales proposant des citadines pour se garer facilement près du vieux port, des berlines confortables pour les voyages d’affaires et des SUV pour explorer les plages sauvages. Les tarifs commencent autour de 55 TND par jour en basse saison et incluent souvent l’assurance de base et l’assistance en cas de panne.',
      'Vous pouvez filtrer les résultats selon la boîte de vitesses, le type de carburant ou la présence d’options comme le GPS, le Wi-Fi ou les sièges enfant. Les loueurs partenaires garantissent des véhicules récents et des vérifications régulières pour rouler sereinement sur les routes côtières exposées au vent marin.',
    ],
  },
  {
    title: 'Réservation simple',
    paragraphs: [
      'Depuis le formulaire Plany, renseignez vos dates et lieux de prise en charge pour visualiser les offres disponibles à Bizerte. Chaque fiche présente les conditions de caution, la politique carburant, le kilométrage inclus et les modalités de restitution.',
      'Une fois votre choix validé, vous recevez un email détaillant l’adresse de l’agence, les documents nécessaires et les contacts utiles. En cas de changement de planning, notre support vous aide à décaler votre retrait ou à prolonger la location, y compris si vous devez rendre le véhicule à Tunis ou à Nabeul.',
    ],
  },
  {
    title: 'Circulation locale',
    paragraphs: [
      'Le trafic à Bizerte est fluide en dehors des heures de pointe, mais le vieux port possède des ruelles étroites. Utilisez les parkings payants autour de la marina ou près du boulevard Hédi Chaker avant de poursuivre à pied. Sur la corniche, restez vigilant aux piétons et aux cyclistes qui profitent du front de mer.',
      'Pour rejoindre les plages de Ghar El Melh ou Raf Raf, privilégiez un véhicule avec bonne motricité et vérifiez les pneus avant d’emprunter les routes secondaires. Faites le plein à Menzel Abderrahmane ou au centre-ville avant de vous éloigner des axes principaux, car les stations-service se raréfient vers Cap Angela.',
    ],
  },
  {
    title: 'Questions fréquentes',
    paragraphs: [],
  },
]

const LocationABizerte = () => (
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
      Lancez votre recherche avec Plany pour réserver en toute simplicité la voiture qui vous accompagnera sur les routes de Bizerte et de son littoral.
    </Typography>
  </Container>
)

export default LocationABizerte
