import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Kairouan | Plany'
const description = 'Louez une voiture à Kairouan pour explorer ses sites uniques. Tarifs accessibles, réservation rapide.'

const faqItems = [
  {
    question: 'Quels lieux touristiques ?',
    answer: 'Visitez la Grande Mosquée, les bassins des Aghlabides, les souks et les sites historiques environnants en toute liberté.',
  },
  {
    question: 'Voiture possible depuis Sfax ?',
    answer: 'Oui, certaines agences acceptent les trajets en aller-simple depuis ou vers Sfax selon disponibilité et frais additionnels.',
  },
  {
    question: 'Location utilitaire possible ?',
    answer: 'Oui, Plany recense des partenaires proposant des utilitaires et des véhicules spacieux adaptés aux artisans et transporteurs.',
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
  name: 'Plany Kairouan',
  description,
  areaServed: 'Kairouan',
  url: 'https://plany.tn/location-voiture-pas-cher-a-kairouan',
  sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
}

const internalLinks = createInternalLinks([
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
  '/location-voiture-pas-cher-a-sfax',
  '/location-voiture-pas-cher-a-nabeul',
  '/location-voiture-pas-cher-a-monastir',
  '/location-voiture-pas-cher-a-mahdia',
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
  'Plany simplifie votre location voiture Kairouan avec une plateforme pensée pour vos déplacements dans la capitale spirituelle de la Tunisie. En quelques clics, vous accédez aux véhicules économiques, SUV ou utilitaires des agences locales et vous profitez de tarifs clairs adaptés à votre budget voyage ou professionnel.',
  'Que vous soyez pèlerin, amateur de patrimoine ou artisan, notre moteur compare les options pour vous aider à trouver une location voiture pas cher Kairouan incluant les assurances essentielles et la climatisation, indispensable durant les étés chauds du Sahel. Planifiez vos trajets vers la médina, les quartiers résidentiels de Bir Barrouta ou les routes vers Sbeitla en toute tranquillité.',
  'Grâce à notre interface responsive, vous réservez sur mobile en route ou sur desktop avant le départ. Plany assure un accompagnement client continu pour ajuster votre contrat, ajouter un conducteur ou gérer un aller-simple, le tout sans surprise sur la facture finale.',
]

const sections = [
  {
    title: 'Pourquoi louer à Kairouan ?',
    paragraphs: [
      'La ville de Kairouan rayonne par son histoire millénaire et son artisanat réputé. Avec une voiture de location, vous reliez facilement la Grande Mosquée Okba Ibn Nafaa, les bassins des Aghlabides et les ateliers de tapis réputés sans dépendre des bus régionaux. Plany recense des agences près de la route de Sousse ou du quartier de la République, ce qui vous permet de récupérer votre véhicule dès votre arrivée en ville.',
      'En louant une voiture, vous gagnez du temps sur vos déplacements vers les sites périphériques comme la mosquée des Trois Portes ou les villages berbères de la région. Les routes sont bien entretenues sur les axes principaux mais peuvent devenir sinueuses sur les pistes agricoles. Disposer d’un véhicule adapté vous garantit de profiter des paysages du gouvernorat sans stress, surtout si vous devez transporter des achats volumineux depuis les souks.',
    ],
  },
  {
    title: 'Offres Plany à Kairouan',
    paragraphs: [
      'Les partenaires Plany proposent une gamme complète : citadines maniables pour se faufiler dans la circulation du centre, berlines confortables pour les déplacements professionnels, et monospaces spacieux pour les familles en visite. Les prix débutent autour de 55 TND par jour pour une location voiture pas cher Kairouan, avec des remises fidélité pour les séjours prolongés. Plusieurs agences mettent à disposition des GPS multilingues et des sièges enfant homologués.',
      'Pour les artisans et commerçants se rendant aux marchés hebdomadaires, Plany référence aussi des utilitaires et des pick-up permettant de transporter marchandises et stands. Vous pouvez filtrer les résultats par type de carburant, par kilométrage inclus ou par possibilité de livraison au domicile dans les quartiers de Ras El Oued, Sidi Saad ou El Mansoura. Les loueurs partenaires s’engagent sur des véhicules récents, entretenus et équipés de climatisation performante pour supporter les températures estivales.',
    ],
  },
  {
    title: 'Comment réserver',
    paragraphs: [
      'Réserver votre voiture sur Plany se fait intégralement en ligne avec un parcours fluide. Saisissez vos dates, choisissez le lieu de prise en charge, puis comparez instantanément les offres disponibles auprès des agences de Kairouan et des villes voisines. Chaque fiche indique le montant de la caution, les conditions d’assurance et les options disponibles comme le second conducteur ou la connectivité USB, afin que vous puissiez prendre une décision éclairée.',
      'Une fois votre location sélectionnée, vous validez votre dossier grâce au paiement sécurisé et vous recevez un récapitulatif détaillé par email. Notre service client est joignable par chat et téléphone pour ajuster vos horaires si votre train arrive à la gare de Kairouan plus tard que prévu ou si vous souhaitez récupérer le véhicule à l’hôtel La Kasbah. Vous pouvez également organiser une restitution dans une autre ville grâce aux options aller-simple proposées par certains loueurs.',
    ],
  },
  {
    title: 'Conseils pour conduire',
    paragraphs: [
      'Conduire à Kairouan requiert de l’attention dans la médina où les ruelles deviennent étroites et animées. Utilisez les parkings surveillés proches de Bab Tunis ou du boulevard Farhat Hached, puis continuez à pied pour visiter les monuments. En périphérie, la route de Sousse et la RN3 vers Kasserine sont fluides, mais les heures de pointe du matin rassemblent de nombreux bus scolaires ; gardez des distances de sécurité et prévoyez un temps supplémentaire.',
      'Si vous explorez les campagnes, privilégiez un SUV ou un utilitaire avec bonne garde au sol, surtout après les épisodes de pluie qui peuvent détériorer les pistes menant aux villages de Haffouz ou Sbikha. Vérifiez régulièrement la pression des pneus et les niveaux de carburant car les stations-service se font plus rares en dehors des grands axes. Respectez enfin les limitations de vitesse et les passages piétons près des écoles coraniques et des marchés hebdomadaires très fréquentés.',
    ],
  },
  {
    title: 'Questions fréquentes',
    paragraphs: [],
  },
]

const LocationAKairouan = () => (
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
      Besoin d’organiser vos déplacements à Kairouan ? Utilisez le formulaire ci-dessus pour lancer votre recherche, comparer les agences en temps réel et réserver une voiture parfaitement adaptée à votre séjour.
    </Typography>
  </Container>
)

export default LocationAKairouan
