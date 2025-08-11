import React from 'react'
import {
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  Divider,
} from '@mui/material'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import SupplierList from '@/components/SupplierList'
import Footer from '@/components/Footer'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

// Données structurées pour Schema.org
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Liste des Agences de Location de Voiture en Tunisie',
  description:
    'Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l’agence qui correspond à vos besoins.',
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
    "Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l'agence qui correspond à vos besoins."
  )

  return (
    <Layout onLoad={onLoad} strict={false}>
      {/* SEO et données structurées */}
      <Seo
        title="Liste des Agences de Location de Voiture en Tunisie - Plany.tn"
        description={description}
        canonical="https://plany.tn/suppliers"
      />
      <Helmet>
        <meta charSet="utf-8" />
        {/* Balises Open Graph */}
        <meta
          property="og:title"
          content="Liste des Agences de Location de Voiture en Tunisie - Plany.tn"
        />
        <meta
          property="og:description"
          content="Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l'agence qui correspond à vos besoins."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://plany.tn/suppliers" />
        <meta property="og:image" content="https://plany.tn/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Plany" />

        {/* Balises Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Liste des Agences de Location de Voiture en Tunisie - Plany.tn"
        />
        <meta
          name="twitter:description"
          content="Découvrez la liste des meilleures agences de location de voiture en Tunisie. Comparez les offres et trouvez l'agence qui correspond à vos besoins."
        />
        <meta name="twitter:image" content="https://plany.tn/logo.png" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />

        {/* Données structurées */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Contenu principal */}
      <Container maxWidth="lg" sx={{ px: 4, py: 6 }}>
        {/* Titre principal avec <h1> */}
        <Box mb={4}>
          <Typography
            variant="h1"
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', md: '2rem' },
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Liste des Agences de Location de Voiture en Tunisie
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: '10px' }}>
          {/* Introduction */}
          <Typography variant="body1" paragraph>
            Bienvenue sur la liste complète des agences de location de voitures en Tunisie proposées par Plany.tn. Découvrez les meilleurs fournisseurs dans différentes villes du pays et comparez leurs offres pour trouver celle qui correspond à vos besoins.
          </Typography>

          {/* Section : Liste des Agences */}
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="h2"
            gutterBottom
            sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}
          >
            Nos Partenaires
          </Typography>
          <Typography variant="body1" paragraph>
            Voici une sélection des meilleures agences de location de voitures partenaires de Plany.tn :
          </Typography>

          {/* Liste des Agences */}
          <div className="suppliers">
            <SupplierList />
          </div>

          {/* Section : Pourquoi Choisir Plany.tn ? */}
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="h2"
            gutterBottom
            sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}
          >
            Pourquoi Choisir Plany.tn ?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h3" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 'bold' }}>Large Choix de Fournisseurs</Typography>
              <Typography variant="body2" paragraph>
                Nous collaborons avec les meilleures agences de location de voitures en Tunisie pour vous offrir un large choix d&apos;options.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h3" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 'bold' }}>Prix Compétitifs</Typography>
              <Typography variant="body2" paragraph>
                Comparez facilement les prix et trouvez l&apos;offre qui correspond à votre budget.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h3" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 'bold' }}>Service Client Réactif</Typography>
              <Typography variant="body2" paragraph>
                Notre équipe est toujours disponible pour répondre à vos questions et vous aider dans votre recherche.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h3" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 'bold' }}>Facilité de Réservation</Typography>
              <Typography variant="body2" paragraph>
                Réservez en quelques clics grâce à notre interface intuitive et sécurisée.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Pied de page */}
      <Footer />
    </Layout>
  )
}

export default Suppliers
