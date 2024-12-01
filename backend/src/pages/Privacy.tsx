import React from 'react'
import { Typography, Container, Box } from '@mui/material'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'

const PrivacyPolicy = () => (
  <Layout>
    <Container maxWidth="md">
      {/* Titre principal */}
      <Box my={4}>
        <Typography variant="h3" gutterBottom>
          Politique de Confidentialité
        </Typography>
        <Typography variant="body1">
          Chez Plany.tn, la confidentialité et la sécurité de vos données personnelles sont une priorité. Cette Politique de Confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme.
        </Typography>
      </Box>

      {/* 1. Collecte des Informations */}
      <Box my={4}>
        <Typography variant="h4">1. Collecte des Informations</Typography>
        <Typography variant="body2" paragraph>
          Nous collectons différentes informations vous concernant lorsque vous utilisez notre plateforme, notamment :
        </Typography>
        <Typography variant="body2" component="ul">
          <li>
            <strong>Informations fournies par l'utilisateur :</strong>
            {' '}
            telles que votre nom, votre adresse e-mail, votre numéro de téléphone, et toute autre information fournie lors de la création de votre compte.
          </li>
          <li>
            <strong>Données de navigation :</strong>
            {' '}
            telles que votre adresse IP, votre type de navigateur, et les pages visitées sur notre site.
          </li>
        </Typography>
      </Box>

      {/* 2. Utilisation des Données Collectées */}
      <Box my={4}>
        <Typography variant="h4">2. Utilisation des Données Collectées</Typography>
        <Typography variant="body2" paragraph>
          Les données collectées sont utilisées dans le but de :
        </Typography>
        <Typography variant="body2" component="ul">
          <li>Fournir et améliorer nos services.</li>
          <li>Personnaliser votre expérience utilisateur.</li>
          <li>Communiquer avec vous, notamment pour répondre à vos questions ou résoudre des problèmes liés à votre compte.</li>
          <li>Assurer la sécurité de notre plateforme et prévenir tout usage frauduleux.</li>
        </Typography>
      </Box>

      {/* 3. Partage des Informations */}
      <Box my={4}>
        <Typography variant="h4">3. Partage des Informations</Typography>
        <Typography variant="body2" paragraph>
          Nous ne vendons ni ne louons vos données personnelles à des tiers. Toutefois, nous pouvons partager vos informations dans les cas suivants :
        </Typography>
        <Typography variant="body2" component="ul">
          <li>Avec des prestataires tiers qui nous aident à fournir nos services (par exemple, hébergement ou analyses de données).</li>
          <li>Lorsque cela est exigé par la loi ou pour répondre à une demande légale.</li>
          <li>En cas de transfert d’entreprise, tel qu’une fusion ou une acquisition.</li>
        </Typography>
      </Box>

      {/* 4. Protection des Données */}
      <Box my={4}>
        <Typography variant="h4">4. Protection des Données</Typography>
        <Typography variant="body2" paragraph>
          Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre tout accès non autorisé, perte, ou destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n’est entièrement sécurisée.
        </Typography>
      </Box>

      {/* 5. Vos Droits */}
      <Box my={4}>
        <Typography variant="h4">5. Vos Droits</Typography>
        <Typography variant="body2" paragraph>
          En tant qu'utilisateur, vous disposez de plusieurs droits concernant vos données personnelles, notamment :
        </Typography>
        <Typography variant="body2" component="ul">
          <li>
            <strong>Accès :</strong>
            {' '}
            Vous avez le droit de demander l'accès aux données personnelles que nous détenons sur vous.
          </li>
          <li>
            <strong>Rectification :</strong>
            {' '}
            Vous pouvez demander la correction de vos données personnelles en cas d'erreur ou d'inexactitude.
          </li>
          <li>
            <strong>Suppression :</strong>
            {' '}
            Vous pouvez demander la suppression de vos données personnelles, sous réserve des obligations légales.
          </li>
        </Typography>
        <Typography variant="body2" paragraph>
          Pour exercer ces droits, veuillez nous contacter à l’adresse suivante :
          {' '}
          <strong>privacy@plany.tn</strong>
          .
        </Typography>
      </Box>

      {/* 6. Cookies */}
      <Box my={4}>
        <Typography variant="h4">6. Cookies</Typography>
        <Typography variant="body2" paragraph>
          Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. Ces cookies permettent notamment de mémoriser vos préférences et d’analyser l’utilisation du site. Vous pouvez configurer votre navigateur pour refuser les cookies, bien que certaines fonctionnalités de la plateforme puissent être affectées.
        </Typography>
      </Box>

      {/* 7. Modifications de la Politique */}
      <Box my={4}>
        <Typography variant="h4">7. Modifications de la Politique</Typography>
        <Typography variant="body2" paragraph>
          Nous nous réservons le droit de mettre à jour cette Politique de Confidentialité à tout moment. Toute modification importante sera communiquée via la plateforme ou par e-mail.
        </Typography>
      </Box>

      {/* Conclusion */}
      <Box my={4}>
        <Typography variant="body1" paragraph>
          En utilisant Plany.tn, vous acceptez cette Politique de Confidentialité. Si vous avez des questions, n'hésitez pas à nous contacter à
          {' '}
          <strong>support@plany.tn</strong>
          .
        </Typography>
      </Box>
    </Container>
    <Footer />
  </Layout>
  )

export default PrivacyPolicy
