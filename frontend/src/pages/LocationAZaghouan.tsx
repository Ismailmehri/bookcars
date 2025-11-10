import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Zaghouan | Plany'
const description = 'Louez une voiture à Zaghouan au meilleur prix avec Plany.'

const faqItems = [
  {
    question: 'Y a-t-il des routes en bon état ?',
    answer: 'Oui, les routes principales reliant Zaghouan à Tunis, Hammamet et Bir Mcherga sont bien entretenues.',
  },
  {
    question: 'Voiture possible sans acompte ?',
    answer: 'Cela dépend de l’agence choisie ; certaines acceptent un dépôt différé ou une préautorisation.',
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
  name: 'Plany Zaghouan',
  description,
  areaServed: 'Zaghouan',
  url: 'https://plany.tn/location-voiture-pas-cher-a-zaghouan',
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
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Avec Plany, la location voiture Zaghouan devient simple et abordable pour découvrir cette ville verte adossée au Djebel Zaghouan. Que vous souhaitiez explorer les sources thermales, randonner dans la montagne ou rejoindre rapidement Hammamet, nous vous aidons à trouver l’auto idéale.',
  'Nos partenaires locaux proposent des véhicules récents, du petit modèle urbain au SUV familial, équipés pour affronter les routes vallonnées. Vous profitez d’un accompagnement personnalisé et de conditions claires, sans frais cachés.',
  'Le SearchForm vous permet de comparer les offres, de vérifier les disponibilités pour un départ immédiat et d’ajouter des options comme l’assurance premium ou le conducteur supplémentaire.',
]

const sections = [
  {
    title: 'Pourquoi louer ici ?',
    paragraphs: [
      'Zaghouan se situe à la croisée de plusieurs axes routiers reliant Tunis, Hammamet et Kairouan. Disposer d’une voiture de location vous garantit une mobilité totale pour vos rendez-vous professionnels ou vos escapades nature.',
      'Les visiteurs peuvent ainsi accéder facilement aux villages artisanaux, aux vignobles de la région et aux sites romains. Vous gérez votre temps selon vos envies, sans attendre les louages ou les bus.',
    ],
  },
  {
    title: 'Offres locales',
    paragraphs: [
      'Plany sélectionne des loueurs sérieux offrant des citadines économiques, des berlines confortables et des SUV adaptés aux routes du Djebel. Chaque contrat inclut un contrôle de sécurité et la possibilité d’ajouter le GPS, le siège bébé ou le porte-vélo.',
      'Les professionnels peuvent réserver des utilitaires légers pour transporter du matériel vers Bir Mcherga ou Zriba. Des tarifs dégressifs sont proposés pour les locations longue durée.',
    ],
  },
  {
    title: 'Réserver en ligne',
    paragraphs: [
      'Renseignez vos dates et lieux de prise en charge dans le SearchForm. Vous pouvez choisir une livraison à domicile, à la gare de Bir Mcherga ou directement à l’hôtel. Les offres apparaissent instantanément avec les détails d’assurance et de caution.',
      'Après validation, vous recevez un email récapitulatif contenant les consignes de prise en charge et les coordonnées du loueur. Notre équipe support reste disponible pour tout ajustement.',
    ],
  },
  {
    title: 'Conseils circulation',
    paragraphs: [
      'Les routes principales sont fluides, mais les chemins menant aux zones de randonnée peuvent être étroits. Vérifiez la météo avant de monter au Djebel et prévoyez un véhicule adapté si vous transportez du matériel sportif.',
      'Dans le centre-ville, garez-vous sur les parkings prévus autour de la place centrale pour profiter des cafés et des boutiques. Respectez les limitations et soyez vigilant aux cyclistes qui parcourent régulièrement la région.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationAZaghouan: React.FC = () => (
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
      Lancez votre recherche dans le SearchForm, réservez votre location voiture Zaghouan et parcourez la montagne verte avec confort et sérénité.
    </Typography>
  </Container>
)

export default LocationAZaghouan
