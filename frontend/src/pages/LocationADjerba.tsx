import React from 'react'
import LocationPageTemplate, { SectionContent, FaqItem } from '@/components/location/LocationPageTemplate'

const slug = '/location-voiture-pas-cher-a-djerba'
const title = 'Location voiture pas cher à Djerba | Plany'
const description = 'Location voiture à Djerba : profitez de votre séjour avec un véhicule adapté. Offres à partir de 55 TND/jour.'

const introductionParagraphs: string[] = [
  'Avec Plany, la location voiture Djerba devient la clé pour découvrir chaque plage et chaque village de l’île sans contrainte. Notre comparateur rassemble les agences basées à l’aéroport de Djerba-Zarzis, à Houmt Souk et à Midoun pour vous proposer des véhicules adaptés à vos envies balnéaires ou culturelles.',
  'Nos offres privilégient la location voiture pas cher Djerba tout en garantissant le confort : climatisation puissante, GPS multilingue, sièges enfant et options premium pour les escapades vers les lagunes. Les véhicules sont contrôlés et prêts pour affronter les routes côtières ainsi que les pistes plus sauvages du sud de l’île.',
  'Que vous arriviez par avion ou par le bac de Jorf, l’interface Plany vous permet de réserver en quelques clics depuis votre mobile. Nous mettons à votre disposition un service client attentif pour adapter vos horaires de prise en charge, ajouter un conducteur ou organiser la restitution à votre hôtel.',
]

const sections: SectionContent[] = [
  {
    title: 'Pourquoi louer à Djerba ?',
    paragraphs: [
      'Djerba est un paradis insulaire où chaque plage offre une ambiance différente. Louer une voiture vous laisse libre de naviguer entre la vieille ville de Houmt Souk, la marina de Midoun et les villages artisanaux comme Guellala. Les transports collectifs restent limités en soirée ; disposer de votre propre véhicule vous garantit des couchers de soleil à la plage de Sidi Mahrez ou des dîners dans les restaurants de la zone touristique sans vous soucier des horaires.',
      'En choisissant Plany, vous accédez à des véhicules fiables pour parcourir les routes côtières bordées de palmiers mais aussi l’intérieur de l’île, où les oliveraies et les mosquées blanchies méritent le détour. Un SUV vous sera utile pour rejoindre les pistes menant aux plages sauvages de Ras Rmel ou aux villages berbères du sud, tandis qu’une citadine suffira pour explorer les ruelles commerçantes de Houmt Souk.',
    ],
  },
  {
    title: 'Offres sur l’île',
    paragraphs: [
      'Les agences partenaires de Plany couvrent l’ensemble de l’île de Djerba avec des points de retrait à l’aéroport, dans les hôtels et près des souks. Vous trouverez des voitures économiques idéales pour deux personnes, des berlines spacieuses pour les familles et des cabriolets pour profiter de la brise marine. Les tarifs démarrent dès 55 TND par jour hors saison et évoluent selon les périodes touristiques de mars à octobre.',
      'Pour les voyageurs souhaitant découvrir le sud tunisien, certains loueurs proposent des forfaits combinant location sur Djerba et drop-off à Tataouine ou Médenine. Vous pouvez ajouter des options telles que glacière, porte-bagages pour matériel de kitesurf ou siège bébé. Nos filtres vous aident à sélectionner les véhicules automatiques ou diesel, indispensables pour une consommation maîtrisée lors des longues traversées de l’île.',
    ],
  },
  {
    title: 'Réserver avec Plany',
    paragraphs: [
      'La réservation sur Plany se déroule en trois étapes simples : saisissez vos dates et lieux, comparez les offres disponibles, puis confirmez votre location voiture Djerba avec paiement sécurisé. Chaque fiche détaille le kilométrage inclus, les assurances, le montant de la caution et les conditions d’annulation pour vous éviter toute surprise.',
      'Notre équipe surveille la disponibilité en temps réel. Si votre vol atterrit tard le soir, vous pouvez opter pour un retrait 24/7 à l’aéroport ou demander la livraison à votre riadh. Les notifications vous accompagnent depuis la confirmation jusqu’au rappel de restitution. En cas de changement, contactez le support Plany qui coordonnera directement avec l’agence locale.',
    ],
  },
  {
    title: 'Circuler sur Djerba',
    paragraphs: [
      'Les routes principales de Djerba sont bien entretenues, mais prenez garde aux scooters et calèches qui partagent la chaussée, surtout entre Midoun et la zone touristique. Respectez les limitations, particulièrement près des écoles et des mosquées. Les parkings sont nombreux autour de Houmt Souk ; privilégiez ceux situés près de la place Hedi Chaker ou du marché central pour éviter les ruelles étroites.',
      'Si vous partez vers les plages du sud, emportez de l’eau et vérifiez la pression des pneus : le sable peut être meuble vers Ras Rmel. Pour un passage vers le continent, renseignez-vous sur les horaires du bac de Jorf et prévoyez un temps d’attente en haute saison. Les stations-service sont présentes à Ajim, Midoun et Houmt Souk ; faites le plein avant de vous lancer sur la route des ksour ou vers le désert du Sahara.',
    ],
  },
  {
    title: 'FAQ',
    paragraphs: [],
  },
]

const faqItems: FaqItem[] = [
  {
    question: 'Quel véhicule pour explorer l’île ?',
    answer: 'Optez pour une citadine pour circuler dans Houmt Souk ou un SUV pour parcourir les plages et les routes secondaires de l’île de Djerba.',
  },
  {
    question: 'Assurance tous risques ?',
    answer: 'Disponible en option selon le loueur, souvent recommandée pour couvrir vos déplacements sur l’île.',
  },
  {
    question: 'Lieux populaires ?',
    answer: 'Houmt Souk, Midoun, la plage de la Seguia, le phare de Taguermess et la synagogue de la Ghriba figurent parmi les incontournables.',
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
  '/location-voiture-pas-cher-a-hammamet',
]

const LocationADjerba = () => (
  <LocationPageTemplate
    city="Djerba"
    slug={slug}
    title={title}
    description={description}
    introductionParagraphs={introductionParagraphs}
    sections={sections}
    faqItems={faqItems}
    internalLinks={internalLinks}
  />
)

export default LocationADjerba
