import React from 'react'
import LocationPageTemplate, { SectionContent, FaqItem } from '@/components/location/LocationPageTemplate'

const slug = '/location-voiture-pas-cher-a-ben-arous'
const title = 'Location voiture pas cher à Ben Arous | Plany'
const description = 'Louez une voiture à Ben Arous avec Plany en quelques clics. Disponibilité immédiate.'

const introductionParagraphs: string[] = [
  'Située au sud de Tunis, Ben Arous est un carrefour industriel et logistique. Avec Plany, trouvez rapidement une location voiture Ben Arous pour vos déplacements entre Mégrine, Radès, Ezzahra ou Mornag.',
  'Notre moteur compare les offres des agences locales afin de vous proposer une location voiture pas cher Ben Arous avec des véhicules entretenus, climatisés et adaptés aux trajets professionnels comme aux déplacements familiaux.',
  'Grâce à la plateforme responsive, vous pouvez réserver depuis votre bureau, votre dépôt ou votre smartphone en mission. Notre équipe accompagne les professionnels pour gérer les flottes temporaires ou les besoins ponctuels d’utilitaires.',
]

const sections: SectionContent[] = [
  {
    title: 'Pourquoi louer à Ben Arous ?',
    paragraphs: [
      'Le gouvernorat de Ben Arous englobe des zones industrielles majeures telles que Mégrine, Radès et Mornag. Disposer d’une voiture de location permet de relier facilement les sièges sociaux, les dépôts et le port de Radès sans attendre un taxi collectif. Plany vous propose des véhicules fiables pour assurer vos tournées commerciales ou vos visites de chantiers.',
      'La location est également intéressante pour les habitants qui souhaitent rejoindre rapidement Tunis centre, la banlieue sud ou les plages de Soliman. Les voitures automatiques et diesel sont populaires pour affronter le trafic de la RN1 et de l’autoroute A1, surtout aux heures de pointe. Un GPS intégré vous aide à naviguer entre les zones en travaux et les bretelles vers la route de Mornag.',
    ],
  },
  {
    title: 'Offres disponibles',
    paragraphs: [
      'Les agences partenaires de Plany à Ben Arous proposent des citadines économiques pour les déplacements quotidiens, des berlines confortables pour les managers et des utilitaires légers pour les artisans. Les tarifs débutent autour de 55 TND par jour, avec des remises progressives pour les locations de plusieurs semaines.',
      'Pour les entreprises, Plany permet d’établir des contrats personnalisés avec facturation mensuelle, suivi des conducteurs et assistance prioritaire. Vous pouvez ajouter des options comme les dispositifs de géolocalisation, les sièges enfant ou la livraison sur site à Radès port ou à la zone logistique de Bir El Bey.',
    ],
  },
  {
    title: 'Réserver en ligne',
    paragraphs: [
      'La réservation Plany est rapide : indiquez vos dates, sélectionnez Ben Arous comme lieu de prise en charge et comparez les véhicules disponibles. Chaque offre détaille la caution, la politique carburant et les assurances pour vous aider à choisir en toute transparence.',
      'Une fois la location validée, vous recevez les instructions de récupération par email et SMS. Les entreprises peuvent partager l’accès au dossier avec leurs collaborateurs pour faciliter la prise en main. Notre support est joignable pour prolonger la location, ajouter un conducteur ou organiser un aller-simple vers Tunis ou Nabeul.',
    ],
  },
  {
    title: 'Conduite locale',
    paragraphs: [
      'Ben Arous est traversée par des axes dynamiques comme la RN1, la GP1 et l’autoroute A1. Prévoyez de partir en avance durant les heures de pointe et privilégiez les voies rapides pour rejoindre Tunis. Les radars fixes sont fréquents, notamment près de Hammam Lif ; respectez les limitations pour éviter les amendes.',
      'Pour accéder aux zones portuaires de Radès, préparez vos autorisations et utilisez un véhicule adapté si vous transportez du matériel. Les parkings sont sécurisés dans la plupart des zones industrielles, mais pensez à verrouiller votre véhicule et à laisser vos documents dans la boîte à gants. En direction de Mornag, la route devient plus rurale : un SUV peut être utile en saison pluvieuse.',
    ],
  },
  {
    title: 'Questions fréquentes',
    paragraphs: [],
  },
]

const faqItems: FaqItem[] = [
  {
    question: 'Peut-on louer pour entreprises ?',
    answer: 'Oui, des formules professionnelles avec facturation détaillée sont proposées pour les entreprises de Ben Arous et de la zone industrielle de Mégrine.',
  },
  {
    question: 'Y a-t-il des agences ouvertes le week-end ?',
    answer: 'Plusieurs agences partenaires assurent un service le samedi et le dimanche, notamment près de la route de Mornag et de la zone portuaire de Radès.',
  },
]

const internalLinks: string[] = [
  '/location-voiture-pas-cher-a-tunis',
  '/location-voiture-pas-cher-a-sousse',
  '/location-voiture-pas-cher-a-sfax',
  '/location-voiture-pas-cher-a-nabeul',
  '/location-voiture-pas-cher-a-monastir',
  '/location-voiture-pas-cher-a-mahdia',
  '/location-voiture-pas-cher-a-kairouan',
  '/location-voiture-pas-cher-a-djerba',
  '/location-voiture-pas-cher-a-ariana',
  '/location-voiture-pas-cher-a-bizerte',
  '/location-voiture-pas-cher-a-gabes',
  '/location-voiture-pas-cher-a-gafsa',
  '/location-voiture-pas-cher-a-tozeur',
  '/location-voiture-pas-cher-a-kasserine',
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
]

const LocationABenArous = () => (
  <LocationPageTemplate
    city="Ben Arous"
    slug={slug}
    title={title}
    description={description}
    introductionParagraphs={introductionParagraphs}
    sections={sections}
    faqItems={faqItems}
    internalLinks={internalLinks}
  />
)

export default LocationABenArous
