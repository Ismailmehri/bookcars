import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import * as bookcarsTypes from ':bookcars-types'
import * as SubscriptionService from '@/services/SubscriptionService'
import '@/assets/css/pricing.css'

const Pricing = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<bookcarsTypes.SubscriptionPeriod>('monthly' as bookcarsTypes.SubscriptionPeriod)
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [subscription, setSubscription] = useState<bookcarsTypes.Subscription>()

  const handlePeriodChange = (_: React.MouseEvent<HTMLElement>, value: bookcarsTypes.SubscriptionPeriod | null) => {
    if (value) {
      setPeriod(value)
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    if (_user) {
      setUser(_user)
      try {
        const sub = await SubscriptionService.getCurrent()
        if (sub) {
          setSubscription(sub)
        }
      } catch {
        // Ignore errors
      }
    }
  }


  const prices = {
    free: { monthly: 0, yearly: 0 },
    basic: { monthly: 10, yearly: 96 },
    premium: { monthly: 30, yearly: 288 },
  }

  const features = [
    { label: 'Voitures visibles dans les résultats', free: '1', basic: '3', premium: 'Illimité' },
    { label: 'Voitures sponsorisées', free: false, basic: '1', premium: 'Illimité' },
    { label: 'URL personnalisée', free: false, basic: true, premium: true },
    { label: 'Page agence dédiée', free: false, basic: false, premium: true },
    { label: 'Statistiques de vues', free: false, basic: false, premium: true },
    { label: 'Gestion d\u2019annonces (dupliquer, masquer\u2026)', free: false, basic: false, premium: true },
    { label: 'Support par email et chat', free: false, basic: true, premium: true },
    { label: 'Badge \u201cAgence v\u00E9rifi\u00E9e\u201d', free: false, basic: false, premium: true },
    { label: 'Acc\u00E8s aux factures PDF', free: false, basic: true, premium: true },
    { label: 'Calendrier de disponibilit\u00E9', free: false, basic: 'extra', premium: true },
    { label: 'Essai gratuit 14 jours', free: false, basic: true, premium: true },
  ]

  const renderFeature = (feature: any, _plan: bookcarsTypes.SubscriptionPlan) => {
    const value = feature[_plan]
    const active = value && value !== 'extra'
    const extra = value === 'extra'
    return (
      <ListItem className={!active && !extra ? 'feature-disabled' : ''}>
        <ListItemIcon>
          {active ? <CheckIcon className="feature-check" /> : <CloseIcon color="disabled" />}
        </ListItemIcon>
        <ListItemText primary={`${feature.label}${typeof value === 'string' && value !== 'extra' && value !== 'true' ? `: ${value}` : ''}${extra ? ' (+5DT/mois)' : ''}`} />
      </ListItem>
    )
  }

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      color: '#9ca3af',
      hover: '#6b7280',
      cta: 'Choisir',
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      color: '#3B82F6',
      hover: '#1d4ed8',
      cta: 'Essayer gratuitement',
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      color: '#F97316',
      hover: '#c2410c',
      cta: 'Essayer gratuitement',
      badge: true,
    },
  ] as const

  const planOrder: Record<bookcarsTypes.SubscriptionPlan, number> = {
    free: 0,
    basic: 1,
    premium: 2,
  }

  const handleChoose = (p: bookcarsTypes.SubscriptionPlan) => {
    navigate(`/pricing/checkout?plan=${p}&period=${period}`)
  }

  const isExpired = subscription ? new Date(subscription.endDate) < new Date() : false

  return (
    <Layout onLoad={onLoad} strict>
      <Container maxWidth="lg">
        <Box my={4} textAlign="center">
          <Typography variant="h4" gutterBottom>
            Plans adaptés à vos besoins
          </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Essayez gratuitement pendant 14 jours. Aucune carte bancaire nécessaire.
        </Typography>
        {subscription && (
          <Typography
            variant="body2"
            color={new Date(subscription.endDate) < new Date() ? 'error' : 'textPrimary'}
            gutterBottom
          >
            {new Date(subscription.endDate) < new Date()
              ? `Votre plan ${subscription.plan} a expiré. Vous êtes maintenant sur le plan gratuit.`
              : `Plan actuel : ${subscription.plan} (fin le ${new Date(subscription.endDate).toLocaleDateString()})`}
          </Typography>
        )}
        <ToggleButtonGroup
            exclusive
            value={period}
            onChange={handlePeriodChange}
            className="period-toggle"
            sx={{ mb: 2 }}
          >
            <ToggleButton value="monthly">Mensuel</ToggleButton>
            <ToggleButton value="yearly">Annuel</ToggleButton>
          </ToggleButtonGroup>
          {period === 'yearly' && (
            <Typography variant="caption" color="textSecondary" display="block">
              Économisez 20%
            </Typography>
          )}
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {plans.map((p) => (
            <Grid item xs={12} md={4} key={p.id}>
              <Card className="plan-card" variant="outlined" sx={{ position: 'relative' }}>
                {p.badge && (
                  <Chip label="Meilleur choix" size="small" className="best-choice" sx={{ position: 'absolute', top: 16, right: 16 }} />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    {p.name}
                  </Typography>
                  <Typography variant="h4" align="center" gutterBottom>
                    {prices[p.id as keyof typeof prices][period]}DT
                    <Typography component="span" variant="subtitle2">/{period === 'monthly' ? 'mois' : 'an'}</Typography>
                  </Typography>
                  <List className="plan-features">
                    {features.map((f) => renderFeature(f, p.id as bookcarsTypes.SubscriptionPlan))}
                  </List>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    disabled={subscription && !isExpired && planOrder[p.id as bookcarsTypes.SubscriptionPlan] <= planOrder[subscription.plan]}
                    onClick={() => handleChoose(p.id as bookcarsTypes.SubscriptionPlan)}
                    sx={{ backgroundColor: p.color, '&:hover': { backgroundColor: p.hover } }}
                  >
                    {subscription && !isExpired && planOrder[p.id as bookcarsTypes.SubscriptionPlan] === planOrder[subscription.plan]
                      ? 'Plan choisi'
                      : subscription && !isExpired && planOrder[p.id as bookcarsTypes.SubscriptionPlan] < planOrder[subscription.plan]
                        ? 'Indisponible'
                        : p.cta}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  )
}

export default Pricing
