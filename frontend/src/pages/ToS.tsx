import React from 'react'
import { Typography, Container, Box } from '@mui/material'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'

import '@/assets/css/tos.css'

// Assurez-vous que Layout existe dans votre projet

const ToS = () => (
  <Layout>
    <Container maxWidth="md">
      {/* Titre principal */}
      <Box my={4}>
        <Typography variant="h3" gutterBottom>
          Conditions Générales d'Utilisation
        </Typography>
        <Typography variant="body1">
          Merci de lire attentivement les présentes conditions générales d’utilisation (CGU). Elles régissent votre accès et votre utilisation de la plateforme Plany.tn, qui met en relation des professionnels loueurs de voitures et des utilisateurs recherchant des véhicules à louer.
        </Typography>
      </Box>

      {/* 1. Définitions */}
      <Box my={4}>
        <Typography variant="h4">1. Définitions</Typography>
        <Typography variant="body2" paragraph>
          <strong>Professionnel Loueur :</strong>
          {' '}
          Utilisateur professionnel habilité à publier des annonces de location de véhicules sur Plany.tn.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Locataire :</strong>
          {' '}
          Utilisateur recherchant un véhicule à louer via la plateforme Plany.tn.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Plateforme :</strong>
          {' '}
          Désigne l'application web et mobile Plany.tn, ainsi que tous les services associés.
        </Typography>
      </Box>

      {/* 2. Accès à la Plateforme */}
      <Box my={4}>
        <Typography variant="h4">2. Accès à la Plateforme et Inscription</Typography>
        <Typography variant="body2" paragraph>
          L’accès à Plany.tn nécessite la création d’un compte utilisateur. Les professionnels loueurs sont seuls responsables de leur conformité légale pour exercer une activité de location de voitures. L'application ne vérifie pas les documents fournis et décline toute responsabilité en cas de non-conformité. Les utilisateurs doivent garantir l’exactitude des informations fournies lors de l’inscription.
        </Typography>
      </Box>

      {/* 3. Annonces et Réservations */}
      <Box my={4}>
        <Typography variant="h4">3. Annonces et Réservations</Typography>
        <Typography variant="body2" paragraph>
          Les loueurs peuvent publier des annonces détaillant les caractéristiques des véhicules proposés à la location. Les locataires peuvent rechercher des véhicules selon des critères tels que la date et l’heure de début et de fin de location.
        </Typography>
        <Typography variant="body2" paragraph>
          Une fois une demande de réservation effectuée, le loueur peut l’accepter ou la refuser. Le locataire est ensuite informé de la décision. Les paiements (y compris la caution) s’effectuent directement entre le loueur et le locataire.
        </Typography>
      </Box>

      {/* 4. Règles Générales de Location */}
      <Box my={4}>
        <Typography variant="h4">4. Règles Générales de Location</Typography>
        <Typography variant="body2" paragraph>
          - Le loueur s’engage à fournir un véhicule conforme à la description de l’annonce.
        </Typography>
        <Typography variant="body2" paragraph>
          - Le locataire doit respecter les dates et heures de réservation convenues.
        </Typography>
        <Typography variant="body2" paragraph>
          - Le paiement et la caution se font en espèces lors de la remise des clés.
        </Typography>
      </Box>

      {/* 5. Limites de Responsabilité */}
      <Box my={4}>
        <Typography variant="h4">5. Limites de Responsabilité</Typography>
        <Typography variant="body2" paragraph>
          Plany.tn agit uniquement comme intermédiaire et décline toute responsabilité concernant :
        </Typography>
        <Typography variant="body2" component="ul">
          <li>L’état du véhicule fourni par le loueur.</li>
          <li>Les litiges entre loueurs et locataires.</li>
          <li>Les dommages, pertes ou accidents survenus pendant la location.</li>
        </Typography>
      </Box>

      {/* 6. Comportements Interdits */}
      <Box my={4}>
        <Typography variant="h4">6. Comportements Interdits</Typography>
        <Typography variant="body2" paragraph>
          Toute utilisation frauduleuse de la plateforme est strictement interdite. Les utilisateurs s’engagent à fournir des informations exactes et à ne pas publier d’annonces trompeuses.
        </Typography>
      </Box>

      {/* 7. Confidentialité et Données Personnelles */}
      <Box my={4}>
        <Typography variant="h4">7. Confidentialité et Données Personnelles</Typography>
        <Typography variant="body2" paragraph>
          Plany.tn traite les données personnelles des utilisateurs conformément aux lois applicables en matière de protection des données. Pour plus d’informations, veuillez consulter notre Politique de Confidentialité.
        </Typography>
      </Box>

      {/* 8. Modification des CGU */}
      <Box my={4}>
        <Typography variant="h4">8. Modification des Conditions Générales</Typography>
        <Typography variant="body2" paragraph>
          Plany.tn se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des changements importants par une notification sur la plateforme.
        </Typography>
      </Box>

      {/* Conclusion */}
      <Box my={4}>
        <Typography variant="body1" paragraph>
          En utilisant Plany.tn, vous acceptez de respecter les présentes Conditions Générales d'Utilisation. Si vous avez des questions ou des préoccupations, veuillez contacter notre support.
        </Typography>
      </Box>
    </Container>
    <Footer />
  </Layout>
  )

export default ToS
