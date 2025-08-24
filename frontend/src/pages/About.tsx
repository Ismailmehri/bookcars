import React from 'react'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'

// Données structurées pour Schema.org
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'À Propos de Plany.tn',
  description:
    'Découvrez Plany.tn, la plateforme leader de location de voitures en Tunisie. Explorez nos services, notre mission et pourquoi choisir Plany.tn pour vos besoins de mobilité.',
  url: 'https://plany.tn/about',
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
  'Plany.tn, la plateforme leader de location de voitures en Tunisie. Explorez nos services, notre mission et pourquoi choisir Plany.tn pour vos besoins de mobilité.'
)

const About = () => (
  <Layout>
    {/* SEO et données structurées */}
    <Seo
      title="À Propos de Plany.tn - Votre Plateforme de Location de Voitures"
      description={description}
      canonical="https://plany.tn/about"
    />
    <Helmet>
      <meta charSet="utf-8" />
      {/* Balises Open Graph */}
      <meta property="og:title" content="À Propos de Plany.tn - Votre Plateforme de Location de Voitures" />
      <meta
        property="og:description"
        content="Découvrez Plany.tn, la plateforme leader de location de voitures en Tunisie. Explorez nos services, notre mission et pourquoi choisir Plany.tn pour vos besoins de mobilité."
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://plany.tn/about" />
      <meta property="og:image" content="https://plany.tn/logo.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Plany" />

      {/* Balises Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="À Propos de Plany.tn - Votre Plateforme de Location de Voitures"
      />
      <meta
        name="twitter:description"
        content="Découvrez Plany.tn, la plateforme leader de location de voitures en Tunisie. Explorez nos services, notre mission et pourquoi choisir Plany.tn pour vos besoins de mobilité."
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
        <h1 className="text-center text-2xl md:text-3xl font-bold">
          À Propos de Plany.tn
        </h1>
      </div>

      <div className="p-4 rounded-lg shadow-md bg-white">
        {/* Introduction */}
        <p className="mb-4">
          Plany.tn est une plateforme innovante dédiée à la mise en relation entre professionnels de la location de voitures et particuliers.
          Nous avons pour mission de simplifier le processus de réservation tout en offrant une expérience transparente et sécurisée pour les utilisateurs.
        </p>

        {/* Notre Mission */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">Notre Mission</h2>
        <p className="mb-4">
          Chez Plany.tn, nous croyons que louer une voiture ne devrait pas être une tâche compliquée. Nous facilitons les échanges entre professionnels loueurs de voitures et particuliers grâce à une plateforme intuitive qui met l&apos;accent sur la rapidité, la fiabilité et la simplicité.
        </p>
        <p className="mb-4">
          Nous nous engageons à fournir une solution pratique pour les professionnels souhaitant élargir leur clientèle et pour les utilisateurs à la recherche de véhicules de qualité.
        </p>

        {/* Nos Valeurs */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">Nos Valeurs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="font-semibold">Simplicité</h3>
            <p className="text-sm">
              Une interface intuitive pour permettre à tous de trouver ou proposer des véhicules facilement.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Transparence</h3>
            <p className="text-sm">
              Une communication claire entre les loueurs et les locataires pour une expérience de confiance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Innovation</h3>
            <p className="text-sm">
              Nous repoussons constamment les limites pour offrir des fonctionnalités modernes et efficaces.
            </p>
          </div>
        </div>

        {/* Pourquoi nous choisir */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">Pourquoi Choisir Plany.tn ?</h2>
        <p className="mb-4">
          Que vous soyez un professionnel cherchant à optimiser la gestion de vos véhicules ou un particulier à la recherche d’une solution pratique pour vos déplacements, Plany.tn est conçu pour répondre à vos besoins. Voici ce qui nous distingue :
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Un large choix de véhicules disponibles dans les principales villes comme Tunis, Sousse, Monastir, Nabeul et Mahdia.</li>
          <li>Réservation simple et rapide depuis n&apos;importe quel appareil.</li>
          <li>Présence dans les principaux aéroports tunisiens : Aéroport International de Tunis-Carthage, Aéroport International de Monastir Habib-Bourguiba, Aéroport International de Djerba-Zarzis, etc.</li>
          <li>Une communication directe entre loueurs et locataires pour une expérience fluide.</li>
          <li>Accès gratuit pour les utilisateurs de la plateforme.</li>
        </ul>

        {/* Notre Couverture Géographique */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">Notre Couverture Géographique</h2>
        <p className="mb-4">
          Plany.tn est présent dans les principales villes et régions de Tunisie, y compris :
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Tunis - La capitale, idéale pour explorer la médina et les sites culturels.</li>
          <li>Sousse - Connue pour sa médina classée au patrimoine mondial de l&apos;UNESCO.</li>
          <li>Monastir - Ville historique avec son célèbre Ribat.</li>
          <li>Nabeul - Capitale de la poterie tunisienne et des agrumes.</li>
          <li>Mahdia - Une destination côtière pittoresque.</li>
        </ul>
        <p className="mb-4">
          Nous couvrons également les principaux aéroports du pays, notamment :
        </p>
        <ul className="list-disc list-inside mb-4 space-y-2">
          <li>Aéroport International de Tunis-Carthage.</li>
          <li>Aéroport International de Monastir Habib-Bourguiba.</li>
          <li>Aéroport International de Djerba-Zarzis.</li>
        </ul>

        {/* Équipe */}
        <hr className="my-6" />
        <h2 className="text-xl md:text-2xl font-bold mb-2">Rencontrez Notre Équipe</h2>
        <p className="mb-4">
          Notre équipe est composée de passionnés de technologie et de mobilité. Nous travaillons chaque jour pour améliorer l&apos;expérience utilisateur et développer de nouvelles fonctionnalités qui répondent aux attentes des professionnels et des particuliers.
        </p>

        {/* Conclusion */}
        <hr className="my-6" />
        <p className="mb-4">
          Chez Plany.tn, notre objectif est de rendre chaque étape de la location de voitures plus fluide et plus agréable. Merci de faire partie de notre communauté !
        </p>
      </div>
    </div>

    {/* Pied de page */}
    <Footer />
  </Layout>
)

export default About
