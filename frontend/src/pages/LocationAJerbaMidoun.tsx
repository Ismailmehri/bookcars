import React from 'react'
import LocationPageTemplate, { SectionContent, FaqItem } from '@/components/location/LocationPageTemplate'

const slug = '/location-voiture-pas-cher-a-jerba-midoun'
const title = 'Location voiture pas cher à Jerba Midoun | Plany'
const description = 'Location de voiture à Jerba Midoun avec Plany dès 55 TND/jour.'

const introductionParagraphs: string[] = [
  'Réservez une location voiture Midoun avec Plany pour profiter pleinement de votre séjour sur l’île de Djerba. Que vous logiez dans un hôtel de la zone touristique, un riad au cœur de Midoun ou une maison de plage à Sidi Mahres, une voiture vous offre une liberté totale.',
  'Nos partenaires proposent des véhicules adaptés aux familles, aux couples en escapade balnéaire ou aux voyageurs en quête d’aventure : citadines, cabriolets, SUV, monospaces et même des voitures automatiques pour circuler sans stress dans les ruelles animées.',
  'Via le SearchForm Plany, comparez les offres disponibles, ajoutez un siège enfant, une glacière ou une assurance premium, et validez votre réservation en quelques minutes.',
]

const sections: SectionContent[] = [
  {
    title: 'Pourquoi louer à Midoun ?',
    paragraphs: [
      'Jerba Midoun est le cœur touristique de l’île avec ses plages de sable fin, ses souks colorés et ses hôtels clubs. Disposer d’une voiture vous permet de visiter Houmt Souk, Guellala ou les villages berbères sans dépendre des taxis.',
      'Les amateurs de sport nautique apprécient la flexibilité pour rejoindre la lagune de Ras Rmel ou la plage de Seguia. Une auto Jerba Midoun facilite également les transferts vers le golf, les restaurants ou les fêtes nocturnes.',
    ],
  },
  {
    title: 'Offres locales',
    paragraphs: [
      'Plany propose des forfaits modulables : location à la journée, au week-end ou à la semaine, avec kilométrage illimité pour explorer toute l’île. Les véhicules sont entretenus, climatisés et livrés avec assistance 24/7.',
      'Vous pouvez choisir une voiture avec toit panoramique pour admirer les couchers de soleil, ou un SUV pour transporter planches de kite surf et bagages volumineux. Les tarifs restent attractifs même pendant la haute saison estivale.',
    ],
  },
  {
    title: 'Réserver simplement',
    paragraphs: [
      'Renseignez vos dates sur Plany, sélectionnez Midoun, l’aéroport de Djerba-Zarzis ou votre hôtel comme point de retrait, puis comparez les offres. Filtrez par transmission, carburant ou nombre de places afin de trouver la voiture idéale.',
      'Une fois votre choix validé, vous recevez votre contrat par email, avec les indications pour la remise des clés et les numéros d’assistance. Notre support peut ajuster votre réservation si vos horaires de vol changent.',
    ],
  },
  {
    title: 'Conduite à Midoun',
    paragraphs: [
      'La circulation est fluide en journée, mais ralentit à la sortie des plages et aux abords du souk de Midoun. Prévoyez un stationnement sur les parkings surveillés des hôtels ou sur les parkings publics près de la place centrale.',
      'Le tour de l’île s’effectue en moins d’une heure : profitez-en pour visiter la chaussée romaine, le phare de Taguermess et les villages de potiers. Restez vigilant la nuit sur les routes côtières peu éclairées.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const faqItems: FaqItem[] = [
  {
    question: 'Voitures adaptées aux familles ?',
    answer: 'Oui, des monospaces et SUV spacieux sont disponibles pour voyager confortablement avec toute la famille.',
  },
  {
    question: 'Offre week-end dispo ?',
    answer: 'Oui, des formules week-end ou mid-week sont proposées avec retrait rapide à Midoun ou à l’aéroport de Djerba.',
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
  '/location-voiture-pas-cher-a-hammamet',
]

const LocationAJerbaMidoun = () => (
  <LocationPageTemplate
    city="Jerba Midoun"
    slug={slug}
    title={title}
    description={description}
    introductionParagraphs={introductionParagraphs}
    sections={sections}
    faqItems={faqItems}
    internalLinks={internalLinks}
  />
)

export default LocationAJerbaMidoun
