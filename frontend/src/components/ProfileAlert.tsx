import React, { useEffect, useState } from 'react'
import { Alert, Button, useMediaQuery, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import * as UserService from '@/services/UserService' // Importez le service utilisateur

const ProfileAlert: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPhoneNumber, setHasPhoneNumber] = useState(false)
  const [loading, setLoading] = useState(true) // Ajoutez un état de chargement
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = UserService.getCurrentUser()

      if (currentUser) {
        try {
          const status = await UserService.validateAccessToken()

          if (status === 200) {
            const _user = await UserService.getUser(currentUser._id)
            setIsAuthenticated(true)
            setHasPhoneNumber(_user?.phone !== undefined && _user?.phone !== null && _user.phone !== '')
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
      setLoading(false) // Fin du chargement
    }

    fetchUser()
  }, [])

  // Ne rien afficher si l'utilisateur n'est pas authentifié ou a déjà un numéro de téléphone
  if (!isAuthenticated || hasPhoneNumber || loading) {
    return null
  }

  return (
    <Alert
      severity="warning"
      className="warning-alert"
      sx={{
        width: isMobile ? '97%' : '100%', // Prend toute la largeur disponible
        marginTop: '5px',
        border: '1px solid #ed6c02',
        maxWidth: '800px', // Limite la largeur maximale
        padding: '10px', // Ajoute un peu d'espace intérieur
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }, // Colonne sur mobile, ligne sur desktop
        alignItems: 'center', // Centre verticalement
        justifyContent: 'space-between', // Espace entre le texte et le bouton
        gap: '10px', // Espacement entre les éléments
        marginBottom: '20px', // Ajoute un espace en bas
      }}
    >
      <span>
        Votre profil est incomplet. Veuillez ajouter un numéro de téléphone pour finaliser votre compte et accéder à toutes les fonctionnalités.
      </span>
      <Link to="/settings" style={{ textDecoration: 'none', float: 'right', marginTop: '30px' }}>
        <Button variant="contained" color="warning" size="small">
          Compléter mon profil
        </Button>
      </Link>
    </Alert>
  )
}

export default ProfileAlert
