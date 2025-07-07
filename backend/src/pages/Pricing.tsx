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
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import * as bookcarsTypes from ':bookcars-types'
import '@/assets/css/pricing.css'

const Pricing = () => {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<bookcarsTypes.SubscriptionPeriod>(bookcarsTypes.SubscriptionPeriod.Monthly)
  const [plan, setPlan] = useState<bookcarsTypes.SubscriptionPlan>(bookcarsTypes.SubscriptionPlan.Free)

  const handleToggle = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setPeriod(checked ? bookcarsTypes.SubscriptionPeriod.Yearly : bookcarsTypes.SubscriptionPeriod.Monthly)
  }

  const handlePlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlan(e.target.value as bookcarsTypes.SubscriptionPlan)
  }

  const handlePay = () => {
    navigate(`/pricing/checkout?plan=${plan}&period=${period}`)
  }

  const prices = {
    [bookcarsTypes.SubscriptionPlan.Free]: { monthly: 0, yearly: 0 },
    [bookcarsTypes.SubscriptionPlan.Basic]: { monthly: 10, yearly: 100 },
    [bookcarsTypes.SubscriptionPlan.Premium]: { monthly: 30, yearly: 290 },
  }

  return (
    <Layout strict>
      <Container maxWidth="lg">
        <Box my={4} textAlign="center">
          <Typography variant="h4" gutterBottom>Tarification</Typography>
          <FormControlLabel
            control={<Switch checked={period === bookcarsTypes.SubscriptionPeriod.Yearly} onChange={handleToggle} />}
            label={period === bookcarsTypes.SubscriptionPeriod.Monthly ? 'Mensuel' : 'Annuel'}
          />
        </Box>
        <RadioGroup row value={plan} onChange={handlePlanChange}>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" gutterBottom>Free Plan</Typography>
                  <Typography variant="h6" color="primary">
                    {prices.free[period]}
                    DT/{period === bookcarsTypes.SubscriptionPeriod.Monthly ? 'mois' : 'an'}
                  </Typography>
                  <Typography variant="body2">1 voiture affichée dans les résultats</Typography>
                </CardContent>
                <CardActions>
                  <FormControlLabel value={bookcarsTypes.SubscriptionPlan.Free} control={<Radio />} label="Choisir" />
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" gutterBottom>Basic Plan</Typography>
                  <Typography variant="h6" color="primary">
                    {prices.basic[period]}
                    DT/{period === bookcarsTypes.SubscriptionPeriod.Monthly ? 'mois' : 'an'}
                  </Typography>
                  <Typography variant="body2">3 voitures dans les résultats + 1 sponsorisée</Typography>
                </CardContent>
                <CardActions>
                  <FormControlLabel value={bookcarsTypes.SubscriptionPlan.Basic} control={<Radio />} label="Choisir" />
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h5" gutterBottom>Premium Plan</Typography>
                  <Typography variant="h6" color="primary">
                    {prices.premium[period]}
                    DT/{period === bookcarsTypes.SubscriptionPeriod.Monthly ? 'mois' : 'an'}
                  </Typography>
                  <Typography variant="body2">Toutes les voitures dans les résultats + 3 sponsorisées</Typography>
                </CardContent>
                <CardActions>
                  <FormControlLabel value={bookcarsTypes.SubscriptionPlan.Premium} control={<Radio />} label="Choisir" />
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </RadioGroup>
        <Box mt={4} textAlign="center">
          <Button variant="contained" className="btn-primary" onClick={handlePay}>
            Payer
          </Button>
        </Box>
      </Container>
    </Layout>
  )
}

export default Pricing
