import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'

interface NoMatchProps {
  hideHeader?: boolean
}

const NoMatch = ({ hideHeader }: NoMatchProps) => {
  const noMatch = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
        padding: 3
      }}
    >
      {/* Message principal */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          marginBottom: 2,
          color: '#333'
        }}
      >
        {commonStrings.NO_MATCH}
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          color: '#757575',
          marginBottom: 4,
          maxWidth: '600px' // Limite la largeur pour un meilleur rendu
        }}
      >
        {commonStrings.NO_MATCH_DESCRIPTION}
      </Typography>

      {/* Bouton pour revenir à la page d'accueil */}
      <Button
        variant="contained"
        color="primary"
        href="/"
        startIcon={<HomeIcon />}
        sx={{
          paddingX: 4,
          paddingY: 1.5,
          borderRadius: 3,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        {commonStrings.GO_TO_HOME}
      </Button>
    </Box>
  )

  return hideHeader ? noMatch() : <Layout strict={false}>{noMatch()}</Layout>
}

export default NoMatch
