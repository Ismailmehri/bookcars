import React from 'react'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'
import Seo from '@/components/Seo'
import { buildDescription } from '@/common/seo'
import '@/assets/css/about.css'

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
    <Seo
      title="À Propos de Plany.tn - Votre Plateforme de Location de Voitures"
      description={description}
      canonical="https://plany.tn/about"
    />
    <Helmet>
      <meta charSet="utf-8" />
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

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>

    <main className="about-page" aria-labelledby="about-title">
      <header className="about-page__hero">
        <p className="about-page__eyebrow">Plany.tn</p>
        <h1 id="about-title" className="about-page__title">À Propos de Plany.tn</h1>
        <p className="about-page__lead">
          Plateforme de confiance dédiée à la location de voitures en Tunisie, conçue pour offrir une réservation rapide
          et transparente sur tous les appareils.
        </p>
      </header>

      <section className="about-page__card about-page__card--intro">
        <h2>Notre mission</h2>
        <p>
          Chez Plany.tn, nous facilitons les échanges entre loueurs professionnels et particuliers grâce à une expérience
          fluide, sécurisée et pensée pour la mobilité quotidienne comme pour les trajets longue distance.
        </p>
        <p>
          Nous nous engageons à rendre chaque étape plus simple : recherche, comparaison, réservation et communication
          directe avec les partenaires locaux.
        </p>
      </section>

      <section className="about-page__card">
        <h2>Nos valeurs</h2>
        <div className="about-page__values" role="list">
          <div className="about-page__values-item" role="listitem">
            <h3>Simplicité</h3>
            <p>Interface épurée et parcours cohérent pour trouver ou proposer un véhicule en quelques minutes.</p>
          </div>
          <div className="about-page__values-item" role="listitem">
            <h3>Transparence</h3>
            <p>Informations claires, prix normalisés et échanges directs pour instaurer la confiance.</p>
          </div>
          <div className="about-page__values-item" role="listitem">
            <h3>Innovation</h3>
            <p>Nouvelles fonctionnalités et optimisation continue afin d&apos;offrir une expérience moderne et performante.</p>
          </div>
        </div>
      </section>

      <section className="about-page__card">
        <h2>Pourquoi choisir Plany.tn ?</h2>
        <ul>
          <li>Large choix de véhicules couvrant Tunis, Sousse, Monastir, Nabeul, Mahdia et bien d&apos;autres villes.</li>
          <li>Réservation rapide et responsive depuis mobile, tablette ou desktop.</li>
          <li>Présence dans les principaux aéroports : Tunis-Carthage, Monastir Habib-Bourguiba, Djerba-Zarzis.</li>
          <li>Communication directe entre loueurs et locataires pour une expérience fluide.</li>
          <li>Accès gratuit pour les utilisateurs de la plateforme.</li>
        </ul>
      </section>

      <section className="about-page__card">
        <h2>Notre couverture</h2>
        <p>
          Nous accompagnons les trajets clés en Tunisie : centres-villes, hubs touristiques et aéroports, avec des
          offres adaptées aux courts et longs séjours.
        </p>
        <div className="about-page__coverage" role="list">
          <div className="about-page__coverage-item" role="listitem">Tunis &amp; sa médina</div>
          <div className="about-page__coverage-item" role="listitem">Sousse &amp; ses quartiers côtiers</div>
          <div className="about-page__coverage-item" role="listitem">Monastir &amp; son Ribat</div>
          <div className="about-page__coverage-item" role="listitem">Nabeul &amp; la côte du Cap Bon</div>
          <div className="about-page__coverage-item" role="listitem">Mahdia &amp; les villages balnéaires</div>
        </div>
      </section>

      <section className="about-page__card about-page__card--team">
        <h2>Rencontrez notre équipe</h2>
        <p>
          Des passionnés de technologie et de mobilité travaillent chaque jour pour améliorer l&apos;expérience, garantir la
          qualité des partenaires et renforcer la fiabilité du service.
        </p>
        <p className="about-page__note" role="status" aria-live="polite">
          Nous restons à l&apos;écoute des retours utilisateurs afin d&apos;optimiser l&apos;interface, l&apos;accessibilité et la
          performance du site.
        </p>
      </section>
    </main>

    <Footer />
  </Layout>
)

export default About
