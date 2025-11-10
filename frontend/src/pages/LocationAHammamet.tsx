import React from 'react'
import LocationPageTemplate, { SectionContent, FaqItem } from '@/components/location/LocationPageTemplate'

const slug = '/location-voiture-pas-cher-a-hammamet'
const title = 'Location voiture pas cher à Hammamet | Plany'
const description = 'Louez une voiture à Hammamet pour découvrir la région en toute liberté.'

const introductionParagraphs: string[] = [
  'Envie de circuler librement entre la médina de Hammamet, les plages de Yasmine et les souks de Nabeul ? Plany facilite votre location voiture Hammamet avec des offres transparentes et adaptées à vos envies de vacances ou à vos déplacements professionnels.',
  'Notre réseau de loueurs propose des cabriolets pour longer la corniche, des citadines pour circuler dans le centre historique et des SUV familiaux pour transporter confortablement enfants et bagages.',
  'Le SearchForm vous guide pour choisir la voiture idéale, ajouter une assurance complète ou des accessoires comme le siège bébé, et finaliser votre réservation en ligne en toute sécurité.',
]

const sections: SectionContent[] = [
  {
    title: 'Pourquoi louer à Hammamet ?',
    paragraphs: [
      'Hammamet est une station balnéaire très fréquentée : disposer d’une voiture vous permet de visiter les plages les plus secrètes, la Kasbah ou les sites de thalassothérapie sans attendre les taxis collectifs.',
      'Vous pouvez organiser des excursions vers Nabeul, Kelibia ou la route des vignobles. Une auto Hammamet vous assure un confort optimal pour transporter planches de surf, glacières et souvenirs.',
    ],
  },
  {
    title: 'Offres touristiques',
    paragraphs: [
      'Plany référence des offres flexibles : location à la journée, au week-end ou à la semaine, avec kilométrage illimité pour parcourir toute la côte du Cap Bon. Chaque véhicule est entretenu et livré avec assistance 24/7.',
      'Des options complémentaires sont disponibles : GPS multilingue, Wi-Fi embarqué, conducteurs additionnels. Les tarifs restent compétitifs même pendant la haute saison estivale.',
    ],
  },
  {
    title: 'Réserver via Plany',
    paragraphs: [
      'Renseignez vos dates, sélectionnez votre point de retrait (Hammamet centre, Yasmine, hôtels ou livraison à domicile) et comparez les offres en temps réel. Vous pouvez filtrer par type de carburant, transmission ou segment.',
      'Une confirmation détaillée vous est envoyée avec les coordonnées du loueur, les documents requis et les instructions de restitution. Notre équipe peut ajuster vos horaires si votre planning change.',
    ],
  },
  {
    title: 'Conduite côtière',
    paragraphs: [
      'La circulation est fluide en dehors des heures de pointe estivales. Respectez les zones piétonnes autour de la médina et privilégiez les parkings surveillés pour profiter de la plage en toute tranquillité.',
      'Sur la route côtière vers Nabeul ou Kelibia, profitez des panoramas mais restez vigilant face aux scooters et aux traversées piétonnes. Pensez à prévoir de l’eau fraîche dans votre voiture plage.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const faqItems: FaqItem[] = [
  {
    question: 'Voiture pour visiter Nabeul ?',
    answer: 'Oui, Plany propose des véhicules parfaits pour relier Hammamet à Nabeul ou Kelibia en toute simplicité.',
  },
  {
    question: 'Agence ouverte le dimanche ?',
    answer: 'Oui, selon disponibilité : réservez en ligne et nous confirmons l’horaire de retrait dominical.',
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
  '/location-voiture-pas-cher-a-medenine',
  '/location-voiture-pas-cher-a-jerba-midoun',
]

const LocationAHammamet = () => (
  <LocationPageTemplate
    city="Hammamet"
    slug={slug}
    title={title}
    description={description}
    introductionParagraphs={introductionParagraphs}
    sections={sections}
    faqItems={faqItems}
    internalLinks={internalLinks}
  />
)

export default LocationAHammamet
