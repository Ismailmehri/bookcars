import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Gafsa | Plany'
const description = 'Réservez une voiture à Gafsa avec Plany. Accès simple et rapide à nos véhicules.'

const faqItems = [
  {
    question: 'Voitures 4x4 disponibles ?',
    answer: 'Oui, des 4x4 et SUV robustes sont proposés pour affronter les pistes montagneuses autour de Gafsa.',
  },
  {
    question: 'Tarif journalier moyen ?',
    answer: 'Comptez environ 60 TND par jour selon le modèle, la saison et les options sélectionnées.',
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
  name: 'Plany Gafsa',
  description,
  areaServed: 'Gafsa',
  url: 'https://plany.tn/location-voiture-pas-cher-a-gafsa',
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
  '/location-voiture-pas-cher-a-tozeur',
  '/location-voiture-pas-cher-a-kasserine',
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Opter pour une location voiture Gafsa avec Plany, c’est profiter d’un partenaire de confiance pour explorer les oasis, les carrières phosphatières et les reliefs verdoyants du sud-ouest tunisien. Nous mettons à votre disposition des offres claires et compétitives pour louer une auto pas cher adaptée à vos trajets.',
  'Vous pouvez choisir entre des berlines confortables, des citadines maniables ou des 4x4 puissants selon votre programme : visite des gorges de Selja, réunion professionnelle à Métlaoui ou escapade vers Tozeur. Toutes les voitures sont récentes, contrôlées et prêtes à partir.',
  'Le SearchForm Plany vous accompagne étape par étape : sélection des dates, comparaison des loueurs, options additionnelles comme le Wi-Fi embarqué ou le siège bébé, et confirmation instantanée par email et SMS.',
]

const sections = [
  {
    title: 'Pourquoi louer à Gafsa ?',
    paragraphs: [
      'La région de Gafsa s’étend entre montagnes et steppes, avec des sites touristiques disséminés. Disposer d’une voiture permet de relier facilement les villages miniers, les oasis de Mides ou Tamerza et la ville nouvelle. Une location voiture Gafsa vous assure la liberté de gérer vos horaires sans dépendre des transports collectifs limités.',
      'Pour les professionnels du phosphate, disposer d’un véhicule de location facilite la coordination des déplacements entre les sites industriels et les bases logistiques. Les SUV et 4x4 proposés offrent un bon compromis entre confort de route et adhérence sur les pistes.',
    ],
  },
  {
    title: 'Offres Plany à Gafsa',
    paragraphs: [
      'Plany référence les meilleures agences locales pour vous permettre de louer une auto pas cher tout en bénéficiant d’une assurance transparente. Nos partenaires incluent la climatisation, le kilométrage adapté et des options utiles comme la géolocalisation ou le porte-bagage.',
      'Pour les longs trajets, vous pouvez sélectionner des véhicules diesel ou hybrides afin d’optimiser votre consommation. Les familles apprécieront les monospaces confortables tandis que les aventuriers opteront pour un 4x4 équipé d’une garde au sol élevée afin de franchir les pistes montagneuses.',
    ],
  },
  {
    title: 'Réserver',
    paragraphs: [
      'Remplissez le formulaire de recherche Plany avec vos dates d’arrivée et de retour à Gafsa, puis laissez notre plateforme filtrer les véhicules disponibles. Comparez les caractéristiques, les assurances incluses et les conditions de caution avant de valider en ligne.',
      'Vous pouvez demander une livraison à la gare de Gafsa ou à votre hôtel. Une confirmation détaillée vous est envoyée, avec les coordonnées du loueur et les consignes de remise de clés. Le service client reste joignable si vous devez prolonger ou écourter votre location.',
    ],
  },
  {
    title: 'Conduite et région',
    paragraphs: [
      'Les routes nationales reliant Gafsa à Kasserine, Tozeur ou Sidi Bouzid sont généralement en bon état, mais les tronçons montagneux peuvent être sinueux. Prévoyez un temps de trajet suffisant et privilégiez un véhicule robuste si vous transportez du matériel.',
      'En ville, le trafic est fluide sauf aux heures d’entrée et de sortie des écoles. Respectez les limitations et anticipez les traversées piétonnes près des marchés. Pour les excursions vers les oasis, vérifiez le niveau de carburant et assurez-vous d’avoir de l’eau, surtout en période estivale.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationAGafsa: React.FC = () => (
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
      Lancez votre SearchForm, choisissez votre location voiture Gafsa idéale et prenez la route des oasis en toute confiance avec Plany.
    </Typography>
  </Container>
)

export default LocationAGafsa
