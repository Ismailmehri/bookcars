import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Nabeul | Plany'
const description = 'Location de voiture à Nabeul à prix pas cher avec Plany. Large choix, réservation rapide, assistance locale.'

const faqItems = [
  {
    question: 'Quels sont les lieux à visiter ?',
    answer: 'Autour de Nabeul, explorez Korba, Hammamet et les plages de Maamoura facilement en voiture.',
  },
  {
    question: 'Voiture possible en aller-simple ?',
    answer: 'Oui, selon les agences partenaires, vous pouvez restituer la voiture dans une autre ville moyennant un supplément.',
  },
  {
    question: 'Véhicules disponibles ?',
    answer: 'Les agences proposent des citadines, SUV, familiales et quelques modèles décapotables pour la côte.',
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
  name: 'Plany Nabeul',
  description,
  areaServed: 'Nabeul',
  url: 'https://plany.tn/location-voiture-pas-cher-a-nabeul',
  sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
}

const internalLinks = createInternalLinks([
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
  '/location-voiture-pas-cher-a-sfax',
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
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Nabeul est l’une des villes côtières les plus attachantes du Cap Bon. Pour profiter de ses poteries artisanales, de ses plages familiales et des marchés parfumés, optez pour une location voiture Nabeul sur Plany. Vous gardez la liberté de circuler entre le centre-ville, les zones touristiques de Hammamet Nord et les villages agricoles qui font la réputation du gouvernorat.',
  'En quelques clics, vous comparez les offres de voiture de location Nabeul proposées par nos partenaires locaux. Notre moteur met en avant les prix, les équipements et les conditions de chaque loueur afin que vous puissiez réserver en toute confiance. Que vous recherchiez une compacte économique pour vous garer près du souk ou un SUV avec coffre généreux pour transporter planches et parasols, la solution se trouve sur Plany.',
]

const sections = [
  {
    title: 'Avantages de louer à Nabeul',
    paragraphs: [
      'La région de Nabeul est riche en découvertes : plages de sable fin, vignobles, ateliers de céramique et marchés traditionnels. En louant une voiture via Plany, vous évitez les contraintes des horaires de bus et vous optimisez vos journées. Vous pouvez commencer par le musée archéologique de Nabeul, poursuivre par un déjeuner à Dar Chaabane, puis finir l’après-midi sur la plage de Sidi Mahersi sans dépendre d’un taxi.',
      'La location voiture pas cher Nabeul est également idéale pour les familles qui souhaitent transporter facilement poussettes, glacières et équipement de snorkeling. Les routes sont bien entretenues jusqu’à Korba et Beni Khiar, et nos partenaires proposent des options siège enfant, GPS et conduite automatique pour un confort maximal. En choisissant Plany, vous profitez d’une assistance locale et d’informations actualisées sur les meilleurs parkings du centre et les axes à privilégier en haute saison.',
    ],
  },
  {
    title: 'Nos offres Plany',
    paragraphs: [
      'Plany référence des loueurs fiables basés à Nabeul-ville, à Hammamet et dans les stations balnéaires voisines. Nos partenaires disposent de flottes variées : citadines hybrides pour limiter la consommation, berlines confortables pour les trajets professionnels et minibus pour les groupes d’amis se rendant aux festivals d’été. Les prix location voiture Nabeul sont affichés de manière claire avec les assurances incluses et les options supplémentaires disponibles.',
      'Pour les séjours prolongés, nous négocions des tarifs dégressifs dès cinq jours. Vous pouvez également réserver une location aller simple et restituer le véhicule à Tunis-Carthage ou à l’aéroport d’Enfidha selon vos besoins. Chaque fiche véhicule précise la politique carburant, le kilométrage et les conditions de dépôt de garantie afin de réserver sereinement.',
    ],
  },
  {
    title: 'Réservation simple',
    paragraphs: [
      'Notre interface responsive permet de réserver votre location auto Nabeul depuis un ordinateur, une tablette ou un smartphone. Indiquez vos dates, votre lieu de prise en charge et vos filtres préférés : boîte automatique, coffre spacieux, climatisation renforcée. Les résultats s’affichent instantanément et vous pouvez comparer les offres selon le prix, la note utilisateur ou les services inclus comme la livraison à l’hôtel.',
      'Une fois l’offre choisie, vous validez vos informations personnelles et procédez au paiement sécurisé. Vous recevez immédiatement votre contrat de location ainsi que les coordonnées de l’agence. Notre service client francophone reste disponible pour ajuster vos horaires de remise ou ajouter un conducteur secondaire. En cas d’arrivée tardive, indiquez-le dès la réservation pour que le loueur adapte son planning.',
    ],
  },
  {
    title: 'Conseils de circulation',
    paragraphs: [
      'Nabeul bénéficie d’un réseau routier côtier agréable, mais la fréquentation augmente dès le printemps. Préférez les plages tôt le matin pour éviter les bouchons sur l’avenue Habib Bourguiba. À l’entrée du centre, stationnez dans les parkings surveillés pour rejoindre le souk à pied et profiter des échoppes colorées. Les routes menant vers Hammamet sont rapides, mais gardez un œil sur les radars fixes et les ralentisseurs à l’approche des zones urbaines.',
      'Si vous prévoyez d’explorer l’intérieur du Cap Bon, comme Takelsa ou le parc de Kélibia, choisissez un véhicule doté d’une bonne tenue de route. La climatisation est vivement recommandée en été et certaines agences fournissent des pare-soleil pour protéger les enfants. Avant de quitter la ville, vérifiez l’état de la route P1 qui relie Nabeul à Tunis : elle peut être chargée en période de vacances, pensez donc à anticiper votre temps de trajet.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationANabeul = () => (
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
        Prêt pour la route ? Entrez vos dates dans le formulaire de recherche, explorez les offres de location voiture Nabeul et réservez le véhicule qui accompagnera votre séjour au Cap Bon.
      </Typography>
    </Box>
  </Container>
)

export default LocationANabeul
