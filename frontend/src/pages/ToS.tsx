import React from 'react'
import {
  Typography,
  Container,
  Box,
  Paper,
  Divider,
} from '@mui/material'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'

// Données structurées pour Schema.org
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Conditions Générales d\'Utilisation - Plany.tn',
  description:
    'Consultez les Conditions Générales d\'Utilisation de Plany.tn pour la location de voiture en Tunisie. Découvrez nos politiques de réservation, de paiement et d\'annulation.',
  url: 'https://plany.tn/tos',
  publisher: {
    '@type': 'Organization',
    name: 'Plany.tn',
    logo: {
      '@type': 'ImageObject',
      url: 'https://plany.tn/logo.png',
      width: 1200,
      height: 630,
    },
  },
}

const ToS = () => (
  <Layout>
    {/* SEO et données structurées */}
    <Helmet>
      <meta charSet="utf-8" />
      <title>Conditions Générales d'Utilisation - Plany.tn</title>
      <meta
        name="description"
        content="Consultez les Conditions Générales d'Utilisation de Plany.tn pour la location de voiture en Tunisie. Découvrez nos politiques de réservation, de paiement et d'annulation."
      />
      <link rel="canonical" href="https://plany.tn/tos" />

      {/* Balises Open Graph */}
      <meta
        property="og:title"
        content="Conditions Générales d'Utilisation - Plany.tn"
      />
      <meta
        property="og:description"
        content="Consultez les Conditions Générales d'Utilisation de Plany.tn pour la location de voiture en Tunisie. Découvrez nos politiques de réservation, de paiement et d'annulation."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://plany.tn/tos" />
      <meta property="og:image" content="https://plany.tn/logo.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Plany" />

      {/* Balises Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Conditions Générales d'Utilisation - Plany.tn"
      />
      <meta
        name="twitter:description"
        content="Consultez les Conditions Générales d'Utilisation de Plany.tn pour la location de voiture en Tunisie. Découvrez nos politiques de réservation, de paiement et d'annulation."
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
    <Container maxWidth="md" sx={{ px: 4, py: 6 }}>
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
          Conditions Générales d'Utilisation
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: '10px' }}>
        <Typography variant="body1">
          Merci de lire attentivement les présentes conditions générales d’utilisation (CGU). Elles régissent votre accès et votre utilisation de la plateforme Plany.tn, qui met en relation des professionnels loueurs de voitures et des utilisateurs recherchant des véhicules à louer.
        </Typography>

        {/* Section 1 : Définitions */}
        <Typography
          variant="h2"
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem', marginTop: '20px' }, fontWeight: 'bold' }}
        >
          1. Définitions
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Professionnel Loueur :</strong>
          {' '}
          Utilisateur professionnel habilité à publier des annonces de location de véhicules sur Plany.tn.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Locataire :</strong>
          {' '}
          Utilisateur recherchant un véhicule à louer via la plateforme Plany.tn.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Plateforme :</strong>
          {' '}
          Désigne l'application web et mobile Plany.tn, ainsi que tous les services associés.
        </Typography>

        {/* Section 2 : Accès à la Plateforme */}
        <Divider sx={{ my: 3 }} />
        <Typography
          variant="h2"
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}
        >
          2. Accès à la Plateforme et Inscription
        </Typography>
        <Typography variant="body1" paragraph>
          L’accès à Plany.tn nécessite la création d’un compte utilisateur. Les professionnels loueurs sont seuls responsables de leur conformité légale pour exercer une activité de location de voitures.
        </Typography>

        {/* Section 3 : Annonces et Réservations */}
        <Divider sx={{ my: 3 }} />
        <Typography
          variant="h2"
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}
        >
          3. Annonces et Réservations
        </Typography>
        <Typography variant="body1" paragraph>
          Les loueurs peuvent publier des annonces détaillant les caractéristiques des véhicules proposés à la location. Les locataires peuvent rechercher des véhicules selon des critères tels que la date et l’heure de début et de fin de location.
        </Typography>
        <Typography variant="body2" paragraph>
          Une fois une demande de réservation effectuée, le loueur peut l’accepter ou la refuser. Le locataire est ensuite informé de la décision. Les paiements (y compris la caution) s’effectuent directement entre le loueur et le locataire.
        </Typography>

        {/* Section 4 : Règles Générales de Location */}
        <Divider sx={{ my: 3 }} />
        <Typography
          variant="h2"
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}
        >
          4. Règles Générales de Location
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" paragraph>
              Le loueur s’engage à fournir un véhicule conforme à la description de l’annonce.
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Le locataire doit respecter les dates et heures de réservation convenues.
            </Typography>
          </li>
        </ul>

        {/* Section 5 : Limites de Responsabilité */}
        <Divider sx={{ my: 3 }} />
        <Typography
          variant="h2"
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 'bold' }}
        >
          5. Limites de Responsabilité
        </Typography>
        <Typography variant="body1" paragraph>
          Plany.tn agit uniquement comme intermédiaire et décline toute responsabilité concernant :
        </Typography>
        <ul>
          <li>L’état du véhicule fourni par le loueur.</li>
          <li>Les litiges entre loueurs et locataires.</li>
          <li>Les dommages, pertes ou accidents survenus pendant la location.</li>
        </ul>

        {/* Conclusion */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" paragraph>
          En utilisant Plany.tn, vous acceptez de respecter les présentes Conditions Générales d'Utilisation. Si vous avez des questions ou des préoccupations, veuillez contacter notre support.
        </Typography>
      </Paper>
    </Container>

    {/* Pied de page */}
    <Footer />
  </Layout>
)

export default ToS
