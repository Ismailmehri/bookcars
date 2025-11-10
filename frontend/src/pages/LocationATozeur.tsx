import React from 'react'
import { Container, Box, Typography, Stack, Link, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Helmet } from 'react-helmet'
import SearchForm from '@/components/SearchForm'
import { createInternalLinks } from '@/common/locationLinks'

const title = 'Location voiture pas cher à Tozeur | Plany'
const description = 'Trouvez une voiture à Tozeur pour vos escapades désertiques avec Plany.'

const faqItems = [
  {
    question: 'Voitures climatisées ?',
    answer: 'Oui, toutes les voitures proposées à Tozeur sont climatisées pour résister aux fortes chaleurs sahariennes.',
  },
  {
    question: 'Routes touristiques accessibles ?',
    answer: 'Les oasis de Chebika, Tamerza, Ong Jemel et le Chott El Jerid sont accessibles en voiture, certains tronçons nécessitant un SUV.',
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
  name: 'Plany Tozeur',
  description,
  areaServed: 'Tozeur',
  url: 'https://plany.tn/location-voiture-pas-cher-a-tozeur',
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
  '/location-voiture-pas-cher-a-kasserine',
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
])

const introductionParagraphs = [
  'Réserver une location voiture Tozeur avec Plany vous permet d’organiser vos excursions dans les oasis du sud tunisien à votre rythme. En quelques clics, vous accédez à une offre complète de citadines, de berlines et de 4x4 adaptés aux pistes désertiques et aux longues distances.',
  'Notre réseau d’agences locales garantit des véhicules climatisés, entretenus et équipés pour affronter les pistes sablonneuses menant à Ong Jemel ou au Chott El Jerid. Vous pouvez ajouter des options utiles comme le GPS hors ligne ou la glacière pour conserver vos boissons au frais.',
  'Depuis le SearchForm Plany, comparez les tarifs, choisissez l’offre qui correspond à votre budget et confirmez votre réservation avec un acompte sécurisé. Nous vous accompagnons également pour tout ajustement d’horaires ou de services.',
]

const sections = [
  {
    title: 'Pourquoi louer à Tozeur ?',
    paragraphs: [
      'Tozeur est une porte d’entrée vers les décors sahariens, les oasis verdoyantes et les villages pittoresques. Avoir une voiture de location facilite les excursions aux gorges de Tamerza, au canyon de Mides ou au parc à thèmes Star Wars d’Ong Jemel. Les transports publics y sont limités, surtout tôt le matin ou tard le soir.',
      'Pour les professionnels, louer une voiture permet d’assurer les transferts entre l’aéroport international de Tozeur-Nefta, les hôtels de la zone touristique et les sites d’événements. La flexibilité d’un véhicule permet aussi de transporter du matériel audiovisuel ou sportif sans contraintes.',
    ],
  },
  {
    title: 'Nos offres spéciales',
    paragraphs: [
      'Plany propose des forfaits tout compris incluant le kilométrage illimité, la climatisation renforcée et l’assistance 24/7 sur les routes désertiques. Vous pouvez opter pour des 4x4 avec pneus adaptés aux dunes ou pour des berlines confortables si vous restez sur les axes principaux.',
      'Les voyageurs en quête de location voiture pas cher Tozeur profitent d’offres saisonnières, de réductions long séjour et de services comme la livraison au riad ou à la maison d’hôtes. Chaque contrat précise clairement le dépôt de garantie et les assurances incluses pour éviter les surprises.',
    ],
  },
  {
    title: 'Réserver en ligne',
    paragraphs: [
      'Saisissez vos dates dans le formulaire Plany, sélectionnez le lieu de prise en charge (aéroport, centre-ville, hôtel) et comparez les offres disponibles. Vous pouvez filtrer par transmission automatique, type de carburant ou capacité de bagages.',
      'Une fois votre location confirmée, vous recevez un récapitulatif complet ainsi que des conseils de préparation : check-list pour la conduite dans le désert, points de ravitaillement et numéros utiles. Notre support reste disponible par chat ou téléphone pour toute question.',
    ],
  },
  {
    title: 'Conduite dans le sud',
    paragraphs: [
      'Les routes reliant Tozeur à Nefta ou Douz sont asphaltées et bien indiquées. Toutefois, les excursions vers les oasis nécessitent parfois de quitter les axes principaux : assurez-vous d’avoir un véhicule adapté, une réserve d’eau et une bonne connaissance de votre itinéraire.',
      'Profitez du coucher de soleil sur le Chott El Jerid mais pensez à rentrer avant la nuit pour éviter les mirages et la baisse de visibilité. Vérifiez régulièrement la pression des pneus, surtout si vous roulez sur des chemins sablonneux.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const LocationATozeur: React.FC = () => (
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
      Remplissez le SearchForm, choisissez votre location voiture Tozeur et vivez l’expérience saharienne avec l’esprit tranquille.
    </Typography>
  </Container>
)

export default LocationATozeur
