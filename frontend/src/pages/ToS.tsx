/* eslint react/jsx-one-expression-per-line: 0, react/no-unescaped-entities: 0 */
import React from 'react'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: "Conditions Générales d'Utilisation - Plany.tn",
  description:
    "Consultez les Conditions Générales d'Utilisation de Plany.tn pour la location de voiture en Tunisie. Découvrez nos politiques de réservation, de paiement et d'annulation.",
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

const description = buildDescription(
  "Consultez les Conditions Générales d'Utilisation de Plany.tn pour la location de voiture en Tunisie. Découvrez nos politiques de réservation, de paiement et d'annulation."
)

const ToS = () => (
  <Layout>
    <Seo
      title="Conditions Générales d'Utilisation - Plany.tn"
      description={description}
      canonical="https://plany.tn/tos"
    />
    <Helmet>
      <meta charSet="utf-8" />
      <meta property="og:title" content="Conditions Générales d'Utilisation - Plany.tn" />
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
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Conditions Générales d'Utilisation - Plany.tn" />
      <meta
        name="twitter:description"
        content="Consultez les Conditions Générales d'Utilisation de Plany.tn pour la location de voiture en Tunisie. Découvrez nos politiques de réservation, de paiement et d'annulation."
      />
      <meta name="twitter:image" content="https://plany.tn/logo.png" />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">
        Conditions Générales d'Utilisation
      </h1>
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow space-y-6">
        <p>
          Merci de lire attentivement les présentes conditions générales d’utilisation (CGU). Elles régissent votre accès et votre utilisation de la plateforme Plany.tn, qui met en relation des professionnels loueurs de voitures et des utilisateurs recherchant des véhicules à louer.
        </p>
        <h2 className="text-xl font-semibold mt-4">1. Définitions</h2>
        <p>
          <strong>Professionnel Loueur :</strong> Utilisateur professionnel habilité à publier des annonces de location de véhicules sur Plany.tn.
        </p>
        <p>
          <strong>Locataire :</strong> Utilisateur recherchant un véhicule à louer via la plateforme Plany.tn.
        </p>
        <p>
          <strong>Plateforme :</strong> Désigne l'application web et mobile Plany.tn, ainsi que tous les services associés.
        </p>
        <hr className="my-6" />
        <h2 className="text-xl font-semibold">2. Accès à la Plateforme et Inscription</h2>
        <p>
          L’accès à Plany.tn nécessite la création d’un compte utilisateur. Les professionnels loueurs sont seuls responsables de leur conformité légale pour exercer une activité de location de voitures.
        </p>
        <hr className="my-6" />
        <h2 className="text-xl font-semibold">3. Annonces et Réservations</h2>
        <p>
          Les loueurs peuvent publier des annonces détaillant les caractéristiques des véhicules proposés à la location. Les locataires peuvent rechercher des véhicules selon des critères tels que la date et l’heure de début et de fin de location.
        </p>
        <p>
          Une fois une demande de réservation effectuée, le loueur peut l’accepter ou la refuser. Les paiements (y compris la caution) s’effectuent directement entre le loueur et le locataire.
        </p>
        <hr className="my-6" />
        <h2 className="text-xl font-semibold">4. Règles Générales de Location</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Le loueur s’engage à fournir un véhicule conforme à la description de l’annonce.</li>
          <li>Le locataire doit respecter les dates et heures de réservation convenues.</li>
        </ul>
        <hr className="my-6" />
        <h2 className="text-xl font-semibold">5. Limites de Responsabilité</h2>
        <p>
          Plany.tn agit uniquement comme intermédiaire et décline toute responsabilité concernant :
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>L’état du véhicule fourni par le loueur.</li>
          <li>Les litiges entre loueurs et locataires.</li>
          <li>Les dommages, pertes ou accidents survenus pendant la location.</li>
        </ul>
      </div>
    </div>
  </Layout>
)

export default ToS
