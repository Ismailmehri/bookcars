import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Djerba | Plany'
const description = 'Location voiture à Djerba : profitez de votre séjour avec un véhicule adapté. Offres à partir de 55 TND/jour.'

const faqItems = [
  {
    question: 'Quel véhicule pour explorer l’île ?',
    answer: 'Optez pour une citadine pour circuler dans Houmt Souk ou un SUV pour parcourir les plages et les routes secondaires de l’île de Djerba.',
  },
  {
    question: 'Assurance tous risques ?',
    answer: 'Disponible en option selon le loueur, souvent recommandée pour couvrir vos déplacements sur l’île.',
  },
  {
    question: 'Lieux populaires ?',
    answer: 'Houmt Souk, Midoun, la plage de la Seguia, le phare de Taguermess et la synagogue de la Ghriba figurent parmi les incontournables.',
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
  name: 'Plany Djerba',
  description,
  areaServed: 'Djerba',
  url: 'https://plany.tn/location-voiture-pas-cher-a-djerba',
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
  'Avec Plany, la location voiture Djerba devient la clé pour découvrir chaque plage et chaque village de l’île sans contrainte. Notre comparateur rassemble les agences basées à l’aéroport de Djerba-Zarzis, à Houmt Souk et à Midoun pour vous proposer des véhicules adaptés à vos envies balnéaires ou culturelles.',
  'Nos offres privilégient la location voiture pas cher Djerba tout en garantissant le confort : climatisation puissante, GPS multilingue, sièges enfant et options premium pour les escapades vers les lagunes. Les véhicules sont contrôlés et prêts pour affronter les routes côtières ainsi que les pistes plus sauvages du sud de l’île.',
  'Que vous arriviez par avion ou par le bac de Jorf, l’interface Plany vous permet de réserver en quelques clics depuis votre mobile. Nous mettons à votre disposition un service client attentif pour adapter vos horaires de prise en charge, ajouter un conducteur ou organiser la restitution à votre hôtel.',
]

const sections = [
  {
    title: 'Pourquoi louer à Djerba ?',
    paragraphs: [
      'Djerba est un paradis insulaire où chaque plage offre une ambiance différente. Louer une voiture vous laisse libre de naviguer entre la vieille ville de Houmt Souk, la marina de Midoun et les villages artisanaux comme Guellala. Les transports collectifs restent limités en soirée ; disposer de votre propre véhicule vous garantit des couchers de soleil à la plage de Sidi Mahrez ou des dîners dans les restaurants de la zone touristique sans vous soucier des horaires.',
      'En choisissant Plany, vous accédez à des véhicules fiables pour parcourir les routes côtières bordées de palmiers mais aussi l’intérieur de l’île, où les oliveraies et les mosquées blanchies méritent le détour. Un SUV vous sera utile pour rejoindre les pistes menant aux plages sauvages de Ras Rmel ou aux villages berbères du sud, tandis qu’une citadine suffira pour explorer les ruelles commerçantes de Houmt Souk.',
    ],
  },
  {
    title: 'Offres sur l’île',
    paragraphs: [
      'Les agences partenaires de Plany couvrent l’ensemble de l’île de Djerba avec des points de retrait à l’aéroport, dans les hôtels et près des souks. Vous trouverez des voitures économiques idéales pour deux personnes, des berlines spacieuses pour les familles et des cabriolets pour profiter de la brise marine. Les tarifs démarrent dès 55 TND par jour hors saison et évoluent selon les périodes touristiques de mars à octobre.',
      'Pour les voyageurs souhaitant découvrir le sud tunisien, certains loueurs proposent des forfaits combinant location sur Djerba et drop-off à Tataouine ou Médenine. Vous pouvez ajouter des options telles que glacière, porte-bagages pour matériel de kitesurf ou siège bébé. Nos filtres vous aident à sélectionner les véhicules automatiques ou diesel, indispensables pour une consommation maîtrisée lors des longues traversées de l’île.',
    ],
  },
  {
    title: 'Réserver avec Plany',
    paragraphs: [
      'La réservation sur Plany se déroule en trois étapes simples : saisissez vos dates et lieux, comparez les offres disponibles, puis confirmez votre location voiture Djerba avec paiement sécurisé. Chaque fiche détaille le kilométrage inclus, les assurances, le montant de la caution et les conditions d’annulation pour vous éviter toute surprise.',
      'Notre équipe surveille la disponibilité en temps réel. Si votre vol atterrit tard le soir, vous pouvez opter pour un retrait 24/7 à l’aéroport ou demander la livraison à votre riadh. Les notifications vous accompagnent depuis la confirmation jusqu’au rappel de restitution. En cas de changement, contactez le support Plany qui coordonnera directement avec l’agence locale.',
    ],
  },
  {
    title: 'Circuler sur Djerba',
    paragraphs: [
      'Les routes principales de Djerba sont bien entretenues, mais prenez garde aux scooters et calèches qui partagent la chaussée, surtout entre Midoun et la zone touristique. Respectez les limitations, particulièrement près des écoles et des mosquées. Les parkings sont nombreux autour de Houmt Souk ; privilégiez ceux situés près de la place Hedi Chaker ou du marché central pour éviter les ruelles étroites.',
      'Si vous partez vers les plages du sud, emportez de l’eau et vérifiez la pression des pneus : le sable peut être meuble vers Ras Rmel. Pour un passage vers le continent, renseignez-vous sur les horaires du bac de Jorf et prévoyez un temps d’attente en haute saison. Les stations-service sont présentes à Ajim, Midoun et Houmt Souk ; faites le plein avant de vous lancer sur la route des ksour ou vers le désert du Sahara.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationADjerba = () => (
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
      Prêt à parcourir Djerba à votre rythme ? Lancez une recherche avec le formulaire Plany pour comparer les véhicules disponibles et réserver votre voiture en toute confiance.
    </Typography>
  </Container>
)

export default LocationADjerba
