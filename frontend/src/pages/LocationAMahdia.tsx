import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Mahdia | Plany'
const description = 'Trouvez une voiture à Mahdia dès 60 TND/jour avec Plany. Rapide, pratique, économique.'

const faqItems = [
  {
    question: 'Peut-on louer près de la plage ?',
    answer: 'Oui, plusieurs agences partenaires disposent de points de retrait à proximité des hôtels et des plages de Mahdia.',
  },
  {
    question: 'Offres longue durée ?',
    answer: 'Des remises sont proposées dès 7 jours de location et des forfaits mensuels sont disponibles pour les séjours prolongés.',
  },
  {
    question: 'Voiture avec GPS ?',
    answer: 'La plupart des agences offrent l’option GPS ou des applications mobiles préinstallées pour faciliter vos trajets.',
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
  name: 'Plany Mahdia',
  description,
  areaServed: 'Mahdia',
  url: 'https://plany.tn/location-voiture-pas-cher-a-mahdia',
  sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
}

const internalLinks = createInternalLinks([
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
  '/location-voiture-pas-cher-a-sfax',
  '/location-voiture-pas-cher-a-nabeul',
  '/location-voiture-pas-cher-a-monastir',
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
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Mahdia, avec sa vieille ville fortifiée et sa mer turquoise, est l’endroit rêvé pour une escapade balnéaire authentique. En réservant une location voiture Mahdia via Plany, vous transformez votre séjour en une expérience sur mesure. Vous pouvez vous lever tôt pour admirer le lever du soleil depuis le cap Afrique, profiter des plages, puis visiter le quartier des tisserands sans dépendre des taxis.',
  'La plateforme Plany centralise les offres des agences locales pour proposer une location voiture pas cher Mahdia avec service personnalisé. Que vous recherchiez une citadine compacte pour vous faufiler dans les rues étroites de la médina ou un SUV confortable pour longer la côte vers Chebba, vous trouverez un véhicule équipé des options indispensables comme la climatisation et les aides à la conduite.',
]

const sections = [
  {
    title: 'Pourquoi louer à Mahdia ?',
    paragraphs: [
      'Mahdia est une ville où l’histoire dialogue avec la mer. Louer une voiture vous permet de relier facilement la vieille ville, le port de pêche et la zone touristique de Hiboun. Vous pouvez vous arrêter à la forteresse Borj El Kebir, flâner dans les cafés du centre, puis rejoindre la plage de Salakta pour une baignade dans une mer limpide. Avec Plany, vous choisissez le véhicule adapté à votre rythme pour profiter pleinement de chaque quartier.',
      'Les amateurs de plongée et de kitesurf apprécient la flexibilité qu’offre une voiture pour transporter leur équipement jusqu’aux spots de Ras Dimass ou de Rejiche. Les familles peuvent embarquer poussettes et glacières sans contrainte, tandis que les professionnels bénéficient d’une solution fiable pour se rendre aux rendez-vous dans les zones industrielles voisines. Louer une voiture à Mahdia via Plany, c’est garantir un séjour fluide et sans imprévu.',
    ],
  },
  {
    title: 'Offres disponibles',
    paragraphs: [
      'Plany réunit des agences basées autour de la corniche, de la gare et des grands hôtels de Mahdia. Les prix location voiture Mahdia débutent aux alentours de 60 TND par jour hors saison, avec des remises spéciales pour les réservations anticipées. Vous trouverez des citadines économiques idéales pour les déplacements urbains, des berlines confortables pour les trajets vers Sousse ou Monastir, ainsi que des minibus si vous voyagez en groupe.',
      'Pour les séjours prolongés, nos partenaires proposent des forfaits longue durée incluant l’entretien et l’assistance routière. Les options supplémentaires comme le Wi-Fi embarqué, le siège enfant ou la livraison au riad sont disponibles directement dans l’interface. Chaque fiche détaille la politique de carburant, les conditions de restitution et le montant de la caution afin de réserver en toute transparence.',
    ],
  },
  {
    title: 'Réservation facile',
    paragraphs: [
      'Réserver votre location auto Mahdia sur Plany se fait en quelques minutes. Indiquez vos dates, choisissez Mahdia ou votre hôtel comme point de retrait, puis filtrez selon vos besoins : boîte automatique, coffre spacieux, connectivité Bluetooth. Les résultats apparaissent instantanément avec les avis clients et les photos des véhicules pour vous aider à faire le bon choix.',
      'Une fois l’offre sélectionnée, le paiement sécurisé s’effectue en ligne et vous recevez immédiatement votre contrat. Vous pouvez télécharger vos pièces justificatives et communiquer avec l’agence pour toute précision. En cas d’arrivée tardive par le train ou par la route, signalez vos horaires afin que le loueur adapte la remise des clés. Notre service client reste disponible pour vous assister à chaque étape.',
    ],
  },
  {
    title: 'Conduite dans la ville',
    paragraphs: [
      'Mahdia possède des rues étroites dans la médina et des avenues larges sur la corniche. Pour visiter le centre historique, privilégiez les parkings autour de la porte Skifa Kahla et continuez à pied. En haute saison, la circulation peut être dense vers Hiboun : partez tôt pour profiter des plages et évitez les heures de pointe en fin de journée. Les routes vers Chebba et Ksour Essef sont bien entretenues, mais restez vigilant face aux traversées d’animaux dans les zones rurales.',
      'Assurez-vous que votre voiture dispose d’une climatisation efficace, surtout en été où les températures dépassent facilement les 35°C. Gardez toujours un peu de monnaie pour les parkings privés et vérifiez l’état des pneus avant une excursion sur les routes côtières. Pour les escapades nocturnes, privilégiez les axes principaux éclairés et réduisez votre vitesse à l’approche des ronds-points qui desservent la zone touristique.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationAMahdia = () => (
  <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
    <SearchForm />
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(autoRentalJsonLd)}</script>
    </Helmet>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Stack spacing={2}>
        {introductionParagraphs.map((paragraph) => (
          <Typography key={paragraph} variant="body1">
            {paragraph}
          </Typography>
        ))}
      </Stack>
    </Box>
    {sections.map((section) => (
      <Box key={section.title} component="section" sx={{ mb: 5 }}>
        <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
          {section.title}
        </Typography>
        {section.paragraphs.length > 0 ? (
          <Stack spacing={2}>
            {section.paragraphs.map((paragraph) => (
              <Typography key={paragraph} variant="body1">
                {paragraph}
              </Typography>
            ))}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {faqItems.map((item) => (
              <Accordion key={item.question} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">{item.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>
    ))}
    <Divider sx={{ mb: 4 }} />
    <Box component="section" sx={{ mb: 4 }}>
      <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
        Voir aussi
      </Typography>
      <List>
        {internalLinks.map((link) => (
          <ListItem key={link.href} disableGutters>
            <ListItemText>
              <Link href={link.href}>{link.label}</Link>
            </ListItemText>
          </ListItem>
        ))}
        <ListItem disableGutters>
          <ListItemText>
            <Link href="https://blog.plany.tn">Conseils & actus : le blog Plany</Link>
          </ListItemText>
        </ListItem>
      </List>
    </Box>
    <Box component="section" sx={{ mb: 2 }}>
      <Typography variant="body1">
        Utilisez dès maintenant le moteur de recherche Plany pour réserver votre location voiture Mahdia et profiter d’un séjour balnéaire rythmé par vos envies.
      </Typography>
    </Box>
  </Container>
)

export default LocationAMahdia
