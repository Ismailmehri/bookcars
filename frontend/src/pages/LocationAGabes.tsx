import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Gabès | Plany'
const description = 'Louez une voiture à Gabès et explorez le sud tunisien avec liberté.'

const faqItems = [
  {
    question: 'Quels lieux explorer ?',
    answer:
      'Depuis Gabès, rejoignez facilement Matmata, Chenini, les ksour de Tataouine ou la palmeraie de Chenini grâce à une voiture adaptée aux pistes.',
  },
  {
    question: 'Véhicules avec clim ?',
    answer: 'Oui, les agences partenaires proposent des véhicules climatisés, indispensables pour circuler dans le sud tunisien.',
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
  name: 'Plany Gabès',
  description,
  areaServed: 'Gabès',
  url: 'https://plany.tn/location-voiture-pas-cher-a-gabes',
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
  'La location voiture Gabès avec Plany offre un accès rapide aux routes du sud tunisien, qu’il s’agisse de se rendre dans les oasis, de visiter le front de mer ou de rejoindre les zones industrielles de Ghannouch. Nous comparons pour vous les offres d’agences locales afin de proposer une location voiture pas cher Gabès qui respecte votre budget tout en garantissant sécurité et confort.',
  'Les véhicules disponibles vont de la citadine agile pour circuler au centre-ville à la berline confortable idéale pour rejoindre les villages alentours. Vous trouverez également des SUV parfaitement adaptés aux routes désertiques et à la chaleur du littoral, avec climatisation renforcée pour un trajet serein.',
  'Depuis le SearchForm, réservez en quelques clics, choisissez vos options (conducteur additionnel, siège enfant, GPS) et bénéficiez d’un service client disponible pour ajuster vos horaires ou prolonger la durée de location selon vos besoins.',
]

const sections = [
  {
    title: 'Pourquoi louer à Gabès ?',
    paragraphs: [
      'Gabès est une ville carrefour entre la côte et le désert, et disposer d’une voiture de location facilite grandement vos déplacements. Vous pouvez rejoindre rapidement les quartiers de Chenini ou de Métouia, transporter vos marchandises vers la zone industrielle ou encore profiter des plages du Golfe de Gabès en adaptant votre horaire au rythme des marées.',
      'Les bus et taxis collectifs existent, mais rester flexible avec une auto Gabès est un atout lorsque vous planifiez des rendez-vous professionnels ou une excursion familiale vers Matmata et ses maisons troglodytiques. Avec Plany, vous accédez à un réseau de loueurs fiables qui vérifient chaque véhicule avant mise à disposition.',
    ],
  },
  {
    title: 'Nos offres Plany',
    paragraphs: [
      'Nous proposons une gamme de véhicules allant de la citadine économique pour circuler dans les ruelles du centre historique à la familiale spacieuse pour voyager vers Tataouine ou Douz. Chaque offre inclut le kilométrage adapté à votre itinéraire, avec la possibilité d’opter pour une assurance renforcée ou un package tout compris afin d’anticiper vos dépenses.',
      'Pour les professionnels, des utilitaires légers sont disponibles afin de transporter du matériel vers les sites pétrochimiques de Ghannouch ou les marchés agricoles. Les loueurs partenaires assurent une assistance 24/7 en cas de souci, afin que votre location voiture Gabès reste sans stress.',
    ],
  },
  {
    title: 'Comment réserver ?',
    paragraphs: [
      'Le processus de réservation Plany est simple : renseignez vos dates dans le formulaire, sélectionnez le type de véhicule et comparez instantanément les tarifs. Vous pouvez régler un acompte sécurisé en ligne ou choisir l’option paiement sur place selon les conditions de l’agence.',
      'Une fois la réservation validée, vous recevez un récapitulatif détaillé indiquant le point de retrait (gare, centre-ville ou livraison à l’hôtel) et les documents nécessaires. En cas d’imprévu, notre équipe support vous accompagne pour modifier l’heure de restitution ou ajouter des services complémentaires.',
    ],
  },
  {
    title: 'Conduite au sud',
    paragraphs: [
      'Les routes menant vers Matmata, Douz ou Kebili sont globalement bien entretenues, mais certaines pistes exigent un véhicule robuste et une conduite vigilante. Avant de partir, prévoyez de vérifier la pression des pneus et de faire le plein, car les stations-service peuvent être éloignées dans la région désertique.',
      'En ville, le trafic reste fluide en dehors des heures de sortie des usines. Respectez les limitations de vitesse, surtout à proximité des marchés et des écoles. Grâce aux véhicules climatisés, vous voyagez dans de bonnes conditions malgré les températures élevées du sud.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationAGabes: React.FC = () => (
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
      Pour chaque itinéraire entre le littoral de Gabès et les portes du désert, complétez le SearchForm Plany et réservez la voiture climatisée qui répond à vos exigences.
    </Typography>
  </Container>
)

export default LocationAGabes
