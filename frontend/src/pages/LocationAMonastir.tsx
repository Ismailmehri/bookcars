import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Monastir | Plany'
const description = 'Réservez une voiture à Monastir au meilleur tarif avec Plany. Idéal pour visiter les plages et le centre-ville.'

const faqItems = [
  {
    question: 'Est-ce adapté aux familles ?',
    answer: 'Oui, Plany propose des monospaces, SUV et véhicules équipés de sièges enfants pour des vacances en famille à Monastir.',
  },
  {
    question: 'Peut-on louer depuis l’aéroport ?',
    answer: 'Absolument, les loueurs livrent votre véhicule à l’aéroport international Monastir Habib Bourguiba sur simple demande.',
  },
  {
    question: 'Assurance incluse ?',
    answer: 'Selon l’agence, l’assurance de base est souvent incluse et des options tous risques peuvent être ajoutées en ligne.',
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
  name: 'Plany Monastir',
  description,
  areaServed: 'Monastir',
  url: 'https://plany.tn/location-voiture-pas-cher-a-monastir',
  sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
}

const internalLinks = createInternalLinks([
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
  '/location-voiture-pas-cher-a-sfax',
  '/location-voiture-pas-cher-a-nabeul',
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
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Avec son ribat historique, sa marina moderne et ses plages dorées, Monastir mérite d’être explorée en toute liberté. Grâce à Plany, la location voiture Monastir devient simple et avantageuse. Nous comparons les offres des loueurs locaux pour vous garantir un véhicule fiable, parfaitement adapté à votre programme de vacances ou à votre déplacement professionnel.',
  'Notre plateforme vous permet de réserver une voiture de location Monastir en quelques minutes, avec des tarifs transparents et des options personnalisées. Choisissez votre modèle préféré, ajoutez des services comme la livraison à l’hôtel ou les sièges pour enfants, puis validez votre réservation en ligne. Vous pourrez ainsi longer la corniche, visiter le mausolée Bourguiba et découvrir les plages du village voisin de Sayada sans contrainte.',
]

const sections = [
  {
    title: 'Pourquoi choisir Monastir ?',
    paragraphs: [
      'Monastir est une destination balnéaire prisée, mais aussi un hub pratique pour rayonner vers Sousse, Mahdia ou Kairouan. Louer une voiture offre une flexibilité totale pour alterner journées plage et excursions culturelles. Vous pouvez rejoindre le ribat au lever du soleil, traverser le boulevard de l’Environnement pour déjeuner au port de plaisance, puis filer vers la route touristique de la Falaise pour admirer la mer en fin de journée.',
      'Les familles apprécieront le confort d’un monospace pour transporter tout le matériel de plage jusqu’à Dkhila, tandis que les couples pourront opter pour une berline élégante pour leurs escapades gastronomiques. La location voiture pas cher Monastir via Plany inclut des véhicules récents, une assistance francophone et des conseils sur les parkings surveillés à proximité des principales attractions.',
    ],
  },
  {
    title: 'Offres Plany locales',
    paragraphs: [
      'Nos partenaires répartis entre l’aéroport Habib Bourguiba, la zone hôtelière et le centre-ville offrent une large gamme de véhicules. Des citadines économiques parfaites pour se faufiler dans les rues étroites du centre aux SUV premium adaptés aux voyages sur la côte, toutes les catégories sont disponibles. Les prix location voiture Monastir commencent autour de 55 TND par jour selon la saison, avec des promotions régulières pour les réservations anticipées.',
      'Plany met en évidence les options utiles comme le kilométrage illimité, l’assistance 24/7 et les assurances renforcées. Vous trouverez aussi des véhicules automatiques, très appréciés pour circuler sur la route reliant Monastir à Skanes, ainsi que des vans pour les groupes se rendant à des événements sportifs. Les fiches détaillent la politique carburant, les équipements embarqués et la possibilité de restituer la voiture dans une autre ville tunisienne.',
    ],
  },
  {
    title: 'Réserver votre véhicule',
    paragraphs: [
      'L’interface Plany est pensée pour un parcours rapide. Indiquez vos dates, choisissez Monastir ou l’aéroport comme point de retrait, puis appliquez des filtres tels que boîte automatique, GPS intégré ou assurance tous risques. Notre système affiche immédiatement les offres disponibles et vous pouvez trier par prix, confort ou avis clients. Chaque offre de location auto Monastir est accompagnée d’un récapitulatif clair avant paiement.',
      'Après validation, vous recevez un email contenant le contrat, les conditions de caution et les instructions de prise en charge. Vous pouvez télécharger vos documents d’identité, ajouter un conducteur secondaire et chatter avec le loueur depuis votre espace Plany. Pour les arrivées nocturnes, signalez votre horaire : de nombreuses agences proposent un accueil 24/7 à l’aéroport ou dans le hall des hôtels principaux.',
    ],
  },
  {
    title: 'Conduite locale',
    paragraphs: [
      'Conduire à Monastir est globalement agréable, mais il convient de rester vigilant autour des zones touristiques où piétons et calèches partagent la chaussée. Les voies menant à la marina et au centre-ville peuvent être animées en fin de journée : privilégiez les parkings de la place du Gouvernement ou ceux de la zone de Skanes pour éviter de tourner trop longtemps. Pour rejoindre Mahdia par la route côtière, partez tôt afin de profiter d’un trafic plus fluide et de paysages marins splendides.',
      'Si vous planifiez une excursion vers les sites historiques de Kairouan, vérifiez la pression des pneus et optez pour un véhicule disposant de climatisation performante : l’intérieur des terres peut être plus chaud que le littoral. Respectez les limitations de vitesse, en particulier sur la route express reliant Monastir à Sousse où des contrôles radars sont fréquents. Les stations-service sont nombreuses, mais privilégiez celles situées sur les axes principaux pour bénéficier de services additionnels comme le gonflage gratuit.',
    ],
  },
  {
    title: 'Questions fréquentes',
    paragraphs: [],
  },
]

const LocationAMonastir = () => (
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
        Pour finaliser votre location voiture Monastir, complétez le formulaire ci-dessus, comparez les modèles disponibles et choisissez l’offre la mieux adaptée à votre séjour sur la côte sahelienne.
      </Typography>
    </Box>
  </Container>
)

export default LocationAMonastir
