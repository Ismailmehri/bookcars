import React from 'react'
import { Button, Typography } from '@mui/material'
import { EventNote, BarChart, Visibility, GroupAdd } from '@mui/icons-material'

import '../assets/css/rental-agency-section.css'

const advantages = [
  {
    id: 'booking',
    title: 'Gestion facile des réservations',
    description: 'Gérez toutes vos réservations depuis une plateforme unique, simple et rapide.',
    icon: <EventNote fontSize="inherit" />, 
  },
  {
    id: 'analytics',
    title: 'Statistiques détaillées',
    description: 'Suivez la performance de vos voitures avec des statistiques sur les locations.',
    icon: <BarChart fontSize="inherit" />, 
  },
  {
    id: 'visibility',
    title: 'Plus de visibilité',
    description: "Augmentez la visibilité de vos véhicules auprès d'un large public de clients potentiels.",
    icon: <Visibility fontSize="inherit" />, 
  },
  {
    id: 'bookingFlow',
    title: 'Réservation simplifiée',
    description: 'Facilitez la réservation pour vos clients avec une interface conviviale.',
    icon: <GroupAdd fontSize="inherit" />, 
  },
]

const RentalAgencySection = () => (
  <section className="rental-agency" aria-labelledby="rental-agency-title">
    <div className="rental-agency__header">
      <Typography id="rental-agency-title" variant="h4" component="h2">
        Rejoignez Plany et boostez votre agence de location !
      </Typography>
      <Typography variant="h6" color="text.secondary" component="p">
        Profitez d&apos;une gestion simplifiée et d&apos;une meilleure visibilité pour vos voitures.
      </Typography>
    </div>

    <div className="rental-agency__grid" role="list">
      {advantages.map((advantage) => (
        <article key={advantage.id} className="rental-agency__card" role="listitem">
          <div className="rental-agency__icon" aria-hidden="true">
            {advantage.icon}
          </div>
          <Typography variant="h6" component="h3" className="rental-agency__title">
            {advantage.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="rental-agency__description">
            {advantage.description}
          </Typography>
        </article>
      ))}
    </div>

    <div className="rental-agency__cta">
      <Button
        variant="contained"
        color="primary"
        size="large"
        href="https://admin.plany.tn/sign-up"
        className="rental-agency__cta-button"
      >
        Inscrivez votre agence maintenant
      </Button>
    </div>
  </section>
)

export default RentalAgencySection
