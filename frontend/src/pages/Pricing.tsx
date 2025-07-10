import React from 'react'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { CheckCircle, Cancel, InfoOutlined } from '@mui/icons-material'
import { Helmet } from 'react-helmet'
import Layout from '@/components/Layout'
import Footer from '@/components/Footer'

import '@/assets/css/pricing.css'

interface Feature {
  label: string
  free?: string | boolean
  basic?: string | boolean
  premium?: string | boolean
}

const features: Feature[] = [
  { label: 'Nombre de voitures visibles', free: '1', basic: '3', premium: 'Illimité' },
  { label: 'Voitures sponsorisées', free: false, basic: '1', premium: '3' },
  { label: 'URL personnalisée', free: false, basic: true, premium: true },
  { label: 'Page agence dédiée', free: false, basic: false, premium: true },
  { label: 'Statistiques de vues', free: false, basic: false, premium: true },
  { label: 'Gestion d’annonces (dupliquer, masquer…)', free: false, basic: false, premium: true },
  { label: 'Support par email et chat', free: false, basic: true, premium: true },
  { label: 'Badge "Agence vérifiée"', free: false, basic: false, premium: true },
  { label: 'Accès aux factures PDF', free: false, basic: true, premium: true },
  { label: 'Calendrier de disponibilité', free: false, basic: 'En option (+5DT/mois)', premium: true },
  { label: 'Essai gratuit 14 jours', free: true, basic: true, premium: true },
]

const renderFeature = (value: string | boolean | undefined) => {
  if (value === true) {
    return (
      <>
        <ListItemIcon>
          <CheckCircle color="success" />
        </ListItemIcon>
        <ListItemText primary="Inclus" />
      </>
    )
  }
  if (value === false) {
    return (
      <>
        <ListItemIcon>
          <Cancel color="disabled" />
        </ListItemIcon>
        <ListItemText primary="Non inclus" sx={{ color: 'text.disabled', textDecoration: 'line-through' }} />
      </>
    )
  }
  return (
    <>
      <ListItemIcon>
        <InfoOutlined color="action" />
      </ListItemIcon>
      <ListItemText primary={value as string} />
    </>
  )
}

const Pricing = () => (
  <Layout>
    <Helmet>
      <title>Plans Adaptés à Vos Besoins - Plany</title>
    </Helmet>
    <Container maxWidth="lg" className="pricing-page">
      <Box className="pricing-header">
        <Typography variant="h3" component="h1" gutterBottom>
          Plans adaptés à vos besoins
        </Typography>
        <Typography variant="h6">
          Essayez gratuitement pendant 14 jours. Aucune carte bancaire nécessaire.
        </Typography>
      </Box>
      <Grid container spacing={3} className="pricing-cards">
        {['free', 'basic', 'premium'].map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan}>
            <Card className={`pricing-card ${plan === 'premium' ? 'premium' : ''}`} elevation={plan === 'premium' ? 6 : 1}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" component="div">
                    {plan === 'free' && 'Free'}
                    {plan === 'basic' && 'Basic'}
                    {plan === 'premium' && 'Premium'}
                  </Typography>
                  {plan === 'premium' && <Chip color="warning" label="Meilleur choix" size="small" />}
                </Box>
                <Typography variant="h4" component="div" className="pricing-price">
                  {plan === 'free' && '0DT'}
                  {plan === 'basic' && '10DT'}
                  {plan === 'premium' && '30DT'}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="pricing-frequency" gutterBottom>
                  /mois
                </Typography>
                <List className="pricing-features">
                  {features.map((f) => (
                    <ListItem key={f.label} disableGutters className={!f[plan as keyof Feature] && f[plan as keyof Feature] !== 0 ? 'disabled' : ''}>
                      {renderFeature(f[plan as keyof Feature])}
                      <Typography sx={{ ml: 1 }}>{f.label}</Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                {plan === 'free' && (
                  <Button fullWidth variant="contained" className="btn-secondary">
                    Commencer l\'essai
                  </Button>
                )}
                {plan === 'basic' && (
                  <Button fullWidth variant="contained" className="btn-primary">
                    Choisir
                  </Button>
                )}
                {plan === 'premium' && (
                  <Button fullWidth variant="contained" className="btn-orange">
                    Choisir
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
    <Footer />
  </Layout>
)

export default Pricing
