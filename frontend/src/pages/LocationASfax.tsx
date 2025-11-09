import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Sfax | Plany'
const description = 'Louez une voiture à Sfax avec Plany à prix mini. Accès rapide aux véhicules disponibles, 100% en ligne.'

const faqItems = [
  {
    question: 'Quel est le tarif moyen ?',
    answer: 'Selon la période et le modèle, le tarif moyen à Sfax se situe entre 50 et 70 TND par jour avec des offres dégressives.',
  },
  {
    question: 'Réservation depuis l’aéroport ?',
    answer: 'Oui, plusieurs agences livrent votre véhicule directement à l’aéroport de Sfax-Thyna pour un démarrage sans stress.',
  },
  {
    question: 'Voitures diesel disponibles ?',
    answer: 'Bien sûr, il suffit de sélectionner l’option carburant diesel lors de votre recherche pour afficher les modèles compatibles.',
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
  name: 'Plany Sfax',
  description,
  areaServed: 'Sfax',
  url: 'https://plany.tn/location-voiture-pas-cher-a-sfax',
  sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
}

const internalLinks = createInternalLinks([
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
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
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Sfax est une capitale économique en pleine effervescence, et disposer d’une voiture de location Sfax vous assure une autonomie totale entre la zone industrielle, les quartiers résidentiels de Sakiet Ezzit et la corniche de Taparura. Plany vous accompagne pour trouver rapidement une offre fiable, qu’il s’agisse d’une citadine pour se glisser autour de la médina ou d’un utilitaire pour transporter du matériel professionnel.',
  'Nos partenaires locaux misent sur la transparence et le service. Vous bénéficiez de la location voiture pas cher Sfax avec un suivi client dédié, des véhicules récents et des options pratiques comme la prise en charge express ou le retour en libre-service. Grâce à notre plateforme responsive, vous comparez les prix depuis votre bureau ou votre smartphone et vous bloquez le véhicule qui correspond à votre planning sans perdre de temps.',
]

const sections = [
  {
    title: 'Pourquoi louer à Sfax ?',
    paragraphs: [
      'Sfax est une métropole portuaire où les rendez-vous professionnels se succèdent. Louer une voiture vous permet de naviguer facilement entre la zone portuaire, le technopole de Thyna et les sièges d’entreprises installés le long de l’avenue Majida Boulila. Les transports publics restant limités aux heures creuses, disposer d’une voiture de location vous évite de subir des attentes et vous assure de respecter vos horaires.',
      'Pour les voyageurs en quête de culture, une voiture est également un atout. Vous pouvez passer d’une visite de la médina aux plages de Chaffar, ou partir explorer les oasis de Gafsa et les villages berbères de Matmata en faisant halte à Gabès. Choisir Plany, c’est profiter de recommandations locales pour optimiser vos trajets, sélectionner un véhicule climatisé et rouler l’esprit tranquille.',
    ],
  },
  {
    title: 'Offres disponibles',
    paragraphs: [
      'Plany agrège les propositions de loueurs implantés sur toute la ville de Sfax : agences proches de la gare, professionnels opérant dans la zone portuaire et loueurs indépendants situés à Sidi Mansour. Les prix location voiture Sfax sont mis à jour en temps réel pour intégrer les promotions saisonnières. Vous pouvez réserver des citadines économiques, des berlines diesel réputées pour leur sobriété sur les longues distances ou des utilitaires si vous transportez des marchandises.',
      'Les voyageurs longue durée apprécient nos formules hebdomadaires ou mensuelles avec entretien inclus. Nous mettons aussi en avant des options de location one-way permettant de restituer la voiture à Tunis ou Sousse, pratique après un road-trip professionnel. Chaque offre précise les conditions d’assurance, la politique carburant et le montant de la caution pour éviter toute surprise à la restitution.',
    ],
  },
  {
    title: 'Réserver avec Plany',
    paragraphs: [
      'Notre moteur de recherche vous invite à saisir vos dates, vos horaires et vos préférences : type de transmission, carburant, capacité de chargement. En quelques secondes, vous accédez à la liste des véhicules disponibles et vous pouvez trier par prix ou par évaluations clients. Pour une location auto Sfax depuis l’aéroport de Thyna, il suffit de sélectionner l’option livraison aéroport et d’indiquer votre numéro de vol.',
      'Le processus de paiement s’effectue sur une plateforme sécurisée conforme aux normes internationales. Une fois la réservation validée, vous recevez un récapitulatif détaillé ainsi que les coordonnées de l’agence. Vous pouvez télécharger vos documents, ajouter des conducteurs supplémentaires et échanger avec le loueur via la messagerie intégrée. En cas de changement de programme, la modification ou l’annulation se fait directement depuis votre espace client.',
    ],
  },
  {
    title: 'Conduite et routes locales',
    paragraphs: [
      'La circulation à Sfax est dense aux heures de pointe, surtout autour de la médina et sur l’axe menant à la zone industrielle. Nous recommandons de privilégier les itinéraires périphériques, comme la route GP1 vers Gabès, pour gagner du temps. Les parkings gardés près de la place de la République et de la gare ferroviaire sont pratiques pour laisser votre véhicule avant de visiter les souks à pied.',
      'Les routes régionales menant à Mahres ou Sidi Bouzid peuvent présenter des irrégularités : choisissez un véhicule avec de bons amortisseurs si vous prévoyez de fréquents déplacements hors de la ville. Pensez également à respecter les limitations, notamment sur la rocade de Sfax où les contrôles de vitesse sont fréquents. Pour les trajets de nuit, assurez-vous que votre voiture dispose d’un éclairage performant et préférez les axes principaux où l’éclairage public est présent.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationASfax = () => (
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
        Besoin d’un devis personnalisé pour votre location voiture Sfax ? Lancez votre recherche ci-dessus, comparez les offres et validez la réservation en ligne en toute simplicité.
      </Typography>
    </Box>
  </Container>
)

export default LocationASfax
