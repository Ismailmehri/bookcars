import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { strings as commonStrings } from '@/lang/common'

import '@/assets/css/error.css'

interface ErrorProps {
  message: string
  style?: React.CSSProperties
  homeLink?: boolean
}

const Error = ({ message, style, homeLink }: ErrorProps) => {
  if (homeLink) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          padding: 3,
          textAlign: 'center',
          ...style
        }}
      >
        {/* Icône d'erreur */}
        <ErrorOutlineIcon sx={{ fontSize: 80, color: '#f44336', marginBottom: 2 }} />

        {/* Message d'erreur */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            marginBottom: 1,
            color: '#333'
          }}
        >
          {commonStrings.GENERIC_ERROR}
        </Typography>

        {/* Lien vers la page d'accueil */}
        <Button
          variant="contained"
          color="primary"
          href="/"
          sx={{
            paddingX: 4,
            paddingY: 1.5,
            borderRadius: 3,
            marginTop: 3,
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {commonStrings.GO_TO_HOME}
        </Button>
      </Box>
    )
  }

  // Version existante si homeLink est false
  return (
    <div className="msg" style={style || {}}>
      <div className="error">
        <span className="message">{message}</span>
      </div>
    </div>
  )
}

export default Error
