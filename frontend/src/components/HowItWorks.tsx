import React, { ReactNode } from 'react'
import { Typography } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PaymentIcon from '@mui/icons-material/Payment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import '../assets/css/how-it-works.css'

interface StepCard {
  id: number
  icon: ReactNode
  title: string
  description: string
}

const steps: StepCard[] = [
  {
    id: 1,
    icon: <LocationOnIcon fontSize="large" />, 
    title: '1. Choisir votre destination',
    description: "Sélectionnez l'endroit et les dates de location.",
  },
  {
    id: 2,
    icon: <DirectionsCarIcon fontSize="large" />,
    title: '2. Trouver la voiture idéale',
    description: 'Explorez et choisissez une voiture adaptée à vos besoins.',
  },
  {
    id: 3,
    icon: <PaymentIcon fontSize="large" />,
    title: '3. Réserver en ligne',
    description: 'Confirmez votre réservation en quelques clics.',
  },
  {
    id: 4,
    icon: <CheckCircleIcon fontSize="large" />,
    title: '4. Profitez de votre voyage',
    description: 'Une fois confirmée, récupérez la voiture et partez en toute tranquillité.',
  },
]

const HowItWorks = () => (
  <section className="how-it-works" aria-labelledby="how-it-works-title">
    <Typography id="how-it-works-title" variant="h4" component="h2" className="how-it-works__title">
      Comment ça fonctionne ?
    </Typography>
    <div className="how-it-works__grid">
      {steps.map((step) => (
        <article key={step.id} className="how-it-works__card">
          <div className="how-it-works__icon" aria-hidden="true">
            {step.icon}
          </div>
          <Typography variant="h6" component="h3" className="how-it-works__heading">
            {step.title}
          </Typography>
          <Typography variant="body1" color="textSecondary" className="how-it-works__description">
            {step.description}
          </Typography>
        </article>
      ))}
    </div>
  </section>
)

export default HowItWorks
