import React from 'react'
import LocationPageTemplate, { SectionContent, FaqItem } from '@/components/location/LocationPageTemplate'

const slug = '/location-voiture-pas-cher-a-medenine'
const title = 'Location voiture pas cher à Médenine | Plany'
const description = 'Réservez à Médenine une voiture avec Plany et partez à la découverte du sud.'

const introductionParagraphs: string[] = [
  'La location voiture Médenine avec Plany vous ouvre les portes du sud tunisien : route vers Zarzis, excursion à Ben Gardane ou visite des ksour du désert. Nous proposons des offres adaptées aux voyages professionnels, touristiques ou familiaux.',
  'Vous trouverez une gamme complète de véhicules : citadines économiques pour les trajets urbains, SUV robustes pour les routes désertiques et voitures automatiques pour ceux qui recherchent le confort sur les longues distances.',
  'Grâce au SearchForm Plany, comparez les tarifs, ajoutez des options comme l’assurance tous risques, le Wi-Fi embarqué ou le siège enfant, et finalisez votre réservation en quelques clics.',
]

const sections: SectionContent[] = [
  {
    title: 'Pourquoi louer ici ?',
    paragraphs: [
      'Médenine est un point de passage stratégique entre le littoral et le désert. Louer une voiture vous permet de gérer vos déplacements vers les zones industrielles, les administrations ou les sites touristiques de la région sans perdre de temps.',
      'Pour les voyageurs se rendant à Djerba ou en Libye via Ras Jedir, disposer d’une auto Médenine fiable garantit un trajet serein. Vous pouvez organiser vos étapes selon votre emploi du temps et profiter d’un confort optimal.',
    ],
  },
  {
    title: 'Nos offres locales',
    paragraphs: [
      'Plany sélectionne des agences partenaires qui entretiennent régulièrement leurs véhicules, proposent des kilomètres adaptés et des options utiles comme le GPS ou la glacière. Les tarifs restent compétitifs, même en haute saison.',
      'Nous offrons également des packages pour les professionnels : location longue durée, flotte d’entreprise, livraison sur site. Chaque contrat est transparent sur les assurances et le dépôt de garantie.',
    ],
  },
  {
    title: 'Réserver facilement',
    paragraphs: [
      'Entrez vos dates dans le formulaire Plany, choisissez votre point de retrait (centre-ville, gare routière, hôtel ou livraison à Zarzis) et comparez les véhicules disponibles. Vous pouvez filtrer par type de carburant ou transmission.',
      'Après validation, vous recevez votre confirmation détaillée, les consignes de prise en charge et les contacts du loueur. Notre support est joignable pour modifier vos horaires ou ajouter des options.',
    ],
  },
  {
    title: 'Conduite et climat',
    paragraphs: [
      'Le climat de Médenine est chaud et sec : privilégiez une voiture climatisée et vérifiez régulièrement vos niveaux d’eau et d’huile. Sur les routes désertiques, adaptez votre vitesse et évitez de circuler aux heures de forte chaleur.',
      'Les axes reliant Médenine à Zarzis et à Ben Gardane sont bien entretenus. Restez toutefois vigilant face aux vents de sable qui peuvent réduire la visibilité. Faites une pause régulière pour rester concentré.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const faqItems: FaqItem[] = [
  {
    question: 'Voiture automatique possible ?',
    answer: 'Oui, des modèles automatiques sont disponibles sur demande pour plus de confort sur les longues distances.',
  },
  {
    question: 'Zones proches à visiter ?',
    answer: 'Profitez de votre voiture pour explorer Zarzis, Ben Gardane, les ksour et les oasis du sud tunisien.',
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
  '/location-voiture-pas-cher-a-ben-arous',
  '/location-voiture-pas-cher-a-bizerte',
  '/location-voiture-pas-cher-a-gabes',
  '/location-voiture-pas-cher-a-gafsa',
  '/location-voiture-pas-cher-a-tozeur',
  '/location-voiture-pas-cher-a-kasserine',
  '/location-voiture-pas-cher-a-sidi-bouzid',
  '/location-voiture-pas-cher-a-zaghouan',
  '/location-voiture-pas-cher-a-jerba-midoun',
  '/location-voiture-pas-cher-a-hammamet',
]

const LocationAMedenine = () => (
  <LocationPageTemplate
    city="Médenine"
    slug={slug}
    title={title}
    description={description}
    introductionParagraphs={introductionParagraphs}
    sections={sections}
    faqItems={faqItems}
    internalLinks={internalLinks}
  />
)

export default LocationAMedenine
