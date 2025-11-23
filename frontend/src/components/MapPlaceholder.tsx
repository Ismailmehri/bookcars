import React from 'react'
import { Button, Stack, Typography } from '@mui/material'

interface MapPlaceholderProps {
  onShowMap: () => void
  label?: string
}

const MapPlaceholder = ({ onShowMap, label = 'Afficher la carte' }: MapPlaceholderProps) => (
  <div style={{ height: '300px', background: '#eaeaea', borderRadius: 8 }}>
    <Stack
      role="status"
      aria-live="polite"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ height: '100%', px: 2 }}
    >
      <Typography variant="body1" color="text.secondary" textAlign="center">
        Carte interactive disponible sur demande.
      </Typography>
      <Button variant="contained" color="primary" onClick={onShowMap} aria-label={label}>
        {label}
      </Button>
    </Stack>
  </div>
)

export default MapPlaceholder
