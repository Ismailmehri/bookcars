import React, { Suspense, lazy, useMemo } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Container,
  Grid,
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

// Données structurées pour Schema.org
const structuredData = {
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

  const faqItems = useMemo(
    () => [
      {
        question: 'Comment choisir la bonne agence de location de voitures ?',
        answer:
          'Identifiez vos besoins (type de véhicule, kilométrage, budget) puis comparez les agences validées sur Plany.tn. Chaque fiche agence affiche les avis récents, la note moyenne et le nombre de voitures disponibles pour vous aider à décider rapidement.',
      },
      {
        question: 'Quels documents sont nécessaires pour réserver une voiture ?',
        answer:
          'Vous aurez besoin d’une pièce d’identité en cours de validité, d’un permis de conduire et d’une carte bancaire pour la caution. Certaines agences peuvent demander des documents supplémentaires ; tout est précisé dans la fiche agence.',
      },
      {
        question: 'Puis-je annuler ma réservation sans frais ?',
        answer:
          'La politique d’annulation dépend de l’agence sélectionnée. Sur Plany.tn, nous mettons en avant les conditions d’annulation afin que vous puissiez choisir une agence flexible si vous avez besoin de plus de liberté.',
      },
      {
        question: 'Les prix affichés incluent-ils l’assurance ?',
        answer:
          'Oui, les prix affichés incluent les assurances de base exigées par la loi. Selon l’agence, vous pouvez ajouter des protections complémentaires (assurance tous risques, conducteur supplémentaire, etc.) directement lors de la réservation.',
      },
      {
        question: 'Comment contacter le service client Plany.tn ?',
        answer:
          'Notre équipe vous accompagne 7j/7 via le chat en ligne, le téléphone ou WhatsApp. Les coordonnées complètes sont disponibles dans la section Assistance de Plany.tn.',
      },
    ],
    [],
  )

  return (
    <Layout onLoad={onLoad} strict={false}>
      <Seo
        title="Liste des agences de location de voitures en Tunisie | Plany.tn"
        description={description}
        canonical="https://plany.tn/suppliers"
      />
      <Helmet>
        <meta charSet="utf-8" />
        <meta
          property="og:title"
          content="Agences de location de voitures en Tunisie - Plany.tn"
        />
        <meta
          property="og:description"
          content="Explorez les agences partenaires Plany.tn, comparez leurs offres et lisez les avis vérifiés pour réserver votre voiture de location en Tunisie."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/suppliers" />
        <meta property="og:image" content="https://plany.tn/logo.png" />
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
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
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
                  href="#liste-agences"
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
                  Explorer les agences
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
                }}
              >
                <Typography component="h3" variant="h5" sx={{ fontWeight: 700, color: '#062451' }} gutterBottom>
                  FAQ – Réponses aux questions des voyageurs
                </Typography>
                {faqItems.map((item) => (
                  <Accordion key={item.question} disableGutters sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#007bff' }} />}
                      aria-controls={`faq-${item.question}`}
                    >
                      <Typography variant="subtitle1" fontWeight={700} color="#062451">
                        {item.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {item.answer}
                      </Typography>
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
