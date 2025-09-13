import React from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import StarOutlineIcon from '@mui/icons-material/StarOutline'

const benefits = [
  {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#007BFF' }} aria-hidden="true" />,
    title: 'Plus de réservations',
    description: 'Une agence vérifiée inspire confiance et convertit mieux.'
  },
  {
    icon: <ShieldOutlinedIcon sx={{ fontSize: 40, color: '#007BFF' }} aria-hidden="true" />,
    title: 'Confiance renforcée',
    description: 'Les clients choisissent plus facilement des agences vérifiées.'
  },
  {
    icon: <StarOutlineIcon sx={{ fontSize: 40, color: '#007BFF' }} aria-hidden="true" />,
    title: 'Mise en avant',
    description: "Les profils vérifiés peuvent bénéficier d'une meilleure visibilité sur Plany."
  }
]

const AgencyVerificationBenefits = () => (
  <Box>
    <Typography variant="h6" gutterBottom>Pourquoi vérifier votre agence ?</Typography>
    <Box
      sx={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: '1fr',
        '@media (min-width:768px)': {
          gridTemplateColumns: 'repeat(3, 1fr)'
        }
      }}
    >
      {benefits.map((b) => (
        <Card
          key={b.title}
          sx={{ borderRadius: '8px', boxShadow: 1, border: '1px solid #E0E0E0' }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {b.icon}
            <Typography variant="subtitle1" sx={{ color: '#007BFF' }}>{b.title}</Typography>
            <Typography variant="body2">{b.description}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
)

export default AgencyVerificationBenefits
