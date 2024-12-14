import React from 'react'
import { Box, Button, Typography, Stack, Paper } from '@mui/material'
import { EventNote, BarChart, Visibility, GroupAdd } from '@mui/icons-material'

const RentalAgencySection = () => (
  <Box sx={{ padding: '40px 20px', textAlign: 'center' }}>
    <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
      Rejoignez Plany et boostez votre agence de location !
    </Typography>
    <Typography variant="h6" sx={{ color: 'text.secondary', marginBottom: 4 }}>
      Profitez d&apos;une gestion simplifiée et d&apos;une meilleure visibilité pour vos voitures.
    </Typography>

    {/* Grid for advantages with icons */}
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={4}
      justifyContent="center"
      alignItems="center"
      sx={{ marginBottom: 4 }}
    >
      <Paper
        sx={{
          padding: 3,
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <EventNote sx={{ fontSize: 80, color: 'primary.main', marginBottom: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Gestion facile des réservations
        </Typography>
        <Typography variant="body2">
          Gérez toutes vos réservations depuis une plateforme unique, simple et rapide.
        </Typography>
      </Paper>

      <Paper
        sx={{
          padding: 3,
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <BarChart sx={{ fontSize: 80, color: 'primary.main', marginBottom: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Statistiques détaillées
        </Typography>
        <Typography variant="body2">
          Suivez la performance de vos voitures avec des statistiques sur les locations.
        </Typography>
      </Paper>
    </Stack>

    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={4}
      justifyContent="center"
      alignItems="center"
    >
      <Paper
        sx={{
          padding: 3,
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Visibility sx={{ fontSize: 80, color: 'primary.main', marginBottom: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Plus de visibilité
        </Typography>
        <Typography variant="body2">
          Augmentez la visibilité de vos véhicules auprès d&apos;un large public de clients potentiels.
        </Typography>
      </Paper>

      <Paper
        sx={{
          padding: 3,
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <GroupAdd sx={{ fontSize: 80, color: 'primary.main', marginBottom: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Réservation simplifiée
        </Typography>
        <Typography variant="body2">
          Facilitez la réservation pour vos clients avec une interface conviviale.
        </Typography>
      </Paper>
    </Stack>

    {/* CTA Button */}
    <Box sx={{ marginTop: 4 }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        href="https://admin.plany.tn/sign-up"
        sx={{ padding: '10px 20px', fontSize: '16px', borderRadius: '10px' }}
      >
        Inscrivez votre agence maintenant
      </Button>
    </Box>
  </Box>
)

export default RentalAgencySection
