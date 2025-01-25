import React from 'react'
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'

interface LocationHeaderProps {
    location: bookcarsTypes.Location; // Définissez le type de la prop location
  }

const LocationHeader = ({ location }: LocationHeaderProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Détermine si l'écran est en mode mobile

  return (
    <Box
      sx={{
        backgroundColor: 'white', // Fond blanc
        padding: isMobile ? '16px' : '24px', // Ajustez le padding selon vos besoins
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '20px',
        marginTop: '20px',
        border: '1px solid #ddd',
        width: isMobile ? '98%' : '800px', // Pleine largeur sur mobile, largeur fixe sur desktop
        mx: 'auto', // Centrer la boîte horizontalement
      }}
    >
      <Typography
        variant={isMobile ? 'h5' : 'h4'} // Taille de police plus petite sur mobile
        component="h1"
        sx={{ fontWeight: 'bold', color: '#333', fontSize: isMobile ? '1.4rem' : '1.7rem' }}
      >
        Louez une voiture à
        {' '}
        {location.name}
      </Typography>
      <Typography
        variant={isMobile ? 'body1' : 'subtitle1'} // Taille de police plus petite sur mobile
        sx={{ color: '#666', marginTop: '10px' }}
      >
        Trouvez la voiture idéale pour vos déplacements. Profitez de tarifs compétitifs
        et d&apos;une large sélection de véhicules adaptés à tous vos besoins.
      </Typography>
      {/* Vous pouvez ajouter une image de voiture et le prix ici */}
      {/* <CarImageWithPrice car={car} /> */}
    </Box>
  )
}

export default LocationHeader
