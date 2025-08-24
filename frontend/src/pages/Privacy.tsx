import React from 'react'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

// Données structurées pour Schema.org
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Politique de Confidentialité - Plany.tn',
  description:
    'Consultez la politique de confidentialité de Plany.tn pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD.',
  url: 'https://plany.tn/privacy',
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
const description = buildDescription(
  'Consultez la politique de confidentialité de Plany.tn pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD.'
)

const PrivacyPolicy = () => (
  <Layout>
    {/* SEO et données structurées */}
    <Seo
      title="Politique de Confidentialité - Plany.tn"
      description={description}
      canonical="https://plany.tn/privacy"
    />
    <Helmet>
      <meta charSet="utf-8" />
      {/* Balises Open Graph */}
      <meta property="og:title" content="Politique de Confidentialité - Plany.tn" />
      <meta
        property="og:description"
        content="Consultez la politique de confidentialité de Plany.tn pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://plany.tn/privacy" />
      <meta property="og:image" content="https://plany.tn/logo.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Plany" />

      {/* Balises Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content="Politique de Confidentialité - Plany.tn" />
      <meta
        name="twitter:description"
        content="Consultez la politique de confidentialité de Plany.tn pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD."
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
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Titre principal avec <h1> */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Politique de Confidentialité
        </h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        {/* Introduction */}
        <p className="mb-4">
          Chez Plany.tn, la confidentialité et la sécurité de vos données personnelles sont une priorité. Cette Politique de Confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme.
        </p>

        {/* Section 1 : Collecte des Informations */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          1. Collecte des Informations
        </h2>
        <p className="mb-4">
          Nous collectons différentes informations vous concernant lorsque vous utilisez notre plateforme, notamment :
        </p>
        <ul>
          <li>
            <strong>Informations fournies par l&apos;utilisateur :</strong>
            {' '}
            telles que votre nom, votre adresse e-mail, votre numéro de téléphone, et toute autre information fournie lors de la création de votre compte.
          </li>
          <li>
            <strong>Données de navigation :</strong>
            {' '}
            telles que votre adresse IP, votre type de navigateur, les pages visitées sur notre site, et les interactions avec nos services.
          </li>
          <li>
            <strong>Données de localisation :</strong>
            {' '}
            si vous autorisez notre application à accéder à votre position géographique (facultatif).
          </li>
        </ul>

        {/* Section 2 : Utilisation des Données Collectées */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          2. Utilisation des Données Collectées
        </h2>
        <p className="mb-4">
          Les données collectées sont utilisées dans le but de :
        </p>
        <ul>
          <li>Fournir et améliorer nos services.</li>
          <li>Personnaliser votre expérience utilisateur en fonction de vos préférences et de vos interactions précédentes.</li>
          <li>Communiquer avec vous, notamment pour répondre à vos questions ou résoudre des problèmes liés à votre compte.</li>
          <li>Assurer la sécurité de notre plateforme et prévenir tout usage frauduleux.</li>
          <li>Analyser les tendances d&apos;utilisation pour améliorer nos offres et nos fonctionnalités.</li>
        </ul>

        {/* Section 3 : Partage des Informations */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          3. Partage des Informations
        </h2>
        <p className="mb-4">
          Nous ne vendons ni ne louons vos données personnelles à des tiers. Toutefois, nous pouvons partager vos informations dans les cas suivants :
        </p>
        <ul>
          <li>Avec des prestataires tiers qui nous aident à fournir nos services (par exemple, hébergement ou analyses de données).</li>
          <li>Lorsque cela est exigé par la loi ou pour répondre à une demande légale.</li>
          <li>En cas de transfert d’entreprise, tel qu’une fusion ou une acquisition.</li>
        </ul>

        {/* Section 4 : Protection des Données */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          4. Protection des Données
        </h2>
        <p className="mb-4">
          Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre tout accès non autorisé, perte, ou destruction. Cela inclut :
        </p>
        <ul>
          <li>Chiffrement SSL/TLS pour sécuriser les communications entre vous et notre plateforme.</li>
          <li>Contrôles d&apos;accès stricts pour limiter l&apos;accès aux données sensibles.</li>
          <li>Procédures de sauvegarde régulières pour éviter toute perte de données.</li>
        </ul>
        <p className="mb-4">
          Bien que nous mettions tout en œuvre pour garantir la sécurité de vos données, aucune méthode de transmission sur Internet ou de stockage électronique n’est entièrement sécurisée.
        </p>

        {/* Section 5 : Vos Droits */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          5. Vos Droits
        </h2>
        <p className="mb-4">
          En tant qu&apos;utilisateur, vous disposez de plusieurs droits concernant vos données personnelles, notamment :
        </p>
        <ul>
          <li>
            <strong>Accès :</strong>
            {' '}
            Vous avez le droit de demander l&apos;accès aux données personnelles que nous détenons sur vous.
          </li>
          <li>
            <strong>Rectification :</strong>
            {' '}
            Vous pouvez demander la correction de vos données personnelles en cas d&apos;erreur ou d&apos;inexactitude.
          </li>
          <li>
            <strong>Suppression :</strong>
            {' '}
            Vous pouvez demander la suppression de vos données personnelles, sous réserve des obligations légales.
          </li>
          <li>
            <strong>Opposition :</strong>
            {' '}
            Vous pouvez vous opposer au traitement de vos données dans certaines circonstances.
          </li>
        </ul>
        <p className="mb-4">
          Pour exercer ces droits, veuillez nous contacter à l’adresse suivante :
          {' '}
          <strong>contact@plany.tn</strong>
          .
        </p>

        {/* Section 6 : Cookies */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          6. Cookies
        </h2>
        <p className="mb-4">
          Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. Ces cookies permettent notamment de mémoriser vos préférences et d’analyser l’utilisation du site. Vous pouvez configurer votre navigateur pour refuser les cookies, bien que certaines fonctionnalités de la plateforme puissent être affectées.
        </p>

        {/* Section 7 : Modifications de la Politique */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          7. Modifications de la Politique
        </h2>
        <p className="mb-4">
          Nous nous réservons le droit de mettre à jour cette Politique de Confidentialité à tout moment. Toute modification importante sera communiquée via la plateforme ou par e-mail.
        </p>

        {/* Conclusion */}
        <hr className="my-6" />
        <p className="mb-4">
          En utilisant Plany.tn, vous acceptez cette Politique de Confidentialité. Si vous avez des questions, n&apos;hésitez pas à nous contacter à
          {' '}
          <strong>contact@plany.tn</strong>
          .
        </p>
      </div>
    </div>

    {/* Pied de page */}
    <Footer />
  </Layout>
)

export default PrivacyPolicy
