import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Kasserine | Plany'
const description = 'Louez une voiture à Kasserine facilement avec Plany. Parfait pour les déplacements régionaux.'

const faqItems = [
  {
    question: 'Quels modèles adaptés à la région ?',
    answer: 'Les SUV et 4x4 sont recommandés pour affronter les routes sinueuses du Mont Chaambi et des zones rurales.',
  },
  {
    question: 'Assurance incluse ?',
    answer: 'L’assurance de base est incluse selon les agences, avec possibilité d’ajouter une couverture tous risques.',
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
  name: 'Plany Kasserine',
  description,
  areaServed: 'Kasserine',
  url: 'https://plany.tn/location-voiture-pas-cher-a-kasserine',
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
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Besoin d’une location voiture Kasserine pour vos rendez-vous professionnels ou vos excursions nature ? Plany agrège les offres des agences locales pour proposer une location pas cher fiable, adaptée aux reliefs montagneux de la région.',
  'Nos véhicules conviennent aux trajets quotidiens dans la ville, mais aussi aux escapades vers Thala, Sbeitla ou vers les stations forestières. Vous profitez de voitures récentes équipées de systèmes de sécurité modernes, de pneus renforcés et de climatisation performante.',
  'Le SearchForm Plany vous permet de comparer rapidement les tarifs, d’ajouter des options comme le siège enfant ou le conducteur additionnel et de recevoir une confirmation instantanée.',
]

const sections = [
  {
    title: 'Pourquoi louer à Kasserine ?',
    paragraphs: [
      'Kasserine est une ville stratégique entre le centre et l’ouest tunisien. Disposer d’un véhicule est indispensable pour rejoindre les sites archéologiques de Sbeitla, les villages agricoles ou les zones forestières du Mont Chaambi. Les transports collectifs étant limités, la voiture de location offre une liberté totale.',
      'Les professionnels intervenant dans les projets agricoles ou les chantiers publics apprécient la flexibilité d’une auto Kasserine prête à démarrer. Plany s’assure que chaque loueur respecte des standards de maintenance rigoureux.',
    ],
  },
  {
    title: 'Offres locales',
    paragraphs: [
      'Nos partenaires proposent des citadines économiques pour les déplacements urbains ainsi que des SUV robustes pour affronter les routes rurales. Vous pouvez opter pour une transmission automatique ou manuelle selon vos habitudes.',
      'Les forfaits incluent généralement l’assistance routière, le kilométrage étudié pour vos trajets et la possibilité de louer un GPS pour circuler dans les zones montagneuses peu balisées. Grâce à Plany, vous bénéficiez d’une location voiture pas cher Kasserine transparente, sans frais cachés.',
    ],
  },
  {
    title: 'Réservation simple',
    paragraphs: [
      'Renseignez vos dates et l’adresse de prise en charge sur notre plateforme. Les offres disponibles s’affichent immédiatement avec les détails des assurances et des cautions. Vous pouvez régler un acompte sécurisé ou choisir de payer sur place selon l’agence.',
      'Une confirmation vous est envoyée avec toutes les informations pratiques : coordonnées du loueur, documents requis et conseils pour la remise des clés. Notre support reste disponible pour toute modification ou prolongation.',
    ],
  },
  {
    title: 'Circulation montagneuse',
    paragraphs: [
      'Les routes menant vers les hauteurs du Chaambi ou les villages frontaliers peuvent être étroites et sinueuses. Un SUV ou un 4x4 offrira une meilleure adhérence, surtout en hiver lorsque les pluies rendent les chemins glissants.',
      'En ville, le trafic demeure modéré mais exige de la vigilance à proximité des marchés et établissements scolaires. Respectez les limitations et vérifiez régulièrement la pression des pneus lorsque vous empruntez des pistes non asphaltées.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationAKasserine: React.FC = () => (
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
      Lancez le SearchForm Plany, réservez votre auto Kasserine et partez explorer les montagnes tunisiennes en toute sérénité.
    </Typography>
  </Container>
)

export default LocationAKasserine
