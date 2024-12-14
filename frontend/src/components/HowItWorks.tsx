import React from 'react'
import { Box, Stack, Typography, Card, CardContent } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import PaymentIcon from '@mui/icons-material/Payment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const steps = [
    {
      id: 1,
      icon: <LocationOnIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: '1. Choisir votre destination',
      description: "Sélectionnez l'endroit et les dates de location.",
    },
    {
        id: 2,
      icon: <DirectionsCarIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: '2. Trouver la voiture idéale',
      description: 'Explorez et choisissez une voiture adaptée à vos besoins.',
    },
    {
      id: 3,
      icon: <PaymentIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: '3. Réserver en ligne',
      description: 'Confirmez votre réservation en quelques clics.',
    },
    {
      id: 4,
      icon: <CheckCircleIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: '4. Profitez de votre voyage',
      description: 'Une fois confirmée, récupérez la voiture et partez en toute tranquillité.',
    },
  ]

const HowItWorks = () => (
  <Box
    sx={{
        py: 5,
        px: 2,
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
      }}
  >
    <h1 className="title"> Comment ça fonctionne ?</h1>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={3}
      justifyContent="center"
      alignItems="center"
      sx={{
          flexWrap: 'wrap',
          gap: 3,
          mt: 4,
        }}
    >
      {steps.map((step) => (
        <Card
          key={step.id}
          sx={{
              width: { xs: '100%', sm: '250px' }, // Taille fixe pour les blocs
              height: { xs: '100%', sm: '280px' }, // Taille fixe pour les blocs
              textAlign: 'center',
              p: 3,
              boxShadow: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              ':hover': { boxShadow: 6 },
            }}
        >
          <CardContent>
            {step.icon}
            <Typography variant="h6" sx={{ mt: 2 }}>
              {step.title}
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ mt: 1 }}
            >
              {step.description}
            </Typography>
          </CardContent>
        </Card>
        ))}
    </Stack>
  </Box>
  )

export default HowItWorks
