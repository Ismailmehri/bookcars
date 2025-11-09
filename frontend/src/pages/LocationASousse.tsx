import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet-async'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Sousse | Plany'
const description = 'Réservez une voiture à Sousse facilement sur Plany. Profitez de nos offres économiques et d’une réservation rapide.'

const faqItems = [
  {
    question: 'Quels sont les prix à Sousse ?',
    answer: 'Les tarifs démarrent dès 50 TND par jour selon la saison, le type de véhicule et la durée de location choisie via Plany.',
  },
  {
    question: 'Types de véhicules disponibles ?',
    answer: 'Nos partenaires à Sousse proposent des SUV, des citadines pour circuler en centre-ville et des boîtes automatiques idéales pour la corniche.',
  },
  {
    question: 'Y a-t-il livraison hôtel ?',
    answer: 'Oui, plusieurs agences partenaires peuvent livrer votre voiture directement à votre hôtel ou résidence de vacances à Sousse.',
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
  name: 'Plany Sousse',
  description,
  areaServed: 'Sousse',
  url: 'https://plany.tn/location-voiture-pas-cher-a-sousse',
  sameAs: ['https://plany.tn', 'https://blog.plany.tn'],
}

const internalLinks = createInternalLinks([
  '/location-voiture-pas-cher-a-tunis',
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
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Envie de profiter du meilleur de la ville de Sousse sans perdre de temps dans les transports ? Avec Plany, la location voiture Sousse devient un jeu d’enfant. Nous comparons pour vous les offres locales afin de vous proposer la solution la plus économique, que vous ayez besoin d’une citadine agile pour parcourir l’avenue Habib Bourguiba ou d’un SUV confortable pour explorer les quartiers résidentiels de Hammam Sousse.',
  'Notre plateforme a été pensée pour offrir une expérience fluide, rapide et sécurisée. Vous choisissez votre voiture de location Sousse, vous validez vos options et, en quelques clics, vous recevez la confirmation. Les tarifs sont transparents, sans frais cachés, et de nombreuses agences partenaires incluent déjà les assurances nécessaires pour circuler sereinement le long de la corniche ou vers Port El Kantaoui.',
]

const sections = [
  {
    title: 'Pourquoi louer une voiture à Sousse ?',
    paragraphs: [
      'Sousse attire chaque année des milliers de visiteurs grâce à ses plages au sable fin, son port de plaisance et sa médina classée à l’UNESCO. En louant votre véhicule avec Plany, vous gagnez un temps précieux pour passer du centre historique aux stations balnéaires. Vous évitez les horaires parfois irréguliers des taxis collectifs et vous gardez le contrôle de votre planning. La location voiture pas cher Sousse est idéale pour les familles souhaitant se déplacer confortablement, mais aussi pour les voyageurs d’affaires qui doivent enchaîner réunions et rencontres avec leurs partenaires locaux.',
      'Circuler en autonomie vous permet également de profiter des alentours de Sousse. Une voiture de location bien équipée vous conduit en moins de trente minutes vers Hergla pour admirer ses falaises, ou vers la ville voisine de Monastir en longeant les complexes hôteliers. Grâce à Plany, vous comparez les offres incluant climatisation, GPS et options enfant, indispensables pour rouler dans le confort durant l’été tunisien.',
    ],
  },
  {
    title: 'Nos offres à Sousse',
    paragraphs: [
      'Les partenaires Plany installés à Sousse couvrent l’ensemble des besoins : citadines économiques pour se stationner facilement près du souk, berlines premium pour vos rendez-vous professionnels, ou encore monospaces et SUV si vous voyagez en famille. Les prix location voiture Sousse démarrent autour de 50 TND par jour hors saison et évoluent avec les pics estivaux. Nous mettons en avant les offres incluant kilométrage illimité, second conducteur gratuit ou livraison à l’hôtel, de manière à rendre votre séjour aussi flexible que possible.',
      'Pour les séjours plus longs, nos loueurs proposent des remises progressives dès la quatrième journée et des formules mensuelles adaptées aux travailleurs nomades. Certaines agences offrent des véhicules automatiques, très appréciés pour rouler dans les zones touristiques de Khezama et d’El Kantaoui où la circulation est dense aux heures de pointe. Chaque fiche véhicule détaille le niveau de confort, la consommation estimée et les conditions d’assurance, vous permettant de faire un choix éclairé en quelques instants.',
    ],
  },
  {
    title: 'Comment réserver sur Plany ?',
    paragraphs: [
      'La réservation se déroule en ligne, sur desktop comme sur mobile, grâce à une interface responsive testée pour répondre aux standards d’accessibilité. Dès que vous indiquez vos dates, notre moteur compare les disponibilités en temps réel chez nos partenaires locaux. Vous pouvez filtrer par boîte automatique, type de carburant ou présence d’options telles que siège bébé et Wi-Fi embarqué. Une fois votre location auto Sousse sélectionnée, il ne vous reste qu’à valider la caution et à charger vos documents d’identité. Le contrat est envoyé par email et reste consultable dans votre espace client.',
      'Plany accepte les paiements sécurisés par carte internationale et propose des notifications pour suivre chaque étape : confirmation, rappel de prise en charge et consignes de restitution. Si votre avion atterrit à l’aéroport international de Monastir Habib Bourguiba, vous pouvez demander une livraison directement à l’aérogare ou à votre hôtel sur la zone touristique. En cas d’imprévu, notre service client disponible en ligne vous assiste pour modifier vos horaires ou ajouter un conducteur supplémentaire.',
    ],
  },
  {
    title: 'Conseils de conduite à Sousse',
    paragraphs: [
      'Conduire à Sousse nécessite d’adapter votre rythme aux quartiers traversés. Dans la médina, privilégiez un petit gabarit et utilisez les parkings surveillés situés près de Bab El Gharbia ou du musée archéologique pour éviter les ruelles étroites. Le long de la corniche et sur la route touristique vers Port El Kantaoui, soyez attentif aux piétons et aux bus touristiques qui multiplient les arrêts. La circulation sur l’autoroute reliant Sousse à Tunis reste fluide, mais prévoyez des espèces pour régler les péages.',
      'Durant l’été, la chaleur peut être intense : veillez à choisir une voiture équipée de climatisation performante et vérifiez les niveaux d’eau avant de quitter la ville. Si vous partez explorer l’arrière-pays, comme les villages de Kondar ou Takrouna, un SUV ou un véhicule à garde au sol élevée est recommandé pour affronter les routes secondaires. Enfin, respectez les limitations de vitesse, surtout aux abords des zones résidentielles où des contrôles radars mobiles sont fréquents.',
    ],
  },
  {
    title: 'Questions fréquentes',
    paragraphs: [],
  },
]

const LocationASousse = () => (
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
        Prêt à confirmer votre location voiture Sousse ? Utilisez le formulaire de recherche ci-dessus pour comparer les disponibilités, sélectionner l’offre idéale et finaliser votre réservation en quelques minutes.
      </Typography>
    </Box>
  </Container>
)

export default LocationASousse
