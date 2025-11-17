import React, { useMemo } from 'react'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import SearchForm from '@/components/SearchForm'

export const locationVoitureTunisieFaqs = [
  {
    question: 'Faut-il une carte de crédit pour louer une voiture en Tunisie ?',
    answer:
      "Sur Plany.tn, de nombreuses agences partenaires acceptent les réservations sans carte de crédit. La carte peut être demandée pour la caution selon la politique du loueur, mais plusieurs offres prévoient une alternative en espèces ou par carte de débit locale."
  },
  {
    question: 'Puis-je payer en espèces à l’agence de location ?',
    answer:
      "Oui, la réservation s’effectue en ligne sans paiement immédiat et vous réglez ensuite directement à l’agence ou lors de la livraison du véhicule. Les loueurs indiquent clairement les moyens de paiement acceptés (espèces, carte, virement) pour garantir une expérience transparente."
  },
  {
    question: 'La caution est-elle bloquée sur la carte ou déposée en cash ?',
    answer:
      "La plupart des agences bloquent une pré-autorisation sur carte bancaire, mais il existe aussi des offres où la caution peut être remise en espèces. Vérifiez le montant du dépôt de garantie et les options d’assurance pour réduire ou supprimer la franchise lorsque cela est proposé."
  },
  {
    question: 'Quels documents sont nécessaires pour louer une voiture en Tunisie ?',
    answer:
      "Un permis de conduire en cours de validité (souvent 1 à 2 ans d’ancienneté), une pièce d’identité ou un passeport et, selon le loueur, un justificatif de réservation Plany suffisent généralement. Pour les conducteurs additionnels, ajoutez simplement leurs documents lors de l’échange avec l’agence."
  },
  {
    question: 'Est-ce que la location inclut une assurance ?',
    answer:
      "Les offres affichées sur Plany.tn détaillent l’assurance incluse (tiers, tous risques selon l’agence) et les options complémentaires comme l’assurance rachat de franchise. Comparez toujours les niveaux de couverture pour choisir la formule adaptée à votre itinéraire en Tunisie."
  },
  {
    question: 'Puis-je récupérer la voiture à l’aéroport et la rendre dans une autre ville ?',
    answer:
      "Oui, la livraison à l’aéroport Tunis-Carthage, Enfidha, Monastir ou Djerba est fréquente. Plusieurs agences acceptent un retour dans une autre ville (one-way) moyennant des frais indiqués à l’avance. Utilisez le comparateur Plany pour filtrer ces options avant de réserver."
  }
] as const

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: 'https://plany.tn/'
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Locations',
      item: 'https://plany.tn/locations'
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Location voiture Tunisie',
      item: 'https://plany.tn/location-voiture-tunisie'
    }
  ]
}

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: locationVoitureTunisieFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
}

export const metaConfig = {
  title: 'Location voiture Tunisie | Comparateur d’agences | Plany.tn',
  description:
    "Comparez les prix de plusieurs agences de location voiture en Tunisie : véhicules récents, réservation en ligne, paiement directement sur place avec livraison aéroport ou hôtel.",
  canonical: 'https://plany.tn/location-voiture-tunisie'
}

const heroBullets = [
  'Comparaison en temps réel des agences locales (citadines, SUV, 4x4, utilitaires).',
  'Réservation en ligne sécurisée, paiement à la livraison ou à l’agence, sans frais cachés.',
  'Livraison disponible dans toute la Tunisie : aéroports, hôtels, centres-villes.',
  'Service client Plany dédié pour faciliter les modifications ou annulations.'
]

const advantageItems = [
  {
    title: 'Comparaison complète des agences',
    description:
      "Plany rassemble les loueurs tunisiens fiables pour vous aider à trouver une location voiture Tunisie adaptée à votre budget et à votre itinéraire, avec des fiches détaillées et des avis authentifiés."
  },
  {
    title: 'Large choix de modèles récents',
    description:
      "Citadines pour les trajets urbains, berlines confort pour les déplacements professionnels, SUV et 4x4 pour explorer les côtes ou le Sud : chaque offre précise le kilométrage, la motorisation et les équipements." 
  },
  {
    title: 'Tarifs transparents et conditions claires',
    description:
      "Nos fiches mettent en avant le carburant, la franchise d’assurance et les frais éventuels pour éviter les surprises. Vous savez exactement ce que couvre votre location voiture pas cher Tunisie."
  },
  {
    title: 'Paiement sur place, sans carte exigée en ligne',
    description:
      "La réservation se valide en quelques clics et vous réglez directement l’agence ou lors de la livraison du véhicule. Cette flexibilité rassure les voyageurs qui souhaitent éviter le prépaiement." 
  },
  {
    title: 'Support client Plany',
    description:
      "Notre équipe répond rapidement si vous avez besoin d’assistance pour modifier un horaire, ajouter un conducteur ou clarifier les options d’assurance."
  },
  {
    title: 'Agences vérifiées et avis clients',
    description:
      "Les partenaires Plany sont audités régulièrement. Les retours des clients permettent de maintenir un haut niveau de qualité sur l’ensemble de la Tunisie."
  }
]

const processSteps = [
  {
    title: 'Choisissez votre ville ou aéroport',
    detail:
      "Indiquez Tunis, Sousse, Sfax, Djerba, Monastir ou l’aéroport Tunis-Carthage, Enfidha, Djerba-Zarzis pour voir immédiatement les offres disponibles."
  },
  {
    title: 'Comparez les voitures et les conditions',
    detail:
      "Filtrez par catégorie, boîte automatique, kilométrage inclus, assurance et politique de dépôt pour trouver la location de voiture en Tunisie qui correspond à vos attentes."
  },
  {
    title: 'Réservez en ligne sans payer par carte',
    detail:
      "Validez votre réservation sur Plany.tn : aucune carte bancaire n’est débitée. L’agence vous contacte ensuite pour confirmer les derniers détails."
  },
  {
    title: 'Récupérez et payez sur place',
    detail:
      "Retirez la voiture à l’heure convenue, payez directement l’agence (espèces, carte ou virement selon le loueur) et commencez votre road-trip tunisien en toute sérénité."
  }
]

const cities = [
  {
    name: 'Location voiture Tunis',
    slug: 'https://plany.tn/location-voiture-pas-cher-a-tunis',
    description:
      "Capitale dynamique, Tunis combine quartiers d’affaires, médina classée UNESCO et plages de la Marsa. Louer une voiture à Tunis ou à l’aéroport Tunis-Carthage facilite vos rendez-vous et vos escapades vers Carthage ou Sidi Bou Saïd."
  },
  {
    name: 'Location voiture Sousse',
    slug: 'https://plany.tn/location-voiture-pas-cher-a-sousse',
    description:
      "Avec sa médina, Port El Kantaoui et ses plages, Sousse attire les familles et les voyageurs d’affaires. Une location voiture Sousse permet d’explorer Monastir, Kairouan ou El Jem en toute liberté." 
  },
  {
    name: 'Location voiture Djerba',
    slug: 'https://plany.tn/location-voiture-pas-cher-a-djerba',
    description:
      "Djerba est idéale pour un séjour balnéaire et culturel. Réserver une voiture à Djerba-Zarzis ou à l’hôtel offre la flexibilité d’explorer Houmt Souk, les plages de Sidi Mahrez et les décors de Tataouine." 
  },
  {
    name: 'Location voiture Sfax',
    slug: 'https://plany.tn/locations',
    description:
      "Ville portuaire active, Sfax est un carrefour professionnel. Louer une voiture à Sfax permet de rejoindre Kerkennah ou Gabès avec un planning maîtrisé." 
  },
  {
    name: 'Location voiture Nabeul / Hammamet',
    slug: 'https://plany.tn/locations',
    description:
      "Pour les séjours balnéaires et les congrès, une location voiture à Hammamet ou Nabeul garantit une autonomie totale entre hôtels, plages et zones industrielles de la région du Cap Bon." 
  }
]

const budgetTips = [
  'Réserver tôt pour sécuriser les meilleures offres, surtout en été et pendant les ponts.',
  'Comparer plusieurs agences pour trouver une location voiture pas cher Tunisie adaptée à votre calendrier.',
  'Opter pour des catégories économiques ou compactes si vous circulez principalement en ville.',
  'Vérifier la politique de carburant et le kilométrage inclus pour éviter les frais supplémentaires.',
  'Consulter les options d’assurance et de franchise afin de limiter la caution ou de réduire les dépôts en espèces.'
]

const LocationVoitureTunisiePage = () => {
  const faqJson = useMemo(() => JSON.stringify(faqJsonLd), [])
  const breadcrumbJson = useMemo(() => JSON.stringify(breadcrumbJsonLd), [])

  return (
    <Layout strict={false}>
      <Helmet>
        <title>{metaConfig.title}</title>
        <meta name="description" content={metaConfig.description} />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={metaConfig.canonical} />
        <meta property="og:title" content={metaConfig.title} />
        <meta property="og:description" content={metaConfig.description} />
        <meta property="og:url" content={metaConfig.canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://plany.tn/static/og/location-voiture-tunisie.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaConfig.title} />
        <meta name="twitter:description" content={metaConfig.description} />
        <meta name="twitter:image" content="https://plany.tn/static/og/location-voiture-tunisie.jpg" />
        <script type="application/ld+json">{breadcrumbJson}</script>
        <script type="application/ld+json">{faqJson}</script>
      </Helmet>

      <header className="bg-gradient-to-r from-blue-50 via-white to-orange-50" aria-label="Location voiture Tunisie">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:items-center lg:py-16">
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Comparateur 100% Tunisie</p>
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Location voiture Tunisie : comparez les agences et réservez en ligne
            </h1>
            <p className="text-lg leading-relaxed text-gray-700">
              Plany.tn facilite la location de voiture en Tunisie : comparez les agences locales, choisissez un véhicule récent et
              réservez en quelques clics. Aucun paiement en ligne n’est exigé : l’agence confirme votre dossier, puis vous payez
              sur place à la livraison ou au comptoir, idéal pour les vacances, un déplacement pro ou un road-trip entre Tunis,
              Sousse, Sfax, Djerba et toutes les grandes villes.
            </p>
            <ul className="grid gap-2 text-gray-700 md:grid-cols-2">
              {heroBullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://plany.tn/locations"
                className="rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Rechercher une voiture
              </a>
              <span className="text-sm text-gray-600">Annulation ou modification flexible avec l’agence</span>
            </div>
          </div>
          <aside className="flex flex-1 flex-col gap-4" aria-label="Recherche location voiture Tunisie">
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="bg-gradient-to-r from-blue-600 to-orange-500 px-4 py-3 text-white">
                <p className="font-semibold">Trouvez votre voiture en Tunisie</p>
                <p className="text-sm">Ajoutez vos dates et comparez immédiatement les prix</p>
              </div>
              <div className="p-4">
                <SearchForm />
              </div>
            </div>
            <img
              src="https://placehold.co/640x360/0F62FE/ffffff?text=Plany.tn+Location+voiture+Tunisie"
              alt="Location de voiture en Tunisie avec Plany, visuels bleu et orange, voitures siglées Plany"
              className="h-auto w-full rounded-2xl object-cover"
              loading="lazy"
            />
          </aside>
        </div>
      </header>

      <main className="bg-white">
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Pourquoi louer une voiture en Tunisie avec Plany ?</h2>
          <p className="mt-4 text-gray-700">
            Plany.tn est né pour simplifier la location voiture Tunisie et accompagner les voyageurs tout au long de leur séjour.
            Notre équipe sélectionne des agences partenaires fiables, affiche les conditions en toute transparence et facilite les
            échanges entre le client et le loueur. Que vous cherchiez une citadine pour Tunis, un SUV pour le Cap Bon ou un 4x4
            pour le Sud, notre comparateur vous aide à réserver vite et bien, avec une assistance locale disponible.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {advantageItems.map((item) => (
              <article key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="rechercher" className="bg-gradient-to-r from-orange-50 via-white to-blue-50">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-bold text-gray-900">Comment fonctionne la location de voiture en Tunisie sur Plany ?</h2>
            <p className="mt-4 text-gray-700">
              Réserver via Plany est rapide : vous consultez les offres des agences tunisiennes en temps réel, vous validez votre
              choix sans payer en ligne, puis l’agence vous contacte pour confirmer la prise en charge. La flexibilité est au cœur
              du service : vous pouvez ajuster l’heure de livraison, ajouter un conducteur ou demander une option bébé avant de
              finaliser le contrat sur place.
            </p>
            <div className="mt-8 grid gap-6 lg:grid-cols-4 md:grid-cols-2">
              {processSteps.map((step, index) => (
                <article key={step.title} className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="mt-4 text-gray-700 leading-relaxed">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Les principales villes pour louer une voiture en Tunisie</h2>
          <p className="mt-4 text-gray-700">
            Plany couvre toutes les régions : du Grand Tunis aux côtes de Sousse, des îles de Djerba aux routes de Sfax ou du Cap
            Bon. Les aéroports Tunis-Carthage, Enfidha-Hammamet, Monastir et Djerba-Zarzis proposent des livraisons rapides.
            Chaque fiche met en avant les distances, les conditions d’assurance et les options pratiques (GPS, siège enfant,
            conducteur additionnel) pour sécuriser votre location de voiture en Tunisie.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {cities.map((city) => (
              <article key={city.name} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">{city.name}</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {city.description} Consultez les disponibilités et les tarifs en visitant la page dédiée :{' '}
                  <a
                    href={city.slug}
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    Voir toutes nos destinations en Tunisie
                  </a>
                  .
                </p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
            <strong>Aéroports desservis :</strong> Tunis-Carthage (TUN), Enfidha-Hammamet (NBE), Monastir Habib-Bourguiba (MIR),
            Djerba-Zarzis (DJE) et Sfax-Thyna (SFA) avec livraison possible à l’hôtel ou au domicile.
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-bold">Conseils pour une location de voiture pas chère en Tunisie</h2>
            <p className="mt-4 text-blue-100">
              Pour une location voiture pas cher Tunisie, anticipez vos dates et utilisez les filtres Plany pour comparer les
              agences locales. La flexibilité sur les horaires de retrait, le choix d’une catégorie économique et la sélection
              d’une politique carburant avantageuse réduisent le budget global sans sacrifier la sécurité.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {budgetTips.map((tip) => (
                <div key={tip} className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-orange-300" aria-hidden="true" />
                  <p className="text-blue-50 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="https://plany.tn/locations"
                className="rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-blue-800"
              >
                Voir les meilleures offres du moment
              </a>
              <p className="text-sm text-blue-100">
                Comparez les assurances, la franchise et le dépôt de garantie avant de valider votre réservation.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Questions fréquentes sur la location de voiture en Tunisie</h2>
          <p className="mt-4 text-gray-700">
            Retrouvez les réponses aux questions les plus courantes sur la location de voiture en Tunisie. Elles complètent les
            informations présentes sur chaque offre et vous aident à choisir une formule flexible et sécurisée.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {locationVoitureTunisieFaqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-orange-50 via-white to-blue-50">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900">Prêt à réserver votre voiture en Tunisie ?</h2>
              <p className="mt-4 text-gray-700">
                Comparez dès maintenant les agences tunisiennes, choisissez un véhicule récent avec assurance incluse et payez
                seulement lors de la remise des clés. Plany.tn vous accompagne pour louer une voiture en Tunisie dans les
                meilleures conditions, que vous arriviez à l’aéroport ou en centre-ville.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="https://plany.tn/locations"
                  className="rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Comparer les offres maintenant
                </a>
                <a
                  href="https://plany.tn/location-voiture-pas-cher-a-djerba"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  Découvrir nos offres à Djerba
                </a>
              </div>
            </div>
          </div>
        </section>
     </main>

     <footer className="bg-gray-900 text-gray-100">
       <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
         <div className="flex flex-wrap gap-4 text-blue-200">
           <a href="/" className="hover:text-white hover:underline">Accueil</a>
           <a href="/about" className="hover:text-white hover:underline">À propos</a>
           <a href="/contact" className="hover:text-white hover:underline">Contact</a>
           <a href="/privacy" className="hover:text-white hover:underline">Politique de confidentialité</a>
           <a href="/tos" className="hover:text-white hover:underline">Conditions d’utilisation</a>
         </div>
         <p className="text-gray-300">
           Plany.tn – Plateforme de location de voiture en Tunisie (agences partenaires, paiement sur place). Livraison en aéroport,
           hôtel ou à domicile partout dans le pays.
         </p>
       </div>
     </footer>
    </Layout>
  )
}

export default LocationVoitureTunisiePage
