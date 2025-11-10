import type { LatLngExpression } from 'leaflet'
import type {
  AdvantageItem,
  NearbyDestination,
  VehicleCategory,
  StatItem,
  HeroContent,
  MapConfig,
  CtaContent,
  LocationLandingPageProps,
} from '@/components/location/LocationLandingPage'

const blogUrl = 'https://blog.plany.tn'

export interface LocationSeoKeywords {
  principal: string[]
  secondaires: string[]
  semantiques: string[]
}

export type LocationSeoData = Omit<LocationLandingPageProps, 'slug' | 'title' | 'metaDescription'> & {
  slug: string
  title: string
  metaDescription: string
  seoKeywords: LocationSeoKeywords
  jsonLd: Array<Record<string, unknown>>
  seoNote: string
}

const commonKeywords = [
  'location voiture Tunisie',
  'location voiture pas cher',
  'location voiture automatique',
  'location voiture sans caution',
  'location voiture aéroport',
  'comparateur location voiture',
  'prix location voiture Tunisie',
  'agence location voiture',
  'louer voiture pas cher',
  'Plany.tn',
]

const createVehicleCategories = (city: string, basePrice: number): VehicleCategory[] => [
  {
    name: 'Mini',
    price: basePrice,
    description: `Parfaites pour se glisser dans les ruelles de ${city}, ces citadines économiques sont idéales pour optimiser votre budget location voiture pas cher.`,
    features: ['Climatisation', '2 bagages cabine', 'Boîte manuelle'],
  },
  {
    name: 'Midi',
    price: basePrice + 18,
    description: `Les berlines intermédiaires conviennent aux familles en séjour à ${city} avec une conduite confortable sur les axes régionaux.`,
    features: ['Transmission automatique selon modèle', '5 places confort', 'Bluetooth'],
  },
  {
    name: 'Maxi',
    price: basePrice + 38,
    description: `SUV ou monospaces grand format pour explorer ${city} et ses environs avec bagages volumineux et climatisation renforcée.`,
    features: ['7 places disponibles', 'Assistance 24h/24', 'Options enfants'],
  },
]

const statsFactory = (city: string, agencies: string, clients: string, rating: string, routes: string): StatItem[] => [
  {
    icon: 'car',
    value: agencies,
    label: 'Agences partenaires',
    description: `Réseau local couvrant les quartiers clés de ${city} pour un retrait rapide.`,
  },
  {
    icon: 'support',
    value: clients,
    label: 'Clients accompagnés',
    description: `Support Plany.tn disponible 7j/7 pour toutes vos demandes de location voiture automatique à ${city}.`,
  },
  {
    icon: 'star',
    value: rating,
    label: 'Note moyenne',
    description: 'Avis vérifiés sur la qualité des véhicules, des assurances et du service client.',
  },
  {
    icon: 'experience',
    value: routes,
    label: 'Itinéraires proposés',
    description: `Idées de roadtrips depuis ${city} vers les sites culturels et balnéaires à proximité.`,
  },
]

const mapConfig = (position: LatLngExpression, description: string, zoom = 12): MapConfig => ({
  position,
  description,
  zoom,
})

const heroFactory = (headline: string, subheading: string, paragraphs: string[]): HeroContent => ({
  headline,
  subheading,
  paragraphs,
})

const faqIntroFactory = (city: string) => `Toutes les réponses pour préparer votre location de voiture à ${city} avec Plany.`

const ctaFactory = (city: string): CtaContent => ({
  title: `Prêt à rouler vers ${city} avec Plany ?`,
  description: `Comparez les offres locales, sélectionnez vos options (automatique, GPS, sièges enfants) et validez votre réservation en ligne. Votre voiture vous attend à ${city} dès votre arrivée.`,
})

const advantagesFactory = (city: string): AdvantageItem[] => [
  {
    icon: 'price',
    title: 'Tarifs transparents',
    description: `Plany.tn affiche les prix réels négociés avec les loueurs de ${city} sans frais cachés ni mauvaise surprise.`,
  },
  {
    icon: 'car',
    title: 'Choix varié',
    description: `Citadines, berlines, SUV ou utilitaires : nous couvrons les besoins loisirs et pros pour louer une voiture à ${city}.`,
  },
  {
    icon: 'support',
    title: 'Assistance 7j/7',
    description: `Support client tunisien disponible en français et en arabe pour suivre votre location voiture sans caution à ${city}.`,
  },
  {
    icon: 'experience',
    title: 'Réservations certifiées',
    description: `Contrats vérifiés, paiement sécurisé et agences partenaires contrôlées pour une expérience sereine à ${city}.`,
  },
]

interface NearbyInput extends Omit<NearbyDestination, 'description'> {
  description: string
  imageAlt: string
}

const nearbyFactory = (city: string, items: NearbyInput[]): (NearbyDestination & { imageAlt: string })[] =>
  items.map((item) => ({
    ...item,
    description: `${item.description} Louez votre voiture à ${city} et rejoignez ${item.name} facilement avec Plany.tn.`,
  }))

const createJsonLd = (
  city: string,
  slug: string,
  metaDescription: string,
  latitude: number,
  longitude: number,
): Array<Record<string, unknown>> => [
  {
    '@context': 'https://schema.org',
    '@type': 'CarRental',
    name: `Plany.tn - Location voiture à ${city}`,
    url: `https://plany.tn${slug}`,
    image: 'https://plany.tn/logo.png',
    priceRange: '50-150 TND',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressCountry: 'TN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    },
    description: metaDescription,
    sameAs: [
      'https://www.facebook.com/plany.Tun',
      'https://www.instagram.com/plany.tn/',
      'https://www.youtube.com/@planyTN',
      'https://www.tiktok.com/@planytn',
    ],
  },
]

const seoNote = 'Plany.tn, comparateur tunisien de location de voitures, référence plus de 100 agences certifiées dans tout le pays. Des offres fiables, automatiques ou sans caution, disponibles à l’aéroport et en centre-ville.'

const locationDataSEO: Record<string, LocationSeoData> = {}

export default locationDataSEO

locationDataSEO.tunis = {
  city: 'Tunis',
  slug: '/location-voiture-pas-cher-a-tunis',
  title: 'Location voiture pas cher à Tunis | Plany',
  metaDescription:
    'Comparez et réservez votre location voiture Tunis et à l’aéroport Tunis-Carthage avec Plany.tn. Louez une citadine ou un SUV automatique sans caution, assurance incluse et assistance locale 7j/7 pour tous vos déplacements.',
  seoKeywords: {
    principal: ['location voiture Tunis', 'location voiture aéroport Tunis-Carthage'],
    secondaires: [
      'location voiture pas cher Tunis',
      'voiture automatique Tunis',
      'prix location voiture Tunisie',
    ],
    semantiques: [...commonKeywords, 'voiture sans caution Tunis', 'comparateur Plany Tunis'],
  },
  hero: heroFactory(
    'Location voiture Tunis avec Plany.tn',
    'Réservez votre voiture à Tunis ou à l’aéroport Tunis-Carthage en quelques clics.',
    [
      'Plany.tn compare en temps réel les prix des agences locales pour une location voiture Tunis pas cher, même en haute saison.',
      'Choisissez citadine, berline ou SUV automatique avec options sans caution pour circuler entre la médina, Les Berges du Lac et La Marsa.',
      'Notre comparateur tunisien sécurise votre réservation avec assurance incluse, support client 7j/7 et retrait express à Tunis-Carthage.',
    ],
  ),
  advantages: advantagesFactory('Tunis'),
  nearbyDestinations: nearbyFactory('Tunis', [
    {
      name: 'Hammamet',
      image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-hammamet',
      description: 'Cap Bon, plages et corniche de Yasmine Hammamet à 45 minutes.',
      imageAlt: 'Location voiture Hammamet depuis Tunis avec Plany.tn pour visiter la corniche Yasmine',
    },
    {
      name: 'Nabeul',
      image: 'https://images.unsplash.com/photo-1544635395-8fd4f7c3fc2b?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-nabeul',
      description: 'Artisanat de la poterie et marchés d’agrumes de Nabeul.',
      imageAlt: 'Location voiture Nabeul pour découvrir les souks d’agrumes avec Plany.tn',
    },
    {
      name: 'Bizerte',
      image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-bizerte',
      description: 'Vieux port, plages de Sidi Salem et routes panoramiques.',
      imageAlt: 'Louer une voiture à Tunis pour rejoindre Bizerte et son vieux port avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Tunis, rejoignez rapidement Hammamet, Nabeul ou Bizerte grâce à une location voiture automatique. La capitale est un point de départ idéal pour explorer le nord de la Tunisie.',
  vehicleIntro:
    'À Tunis, les voyageurs alternent entre citadine maniable pour la médina, berline automatique pour les rendez-vous d’affaires aux Berges du Lac et SUV pour un roadtrip vers Bizerte.',
  vehicleCategories: createVehicleCategories('Tunis', 60),
  map: mapConfig(
    [36.8065, 10.1815],
    'Retrait possible à l’aéroport Tunis-Carthage, au centre-ville, aux Berges du Lac et dans les hôtels partenaires.',
  ),
  stats: statsFactory('Tunis', '120+', '18 500', '4.9/5', '35 circuits'),
  statsIntro:
    'Plany.tn accompagne chaque année des milliers de voyageurs à Tunis avec une note moyenne de 4.9/5 et plus de 120 agences partenaires couvrant toute la capitale.',
  faqItems: [
    {
      question: 'Quel est le prix moyen d’une location voiture à Tunis ?',
      answer:
        'Les offres démarrent à 55 TND/jour pour une citadine. Plany.tn compare les tarifs des agences tunisiennes pour garantir le meilleur prix.',
    },
    {
      question: 'Peut-on louer une voiture sans caution à Tunis ?',
      answer:
        'Oui, plusieurs partenaires proposent des formules sans caution ou dépôt réduit. Filtrez ces offres sur Plany.tn lors de votre recherche.',
    },
    {
      question: 'Y a-t-il des voitures automatiques à l’aéroport Tunis-Carthage ?',
      answer:
        'Oui, des SUV et berlines automatiques sont livrables directement au terminal Tunis-Carthage avec assurance incluse.',
    },
    {
      question: 'Comment récupérer mon véhicule à Tunis ?',
      answer:
        'Choisissez retrait en agence centre-ville, livraison à l’hôtel ou accueil à l’aéroport. Plany.tn envoie les instructions détaillées par e-mail.',
    },
    {
      question: 'Pourquoi utiliser le comparateur Plany.tn ?',
      answer:
        'Plany.tn centralise les disponibilités, avis et options pour louer une voiture à Tunis pas cher avec un service client local 7j/7.',
    },
  ],
  faqIntro: faqIntroFactory('Tunis'),
  internalLinks: [
    '/location-voiture-pas-cher-a-sousse',
    '/location-voiture-pas-cher-a-nabeul',
    '/location-voiture-pas-cher-a-hammamet',
    '/location-voiture-pas-cher-a-bizerte',
  ],
  blogUrl,
  cta: ctaFactory('Tunis'),
  crosslinkIntro: 'Prolongez votre roadtrip vers',
  jsonLd: createJsonLd(
    'Tunis',
    '/location-voiture-pas-cher-a-tunis',
    'Comparez et réservez votre location voiture Tunis et à l’aéroport Tunis-Carthage avec Plany.tn. Louez une citadine ou un SUV automatique sans caution, assurance incluse et assistance locale 7j/7 pour tous vos déplacements.',
    36.8065,
    10.1815,
  ),
  seoNote,
}

locationDataSEO.sousse = {
  city: 'Sousse',
  slug: '/location-voiture-pas-cher-a-sousse',
  title: 'Location voiture pas cher à Sousse | Plany',
  metaDescription:
    'Réservez votre location voiture Sousse, Port El Kantaoui ou hôtels du Sahel avec Plany.tn. Comparez les agences locales, louez une citadine ou un SUV automatique sans caution et profitez d’une assistance 7j/7 depuis l’aéroport Monastir.',
  seoKeywords: {
    principal: ['location voiture Sousse', 'location voiture Port El Kantaoui'],
    secondaires: ['louer voiture pas cher Sousse', 'voiture automatique Sousse', 'location voiture aéroport Monastir'],
    semantiques: [...commonKeywords, 'comparateur location voiture Sousse', 'location voiture Sahel tunisien'],
  },
  hero: heroFactory(
    'Location voiture Sousse avec Plany.tn',
    'Explorez Sousse, Port El Kantaoui et le Sahel en toute liberté.',
    [
      'Plany.tn sélectionne les meilleures offres de location voiture Sousse pour des vacances à Port El Kantaoui, Boujaafar ou Kalaa Kebira.',
      'Comparez citadines, SUV climatisés et voitures automatiques livrées aux hôtels ou à l’aéroport de Monastir Habib-Bourguiba.',
      'Réservez en ligne sans stress, options sans caution et assistance tunisienne 7j/7 pour vos trajets sur la côte du Sahel.',
    ],
  ),
  advantages: advantagesFactory('Sousse'),
  nearbyDestinations: nearbyFactory('Sousse', [
    {
      name: 'Monastir',
      image: 'https://images.unsplash.com/photo-1551887673-31b605e1c04c?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-monastir',
      description: 'Ribat, marina et aéroport international de Monastir.',
      imageAlt: 'Location voiture Monastir depuis Sousse avec Plany.tn pour visiter la marina',
    },
    {
      name: 'Mahdia',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-mahdia',
      description: 'Plages turquoise et port de pêche de Mahdia.',
      imageAlt: 'Louer une voiture à Sousse pour découvrir les plages de Mahdia avec Plany.tn',
    },
    {
      name: 'Kairouan',
      image: 'https://images.unsplash.com/photo-1512455102796-9a9d0d87b100?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kairouan',
      description: 'Mosquées, souks et patrimoine UNESCO de Kairouan.',
      imageAlt: 'Location voiture Sousse vers Kairouan pour visiter la Grande Mosquée avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Avec une voiture louée à Sousse, planifiez des excursions vers Monastir, Mahdia ou Kairouan et profitez des routes rapides du Sahel tunisien.',
  vehicleIntro:
    'Les visiteurs choisissent citadine automatique pour Port El Kantaoui, berline spacieuse pour un aller-retour vers Kairouan et SUV climatisé pour explorer la côte.',
  vehicleCategories: createVehicleCategories('Sousse', 52),
  map: mapConfig(
    [35.8256, 10.636],
    'Récupérez votre voiture avenue Habib Bourguiba, Port El Kantaoui ou directement à votre hôtel sur la zone touristique.',
  ),
  stats: statsFactory('Sousse', '80+', '11 200', '4.8/5', '24 circuits'),
  statsIntro:
    'À Sousse, plus de 80 agences partenaires assurent des retraits rapides et un parc récent pour des milliers de clients chaque année.',
  faqItems: [
    {
      question: 'Combien coûte une location voiture à Sousse ?',
      answer:
        'Les tarifs commencent à 50 TND/jour pour une citadine. Plany.tn affiche les prix exacts des agences du Sahel sans frais cachés.',
    },
    {
      question: 'Peut-on louer sans caution à Sousse ?',
      answer:
        'Oui, certaines agences Plany.tn proposent des formules sans caution ou avec dépôt réduit, idéal pour un séjour tout compris.',
    },
    {
      question: 'La livraison à l’hôtel est-elle disponible ?',
      answer:
        'Oui, les partenaires livrent les voitures dans les hôtels de Port El Kantaoui ou Sousse centre sur simple demande.',
    },
    {
      question: 'Puis-je récupérer un SUV automatique à Monastir ?',
      answer:
        'Oui, nous organisons la livraison à l’aéroport de Monastir Habib-Bourguiba avec des SUV automatiques climatisés.',
    },
    {
      question: 'Pourquoi réserver via le comparateur Plany.tn ?',
      answer:
        'Plany.tn centralise avis clients, options et assurances pour louer une voiture à Sousse pas cher en toute confiance.',
    },
  ],
  faqIntro: faqIntroFactory('Sousse'),
  internalLinks: [
    '/location-voiture-pas-cher-a-monastir',
    '/location-voiture-pas-cher-a-mahdia',
    '/location-voiture-pas-cher-a-kairouan',
    '/location-voiture-pas-cher-a-hammamet',
  ],
  blogUrl,
  cta: ctaFactory('Sousse'),
  crosslinkIntro: 'Envie de découvrir aussi',
  jsonLd: createJsonLd(
    'Sousse',
    '/location-voiture-pas-cher-a-sousse',
    'Réservez votre location voiture Sousse, Port El Kantaoui ou hôtels du Sahel avec Plany.tn. Comparez les agences locales, louez une citadine ou un SUV automatique sans caution et profitez d’une assistance 7j/7 depuis l’aéroport Monastir.',
    35.8256,
    10.636,
  ),
  seoNote,
}

locationDataSEO.sfax = {
  city: 'Sfax',
  slug: '/location-voiture-pas-cher-a-sfax',
  title: 'Location voiture pas cher à Sfax | Plany',
  metaDescription:
    'Réservez une location voiture Sfax, zone industrielle ou aéroport Thyna avec Plany.tn. Citadine diesel, berline ou utilitaire automatique, sans caution et avec assurance incluse pour vos trajets professionnels en Tunisie.',
  seoKeywords: {
    principal: ['location voiture Sfax', 'location voiture aéroport Thyna'],
    secondaires: ['location utilitaire Sfax', 'voiture diesel Sfax', 'louer voiture pas cher Sfax'],
    semantiques: [...commonKeywords, 'comparateur location voiture Sfax', 'location voiture business Sfax'],
  },
  hero: heroFactory(
    'Location voiture Sfax avec Plany.tn',
    'Optimisez vos déplacements depuis le port, la zone industrielle ou Thyna.',
    [
      'Plany.tn propose des offres adaptées aux professionnels et familles à Sfax avec livraison au centre-ville, à Sidi Mansour ou à l’aéroport Thyna.',
      'Choisissez une voiture diesel, un utilitaire frigorifique ou une berline automatique pour rejoindre Gabès, Mahres ou Skhira.',
      'Réservez en ligne avec assurance incluse, assistance route 24h/24 et options sans caution pour maîtriser vos coûts.',
    ],
  ),
  advantages: advantagesFactory('Sfax'),
  nearbyDestinations: nearbyFactory('Sfax', [
    {
      name: 'Gabès',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-gabes',
      description: 'Port de Ghannouch et oasis maritime de Gabès.',
      imageAlt: 'Location voiture Sfax vers Gabès pour explorer l’oasis avec Plany.tn',
    },
    {
      name: 'Mahdia',
      image: 'https://images.unsplash.com/photo-1543353071-087092ec3932?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-mahdia',
      description: 'Centre historique, corniche et port de Mahdia.',
      imageAlt: 'Louer une voiture à Sfax pour visiter la corniche de Mahdia avec Plany.tn',
    },
    {
      name: 'Kerkennah',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-sfax',
      description: 'Archipel de Kerkennah accessible via le bac de Sfax.',
      imageAlt: 'Location voiture Sfax pour rejoindre Kerkennah avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Sfax, une voiture de location facilite les déplacements entre zones industrielles, port de commerce et villes du sud comme Gabès ou Gafsa.',
  vehicleIntro:
    'Les citadines diesel conviennent aux trajets urbains, les berlines automatiques rassurent les cadres en mission et les utilitaires répondent aux besoins logistiques à Sfax.',
  vehicleCategories: createVehicleCategories('Sfax', 54),
  map: mapConfig(
    [34.7406, 10.7603],
    'Retrait à l’aéroport Sfax-Thyna, avenue de la République ou dans les zones industrielles Sidi Salem et Sakiet Ezzit.',
  ),
  stats: statsFactory('Sfax', '70+', '9 100', '4.7/5', '20 circuits'),
  statsIntro:
    'Plany.tn couvre la métropole sfaxienne avec plus de 70 agences partenaires spécialisées dans les flottes professionnelles et familiales.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Sfax ?',
      answer:
        'Les citadines débutent à 52 TND/jour. Comparez les tarifs diesel et automatique sur Plany.tn pour sécuriser votre budget.',
    },
    {
      question: 'Puis-je louer un utilitaire à Sfax ?',
      answer:
        'Oui, camionnettes frigorifiques et fourgonnettes sont disponibles pour les livraisons dans la région sfaxienne.',
    },
    {
      question: 'Existe-t-il des offres sans caution ?',
      answer:
        'Certaines agences Plany.tn proposent un dépôt réduit ou des assurances couvrant la caution, idéal pour les missions courtes.',
    },
    {
      question: 'La livraison à l’aéroport Thyna est-elle possible ?',
      answer:
        'Oui, réservez votre voiture et récupérez-la à l’aéroport Sfax-Thyna dès l’atterrissage.',
    },
    {
      question: 'Plany.tn propose-t-il des voitures automatiques à Sfax ?',
      answer:
        'Oui, berlines et SUV automatiques sont disponibles avec assistance 24h/24 pour vos trajets professionnels.',
    },
  ],
  faqIntro: faqIntroFactory('Sfax'),
  internalLinks: [
    '/location-voiture-pas-cher-a-gabes',
    '/location-voiture-pas-cher-a-mahdia',
    '/location-voiture-pas-cher-a-kairouan',
    '/location-voiture-pas-cher-a-tozeur',
  ],
  blogUrl,
  cta: ctaFactory('Sfax'),
  crosslinkIntro: 'Poursuivez votre trajet vers',
  jsonLd: createJsonLd(
    'Sfax',
    '/location-voiture-pas-cher-a-sfax',
    'Réservez une location voiture Sfax, zone industrielle ou aéroport Thyna avec Plany.tn. Citadine diesel, berline ou utilitaire automatique, sans caution et avec assurance incluse pour vos trajets professionnels en Tunisie.',
    34.7406,
    10.7603,
  ),
  seoNote,
}

locationDataSEO.nabeul = {
  city: 'Nabeul',
  slug: '/location-voiture-pas-cher-a-nabeul',
  title: 'Location voiture pas cher à Nabeul | Plany',
  metaDescription:
    'Comparez les offres de location voiture Nabeul, Korba ou Hammamet avec Plany.tn. Réservez une citadine, SUV automatique ou familiale sans caution, retrait en centre-ville ou hôtel, et profitez des routes du Cap Bon en toute liberté.',
  seoKeywords: {
    principal: ['location voiture Nabeul', 'location voiture Cap Bon'],
    secondaires: ['location voiture pas cher Nabeul', 'voiture automatique Nabeul', 'comparateur location voiture Cap Bon'],
    semantiques: [...commonKeywords, 'location voiture Hammamet', 'roadtrip Cap Bon'],
  },
  hero: heroFactory(
    'Location voiture Nabeul avec Plany.tn',
    'Explorez le Cap Bon entre plages, artisanat et stations balnéaires.',
    [
      'Réservez votre location voiture Nabeul pas cher avec Plany.tn pour visiter Korba, Kelibia et les plages du Cap Bon.',
      'Choisissez citadine automatique pour circuler dans le centre, SUV pour rejoindre les falaises de Haouaria ou familiale pour un séjour à Hammamet.',
      'Nos agences partenaires proposent des retraits sans caution, livraison à l’hôtel et assurance complète pour des vacances sereines.',
    ],
  ),
  advantages: advantagesFactory('Nabeul'),
  nearbyDestinations: nearbyFactory('Nabeul', [
    {
      name: 'Hammamet',
      image: 'https://images.unsplash.com/photo-1543353071-087092ec3932?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-hammamet',
      description: 'Yasmine Hammamet et sa marina animée.',
      imageAlt: 'Location voiture Nabeul pour rejoindre Yasmine Hammamet avec Plany.tn',
    },
    {
      name: 'Kelibia',
      image: 'https://images.unsplash.com/photo-1526481280695-3c46947ebd1c?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-nabeul',
      description: 'Forteresse et plages cristallines de Kelibia.',
      imageAlt: 'Louer une voiture à Nabeul pour explorer Kelibia grâce à Plany.tn',
    },
    {
      name: 'Korba',
      image: 'https://images.unsplash.com/photo-1526483360412-f4dbaf036963?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-nabeul',
      description: 'Lagune de Korba et circuits œnotouristiques.',
      imageAlt: 'Location voiture Cap Bon pour découvrir la lagune de Korba avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Une voiture louée à Nabeul vous permet de parcourir facilement le Cap Bon, de Yasmine Hammamet aux vignobles de Grombalya.',
  vehicleIntro:
    'Les voyageurs alternent entre citadine automatique pour les souks, familiale pour les plages et SUV pour explorer Haouaria et les falaises.',
  vehicleCategories: createVehicleCategories('Nabeul', 50),
  map: mapConfig(
    [36.4513, 10.735],
    'Retrait en centre-ville, zone touristique de Hammamet Nord ou livraison dans les hôtels de Korba.',
  ),
  stats: statsFactory('Nabeul', '55+', '7 600', '4.8/5', '18 circuits'),
  statsIntro:
    'Plany.tn accompagne les séjours balnéaires avec un réseau d’agences spécialisées sur le Cap Bon et une note client de 4.8/5.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Nabeul ?',
      answer:
        'Les tarifs débutent à 48 TND/jour. Plany.tn affiche les offres des loueurs du Cap Bon pour un budget maîtrisé.',
    },
    {
      question: 'Puis-je louer sans caution à Nabeul ?',
      answer:
        'Oui, plusieurs partenaires proposent des offres sans caution ou dépôt réduit, pratique pour un séjour court.',
    },
    {
      question: 'Les voitures automatiques sont-elles disponibles ?',
      answer:
        'Oui, SUV et berlines automatiques sont livrables à votre hôtel ou au centre-ville.',
    },
    {
      question: 'Peut-on récupérer la voiture à Hammamet ?',
      answer:
        'Oui, choisissez une livraison à Hammamet ou Yasmine Hammamet via Plany.tn.',
    },
    {
      question: 'Pourquoi choisir Plany.tn pour Nabeul ?',
      answer:
        'Plany.tn est le comparateur local dédié à la location voiture Cap Bon avec avis vérifiés et assistance 7j/7.',
    },
  ],
  faqIntro: faqIntroFactory('Nabeul'),
  internalLinks: [
    '/location-voiture-pas-cher-a-hammamet',
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-sousse',
    '/location-voiture-pas-cher-a-mahdia',
  ],
  blogUrl,
  cta: ctaFactory('Nabeul'),
  crosslinkIntro: 'Parcourez également',
  jsonLd: createJsonLd(
    'Nabeul',
    '/location-voiture-pas-cher-a-nabeul',
    'Comparez les offres de location voiture Nabeul, Korba ou Hammamet avec Plany.tn. Réservez une citadine, SUV automatique ou familiale sans caution, retrait en centre-ville ou hôtel, et profitez des routes du Cap Bon en toute liberté.',
    36.4513,
    10.735,
  ),
  seoNote,
}

locationDataSEO.monastir = {
  city: 'Monastir',
  slug: '/location-voiture-pas-cher-a-monastir',
  title: 'Location voiture pas cher à Monastir | Plany',
  metaDescription:
    'Réservez votre location voiture Monastir, aéroport Habib-Bourguiba ou marina avec Plany.tn. Louez une citadine, familiale ou SUV automatique sans caution pour visiter Sousse, Mahdia et tout le Sahel tunisien.',
  seoKeywords: {
    principal: ['location voiture Monastir', 'location voiture aéroport Monastir'],
    secondaires: ['voiture automatique Monastir', 'location voiture pas cher Monastir', 'comparateur location voiture Sahel'],
    semantiques: [...commonKeywords, 'location voiture Port El Kantaoui', 'roadtrip Sahel tunisien'],
  },
  hero: heroFactory(
    'Location voiture Monastir avec Plany.tn',
    'Découvrez la marina, le ribat et le Sahel tunisien en voiture.',
    [
      'Plany.tn centralise les offres des agences de Monastir pour louer une voiture dès votre arrivée à l’aéroport Habib-Bourguiba.',
      'Choisissez citadine, familiale ou SUV automatique avec options sans caution et assurance incluse pour rejoindre Sousse et Mahdia.',
      'Réservation 100 % en ligne, assistance locale 7j/7 et contrats vérifiés pour un séjour balnéaire serein.',
    ],
  ),
  advantages: advantagesFactory('Monastir'),
  nearbyDestinations: nearbyFactory('Monastir', [
    {
      name: 'Sousse',
      image: 'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-sousse',
      description: 'Médina classée UNESCO et Port El Kantaoui à 20 minutes.',
      imageAlt: 'Location voiture Monastir pour visiter Sousse et Port El Kantaoui avec Plany.tn',
    },
    {
      name: 'Mahdia',
      image: 'https://images.unsplash.com/photo-1559589689-577aabd1db4f?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-mahdia',
      description: 'Plages sauvages et port de Mahdia.',
      imageAlt: 'Louer une voiture à Monastir pour rejoindre les plages de Mahdia grâce à Plany.tn',
    },
    {
      name: 'El Jem',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kairouan',
      description: 'Amphithéâtre romain El Jem classé UNESCO.',
      imageAlt: 'Location voiture Monastir vers El Jem pour découvrir l’amphithéâtre avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Monastir est le point de départ idéal pour rayonner sur le Sahel : Sousse, Mahdia et El Jem se rejoignent en moins d’une heure.',
  vehicleIntro:
    'Les familles apprécient les monospaces automatiques pour les stations balnéaires, tandis que les citadines conviennent aux ruelles du centre historique.',
  vehicleCategories: createVehicleCategories('Monastir', 50),
  map: mapConfig(
    [35.7643, 10.8113],
    'Retrait possible à l’aéroport Habib-Bourguiba, à la marina ou dans les hôtels de la zone touristique.',
  ),
  stats: statsFactory('Monastir', '60+', '8 900', '4.8/5', '21 circuits'),
  statsIntro:
    'Avec un taux de satisfaction de 4.8/5, Plany.tn dessert la région de Monastir via 60 agences partenaires contrôlées.',
  faqItems: [
    {
      question: 'Quel est le tarif d’une location voiture à Monastir ?',
      answer:
        'Les prix commencent à 48 TND/jour. Comparez les promotions saisonnières sur Plany.tn pour optimiser votre budget.',
    },
    {
      question: 'La livraison à l’aéroport est-elle disponible ?',
      answer:
        'Oui, les partenaires livrent les véhicules directement à l’aéroport Habib-Bourguiba avec accueil personnalisé.',
    },
    {
      question: 'Peut-on louer sans caution ?',
      answer:
        'Des offres sans caution ou avec dépôt réduit sont proposées via notre comparateur, idéales pour un séjour all inclusive.',
    },
    {
      question: 'Les voitures automatiques sont-elles nombreuses ?',
      answer:
        'Oui, SUV, berlines et minivans automatiques sont disponibles toute l’année à Monastir.',
    },
    {
      question: 'Pourquoi choisir Plany.tn ?',
      answer:
        'Plany.tn offre un comparatif transparent des agences du Sahel avec avis clients et assistance locale.',
    },
  ],
  faqIntro: faqIntroFactory('Monastir'),
  internalLinks: [
    '/location-voiture-pas-cher-a-sousse',
    '/location-voiture-pas-cher-a-mahdia',
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-kairouan',
  ],
  blogUrl,
  cta: ctaFactory('Monastir'),
  crosslinkIntro: 'Complétez votre séjour avec',
  jsonLd: createJsonLd(
    'Monastir',
    '/location-voiture-pas-cher-a-monastir',
    'Réservez votre location voiture Monastir, aéroport Habib-Bourguiba ou marina avec Plany.tn. Louez une citadine, familiale ou SUV automatique sans caution pour visiter Sousse, Mahdia et tout le Sahel tunisien.',
    35.7643,
    10.8113,
  ),
  seoNote,
}

locationDataSEO.mahdia = {
  city: 'Mahdia',
  slug: '/location-voiture-pas-cher-a-mahdia',
  title: 'Location voiture pas cher à Mahdia | Plany',
  metaDescription:
    'Louez votre voiture à Mahdia avec Plany.tn : citadine, familiale ou SUV automatique sans caution. Retrait à la corniche, dans les hôtels ou depuis Monastir. Comparez les prix des agences locales et explorez la côte du Sahel.',
  seoKeywords: {
    principal: ['location voiture Mahdia', 'louer voiture Mahdia pas cher'],
    secondaires: ['voiture automatique Mahdia', 'location voiture Sahel', 'comparateur location voiture Mahdia'],
    semantiques: [...commonKeywords, 'location voiture Monastir', 'roadtrip Mahdia'],
  },
  hero: heroFactory(
    'Location voiture Mahdia avec Plany.tn',
    'Explorez la corniche, les plages et le patrimoine historique.',
    [
      'Plany.tn rassemble les offres des agences de Mahdia pour des locations pas chères, même en haute saison estivale.',
      'Optez pour une citadine automatique pour la médina, un SUV climatisé pour les plages de Rejiche ou une familiale pour voyager en tribu.',
      'Assurance incluse, options sans caution et assistance locale 7j/7 pour profiter sereinement du littoral du Sahel.',
    ],
  ),
  advantages: advantagesFactory('Mahdia'),
  nearbyDestinations: nearbyFactory('Mahdia', [
    {
      name: 'Monastir',
      image: 'https://images.unsplash.com/photo-1526481280695-3c46947ebd1c?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-monastir',
      description: 'Ribat et marina de Monastir à 45 minutes.',
      imageAlt: 'Location voiture Mahdia vers Monastir pour profiter de la marina avec Plany.tn',
    },
    {
      name: 'Sousse',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-sousse',
      description: 'Vieille médina et Port El Kantaoui.',
      imageAlt: 'Louer une voiture à Mahdia pour découvrir Sousse et Port El Kantaoui avec Plany.tn',
    },
    {
      name: 'El Jem',
      image: 'https://images.unsplash.com/photo-1549092279-3fd7349cda4d?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kairouan',
      description: 'Amphithéâtre romain et patrimoine antique.',
      imageAlt: 'Location voiture Mahdia pour visiter El Jem avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Mahdia, rejoignez en voiture Monastir, Sousse ou El Jem et profitez d’un roadtrip culturel et balnéaire dans le Sahel.',
  vehicleIntro:
    'Les voyageurs privilégient la citadine automatique pour les ruelles, la familiale pour les séjours en bord de mer et le SUV pour explorer les plages sauvages.',
  vehicleCategories: createVehicleCategories('Mahdia', 50),
  map: mapConfig(
    [35.5047, 11.0622],
    'Retrait à la corniche de Mahdia, au centre-ville ou via livraison dans les hôtels zone touristique.',
  ),
  stats: statsFactory('Mahdia', '45+', '5 900', '4.8/5', '16 circuits'),
  statsIntro:
    'Plany.tn référence plus de 45 agences locales à Mahdia avec un taux de satisfaction de 4.8/5 et une assistance continue.',
  faqItems: [
    {
      question: 'Quel est le coût d’une location voiture à Mahdia ?',
      answer:
        'Les offres débutent à 50 TND/jour. Comparez les promotions saisonnières sur Plany.tn pour profiter du meilleur tarif.',
    },
    {
      question: 'Peut-on louer une voiture sans caution ?',
      answer:
        'Oui, certaines agences proposent des contrats sans caution ou dépôt réduit avec assurance renforcée.',
    },
    {
      question: 'Les véhicules automatiques sont-ils disponibles ?',
      answer:
        'Oui, Plany.tn propose des berlines et SUV automatiques livrables à votre hôtel de Mahdia.',
    },
    {
      question: 'Y a-t-il un service de livraison ?',
      answer:
        'Oui, les loueurs livrent les voitures dans les resorts de la corniche ou directement depuis Monastir.',
    },
    {
      question: 'Pourquoi réserver via Plany.tn ?',
      answer:
        'Le comparateur Plany.tn affiche les avis clients, les assurances et les options pour une location voiture Mahdia en toute sécurité.',
    },
  ],
  faqIntro: faqIntroFactory('Mahdia'),
  internalLinks: [
    '/location-voiture-pas-cher-a-sousse',
    '/location-voiture-pas-cher-a-monastir',
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-kairouan',
  ],
  blogUrl,
  cta: ctaFactory('Mahdia'),
  crosslinkIntro: 'Explorez aussi',
  jsonLd: createJsonLd(
    'Mahdia',
    '/location-voiture-pas-cher-a-mahdia',
    'Louez votre voiture à Mahdia avec Plany.tn : citadine, familiale ou SUV automatique sans caution. Retrait à la corniche, dans les hôtels ou depuis Monastir. Comparez les prix des agences locales et explorez la côte du Sahel.',
    35.5047,
    11.0622,
  ),
  seoNote,
}

locationDataSEO.kairouan = {
  city: 'Kairouan',
  slug: '/location-voiture-pas-cher-a-kairouan',
  title: 'Location voiture pas cher à Kairouan | Plany',
  metaDescription:
    'Réservez votre location voiture Kairouan avec Plany.tn pour explorer la médina UNESCO, la Grande Mosquée et les routes vers Sousse ou Sfax. Citadine, SUV automatique ou utilitaire sans caution, retrait rapide en centre-ville.',
  seoKeywords: {
    principal: ['location voiture Kairouan', 'louer voiture Kairouan'],
    secondaires: ['location voiture pas cher Kairouan', 'SUV automatique Kairouan', 'comparateur location voiture Kairouan'],
    semantiques: [...commonKeywords, 'roadtrip Kairouan', 'visite Grande Mosquée Kairouan'],
  },
  hero: heroFactory(
    'Location voiture Kairouan avec Plany.tn',
    'Découvrez le patrimoine religieux et les souks historiques en toute liberté.',
    [
      'Plany.tn facilite la location voiture Kairouan pour accéder aux monuments classés UNESCO, aux bassins des Aghlabides et aux villages artisanaux.',
      'Sélectionnez citadine compacte, SUV automatique ou utilitaire pour vos déplacements vers Sousse, Sfax ou les zones rurales.',
      'Nos partenaires offrent des formules sans caution, assurance tous risques et assistance 7j/7 pour rouler sereinement en Tunisie.',
    ],
  ),
  advantages: advantagesFactory('Kairouan'),
  nearbyDestinations: nearbyFactory('Kairouan', [
    {
      name: 'Sousse',
      image: 'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-sousse',
      description: 'Plages et médina de Sousse à moins d’une heure.',
      imageAlt: 'Location voiture Kairouan vers Sousse avec Plany.tn',
    },
    {
      name: 'Monastir',
      image: 'https://images.unsplash.com/photo-1526481280695-3c46947ebd1c?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-monastir',
      description: 'Aéroport Habib-Bourguiba pour vos arrivées internationales.',
      imageAlt: 'Louer une voiture à Kairouan pour rejoindre l’aéroport de Monastir via Plany.tn',
    },
    {
      name: 'El Jem',
      image: 'https://images.unsplash.com/photo-1549092279-3fd7349cda4d?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kairouan',
      description: 'Amphithéâtre romain et patrimoine antique.',
      imageAlt: 'Location voiture Kairouan pour visiter El Jem avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'En louant une voiture à Kairouan, vous accédez facilement aux sites religieux, aux marchés artisanaux et aux villes du Sahel.',
  vehicleIntro:
    'Citadine pour les ruelles historiques, SUV automatique pour les routes régionales, utilitaire pour les artisans transportant leurs marchandises.',
  vehicleCategories: createVehicleCategories('Kairouan', 48),
  map: mapConfig(
    [35.6781, 10.0963],
    'Retrait au centre-ville, près de la Grande Mosquée ou livraison aux hôtels et maisons d’hôtes.',
  ),
  stats: statsFactory('Kairouan', '40+', '4 800', '4.7/5', '15 circuits'),
  statsIntro:
    'Plany.tn soutient le tourisme culturel à Kairouan avec plus de 40 agences partenaires et un accompagnement personnalisé.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Kairouan ?',
      answer:
        'Les tarifs débutent à 45 TND/jour pour une citadine. Comparez les offres sur Plany.tn pour profiter du meilleur prix.',
    },
    {
      question: 'Puis-je louer sans caution ?',
      answer:
        'Oui, des formules sans caution sont proposées avec assurance renforcée via nos partenaires locaux.',
    },
    {
      question: 'Des voitures automatiques sont-elles disponibles ?',
      answer:
        'Oui, SUV et berlines automatiques peuvent être livrés à la médina ou à votre hébergement.',
    },
    {
      question: 'Peut-on récupérer la voiture à Monastir ou Sousse ?',
      answer:
        'Oui, Plany.tn organise des allers simples vers Monastir ou Sousse selon les disponibilités.',
    },
    {
      question: 'Pourquoi passer par Plany.tn ?',
      answer:
        'Plany.tn offre un comparatif transparent des agences kairouanaises avec avis vérifiés et support francophone.',
    },
  ],
  faqIntro: faqIntroFactory('Kairouan'),
  internalLinks: [
    '/location-voiture-pas-cher-a-sousse',
    '/location-voiture-pas-cher-a-monastir',
    '/location-voiture-pas-cher-a-sfax',
    '/location-voiture-pas-cher-a-mahdia',
  ],
  blogUrl,
  cta: ctaFactory('Kairouan'),
  crosslinkIntro: 'Planifiez aussi une étape à',
  jsonLd: createJsonLd(
    'Kairouan',
    '/location-voiture-pas-cher-a-kairouan',
    'Réservez votre location voiture Kairouan avec Plany.tn pour explorer la médina UNESCO, la Grande Mosquée et les routes vers Sousse ou Sfax. Citadine, SUV automatique ou utilitaire sans caution, retrait rapide en centre-ville.',
    35.6781,
    10.0963,
  ),
  seoNote,
}

locationDataSEO.djerba = {
  city: 'Djerba',
  slug: '/location-voiture-pas-cher-a-djerba',
  title: 'Location voiture pas cher à Djerba | Plany',
  metaDescription:
    'Comparez les offres de location voiture Djerba avec Plany.tn : livraison à l’aéroport Djerba-Zarzis, citadines, SUV automatiques ou voitures familiales sans caution. Explorez Houmt Souk, Midoun et les plages en toute liberté.',
  seoKeywords: {
    principal: ['location voiture Djerba', 'location voiture aéroport Djerba-Zarzis'],
    secondaires: ['voiture automatique Djerba', 'SUV Djerba', 'location voiture plage Djerba'],
    semantiques: [...commonKeywords, 'location voiture Jerba Midoun', 'roadtrip Djerba'],
  },
  hero: heroFactory(
    'Location voiture Djerba avec Plany.tn',
    'Profitez de l’île aux multiples visages avec une voiture livrée où vous le souhaitez.',
    [
      'Plany.tn compare les agences de l’île pour une location voiture Djerba pas cher livrée à l’aéroport Djerba-Zarzis ou à Houmt Souk.',
      'Optez pour un SUV automatique pour parcourir Midoun, les plages de Seguia ou les villages berbères du sud.',
      'Assurance incluse, options sans caution et assistance 7j/7 pour profiter des routes insulaires et des excursions vers Tataouine.',
    ],
  ),
  advantages: advantagesFactory('Djerba'),
  nearbyDestinations: nearbyFactory('Djerba', [
    {
      name: 'Houmt Souk',
      image: 'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-djerba',
      description: 'Souks, port et musées traditionnels.',
      imageAlt: 'Location voiture Djerba pour explorer Houmt Souk avec Plany.tn',
    },
    {
      name: 'Midoun',
      image: 'https://images.unsplash.com/photo-1526570243268-4bc3fd12cb87?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-jerba-midoun',
      description: 'Zone touristique de Midoun et plages de Sidi Mahrez.',
      imageAlt: 'Louer une voiture à Djerba pour rejoindre Midoun via Plany.tn',
    },
    {
      name: 'Tataouine',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-medenine',
      description: 'Ksour et paysages désertiques de Tataouine.',
      imageAlt: 'Location voiture Djerba pour un roadtrip vers Tataouine avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Avec une voiture louée à Djerba, découvrez Houmt Souk, Midoun et organisez des excursions vers Tataouine, Chenini ou Ksar Ghilane.',
  vehicleIntro:
    'Les familles choisissent le SUV automatique pour transporter bagages et équipements de plage, tandis que les couples optent pour la citadine climatisée.',
  vehicleCategories: createVehicleCategories('Djerba', 55),
  map: mapConfig(
    [33.807, 10.865],
    'Retrait à l’aéroport Djerba-Zarzis, Houmt Souk, Midoun ou livraison dans votre hôtel.',
  ),
  stats: statsFactory('Djerba', '75+', '12 300', '4.9/5', '26 circuits'),
  statsIntro:
    'Plany.tn accompagne les voyageurs à Djerba avec un réseau dense d’agences couvrant toute l’île et une note client de 4.9/5.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Djerba ?',
      answer:
        'Les offres débutent à 55 TND/jour pour une citadine. Comparez les prix des SUV et voitures automatiques sur Plany.tn.',
    },
    {
      question: 'La livraison à l’aéroport Djerba-Zarzis est-elle possible ?',
      answer:
        'Oui, la plupart des partenaires livrent les véhicules directement au terminal avec accueil personnalisé.',
    },
    {
      question: 'Peut-on louer sans caution à Djerba ?',
      answer:
        'Oui, certaines agences proposent des formules sans caution ou dépôt réduit, idéal pour les séjours courts.',
    },
    {
      question: 'Les SUV automatiques sont-ils disponibles ?',
      answer:
        'Oui, SUV climatisés et boîtes automatiques sont proposés pour parcourir l’île et les pistes vers Tataouine.',
    },
    {
      question: 'Pourquoi réserver via Plany.tn ?',
      answer:
        'Plany.tn est le comparateur tunisien spécialisé sur Djerba avec avis vérifiés et assistance 7j/7.',
    },
  ],
  faqIntro: faqIntroFactory('Djerba'),
  internalLinks: [
    '/location-voiture-pas-cher-a-jerba-midoun',
    '/location-voiture-pas-cher-a-medenine',
    '/location-voiture-pas-cher-a-gabes',
    '/location-voiture-pas-cher-a-tozeur',
  ],
  blogUrl,
  cta: ctaFactory('Djerba'),
  crosslinkIntro: 'Préparez aussi vos étapes vers',
  jsonLd: createJsonLd(
    'Djerba',
    '/location-voiture-pas-cher-a-djerba',
    'Comparez les offres de location voiture Djerba avec Plany.tn : livraison à l’aéroport Djerba-Zarzis, citadines, SUV automatiques ou voitures familiales sans caution. Explorez Houmt Souk, Midoun et les plages en toute liberté.',
    33.807,
    10.865,
  ),
  seoNote,
}

locationDataSEO.ariana = {
  city: 'Ariana',
  slug: '/location-voiture-pas-cher-a-ariana',
  title: 'Location voiture pas cher à Ariana | Plany',
  metaDescription:
    'Comparez et réservez votre location voiture Ariana, Ennasr ou Jardins d’El Menzah avec Plany.tn. Choisissez citadine ou SUV automatique, retrait rapide à Tunis-Carthage, options sans caution et assistance locale 7j/7.',
  seoKeywords: {
    principal: ['location voiture Ariana', 'location voiture Ennasr'],
    secondaires: ['voiture automatique Ariana', 'location voiture sans caution Ariana', 'location voiture Tunis-Carthage'],
    semantiques: [...commonKeywords, 'comparateur location voiture Ariana', 'location voiture banlieue nord Tunis'],
  },
  hero: heroFactory(
    'Location voiture Ariana avec Plany.tn',
    'Partez de la banlieue nord de Tunis en toute liberté.',
    [
      'Plany.tn regroupe les offres des agences d’Ariana, Ennasr et Jardins d’El Menzah pour une location voiture pas cher adaptée à vos besoins.',
      'Choisissez citadine automatique pour le quotidien, SUV premium pour les déplacements professionnels ou familiale pour un séjour en banlieue nord.',
      'Retrait possible à Tunis-Carthage, livraison à domicile et options sans caution pour gagner du temps.',
    ],
  ),
  advantages: advantagesFactory('Ariana'),
  nearbyDestinations: nearbyFactory('Ariana', [
    {
      name: 'Tunis',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tunis',
      description: 'Centre-ville, médina et quartiers d’affaires de Tunis.',
      imageAlt: 'Location voiture Ariana pour rejoindre Tunis centre avec Plany.tn',
    },
    {
      name: 'La Marsa',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tunis',
      description: 'Corniche de La Marsa et Sidi Bou Saïd.',
      imageAlt: 'Louer une voiture à Ariana pour découvrir La Marsa avec Plany.tn',
    },
    {
      name: 'Hammamet',
      image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-hammamet',
      description: 'Yasmine Hammamet et ses resorts.',
      imageAlt: 'Location voiture Ariana pour rejoindre Hammamet avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Ariana, rejoignez facilement Tunis, La Marsa ou Hammamet grâce à une voiture louée avec Plany.tn.',
  vehicleIntro:
    'Les résidents choisissent la citadine automatique pour la circulation quotidienne, tandis que les professionnels privilégient le SUV pour leurs rendez-vous.',
  vehicleCategories: createVehicleCategories('Ariana', 52),
  map: mapConfig(
    [36.8665, 10.1647],
    'Retrait à Ennasr, aux Jardins d’El Menzah ou à l’aéroport Tunis-Carthage selon votre arrivée.',
  ),
  stats: statsFactory('Ariana', '50+', '6 700', '4.8/5', '17 circuits'),
  statsIntro:
    'Plany.tn dessert la banlieue nord de Tunis avec plus de 50 agences partenaires et une satisfaction client de 4.8/5.',
  faqItems: [
    {
      question: 'Quel est le tarif d’une location voiture à Ariana ?',
      answer:
        'Les prix débutent à 52 TND/jour pour une citadine automatique. Comparez les offres locales sur Plany.tn.',
    },
    {
      question: 'Peut-on louer sans caution ?',
      answer:
        'Oui, plusieurs agences d’Ariana proposent des formules sans caution ou dépôt réduit.',
    },
    {
      question: 'La livraison à domicile est-elle possible ?',
      answer:
        'Oui, nos partenaires livrent les véhicules à Ennasr, Menzah ou Ariana centre.',
    },
    {
      question: 'Y a-t-il des voitures automatiques disponibles ?',
      answer:
        'Oui, les SUV et berlines automatiques sont disponibles toute l’année avec assistance 7j/7.',
    },
    {
      question: 'Pourquoi utiliser Plany.tn ?',
      answer:
        'Plany.tn est le comparateur tunisien qui regroupe offres, avis et assurances pour louer sereinement à Ariana.',
    },
  ],
  faqIntro: faqIntroFactory('Ariana'),
  internalLinks: [
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-ben-arous',
    '/location-voiture-pas-cher-a-hammamet',
    '/location-voiture-pas-cher-a-nabeul',
  ],
  blogUrl,
  cta: ctaFactory('Ariana'),
  crosslinkIntro: 'Découvrez également',
  jsonLd: createJsonLd(
    'Ariana',
    '/location-voiture-pas-cher-a-ariana',
    'Comparez et réservez votre location voiture Ariana, Ennasr ou Jardins d’El Menzah avec Plany.tn. Choisissez citadine ou SUV automatique, retrait rapide à Tunis-Carthage, options sans caution et assistance locale 7j/7.',
    36.8665,
    10.1647,
  ),
  seoNote,
}

locationDataSEO['ben-arous'] = {
  city: 'Ben Arous',
  slug: '/location-voiture-pas-cher-a-ben-arous',
  title: 'Location voiture pas cher à Ben Arous | Plany',
  metaDescription:
    'Louez une voiture à Ben Arous, Mégrine ou Radès avec Plany.tn. Citadine, utilitaire ou SUV automatique, retrait rapide à Tunis, options sans caution et tarifs négociés pour vos trajets quotidiens ou professionnels.',
  seoKeywords: {
    principal: ['location voiture Ben Arous', 'location voiture Mégrine'],
    secondaires: ['louer voiture pas cher Ben Arous', 'utilitaire Ben Arous', 'voiture automatique Ben Arous'],
    semantiques: [...commonKeywords, 'location voiture Radès', 'comparateur location voiture Ben Arous'],
  },
  hero: heroFactory(
    'Location voiture Ben Arous avec Plany.tn',
    'Votre voiture disponible dans la banlieue sud de Tunis.',
    [
      'Plany.tn connecte les habitants de Ben Arous, Mégrine et Radès aux meilleures offres de location voiture Tunisie.',
      'Choisissez citadine automatique pour vos trajets quotidiens, utilitaire pour votre activité professionnelle ou SUV pour rejoindre Hammamet.',
      'Options sans caution, assurance incluse et assistance locale 7j/7 pour sécuriser vos déplacements.',
    ],
  ),
  advantages: advantagesFactory('Ben Arous'),
  nearbyDestinations: nearbyFactory('Ben Arous', [
    {
      name: 'Tunis',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tunis',
      description: 'Centre-ville de Tunis et quartier des Berges du Lac.',
      imageAlt: 'Location voiture Ben Arous pour rejoindre Tunis centre avec Plany.tn',
    },
    {
      name: 'Radès',
      image: 'https://images.unsplash.com/photo-1493815793585-d94ccbc86df0?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-ben-arous',
      description: 'Stade olympique et zone industrielle de Radès.',
      imageAlt: 'Louer une voiture à Ben Arous pour se rendre à Radès avec Plany.tn',
    },
    {
      name: 'Hammamet',
      image: 'https://images.unsplash.com/photo-1543353071-087092ec3932?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-hammamet',
      description: 'Plages et resorts de Hammamet.',
      imageAlt: 'Location voiture Ben Arous pour partir à Hammamet avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Ben Arous, accédez rapidement à Tunis centre, Radès ou Hammamet grâce à une voiture louée avec Plany.tn.',
  vehicleIntro:
    'Les citadines automatiques conviennent aux trajets quotidiens, tandis que les utilitaires et SUV répondent aux besoins professionnels et loisirs.',
  vehicleCategories: createVehicleCategories('Ben Arous', 50),
  map: mapConfig(
    [36.7433, 10.2303],
    'Retrait à Mégrine, Radès ou livraison à domicile dans toute la banlieue sud de Tunis.',
  ),
  stats: statsFactory('Ben Arous', '48+', '6 100', '4.7/5', '15 circuits'),
  statsIntro:
    'Plany.tn accompagne les habitants de Ben Arous avec des retraits flexibles, des utilitaires disponibles et une note moyenne de 4.7/5.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Ben Arous ?',
      answer:
        'Les tarifs débutent à 48 TND/jour pour une citadine. Comparez les offres locales sur Plany.tn pour économiser.',
    },
    {
      question: 'Puis-je louer un utilitaire ?',
      answer:
        'Oui, camionnettes et fourgons sont proposés pour les livraisons autour de Tunis sud.',
    },
    {
      question: 'Les offres sans caution existent-elles ?',
      answer:
        'Oui, plusieurs partenaires Ben Arous offrent des formules sans caution ou dépôt réduit.',
    },
    {
      question: 'La livraison à domicile est-elle possible ?',
      answer:
        'Oui, les agences livrent les voitures à Mégrine, Radès ou directement dans vos locaux.',
    },
    {
      question: 'Pourquoi utiliser Plany.tn ?',
      answer:
        'Plany.tn centralise tarifs, avis et assurances pour louer une voiture à Ben Arous pas cher avec un support tunisien 7j/7.',
    },
  ],
  faqIntro: faqIntroFactory('Ben Arous'),
  internalLinks: [
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-ariana',
    '/location-voiture-pas-cher-a-hammamet',
    '/location-voiture-pas-cher-a-nabeul',
  ],
  blogUrl,
  cta: ctaFactory('Ben Arous'),
  crosslinkIntro: 'Envie de bouger vers',
  jsonLd: createJsonLd(
    'Ben Arous',
    '/location-voiture-pas-cher-a-ben-arous',
    'Louez une voiture à Ben Arous, Mégrine ou Radès avec Plany.tn. Citadine, utilitaire ou SUV automatique, retrait rapide à Tunis, options sans caution et tarifs négociés pour vos trajets quotidiens ou professionnels.',
    36.7433,
    10.2303,
  ),
  seoNote,
}

locationDataSEO.bizerte = {
  city: 'Bizerte',
  slug: '/location-voiture-pas-cher-a-bizerte',
  title: 'Location voiture pas cher à Bizerte | Plany',
  metaDescription:
    'Comparez et réservez votre location voiture Bizerte, vieux port ou Cap Blanc avec Plany.tn. Citadine, SUV automatique ou utilitaire sans caution, retrait à l’aéroport Tunis-Carthage ou en centre-ville avec assistance locale 7j/7.',
  seoKeywords: {
    principal: ['location voiture Bizerte', 'location voiture Cap Blanc'],
    secondaires: [
      'location voiture pas cher Bizerte',
      'voiture automatique Bizerte',
      'location voiture vieux port Bizerte',
    ],
    semantiques: [...commonKeywords, 'location voiture nord Tunisie', 'comparateur location voiture Bizerte'],
  },
  hero: heroFactory(
    'Location voiture Bizerte avec Plany.tn',
    'Profitez du vieux port, des plages et du Cap Blanc en totale autonomie.',
    [
      'Plany.tn centralise les offres de location voiture Bizerte pour circuler entre le centre historique, Zarzouna et la corniche.',
      'Réservez citadine, berline automatique ou utilitaire pour vos missions industrielles dans les zones portuaires et logistiques.',
      'Options sans caution, assurances complètes et assistance locale 7j/7 pour rouler sereinement vers Ghar El Melh et Cap Serrat.',
    ],
  ),
  advantages: advantagesFactory('Bizerte'),
  nearbyDestinations: nearbyFactory('Bizerte', [
    {
      name: 'Tunis',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tunis',
      description: 'Capitale tunisienne et aéroport Tunis-Carthage à 60 km.',
      imageAlt: 'Location voiture Bizerte pour relier Tunis et l’aéroport avec Plany.tn',
    },
    {
      name: 'Nabeul',
      image: 'https://images.unsplash.com/photo-1544635395-8fd4f7c3fc2b?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-nabeul',
      description: 'Souks d’artisanat et plages du Cap Bon.',
      imageAlt: 'Louer une voiture à Bizerte pour découvrir Nabeul avec Plany.tn',
    },
    {
      name: 'Cap Serrat',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-bizerte',
      description: 'Plages sauvages et sentiers forestiers du nord.',
      imageAlt: 'Location voiture Bizerte pour rejoindre Cap Serrat avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Avec une voiture louée à Bizerte, rejoignez en moins d’une heure Tunis, Tabarka ou les plages du Cap Serrat en profitant des routes côtières du nord tunisien.',
  vehicleIntro:
    'Les Bizertiens optent pour une citadine automatique afin de naviguer dans le vieux port, tandis que les professionnels choisissent utilitaire ou SUV pour la zone industrielle et les bases navales.',
  vehicleCategories: createVehicleCategories('Bizerte', 54),
  map: mapConfig(
    [37.2746, 9.8739],
    'Retrait en centre-ville, zone industrielle de Zarzouna, marinas et livraison aux hôtels du vieux port.',
  ),
  stats: statsFactory('Bizerte', '56+', '6 800', '4.8/5', '18 circuits'),
  statsIntro:
    'Plany.tn accompagne les voyageurs d’affaires et plaisanciers à Bizerte avec plus de 50 agences partenaires et une note moyenne de 4.8/5.',
  faqItems: [
    {
      question: 'Combien coûte une location voiture à Bizerte ?',
      answer:
        'Les tarifs débutent à 52 TND/jour pour une citadine. Comparez les offres locales sur Plany.tn pour trouver le meilleur prix.',
    },
    {
      question: 'Puis-je louer une voiture sans caution à Bizerte ?',
      answer:
        'Oui, plusieurs agences partenaires proposent des formules sans caution ou avec dépôt réduit pour les séjours loisirs.',
    },
    {
      question: 'Existe-t-il des voitures automatiques à Bizerte ?',
      answer:
        'Oui, les catalogues Plany.tn incluent des berlines et SUV automatiques adaptés aux trajets entre le port, Zarzouna et Cap Blanc.',
    },
    {
      question: 'La livraison au port de Bizerte est-elle possible ?',
      answer:
        'Oui, choisissez l’option livraison et recevez votre voiture directement au port de plaisance ou dans la zone industrielle.',
    },
    {
      question: 'Pourquoi utiliser le comparateur Plany.tn à Bizerte ?',
      answer:
        'Plany.tn regroupe les disponibilités locales, avis vérifiés et options d’assurance pour louer une voiture à Bizerte pas cher.',
    },
  ],
  faqIntro: faqIntroFactory('Bizerte'),
  internalLinks: [
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-nabeul',
    '/location-voiture-pas-cher-a-hammamet',
    '/location-voiture-pas-cher-a-sousse',
  ],
  blogUrl,
  cta: ctaFactory('Bizerte'),
  crosslinkIntro: 'Envie de poursuivre votre escapade vers',
  jsonLd: createJsonLd(
    'Bizerte',
    '/location-voiture-pas-cher-a-bizerte',
    'Comparez et réservez votre location voiture Bizerte, vieux port ou Cap Blanc avec Plany.tn. Citadine, SUV automatique ou utilitaire sans caution, retrait à l’aéroport Tunis-Carthage ou en centre-ville avec assistance locale 7j/7.',
    37.2746,
    9.8739,
  ),
  seoNote,
}

locationDataSEO.gabes = {
  city: 'Gabès',
  slug: '/location-voiture-pas-cher-a-gabes',
  title: 'Location voiture pas cher à Gabès | Plany',
  metaDescription:
    'Comparez les offres de location voiture Gabès et à l’aéroport Gabès-Matmata sur Plany.tn. Citadine automatique, SUV climatisé ou 4x4 sans caution, réservez au meilleur prix pour explorer le sud tunisien entre Matmata, Chenini et la côte.',
  seoKeywords: {
    principal: ['location voiture Gabès', 'location voiture aéroport Gabès-Matmata'],
    secondaires: ['louer voiture pas cher Gabès', 'voiture automatique Gabès', 'location voiture sud tunisien'],
    semantiques: [...commonKeywords, 'location voiture Matmata', 'comparateur location voiture Gabès'],
  },
  hero: heroFactory(
    'Location voiture Gabès avec Plany.tn',
    'Découvrez le sud tunisien entre oasis, mer et désert.',
    [
      'Plany.tn regroupe les offres de location voiture Gabès pour rejoindre la corniche, la zone industrielle de Ghannouch ou le port de pêche.',
      'Choisissez SUV automatique ou 4x4 climatisé pour explorer Matmata, Douz ou Chenini via des routes bien entretenues.',
      'Réservez sans caution selon disponibilité, assurance incluse et assistance locale 7j/7 pour chaque trajet au départ de Gabès.',
    ],
  ),
  advantages: advantagesFactory('Gabès'),
  nearbyDestinations: nearbyFactory('Gabès', [
    {
      name: 'Djerba',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-djerba',
      description: 'Île de Djerba, Houmt Souk et plage de Sidi Mahrez.',
      imageAlt: 'Location voiture Gabès pour rejoindre Djerba et Houmt Souk avec Plany.tn',
    },
    {
      name: 'Matmata',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-gabes',
      description: 'Maisons troglodytes et décors sahariens de Matmata.',
      imageAlt: 'Louer une voiture à Gabès pour visiter Matmata avec Plany.tn',
    },
    {
      name: 'Douz',
      image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tozeur',
      description: 'Porte du Sahara et activités dans les dunes de Douz.',
      imageAlt: 'Location voiture Gabès pour un safari à Douz avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Gabès, atteignez facilement Djerba, Matmata ou Douz pour vivre l’expérience du sud tunisien entre plages et désert.',
  vehicleIntro:
    'Les citadines automatiques conviennent aux trajets urbains, tandis que les SUV climatisés et 4x4 répondent aux itinéraires vers Matmata ou Chenini.',
  vehicleCategories: createVehicleCategories('Gabès', 53),
  map: mapConfig(
    [33.8815, 10.0982],
    'Retrait avenue Habib Bourguiba, zone industrielle Ghannouch, port de Gabès et livraison à la gare routière.',
  ),
  stats: statsFactory('Gabès', '44+', '5 900', '4.7/5', '16 circuits'),
  statsIntro:
    'Plany.tn accompagne les trajets professionnels et touristiques à Gabès avec plus de 40 agences partenaires et un support 7j/7.',
  faqItems: [
    {
      question: 'Quel est le prix moyen d’une location voiture à Gabès ?',
      answer:
        'Les citadines commencent à 50 TND/jour. Plany.tn compare les prix des agences de Gabès pour garantir un budget maîtrisé.',
    },
    {
      question: 'Peut-on louer une voiture sans caution à Gabès ?',
      answer:
        'Oui, certaines offres Plany.tn incluent des formules sans caution ou avec dépôt réduit pour les séjours courts.',
    },
    {
      question: 'Existe-t-il des véhicules automatiques à Gabès ?',
      answer:
        'Oui, vous trouverez des berlines automatiques, SUV climatisés et 4x4 avec kilométrage adapté au sud tunisien.',
    },
    {
      question: 'Comment récupérer une voiture à l’aéroport Gabès-Matmata ?',
      answer:
        'Indiquez votre numéro de vol sur Plany.tn et l’agence partenaire vous accueille directement à l’aéroport.',
    },
    {
      question: 'Pourquoi choisir Plany.tn pour louer à Gabès ?',
      answer:
        'Plany.tn centralise les disponibilités du sud tunisien avec avis clients, assistance locale et paiement sécurisé.',
    },
  ],
  faqIntro: faqIntroFactory('Gabès'),
  internalLinks: [
    '/location-voiture-pas-cher-a-djerba',
    '/location-voiture-pas-cher-a-medenine',
    '/location-voiture-pas-cher-a-tozeur',
    '/location-voiture-pas-cher-a-sfax',
  ],
  blogUrl,
  cta: ctaFactory('Gabès'),
  crosslinkIntro: 'Complétez votre itinéraire dans le sud avec',
  jsonLd: createJsonLd(
    'Gabès',
    '/location-voiture-pas-cher-a-gabes',
    'Comparez les offres de location voiture Gabès et à l’aéroport Gabès-Matmata sur Plany.tn. Citadine automatique, SUV climatisé ou 4x4 sans caution, réservez au meilleur prix pour explorer le sud tunisien entre Matmata, Chenini et la côte.',
    33.8815,
    10.0982,
  ),
  seoNote,
}

locationDataSEO.gafsa = {
  city: 'Gafsa',
  slug: '/location-voiture-pas-cher-a-gafsa',
  title: 'Location voiture pas cher à Gafsa | Plany',
  metaDescription:
    'Réservez votre location voiture Gafsa avec Plany.tn pour circuler entre les sites miniers, oasis et gare SNCFT. Citadine, diesel ou 4x4 automatique, profitez de tarifs négociés sans caution et d’une assistance locale 7j/7 à l’aéroport Gafsa-Ksar.',
  seoKeywords: {
    principal: ['location voiture Gafsa', 'location 4x4 Gafsa'],
    secondaires: ['louer voiture pas cher Gafsa', 'location voiture oasis Gafsa', 'voiture automatique Gafsa'],
    semantiques: [...commonKeywords, 'location SUV Gafsa', 'comparateur location voiture Gafsa'],
  },
  hero: heroFactory(
    'Location voiture Gafsa avec Plany.tn',
    'Explorez les oasis et sites historiques du sud-ouest.',
    [
      'Plany.tn compare les agences locales pour votre location voiture Gafsa, que vous soyez en mission minière ou en visite des oasis.',
      'Optez pour 4x4 automatique afin d’atteindre Métlaoui, Redeyef ou les villages troglodytes en toute sécurité.',
      'Assurance, assistance et options sans caution disponibles pour des trajets fiables vers Tozeur et Kasserine.',
    ],
  ),
  advantages: advantagesFactory('Gafsa'),
  nearbyDestinations: nearbyFactory('Gafsa', [
    {
      name: 'Tozeur',
      image: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tozeur',
      description: 'Oasis de Tozeur et Chott el Jerid.',
      imageAlt: 'Location voiture Gafsa pour rejoindre Tozeur et ses oasis avec Plany.tn',
    },
    {
      name: 'Métlaoui',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-gafsa',
      description: 'Les gorges de Selja et le Lézard Rouge.',
      imageAlt: 'Louer une voiture à Gafsa pour découvrir Métlaoui et le Lézard Rouge avec Plany.tn',
    },
    {
      name: 'Kasserine',
      image: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kasserine',
      description: 'Mont Chaambi et vestiges de Sbeitla.',
      imageAlt: 'Location voiture Gafsa pour un roadtrip vers Kasserine avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Votre voiture louée à Gafsa ouvre l’accès aux oasis, gorges et montagnes du sud-ouest tunisien en quelques heures.',
  vehicleIntro:
    'Citadine diesel pour la ville, SUV automatique pour les sites miniers et 4x4 équipé pour les pistes menant à Métlaoui ou Tozeur.',
  vehicleCategories: createVehicleCategories('Gafsa', 50),
  map: mapConfig(
    [34.425, 8.7841],
    'Retrait avenue Habib Bourguiba, zone industrielle d’El Guettar, gare SNCFT et aéroport Gafsa-Ksar.',
  ),
  stats: statsFactory('Gafsa', '38+', '4 200', '4.6/5', '14 circuits'),
  statsIntro:
    'Plany.tn soutient les déplacements professionnels à Gafsa avec un réseau dense d’agences et des options adaptées aux routes montagneuses.',
  faqItems: [
    {
      question: 'Quel est le tarif d’une location voiture à Gafsa ?',
      answer:
        'Les prix démarrent à 48 TND/jour pour une citadine diesel. Les 4x4 restent accessibles grâce aux offres négociées Plany.tn.',
    },
    {
      question: 'Des 4x4 automatiques sont-ils disponibles à Gafsa ?',
      answer:
        'Oui, plusieurs agences proposent des 4x4 automatiques et pick-up adaptés aux pistes du sud-ouest.',
    },
    {
      question: 'Peut-on louer sans caution à Gafsa ?',
      answer:
        'Certaines formules Plany.tn incluent dépôt réduit ou suppression de caution pour les séjours courts.',
    },
    {
      question: 'Comment récupérer une voiture à l’aéroport Gafsa-Ksar ?',
      answer:
        'Transmettez votre heure d’arrivée et l’agence partenaire vous livrera le véhicule au terminal.',
    },
    {
      question: 'Pourquoi passer par Plany.tn pour Gafsa ?',
      answer:
        'Plany.tn centralise tarifs, assurances et avis clients pour une location voiture Gafsa fiable et transparente.',
    },
  ],
  faqIntro: faqIntroFactory('Gafsa'),
  internalLinks: [
    '/location-voiture-pas-cher-a-tozeur',
    '/location-voiture-pas-cher-a-kasserine',
    '/location-voiture-pas-cher-a-gabes',
    '/location-voiture-pas-cher-a-sidi-bouzid',
  ],
  blogUrl,
  cta: ctaFactory('Gafsa'),
  crosslinkIntro: 'Prolongez vos déplacements professionnels vers',
  jsonLd: createJsonLd(
    'Gafsa',
    '/location-voiture-pas-cher-a-gafsa',
    'Réservez votre location voiture Gafsa avec Plany.tn pour circuler entre les sites miniers, oasis et gare SNCFT. Citadine, diesel ou 4x4 automatique, profitez de tarifs négociés sans caution et d’une assistance locale 7j/7 à l’aéroport Gafsa-Ksar.',
    34.425,
    8.7841,
  ),
  seoNote,
}

locationDataSEO.tozeur = {
  city: 'Tozeur',
  slug: '/location-voiture-pas-cher-a-tozeur',
  title: 'Location voiture pas cher à Tozeur | Plany',
  metaDescription:
    'Comparez la location voiture Tozeur et à l’aéroport Tozeur-Nefta avec Plany.tn. SUV automatique, 4x4 ou citadine climatisée, réservez sans caution pour visiter les oasis, Chott el Jerid et les décors Star Wars avec assistance 7j/7.',
  seoKeywords: {
    principal: ['location voiture Tozeur', 'location voiture aéroport Tozeur-Nefta'],
    secondaires: ['location 4x4 Tozeur', 'voiture automatique Tozeur', 'location voiture oasis Tozeur'],
    semantiques: [...commonKeywords, 'location voiture Chott el Jerid', 'comparateur location voiture Tozeur'],
  },
  hero: heroFactory(
    'Location voiture Tozeur avec Plany.tn',
    'Partez à la conquête des oasis et du désert tunisien.',
    [
      'Plany.tn rassemble les agences locales pour louer une voiture à Tozeur et rejoindre Nefta, Ong Jmel ou Chebika.',
      'Choisissez 4x4 automatique pour les pistes sahariennes ou citadine climatisée pour circuler dans le centre historique.',
      'Profitez d’options sans caution, assurance complète et assistance 7j/7 depuis l’aéroport Tozeur-Nefta.',
    ],
  ),
  advantages: advantagesFactory('Tozeur'),
  nearbyDestinations: nearbyFactory('Tozeur', [
    {
      name: 'Nefta',
      image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tozeur',
      description: 'Corbeille de Nefta et oasis denses.',
      imageAlt: 'Location voiture Tozeur pour visiter Nefta avec Plany.tn',
    },
    {
      name: 'Chott el Jerid',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-gafsa',
      description: 'Lac salé et panorama infini du Chott.',
      imageAlt: 'Louer une voiture à Tozeur pour traverser le Chott el Jerid avec Plany.tn',
    },
    {
      name: 'Douz',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tozeur',
      description: 'Portes du Sahara et randonnées en dromadaire.',
      imageAlt: 'Location voiture Tozeur pour rejoindre Douz et ses dunes avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Tozeur, vous accédez facilement aux oasis de montagne, à Douz et au Chott el Jerid grâce à une voiture climatisée adaptée au désert.',
  vehicleIntro:
    'Les voyageurs privilégient 4x4 automatique pour les pistes sablonneuses, tandis que les citadines restent idéales pour les hôtels et le centre de Tozeur.',
  vehicleCategories: createVehicleCategories('Tozeur', 58),
  map: mapConfig(
    [33.9197, 8.1335],
    'Retrait à l’aéroport Tozeur-Nefta, avenue Habib Bourguiba ou livraison dans les hôtels d’Ong Jmel et Nefta.',
  ),
  stats: statsFactory('Tozeur', '36+', '4 800', '4.8/5', '20 circuits'),
  statsIntro:
    'Plany.tn équipe les aventuriers du Sahara depuis Tozeur avec plus de 30 agences partenaires et une note de satisfaction de 4.8/5.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Tozeur ?',
      answer:
        'Les offres commencent à 55 TND/jour pour une citadine. Les 4x4 automatiques restent abordables via Plany.tn selon la saison.',
    },
    {
      question: 'Peut-on louer un 4x4 sans caution à Tozeur ?',
      answer:
        'Oui, certaines agences proposent des forfaits sans caution ou avec dépôt réduit pour les expéditions sahariennes.',
    },
    {
      question: 'Y a-t-il des voitures automatiques à l’aéroport Tozeur-Nefta ?',
      answer:
        'Oui, Plany.tn propose des SUV et berlines automatiques livrés directement au terminal.',
    },
    {
      question: 'Comment préparer une excursion vers Ong Jmel ?',
      answer:
        'Prévoyez un 4x4 équipé et informez votre agence via Plany.tn pour obtenir conseils et assistance sur les pistes.',
    },
    {
      question: 'Pourquoi utiliser Plany.tn pour Tozeur ?',
      answer:
        'Plany.tn offre un comparateur local, des avis vérifiés et des assurances adaptées aux parcours désertiques.',
    },
  ],
  faqIntro: faqIntroFactory('Tozeur'),
  internalLinks: [
    '/location-voiture-pas-cher-a-gafsa',
    '/location-voiture-pas-cher-a-gabes',
    '/location-voiture-pas-cher-a-kasserine',
    '/location-voiture-pas-cher-a-djerba',
  ],
  blogUrl,
  cta: ctaFactory('Tozeur'),
  crosslinkIntro: 'Planifiez aussi des étapes vers',
  jsonLd: createJsonLd(
    'Tozeur',
    '/location-voiture-pas-cher-a-tozeur',
    'Comparez la location voiture Tozeur et à l’aéroport Tozeur-Nefta avec Plany.tn. SUV automatique, 4x4 ou citadine climatisée, réservez sans caution pour visiter les oasis, Chott el Jerid et les décors Star Wars avec assistance 7j/7.',
    33.9197,
    8.1335,
  ),
  seoNote,
}

locationDataSEO.kasserine = {
  city: 'Kasserine',
  slug: '/location-voiture-pas-cher-a-kasserine',
  title: 'Location voiture pas cher à Kasserine | Plany',
  metaDescription:
    'Réservez votre location voiture Kasserine et au pied du mont Chaambi avec Plany.tn. Citadine robuste, SUV 4x4 ou pickup automatique, partez sans caution pour vos trajets professionnels ou randonnées vers Thala et Sbeitla avec assistance locale 7j/7.',
  seoKeywords: {
    principal: ['location voiture Kasserine', 'location 4x4 Kasserine'],
    secondaires: ['louer voiture pas cher Kasserine', 'voiture automatique Kasserine', 'location voiture mont Chaambi'],
    semantiques: [...commonKeywords, 'location voiture Sbeitla', 'comparateur location voiture Kasserine'],
  },
  hero: heroFactory(
    'Location voiture Kasserine avec Plany.tn',
    'Reliez les montagnes et sites romains du centre-ouest.',
    [
      'Plany.tn agrège les agences régionales pour louer une voiture à Kasserine et rejoindre Sbeitla, Feriana ou Thala.',
      'Choisissez SUV ou 4x4 automatique pour gravir le mont Chaambi, ou citadine pour les déplacements administratifs en centre-ville.',
      'Bénéficiez d’options sans caution, d’assurances adaptées et d’une assistance locale 7j/7.',
    ],
  ),
  advantages: advantagesFactory('Kasserine'),
  nearbyDestinations: nearbyFactory('Kasserine', [
    {
      name: 'Sbeitla',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kasserine',
      description: 'Vestiges romains et musées de Sbeitla.',
      imageAlt: 'Location voiture Kasserine pour visiter les ruines de Sbeitla avec Plany.tn',
    },
    {
      name: 'Gafsa',
      image: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-gafsa',
      description: 'Routes vers les mines et oasis de Gafsa.',
      imageAlt: 'Louer une voiture à Kasserine pour rejoindre Gafsa avec Plany.tn',
    },
    {
      name: 'Kairouan',
      image: 'https://images.unsplash.com/photo-1512455102796-9a9d0d87b100?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kairouan',
      description: 'Capitale spirituelle et marchés traditionnels.',
      imageAlt: 'Location voiture Kasserine pour un périple vers Kairouan avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Kasserine, les routes rénovées permettent d’atteindre rapidement Sbeitla, Gafsa ou Kairouan pour affaires et tourisme.',
  vehicleIntro:
    'Les SUV et 4x4 sont recommandés pour les reliefs du mont Chaambi, tandis que les citadines automatiques suffisent pour la circulation urbaine.',
  vehicleCategories: createVehicleCategories('Kasserine', 49),
  map: mapConfig(
    [35.1676, 8.8364],
    'Retrait avenue Habib Bourguiba, zone industrielle et livraison dans les délégations rurales.',
  ),
  stats: statsFactory('Kasserine', '34+', '3 900', '4.6/5', '12 circuits'),
  statsIntro:
    'Plany.tn facilite les déplacements professionnels à Kasserine grâce à un réseau d’agences certifiées et des véhicules adaptés aux routes montagneuses.',
  faqItems: [
    {
      question: 'Quel est le tarif d’une location voiture à Kasserine ?',
      answer:
        'Comptez dès 47 TND/jour pour une citadine. Les SUV automatiques restent compétitifs via Plany.tn.',
    },
    {
      question: 'Peut-on louer un 4x4 sans caution à Kasserine ?',
      answer:
        'Oui, certaines agences proposent des dépôts réduits ou des assurances rachat de franchise.',
    },
    {
      question: 'Comment accéder au mont Chaambi en voiture ?',
      answer:
        'Réservez un SUV ou 4x4 sur Plany.tn, vérifiez les conditions météo et suivez les recommandations locales.',
    },
    {
      question: 'Existe-t-il des voitures automatiques à Kasserine ?',
      answer:
        'Oui, des berlines et SUV automatiques sont disponibles pour les trajets urbains et interurbains.',
    },
    {
      question: 'Pourquoi passer par Plany.tn à Kasserine ?',
      answer:
        'Plany.tn fournit comparateur, avis et assistance 7j/7 pour une location voiture Kasserine fiable.',
    },
  ],
  faqIntro: faqIntroFactory('Kasserine'),
  internalLinks: [
    '/location-voiture-pas-cher-a-kairouan',
    '/location-voiture-pas-cher-a-gafsa',
    '/location-voiture-pas-cher-a-sidi-bouzid',
    '/location-voiture-pas-cher-a-tozeur',
  ],
  blogUrl,
  cta: ctaFactory('Kasserine'),
  crosslinkIntro: 'Organisez aussi vos étapes vers',
  jsonLd: createJsonLd(
    'Kasserine',
    '/location-voiture-pas-cher-a-kasserine',
    'Réservez votre location voiture Kasserine et au pied du mont Chaambi avec Plany.tn. Citadine robuste, SUV 4x4 ou pickup automatique, partez sans caution pour vos trajets professionnels ou randonnées vers Thala et Sbeitla avec assistance locale 7j/7.',
    35.1676,
    8.8364,
  ),
  seoNote,
}

locationDataSEO['sidi-bouzid'] = {
  city: 'Sidi Bouzid',
  slug: '/location-voiture-pas-cher-a-sidi-bouzid',
  title: 'Location voiture pas cher à Sidi Bouzid | Plany',
  metaDescription:
    'Comparez la location voiture Sidi Bouzid sur Plany.tn pour vos trajets agricoles ou administratifs. Citadine automatique, utilitaire diesel ou pick-up sans caution, livraison à la gare routière ou dans les délégations voisines avec assistance 7j/7.',
  seoKeywords: {
    principal: ['location voiture Sidi Bouzid', 'location utilitaire Sidi Bouzid'],
    secondaires: ['voiture automatique Sidi Bouzid', 'louer voiture pas cher Sidi Bouzid', 'location voiture centre Tunisie'],
    semantiques: [...commonKeywords, 'location pick-up Sidi Bouzid', 'comparateur location voiture Sidi Bouzid'],
  },
  hero: heroFactory(
    'Location voiture Sidi Bouzid avec Plany.tn',
    'Optimisez vos déplacements au cœur de la Tunisie.',
    [
      'Plany.tn compare les offres de location voiture Sidi Bouzid pour desservir les délégations agricoles et les zones industrielles.',
      'Choisissez utilitaire diesel, pick-up ou citadine automatique pour vos tournées commerciales et rendez-vous administratifs.',
      'Profitez d’options sans caution, d’assurances flexibles et d’une assistance locale 7j/7.',
    ],
  ),
  advantages: advantagesFactory('Sidi Bouzid'),
  nearbyDestinations: nearbyFactory('Sidi Bouzid', [
    {
      name: 'Kairouan',
      image: 'https://images.unsplash.com/photo-1512455102796-9a9d0d87b100?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-kairouan',
      description: 'Marchés et patrimoine UNESCO de Kairouan.',
      imageAlt: 'Location voiture Sidi Bouzid pour rejoindre Kairouan avec Plany.tn',
    },
    {
      name: 'Gafsa',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-gafsa',
      description: 'Liaisons vers les oasis et sites miniers de Gafsa.',
      imageAlt: 'Louer une voiture à Sidi Bouzid pour un déplacement à Gafsa avec Plany.tn',
    },
    {
      name: 'Sfax',
      image: 'https://images.unsplash.com/photo-1526481280695-3c4691d58c94?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-sfax',
      description: 'Port industriel et zone économique de Sfax.',
      imageAlt: 'Location voiture Sidi Bouzid pour rejoindre Sfax et ses zones industrielles avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Grâce à votre voiture louée à Sidi Bouzid, vous reliez facilement Kairouan, Gafsa ou Sfax pour affaires agricoles et distribution.',
  vehicleIntro:
    'Citadines automatiques pour la ville, utilitaires diesel pour les livraisons de produits agricoles et pick-up robustes pour les pistes rurales.',
  vehicleCategories: createVehicleCategories('Sidi Bouzid', 47),
  map: mapConfig(
    [35.0382, 9.484],
    'Retrait au centre-ville, zone industrielle et livraison sur les marchés de gros ou coopératives agricoles.',
  ),
  stats: statsFactory('Sidi Bouzid', '30+', '3 100', '4.5/5', '10 circuits'),
  statsIntro:
    'Plany.tn soutient les professionnels agricoles de Sidi Bouzid avec un réseau d’agences couvrant tout le gouvernorat.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Sidi Bouzid ?',
      answer:
        'Les citadines débutent à 45 TND/jour. Les utilitaires restent abordables grâce aux partenariats Plany.tn.',
    },
    {
      question: 'Puis-je louer un utilitaire ou pick-up à Sidi Bouzid ?',
      answer:
        'Oui, Plany.tn propose une flotte d’utilitaires diesel et pick-up adaptés aux besoins agricoles.',
    },
    {
      question: 'Existe-t-il des offres sans caution ?',
      answer:
        'Certaines agences offrent des dépôts réduits ou la suppression de caution selon la durée de location.',
    },
    {
      question: 'Comment organiser une livraison dans ma délégation ?',
      answer:
        'Indiquez votre adresse lors de la réservation sur Plany.tn pour une livraison directe à Bir El Hafey, Jelma ou Regueb.',
    },
    {
      question: 'Pourquoi choisir Plany.tn pour Sidi Bouzid ?',
      answer:
        'Plany.tn centralise prix, assurances et avis pour sécuriser vos déplacements au cœur de la Tunisie.',
    },
  ],
  faqIntro: faqIntroFactory('Sidi Bouzid'),
  internalLinks: [
    '/location-voiture-pas-cher-a-kairouan',
    '/location-voiture-pas-cher-a-gafsa',
    '/location-voiture-pas-cher-a-sfax',
    '/location-voiture-pas-cher-a-mahdia',
  ],
  blogUrl,
  cta: ctaFactory('Sidi Bouzid'),
  crosslinkIntro: 'Planifiez vos livraisons vers',
  jsonLd: createJsonLd(
    'Sidi Bouzid',
    '/location-voiture-pas-cher-a-sidi-bouzid',
    'Comparez la location voiture Sidi Bouzid sur Plany.tn pour vos trajets agricoles ou administratifs. Citadine automatique, utilitaire diesel ou pick-up sans caution, livraison à la gare routière ou dans les délégations voisines avec assistance 7j/7.',
    35.0382,
    9.484,
  ),
  seoNote,
}

locationDataSEO.zaghouan = {
  city: 'Zaghouan',
  slug: '/location-voiture-pas-cher-a-zaghouan',
  title: 'Location voiture pas cher à Zaghouan | Plany',
  metaDescription:
    'Réservez votre location voiture Zaghouan avec Plany.tn pour profiter du Djebel, de l’aqueduc romain et des hammams. Citadine automatique, SUV ou utilitaire sans caution, retrait rapide depuis Tunis Sud ou Bir Mcherga avec assistance locale 7j/7.',
  seoKeywords: {
    principal: ['location voiture Zaghouan', 'location voiture Djebel Zaghouan'],
    secondaires: ['voiture automatique Zaghouan', 'louer voiture pas cher Zaghouan', 'location voiture aqueduc Zaghouan'],
    semantiques: [...commonKeywords, 'location voiture Bir Mcherga', 'comparateur location voiture Zaghouan'],
  },
  hero: heroFactory(
    'Location voiture Zaghouan avec Plany.tn',
    'Explorez le Djebel et les villages verts du Cap Bon intérieur.',
    [
      'Plany.tn réunit les agences régionales pour louer une voiture à Zaghouan et découvrir l’aqueduc romain, les hammams et les villages artisanaux.',
      'Choisissez citadine automatique pour circuler dans le centre, SUV pour gravir le Djebel Zaghouan ou utilitaire pour vos activités professionnelles.',
      'Profitez d’options sans caution, assurances flexibles et assistance locale 7j/7 depuis Tunis ou Bir Mcherga.',
    ],
  ),
  advantages: advantagesFactory('Zaghouan'),
  nearbyDestinations: nearbyFactory('Zaghouan', [
    {
      name: 'Tunis',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-tunis',
      description: 'Accès rapide à Tunis et Tunis-Carthage.',
      imageAlt: 'Location voiture Zaghouan pour rejoindre Tunis avec Plany.tn',
    },
    {
      name: 'Hammamet',
      image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-hammamet',
      description: 'Plages et marinas de Yasmine Hammamet.',
      imageAlt: 'Louer une voiture à Zaghouan pour se rendre à Hammamet avec Plany.tn',
    },
    {
      name: 'El Fahs',
      image: 'https://images.unsplash.com/photo-1526481280695-3c4691d58c94?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-zaghouan',
      description: 'Randonnées et forêts autour d’El Fahs.',
      imageAlt: 'Location voiture Zaghouan pour explorer El Fahs avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Avec une voiture louée à Zaghouan, rejoignez aisément Tunis, Hammamet ou El Fahs pour une escapade nature et bien-être.',
  vehicleIntro:
    'Citadines automatiques idéales pour le centre historique, SUV pour monter vers le Djebel et utilitaires pour les artisans et producteurs locaux.',
  vehicleCategories: createVehicleCategories('Zaghouan', 48),
  map: mapConfig(
    [36.4008, 10.1471],
    'Retrait en centre-ville, zone industrielle de Bir Mcherga et livraison dans les écolodges du Djebel.',
  ),
  stats: statsFactory('Zaghouan', '28+', '2 900', '4.6/5', '11 circuits'),
  statsIntro:
    'Plany.tn aide les voyageurs bien-être à Zaghouan avec un réseau d’agences locales et des véhicules adaptés aux routes montagneuses.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Zaghouan ?',
      answer:
        'Les tarifs démarrent à 48 TND/jour pour une citadine. Les SUV restent abordables via Plany.tn pour les excursions nature.',
    },
    {
      question: 'Peut-on louer une voiture sans caution à Zaghouan ?',
      answer:
        'Oui, plusieurs partenaires proposent des options sans caution ou dépôt réduit pour les séjours courts.',
    },
    {
      question: 'Les voitures automatiques sont-elles disponibles ?',
      answer:
        'Oui, citadines et SUV automatiques sont proposés pour les trajets vers Tunis ou Hammamet.',
    },
    {
      question: 'Comment accéder au Djebel Zaghouan ?',
      answer:
        'Réservez un SUV sur Plany.tn, vérifiez l’état des routes et suivez les itinéraires balisés au départ d’El Fahs.',
    },
    {
      question: 'Pourquoi réserver via Plany.tn ?',
      answer:
        'Plany.tn offre transparence tarifaire, avis vérifiés et assistance locale pour louer une voiture à Zaghouan pas cher.',
    },
  ],
  faqIntro: faqIntroFactory('Zaghouan'),
  internalLinks: [
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-hammamet',
    '/location-voiture-pas-cher-a-nabeul',
    '/location-voiture-pas-cher-a-ben-arous',
  ],
  blogUrl,
  cta: ctaFactory('Zaghouan'),
  crosslinkIntro: 'Envie de découvrir aussi',
  jsonLd: createJsonLd(
    'Zaghouan',
    '/location-voiture-pas-cher-a-zaghouan',
    'Réservez votre location voiture Zaghouan avec Plany.tn pour profiter du Djebel, de l’aqueduc romain et des hammams. Citadine automatique, SUV ou utilitaire sans caution, retrait rapide depuis Tunis Sud ou Bir Mcherga avec assistance locale 7j/7.',
    36.4008,
    10.1471,
  ),
  seoNote,
}

locationDataSEO.medenine = {
  city: 'Médenine',
  slug: '/location-voiture-pas-cher-a-medenine',
  title: 'Location voiture pas cher à Médenine | Plany',
  metaDescription:
    'Comparez la location voiture Médenine, Zarzis et Ben Gardane avec Plany.tn. Citadine automatique, SUV climatisé ou pick-up sans caution, livraison à l’aéroport Djerba-Zarzis ou au poste frontalier, assistance locale 7j/7 pour explorer le sud-est.',
  seoKeywords: {
    principal: ['location voiture Médenine', 'location voiture Zarzis'],
    secondaires: ['voiture automatique Médenine', 'louer voiture pas cher Médenine', 'location voiture Ben Gardane'],
    semantiques: [...commonKeywords, 'location voiture sud-est Tunisie', 'comparateur location voiture Médenine'],
  },
  hero: heroFactory(
    'Location voiture Médenine avec Plany.tn',
    'Reliez Zarzis, Ben Gardane et l’aéroport Djerba-Zarzis facilement.',
    [
      'Plany.tn compare les offres de location voiture Médenine pour vos déplacements professionnels et logistiques vers Zarzis ou Ben Gardane.',
      'Choisissez SUV climatisé, citadine automatique ou pick-up selon vos besoins de transport sur la RN1.',
      'Options sans caution, assurance complète et assistance locale 7j/7 pour sécuriser vos trajets dans le sud-est.',
    ],
  ),
  advantages: advantagesFactory('Médenine'),
  nearbyDestinations: nearbyFactory('Médenine', [
    {
      name: 'Zarzis',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-medenine',
      description: 'Zone touristique et port de Zarzis.',
      imageAlt: 'Location voiture Médenine pour rejoindre Zarzis avec Plany.tn',
    },
    {
      name: 'Ben Gardane',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-medenine',
      description: 'Marchés frontaliers et zone franche.',
      imageAlt: 'Louer une voiture à Médenine pour Ben Gardane avec Plany.tn',
    },
    {
      name: 'Djerba',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-djerba',
      description: 'Île de Djerba et aéroport Djerba-Zarzis.',
      imageAlt: 'Location voiture Médenine pour accéder à Djerba et son aéroport avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Médenine, roulez vers Zarzis, Ben Gardane ou l’aéroport Djerba-Zarzis en profitant des routes rapides du sud-est tunisien.',
  vehicleIntro:
    'Citadine automatique pour la ville, SUV climatisé pour les trajets côtiers et pick-up pour les activités logistiques et agricoles.',
  vehicleCategories: createVehicleCategories('Médenine', 55),
  map: mapConfig(
    [33.3544, 10.5055],
    'Retrait en centre-ville, zone industrielle, livraison à l’aéroport Djerba-Zarzis et aux hôtels de Zarzis.',
  ),
  stats: statsFactory('Médenine', '40+', '5 500', '4.7/5', '17 circuits'),
  statsIntro:
    'Plany.tn connecte Médenine aux principales zones touristiques et logistiques avec un réseau de plus de 40 agences partenaires.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Médenine ?',
      answer:
        'Les tarifs débutent à 52 TND/jour pour une citadine. Les SUV climatisés restent compétitifs via Plany.tn.',
    },
    {
      question: 'Peut-on louer une voiture sans caution à Médenine ?',
      answer:
        'Oui, certaines agences proposent des options sans caution ou avec dépôt réduit pour les trajets fréquents vers Zarzis.',
    },
    {
      question: 'Comment récupérer un véhicule à l’aéroport Djerba-Zarzis ?',
      answer:
        'Indiquez votre vol lors de la réservation sur Plany.tn et l’agence vous attendra au terminal.',
    },
    {
      question: 'Existe-t-il des pick-up ou utilitaires ?',
      answer:
        'Oui, Plany.tn propose pick-up double cabine et utilitaires pour les besoins professionnels à Médenine.',
    },
    {
      question: 'Pourquoi réserver via Plany.tn ?',
      answer:
        'Plany.tn compare les prix du sud-est, fournit des avis vérifiés et une assistance 7j/7.',
    },
  ],
  faqIntro: faqIntroFactory('Médenine'),
  internalLinks: [
    '/location-voiture-pas-cher-a-djerba',
    '/location-voiture-pas-cher-a-gabes',
    '/location-voiture-pas-cher-a-tozeur',
    '/location-voiture-pas-cher-a-jerba-midoun',
  ],
  blogUrl,
  cta: ctaFactory('Médenine'),
  crosslinkIntro: 'Partez aussi vers',
  jsonLd: createJsonLd(
    'Médenine',
    '/location-voiture-pas-cher-a-medenine',
    'Comparez la location voiture Médenine, Zarzis et Ben Gardane avec Plany.tn. Citadine automatique, SUV climatisé ou pick-up sans caution, livraison à l’aéroport Djerba-Zarzis ou au poste frontalier, assistance locale 7j/7 pour explorer le sud-est.',
    33.3544,
    10.5055,
  ),
  seoNote,
}

locationDataSEO['jerba-midoun'] = {
  city: 'Jerba Midoun',
  slug: '/location-voiture-pas-cher-a-jerba-midoun',
  title: 'Location voiture pas cher à Jerba Midoun | Plany',
  metaDescription:
    'Réservez votre location voiture Jerba Midoun avec Plany.tn. Citadine automatique, SUV plage ou cabriolet sans caution, livraison à l’aéroport Djerba-Zarzis ou à votre hôtel de Sidi Mahrez, tarifs comparés en temps réel avec assistance locale 7j/7.',
  seoKeywords: {
    principal: ['location voiture Jerba Midoun', 'location voiture aéroport Djerba-Zarzis'],
    secondaires: ['voiture automatique Djerba', 'location voiture plage Jerba', 'louer voiture pas cher Jerba Midoun'],
    semantiques: [...commonKeywords, 'location voiture Sidi Mahrez', 'comparateur location voiture Jerba Midoun'],
  },
  hero: heroFactory(
    'Location voiture Jerba Midoun avec Plany.tn',
    'Profitez des plages et villages de Djerba en toute liberté.',
    [
      'Plany.tn rassemble les agences de Jerba Midoun pour louer une voiture et explorer Sidi Mahrez, Houmt Souk ou le phare de Taguermess.',
      'Optez pour citadine automatique pour les ruelles de Midoun, SUV plage pour transporter les planches ou cabriolet pour une expérience premium.',
      'Réservez sans caution selon disponibilité, avec assistance locale et livraison à l’aéroport Djerba-Zarzis ou dans votre hôtel.',
    ],
  ),
  advantages: advantagesFactory('Jerba Midoun'),
  nearbyDestinations: nearbyFactory('Jerba Midoun', [
    {
      name: 'Houmt Souk',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-djerba',
      description: 'Souks, port et musées de Houmt Souk.',
      imageAlt: 'Location voiture Jerba Midoun pour visiter Houmt Souk avec Plany.tn',
    },
    {
      name: 'Guellala',
      image: 'https://images.unsplash.com/photo-1526481280695-3c4691d58c94?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-jerba-midoun',
      description: 'Village de potiers et musées traditionnels.',
      imageAlt: 'Louer une voiture à Jerba Midoun pour découvrir Guellala avec Plany.tn',
    },
    {
      name: 'Zarzis',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-medenine',
      description: 'Excursions balnéaires vers Zarzis.',
      imageAlt: 'Location voiture Jerba Midoun pour explorer Zarzis avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Avec votre voiture louée à Jerba Midoun, rejoignez rapidement Houmt Souk, Guellala ou Zarzis pour profiter des plages et animations.',
  vehicleIntro:
    'Citadine automatique idéale pour Midoun, SUV climatisé pour les plages et routes sablonneuses, cabriolet pour une expérience resort.',
  vehicleCategories: createVehicleCategories('Jerba Midoun', 57),
  map: mapConfig(
    [33.8083, 10.9926],
    'Retrait à Midoun centre, livraison à l’aéroport Djerba-Zarzis, hôtels de Sidi Mahrez et resorts de Taguermess.',
  ),
  stats: statsFactory('Jerba Midoun', '42+', '7 200', '4.9/5', '19 circuits'),
  statsIntro:
    'Plany.tn accompagne les vacanciers à Jerba Midoun avec une sélection de plus de 40 agences partenaires et une satisfaction moyenne de 4.9/5.',
  faqItems: [
    {
      question: 'Quel est le tarif d’une location voiture à Jerba Midoun ?',
      answer:
        'Les citadines débutent à 55 TND/jour. Les SUV plage et cabriolets restent abordables via Plany.tn selon la saison.',
    },
    {
      question: 'Puis-je louer une voiture sans caution à Jerba Midoun ?',
      answer:
        'Oui, plusieurs partenaires offrent des formules sans caution ou dépôt réduit pour les séjours balnéaires.',
    },
    {
      question: 'Comment récupérer un véhicule à l’aéroport Djerba-Zarzis ?',
      answer:
        'Indiquez votre numéro de vol sur Plany.tn et recevez votre voiture directement au terminal.',
    },
    {
      question: 'Des voitures automatiques sont-elles disponibles ?',
      answer:
        'Oui, la plupart des catalogues proposent des citadines et SUV automatiques adaptés à la circulation touristique.',
    },
    {
      question: 'Pourquoi choisir Plany.tn à Jerba Midoun ?',
      answer:
        'Plany.tn compare les agences locales, garantit des prix transparents et offre un support 7j/7 pour vos vacances.',
    },
  ],
  faqIntro: faqIntroFactory('Jerba Midoun'),
  internalLinks: [
    '/location-voiture-pas-cher-a-djerba',
    '/location-voiture-pas-cher-a-medenine',
    '/location-voiture-pas-cher-a-gabes',
    '/location-voiture-pas-cher-a-hammamet',
  ],
  blogUrl,
  cta: ctaFactory('Jerba Midoun'),
  crosslinkIntro: 'Envie d’autres idées soleil vers',
  jsonLd: createJsonLd(
    'Jerba Midoun',
    '/location-voiture-pas-cher-a-jerba-midoun',
    'Réservez votre location voiture Jerba Midoun avec Plany.tn. Citadine automatique, SUV plage ou cabriolet sans caution, livraison à l’aéroport Djerba-Zarzis ou à votre hôtel de Sidi Mahrez, tarifs comparés en temps réel avec assistance locale 7j/7.',
    33.8083,
    10.9926,
  ),
  seoNote,
}

locationDataSEO.hammamet = {
  city: 'Hammamet',
  slug: '/location-voiture-pas-cher-a-hammamet',
  title: 'Location voiture pas cher à Hammamet | Plany',
  metaDescription:
    'Comparez la location voiture Hammamet et Yasmine Hammamet avec Plany.tn. Citadine automatique, SUV plage ou cabriolet sans caution, retrait à l’aéroport Enfidha ou à l’hôtel, tarifs négociés et assistance locale 7j/7 pour explorer le Cap Bon.',
  seoKeywords: {
    principal: ['location voiture Hammamet', 'location voiture Yasmine Hammamet'],
    secondaires: ['voiture automatique Hammamet', 'location voiture aéroport Enfidha', 'louer voiture pas cher Hammamet'],
    semantiques: [...commonKeywords, 'location voiture Cap Bon', 'comparateur location voiture Hammamet'],
  },
  hero: heroFactory(
    'Location voiture Hammamet avec Plany.tn',
    'Explorez le Cap Bon entre médina, golf et marinas.',
    [
      'Plany.tn compare les offres de location voiture Hammamet pour rejoindre Yasmine, Nabeul ou les golfs prestigieux.',
      'Choisissez citadine automatique pour circuler dans la médina, SUV plage pour transporter votre matériel nautique ou cabriolet pour une expérience premium.',
      'Réservez sans caution selon disponibilité, retrait à l’aéroport Enfidha ou directement à l’hôtel avec assistance locale 7j/7.',
    ],
  ),
  advantages: advantagesFactory('Hammamet'),
  nearbyDestinations: nearbyFactory('Hammamet', [
    {
      name: 'Nabeul',
      image: 'https://images.unsplash.com/photo-1544635395-8fd4f7c3fc2b?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-nabeul',
      description: 'Souks artisanaux et marchés d’agrumes.',
      imageAlt: 'Location voiture Hammamet pour visiter Nabeul avec Plany.tn',
    },
    {
      name: 'Enfidha',
      image: 'https://images.unsplash.com/photo-1551887673-31b605e1c04c?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-sousse',
      description: 'Aéroport Enfidha-Hammamet et resorts voisins.',
      imageAlt: 'Louer une voiture à Hammamet pour rejoindre l’aéroport Enfidha avec Plany.tn',
    },
    {
      name: 'Kelibia',
      image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=800&q=60',
      link: '/location-voiture-pas-cher-a-hammamet',
      description: 'Fort et plages turquoises de Kélibia.',
      imageAlt: 'Location voiture Hammamet pour explorer Kélibia avec Plany.tn',
    },
  ]),
  nearbyIntro:
    'Depuis Hammamet, rejoignez Nabeul, Enfidha ou Kelibia en quelques minutes grâce aux autoroutes et routes côtières du Cap Bon.',
  vehicleIntro:
    'Citadines automatiques pour la médina, SUV spacieux pour les familles en resort et cabriolets pour les escapades romantiques.',
  vehicleCategories: createVehicleCategories('Hammamet', 56),
  map: mapConfig(
    [36.3996, 10.6149],
    'Retrait à Yasmine Hammamet, centres de congrès, golf Citrus et livraison dans les hôtels balnéaires.',
  ),
  stats: statsFactory('Hammamet', '58+', '9 400', '4.8/5', '22 circuits'),
  statsIntro:
    'Plany.tn accompagne les séjours balnéaires à Hammamet avec plus de 50 agences partenaires et une note moyenne de 4.8/5.',
  faqItems: [
    {
      question: 'Quel est le prix d’une location voiture à Hammamet ?',
      answer:
        'Les offres débutent à 55 TND/jour pour une citadine. Les SUV plage restent compétitifs via Plany.tn selon la saison.',
    },
    {
      question: 'Peut-on louer sans caution à Hammamet ?',
      answer:
        'Oui, certaines agences proposent des formules sans caution ou dépôt réduit pour les séjours hôteliers.',
    },
    {
      question: 'Comment récupérer un véhicule à l’aéroport Enfidha ?',
      answer:
        'Indiquez votre vol dans Plany.tn et l’agence partenaire vous accueille au terminal.',
    },
    {
      question: 'Des voitures automatiques sont-elles disponibles ?',
      answer:
        'Oui, citadines, berlines et SUV automatiques sont proposés pour un confort maximal sur la côte.',
    },
    {
      question: 'Pourquoi choisir Plany.tn à Hammamet ?',
      answer:
        'Plany.tn offre comparateur local, avis clients et assistance 7j/7 pour louer une voiture à Hammamet pas cher.',
    },
  ],
  faqIntro: faqIntroFactory('Hammamet'),
  internalLinks: [
    '/location-voiture-pas-cher-a-nabeul',
    '/location-voiture-pas-cher-a-sousse',
    '/location-voiture-pas-cher-a-tunis',
    '/location-voiture-pas-cher-a-bizerte',
  ],
  blogUrl,
  cta: ctaFactory('Hammamet'),
  crosslinkIntro: 'Prolongez votre séjour vers',
  jsonLd: createJsonLd(
    'Hammamet',
    '/location-voiture-pas-cher-a-hammamet',
    'Comparez la location voiture Hammamet et Yasmine Hammamet avec Plany.tn. Citadine automatique, SUV plage ou cabriolet sans caution, retrait à l’aéroport Enfidha ou à l’hôtel, tarifs négociés et assistance locale 7j/7 pour explorer le Cap Bon.',
    36.3996,
    10.6149,
  ),
  seoNote,
}
