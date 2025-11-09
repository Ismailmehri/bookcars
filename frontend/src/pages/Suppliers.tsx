import React, { Suspense, lazy, useMemo } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

const SupplierList = lazy(() => import('@/components/SupplierList'))

interface FaqItem {
  question: string
  answer: React.ReactNode
  structuredAnswer: string
}

// Données structurées pour Schema.org
const supplierListStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Liste des agences de location de voitures en Tunisie',
  description:
    'Sélection des meilleures agences de location de voitures en Tunisie, validées par Plany.tn avec notes et avis récents.',
  url: 'https://plany.tn/suppliers',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Organization',
        name: 'Agence de Location à Tunis',
        url: 'https://plany.tn/search?pickupLocation=675e8576f2a6e5a87913cfed&supplier=6788e4d2ffbf2c95bd897846',
        image: 'https://plany.tn/logo.png',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Organization',
        name: 'Agence de Location à Sousse',
        url: 'https://plany.tn/search?pickupLocation=675e8b7ef2a6e5a87913d103&supplier=677bc1433a4d006a5d865660',
        image: 'https://plany.tn/logo.png',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Organization',
        name: 'Agence de Location à Hammamet',
        url: 'https://plany.tn/search?pickupLocation=675e8689f2a6e5a87913d03c&supplier=6769b3d0f2a6e5a87913f29c',
        image: 'https://plany.tn/logo.png',
      },
    },
  ],
}

const Suppliers = () => {
  const onLoad = () => {}

  const description = buildDescription(
    'Découvrez les agences de location de voitures en Tunisie validées par Plany.tn. Comparez les services, consultez les avis récents et réservez votre véhicule en toute confiance.'
  )

  const keywords = 'agences de location de voitures en Tunisie, location voiture Tunisie, Plany.tn, réservation voiture Tunisie, avis agence location, location auto Tunisie'

  const faqItems = useMemo<FaqItem[]>(
    () => [
      {
        question: 'Qu’est-ce que Plany.tn ?',
        structuredAnswer:
          'Plany.tn est une plateforme tunisienne qui compare les offres de plusieurs agences locales de location de voitures et permet de réserver simplement au meilleur prix partout en Tunisie.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Plany.tn est une plateforme tunisienne qui compare les offres de plusieurs agences locales de location de voitures et
            vous permet de réserver simplement au meilleur prix, partout en Tunisie.
          </Typography>
        ),
      },
      {
        question: 'Comment réserver une voiture sur Plany.tn ?',
        structuredAnswer:
          'Saisissez le lieu et les dates, comparez les offres, cliquez sur « Réserver » et renseignez vos informations. Vous recevez la confirmation par l’agence sous 24 heures maximum.',
        answer: (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Il suffit d’indiquer votre lieu et vos dates de location, de comparer les offres disponibles puis de compléter vos
              informations en cliquant sur « Réserver ».
            </Typography>
            <Box component="ol" sx={{ pl: 3, color: 'text.secondary', display: 'grid', gap: 0.75 }}>
              <Typography component="li" variant="body2">
                Indiquez le
                <Box component="span" sx={{ fontWeight: 700, ml: 0.5 }}>
                  lieu
                </Box>
                et les
                <Box component="span" sx={{ fontWeight: 700, ml: 0.5 }}>
                  dates
                </Box>
                de prise en charge et de retour.
              </Typography>
              <Typography component="li" variant="body2">
                Comparez les offres disponibles et choisissez votre voiture.
              </Typography>
              <Typography component="li" variant="body2">
                Cliquez sur
                <Box component="span" sx={{ fontWeight: 700, ml: 0.5 }}>
                  « Réserver »
                </Box>
                et complétez vos informations.
              </Typography>
              <Typography component="li" variant="body2">
                Recevez la
                <Box component="span" sx={{ fontWeight: 700, ml: 0.5 }}>
                  confirmation de l’agence sous 24 heures maximum
                </Box>
                .
              </Typography>
            </Box>
            <Alert
              severity="info"
              icon={false}
              sx={{
                backgroundColor: 'rgba(0, 123, 255, 0.08)',
                color: '#062451',
                border: '1px solid rgba(0, 123, 255, 0.18)',
                borderRadius: 2,
                fontSize: '0.95rem',
              }}
            >
              Pas de retour après 24h ? Contactez directement l’agence via le numéro indiqué dans l’email de réservation.
            </Alert>
          </Stack>
        ),
      },
      {
        question: 'Sous combien de temps ma réservation est-elle confirmée ?',
        structuredAnswer:
          'L’agence doit confirmer votre réservation dans un délai maximum de 24 heures. Si vous n’avez pas de retour, appelez directement l’agence via le numéro indiqué dans l’email de réservation.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Chaque agence dispose de 24 heures maximum pour valider votre réservation. En cas d’absence de réponse, appelez
            l’agence via le numéro reçu dans l’email de confirmation.
          </Typography>
        ),
      },
      {
        question: 'Comment se fait le paiement ?',
        structuredAnswer:
          'Le paiement se fait globalement en espèces (cash) au moment de la remise du véhicule. Certaines agences acceptent la carte bancaire : vérifiez la fiche de l’agence avant de réserver.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Le paiement se fait principalement en espèces lors de la remise du véhicule. Certaines agences acceptent la carte
            bancaire&nbsp;: vérifiez la fiche de l’agence choisie avant de confirmer.
          </Typography>
        ),
      },
      {
        question: 'Comment fonctionne la caution (dépôt de garantie) ?',
        structuredAnswer:
          'La caution est généralement versée en espèces et restituée au retour du véhicule si aucune anomalie n’est constatée. Certaines agences acceptent une empreinte carte bancaire : à vérifier sur la fiche agence.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            La caution est habituellement versée en espèces et restituée au retour du véhicule si aucun dommage n’est constaté.
            Quelques agences proposent une empreinte carte bancaire&nbsp;: consultez leur fiche pour en être certain.
          </Typography>
        ),
      },
      {
        question: 'Dois-je restituer la voiture au même endroit ?',
        structuredAnswer:
          'Oui, la restitution se fait en principe au même lieu que la prise en charge. Toute restitution dans un autre endroit doit être convenue à l’avance avec l’agence.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            La restitution se fait en principe au même endroit que la prise en charge. Toute dépose ailleurs doit être validée
            au préalable avec l’agence.
          </Typography>
        ),
      },
      {
        question: 'Quelle est la politique de carburant ?',
        structuredAnswer:
          'Politique standard : « même niveau au départ, même niveau au retour ». Rendez la voiture avec le même niveau d’essence qu’au moment de la prise en charge.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            La règle la plus courante est « même niveau au départ, même niveau au retour ». Remettez le véhicule avec un niveau
            d’essence identique à celui constaté lors de la prise en charge.
          </Typography>
        ),
      },
      {
        question: 'Le kilométrage est-il limité ?',
        structuredAnswer:
          'Selon l’agence : certaines offres incluent un kilométrage illimité, d’autres fixent une limite par jour (ex. 300 km/j). Cette information est affichée sur chaque annonce.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Cela dépend de l’agence sélectionnée. Certaines offres prévoient un kilométrage illimité, d’autres une limite
            journalière (ex.&nbsp;: 300 km/j). Consultez l’annonce pour connaître la politique précise.
          </Typography>
        ),
      },
      {
        question: 'Quels documents dois-je présenter pour louer ?',
        structuredAnswer:
          'Pièce d’identité/passeport, permis de conduire valide et moyen de paiement pour la caution (cash ou carte selon l’agence).',
        answer: (
          <Stack spacing={1.25}>
            <Typography variant="body2" color="text.secondary">
              Préparez les documents suivants lors de la remise du véhicule&nbsp;:
            </Typography>
            <Box component="ul" sx={{ pl: 3, color: 'text.secondary', display: 'grid', gap: 0.5 }}>
              <Typography component="li" variant="body2">
                Pièce d’identité ou passeport en cours de validité
              </Typography>
              <Typography component="li" variant="body2">
                Permis de conduire valide
              </Typography>
              <Typography component="li" variant="body2">
                Moyen de paiement pour la caution (cash ou carte selon l’agence)
              </Typography>
            </Box>
          </Stack>
        ),
      },
      {
        question: 'Puis-je ajouter un conducteur supplémentaire ?',
        structuredAnswer:
          'Oui, selon l’agence. L’option peut être gratuite ou payante (montant précisé dans la fiche de l’offre).',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Oui, de nombreuses agences acceptent un conducteur additionnel. L’option peut être gratuite ou facturée&nbsp;: le
            montant est indiqué dans la fiche de l’offre.
          </Typography>
        ),
      },
      {
        question: 'Puis-je annuler ou modifier ma réservation ?',
        structuredAnswer:
          'Oui, selon la politique de l’agence. Beaucoup d’offres permettent l’annulation gratuite ou avec des frais réduits. Les conditions exactes figurent dans chaque annonce.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Oui. Les conditions d’annulation ou de modification dépendent de l’agence et sont précisées sur chaque annonce. De
            nombreuses offres prévoient une annulation gratuite ou à frais réduits.
          </Typography>
        ),
      },
      {
        question: 'Que faire si l’agence n’a plus le véhicule réservé ?',
        structuredAnswer:
          'Signalez le problème à Plany. Les agences qui annulent fréquemment peuvent être déréférencées. L’agence peut aussi proposer un modèle équivalent selon disponibilité.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Prévenez immédiatement Plany. Nous surveillons les annulations répétées et pouvons déréférencer une agence si
            nécessaire. L’agence peut également proposer un modèle équivalent selon les disponibilités.
          </Typography>
        ),
      },
      {
        question: 'Où puis-je louer une voiture via Plany ?',
        structuredAnswer:
          'Dans toute la Tunisie : Tunis, Sousse, Hammamet, Monastir, Djerba, Sfax, Nabeul, Mahdia, Bizerte, Tozeur, etc.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Partout en Tunisie&nbsp;: Tunis, Sousse, Hammamet, Monastir, Djerba, Sfax, Nabeul, Mahdia, Bizerte, Tozeur et de
            nombreuses autres villes.
          </Typography>
        ),
      },
      {
        question: 'Les véhicules sont-ils récents et entretenus ?',
        structuredAnswer:
          'Oui. Les véhicules proviennent d’agences agréées, sont entretenus régulièrement et livrés propres.',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Oui. Les agences partenaires disposent de véhicules récents, entretenus régulièrement et livrés propres pour garantir
            une expérience sereine.
          </Typography>
        ),
      },
      {
        question: 'Où suivre les actualités et conseils de Plany ?',
        structuredAnswer:
          'Sur le blog officiel : https://blog.plany.tn (guides pratiques, conseils location, promos).',
        answer: (
          <Typography variant="body2" color="text.secondary">
            Retrouvez nos actualités, conseils de location et promotions sur notre blog officiel&nbsp;:
            {' '}
            <MuiLink href="https://blog.plany.tn" target="_blank" rel="noopener noreferrer" underline="hover" color="primary">
              blog.plany.tn
            </MuiLink>
            .
          </Typography>
        ),
      },
    ],
    [],
  )

  const faqStructuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.structuredAnswer,
        },
      })),
    }),
    [faqItems],
  )

  const breadcrumbStructuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: 'https://plany.tn/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Agences de location de voitures en Tunisie',
          item: 'https://plany.tn/suppliers',
        },
      ],
    }),
    [],
  )

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo
        title="Liste des agences de location de voitures en Tunisie | Plany.tn"
        description={description}
        canonical="https://plany.tn/suppliers"
        robots="index, follow"
      />
      <Helmet>
        <meta charSet="utf-8" />
        <html lang="fr" />
        <meta name="keywords" content={keywords} />
        <meta name="author" content="Plany.tn" />
        <link rel="alternate" hrefLang="fr" href="https://plany.tn/suppliers" />
        <meta
          property="og:title"
          content="Agences de location de voitures en Tunisie - Plany.tn"
        />
        <meta
          property="og:description"
          content="Explorez les agences partenaires Plany.tn, comparez leurs offres et lisez les avis vérifiés pour réserver votre voiture de location en Tunisie."
        />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/suppliers" />
        <meta property="og:image" content="https://plany.tn/logo.png" />
        <meta property="og:image:alt" content="Logo Plany.tn" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Plany" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Agences de location de voitures en Tunisie - Plany.tn"
        />
        <meta
          name="twitter:description"
          content="Réservez votre voiture en Tunisie avec Plany.tn : agences validées, avis authentiques et services professionnels."
        />
        <meta name="twitter:image" content="https://plany.tn/logo.png" />
        <meta name="twitter:image:alt" content="Logo de Plany.tn" />
        <meta name="twitter:site" content="@PlanyTN" />
        <meta name="twitter:creator" content="@PlanyTN" />
        <script type="application/ld+json">
          {JSON.stringify(supplierListStructuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Helmet>

      <Box
        component="section"
        sx={{
          background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.14) 0%, rgba(247, 147, 30, 0.14) 100%)',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                component="h1"
                variant="h2"
                sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.75rem' }, color: '#062451' }}
              >
                Liste des agences de location de voitures en Tunisie
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, color: '#1a2f5c', maxWidth: 640 }}>
                Plany.tn référence les agences les plus fiables du pays. Consultez leurs notes, les avis récents et les voitures disponibles pour planifier votre prochaine location en toute sérénité.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  href="/"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: '#007bff',
                    color: '#ffffff',
                    borderRadius: '999px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#005fcc',
                    },
                  }}
                >
                  Réserver maintenant
                </Button>
                <Button
                  href="/contact"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: '999px',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    color: '#F7931E',
                    borderColor: '#F7931E',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#d97c0f',
                      color: '#d97c0f',
                    },
                  }}
                >
                  Besoin d’aide ?
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(0, 123, 255, 0.08) 100%)',
                  border: '1px solid rgba(0, 123, 255, 0.12)',
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DirectionsCarFilledIcon sx={{ color: '#007bff' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#062451">
                        +80 agences sélectionnées
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chaque partenaire est validé manuellement pour garantir un service irréprochable.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <WorkspacePremiumIcon sx={{ color: '#F7931E' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#062451">
                        Avis vérifiés et transparents
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Consultez les retours de vrais clients pour choisir l’agence qui vous correspond.
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <QueryBuilderIcon sx={{ color: '#007bff' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#062451">
                        Réservation en quelques minutes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Comparez, choisissez et réservez votre voiture sans stress depuis votre espace client.
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="liste-agences" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={4}>
          <Box>
            <Chip
              label="Nos partenaires certifiés"
              sx={{
                backgroundColor: '#e6f0ff',
                color: '#003c82',
                fontWeight: 600,
                borderRadius: '999px',
                px: 2,
              }}
            />
            <Typography component="h2" variant="h3" sx={{ mt: 2, fontWeight: 700, color: '#062451' }}>
              Découvrez les agences Plany.tn
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mt: 1 }}>
              Toutes les agences ci-dessous sont actives, vérifiées et disposent d’un parc de véhicules disponibles immédiatement. Filtrez, comparez et contactez l’agence qui répond à vos attentes.
            </Typography>
          </Box>

          <Suspense
            fallback={(
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, backgroundColor: '#f5f9ff' }}>
                <Typography variant="h6" gutterBottom>
                  Chargement des agences…
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Merci de patienter pendant que nous affichons la liste des agences partenaires Plany.tn.
                </Typography>
              </Paper>
            )}
          >
            <SupplierList />
          </Suspense>
        </Stack>
      </Container>

      <Box component="section" sx={{ py: { xs: 6, md: 8 }, backgroundColor: '#f8fbff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography component="h3" variant="h4" sx={{ fontWeight: 700, color: '#062451' }}>
                Pourquoi les voyageurs choisissent Plany.tn ?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Nous combinons la technologie et l’expertise locale pour simplifier votre location de voiture en Tunisie.
              </Typography>
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <SupportAgentIcon sx={{ color: '#F7931E' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#062451">
                      Assistance dédiée 7j/7
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Un conseiller vous accompagne à chaque étape de votre réservation.
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <DirectionsCarFilledIcon sx={{ color: '#007bff' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#062451">
                      Des véhicules adaptés à chaque trajet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Citadines, familiales ou SUV premium : trouvez le véhicule parfait pour vos vacances ou déplacements professionnels.
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <WorkspacePremiumIcon sx={{ color: '#007bff' }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#062451">
                      Conditions transparentes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pas de frais cachés : nous affichons clairement les dépôts de garantie, assurances et options disponibles.
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.08), rgba(247, 147, 30, 0.12))',
                  border: '1px solid rgba(0, 123, 255, 0.16)',
                  boxShadow: '0 24px 48px rgba(6, 36, 81, 0.08)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <Typography component="h3" variant="h5" sx={{ fontWeight: 700, color: '#062451' }} gutterBottom>
                  FAQ – Réponses aux questions des voyageurs
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Tout ce qu’il faut savoir pour réserver sereinement sur
                  <Box component="span" sx={{ fontWeight: 700, color: '#062451', ml: 0.5 }}>
                    Plany.tn
                  </Box>
                  : paiement, caution, confirmation sous 24h, restitution, carburant, documents, annulation et plus encore.
                </Typography>
                {faqItems.map((item) => (
                  <Accordion
                    key={item.question}
                    disableGutters
                    sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}
                    defaultExpanded={item.question === 'Qu’est-ce que Plany.tn ?'}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#007bff' }} />}
                      aria-controls={`faq-${item.question}`}
                    >
                      <Typography variant="subtitle1" fontWeight={700} color="#062451">
                        {item.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ color: '#4c648f', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {item.answer}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Layout>
  )
}

export default Suppliers
