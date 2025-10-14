import React, { useEffect, useState } from 'react'
import { Box, Typography, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Paper, Button, Collapse } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import * as SupplierService from '@/services/SupplierService'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'

interface AgencyScoreProps {
  agencyId: string
  initialScoreBreakdown?: bookcarsTypes.ScoreBreakdown
}

const AgencyScore: React.FC<AgencyScoreProps> = ({ agencyId, initialScoreBreakdown }) => {
  const [scoreBreakdown, setScoreBreakdown] = useState<bookcarsTypes.ScoreBreakdown | null>(initialScoreBreakdown ?? null)
  const [loading, setLoading] = useState<boolean>(!initialScoreBreakdown)
  const [error, setError] = useState<string | null>(null)
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false) // État pour afficher/cacher les recommandations

  useEffect(() => {
    if (initialScoreBreakdown) {
      setScoreBreakdown(initialScoreBreakdown)
      setLoading(false)
    }
  }, [initialScoreBreakdown])

  useEffect(() => {
    if (initialScoreBreakdown || !agencyId) {
      return
    }

    let active = true
    const fetchAgencyScore = async () => {
      try {
        setError(null)
        setLoading(true)
        const response = await SupplierService.getSupplierScore(agencyId)
        if (active) {
          setScoreBreakdown(response)
        }
      } catch (err) {
        if (active) {
          setError('Erreur lors de la récupération du score.')
        }
        console.error(err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchAgencyScore()
    return () => {
      active = false
    }
  }, [agencyId, initialScoreBreakdown])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main' // Vert
    if (score >= 50) return 'warning.main' // Orange
    return 'error.main' // Rouge
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  if (!scoreBreakdown) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography>Aucun score disponible.</Typography>
      </Box>
    )
  }

  return (
    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, margin: env.isMobile() ? '5px 5px 12px 5px' : '0px 5px 12px 0px' }}>
      {/* Affichage du score avec CircularProgress */}
      <Typography variant="h6" gutterBottom fontSize={16} textAlign="center" marginBottom={1}>
        Score de l&apos;agence
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 3,
        }}
      >
        <Box position="relative" display="inline-flex">

          {/* Cercle de progression */}
          <CircularProgress
            variant="determinate"
            value={scoreBreakdown.score}
            size={120}
            thickness={5}
            sx={{
              color: getScoreColor(scoreBreakdown.score),
            }}
          />
          {/* Texte au centre du cercle */}
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" component="div" color="text.primary">
              {`${scoreBreakdown.score}/100`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Bouton pour afficher/cacher les recommandations */}
      <Box display="flex" justifyContent="center" marginBottom={2}>
        <Button
          variant="outlined"
          onClick={() => setShowRecommendations(!showRecommendations)}
          sx={{ textTransform: 'none' }}
        >
          {showRecommendations ? 'Masquer les recommandations' : 'Voir les recommandations'}
        </Button>
      </Box>

      {/* Recommandations (cachées par défaut) */}
      <Collapse in={showRecommendations}>
        <List>
          {scoreBreakdown.recommendations.map((recommendation, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <ListItem key={index} sx={{ paddingLeft: 0 }}>
              <ListItemIcon>
                {scoreBreakdown.score >= 80 ? (
                  <CheckCircleIcon color="success" sx={{ minWidth: '20px' }} />
                ) : scoreBreakdown.score >= 50 ? (
                  <WarningIcon color="warning" sx={{ minWidth: '20px' }} />
                ) : (
                  <ErrorIcon color="error" sx={{ minWidth: '20px' }} />
                )}
              </ListItemIcon>
              <ListItemText primary={recommendation} sx={{ '& .MuiTypography-root': { fontSize: '12px' } }} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  )
}

export default AgencyScore
