import React, { useEffect, useState } from 'react'
import { Alert, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import * as UserService from '@/services/UserService'
import env from '@/config/env.config'

const ProfileAlert: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPhoneNumber, setHasPhoneNumber] = useState(false)
  const [user, setUser] = useState<any>(null) // Stocker l’utilisateur complet
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = UserService.getCurrentUser()

      if (currentUser) {
        try {
          const status = await UserService.validateAccessToken()

          if (status === 200) {
            const _user = await UserService.getUser(currentUser._id)
            setUser(_user)
            setIsAuthenticated(true)
            setHasPhoneNumber(
              _user?.phone !== undefined
              && _user?.phone !== null
              && _user.phone !== ''
            )
          } else {
            setIsAuthenticated(false)
          }
        } catch (err) {
          console.error(err)
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  // Si pas connecté ou chargement en cours -> rien afficher
  if (!isAuthenticated || loading) {
    return null
  }

  return (
    <>
      {/* ✅ Alerte erreur si score < 50 */}
      {user?.score !== undefined && user.score < 65 && (
        <Alert
          severity="error"
          sx={{
            width: '97%',
            marginTop: '5px',
            marginLeft: env.isMobile() ? '0px' : '10px',
            border: '1px solid #d32f2f',
            padding: '10px',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <span>
            Votre score a chuté sous le seuil minimum requis. Par conséquent, vos voitures ne seront plus visibles sur
            {' '}
            <strong>Plany</strong>
            {' '}
            tant que votre score ne sera pas rétabli.
          </span>
        </Alert>
      )}

      {/* ⚠️ Alerte warning si pas de numéro de téléphone */}
      {!hasPhoneNumber && (
        <Alert
          severity="warning"
          className="warning-alert"
          sx={{
            width: '97%',
            marginTop: '5px',
            marginLeft: env.isMobile() ? '0px' : '10px',
            border: '1px solid #ed6c02',
            padding: '10px',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <span>
            Votre profil est incomplet. Veuillez ajouter un numéro de téléphone pour finaliser votre compte et accéder à toutes les fonctionnalités.
          </span>
          <Link
            to="/settings"
            style={{ textDecoration: 'none', float: 'right', marginTop: '30px' }}
          >
            <Button variant="contained" color="warning" size="small">
              Compléter mon profil
            </Button>
          </Link>
        </Alert>
      )}
    </>
  )
}

export default ProfileAlert
