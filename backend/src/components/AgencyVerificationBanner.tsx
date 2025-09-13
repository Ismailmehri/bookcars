import React from 'react'
import { Box, Typography } from '@mui/material'

export type AgencyVerificationStatus = 'NON_SOUMIS' | 'EN_REVUE' | 'VALIDEE' | 'REFUSEE'

interface Props {
  status: AgencyVerificationStatus
}

const map: Record<AgencyVerificationStatus, {
  icon: string
  message: string
  bg: string
  color: string
  role: 'status' | 'alert'
}> = {
  NON_SOUMIS: {
    icon: '⚠️',
    message: 'Pour que vos clients voient votre agence comme vérifiée, veuillez téléverser vos documents obligatoires.',
    bg: '#FFF3CD',
    color: '#856404',
    role: 'status'
  },
  EN_REVUE: {
    icon: '⌛',
    message: 'Votre dossier est en cours de vérification par notre équipe. Vous serez notifié une fois terminé.',
    bg: '#E8F4FD',
    color: '#004085',
    role: 'status'
  },
  VALIDEE: {
    icon: '✅',
    message: 'Félicitations ! Votre agence est vérifiée. Vos clients vous feront davantage confiance et vous obtiendrez plus de réservations.',
    bg: '#D4EDDA',
    color: '#155724',
    role: 'status'
  },
  REFUSEE: {
    icon: '❌',
    message: 'Vos documents ont été refusés. Merci de téléverser une nouvelle version avec les corrections demandées.',
    bg: '#F8D7DA',
    color: '#721C24',
    role: 'alert'
  }
}

const AgencyVerificationBanner = ({ status }: Props) => {
  const { icon, message, bg, color, role } = map[status]
  return (
    <Box
      role={role}
      sx={{
        backgroundColor: bg,
        color,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span aria-hidden="true">{icon}</span>
      <Typography variant="body2">{message}</Typography>
    </Box>
  )
}

export default AgencyVerificationBanner
