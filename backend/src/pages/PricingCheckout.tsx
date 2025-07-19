import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Button,
} from '@mui/material'
import Layout from '@/components/Layout'
import * as bookcarsTypes from ':bookcars-types'
import * as SubscriptionService from '@/services/SubscriptionService'
import * as helper from '@/common/helper'
import { calculateSubscriptionFinalPrice } from ':bookcars-helper'

const PricingCheckout = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [plan, setPlan] = useState<bookcarsTypes.SubscriptionPlan>()
  const [period, setPeriod] = useState<bookcarsTypes.SubscriptionPeriod>()
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [currentSub, setCurrentSub] = useState<bookcarsTypes.Subscription>()
  const [processing, setProcessing] = useState(false)


  const getPlanLimits = (p: bookcarsTypes.SubscriptionPlan) => {
    switch (p) {
      case 'basic':
        return { resultsCars: 3, sponsoredCars: 1 }
      case 'premium':
        return { resultsCars: -1, sponsoredCars: -1 }
      default:
        return { resultsCars: 1, sponsoredCars: 0 }
    }
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
    if (_user) {
      try {
        const sub = await SubscriptionService.getCurrent()
        if (sub) {
          setCurrentSub(sub)
        }
      } catch {
        // Ignore errors
      }
    }
  }

  useEffect(() => {
    const p = params.get('plan') as bookcarsTypes.SubscriptionPlan | null
    const per = params.get('period') as bookcarsTypes.SubscriptionPeriod | null
    if (p && per) {
      setPlan(p)
      setPeriod(per)
    } else {
      navigate('/pricing')
    }
  }, [params, navigate])

  const handlePay = async () => {
    if (!user || !plan || !period || processing) return
    setProcessing(true)
    const startDate = new Date()
    const endDate = new Date(startDate)
    if (period === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }
    const limits = getPlanLimits(plan)
    const payload: bookcarsTypes.CreateSubscriptionPayload = {
      supplier: user._id as string,
      plan,
      period,
      startDate,
      endDate,
      resultsCars: limits.resultsCars,
      sponsoredCars: limits.sponsoredCars,
    }
    let status: number
    if (
      currentSub &&
      new Date(currentSub.endDate) > new Date() &&
      currentSub._id
    ) {
      const updatePayload: bookcarsTypes.UpdateSubscriptionPayload = {
        ...payload,
        _id: currentSub._id,
      }
      status = await SubscriptionService.update(updatePayload)
    } else {
      status = await SubscriptionService.create(payload)
    }
    if (status === 200) {
      try {
        const sub = await SubscriptionService.getCurrent()
        if (sub) {
          setCurrentSub(sub)
        }
      } catch {
        // ignore
      }
      helper.info('Abonnement enregistré')
      navigate('/')
    } else {
      helper.error()
    }
    setProcessing(false)
  }

  const finalPrice = calculateSubscriptionFinalPrice(currentSub, plan, period)

  return (
    <Layout onLoad={onLoad} strict>
      <Container maxWidth="sm">
        {user && plan && period && (
          <Box mt={4} textAlign="center">
            <Typography variant="h5" gutterBottom>Récapitulatif</Typography>
            <Typography>Agence: {user.fullName}</Typography>
            <Typography>Plan: {plan}</Typography>
            <Typography>Période: {period}</Typography>
            <Typography>Date de début: {new Date().toLocaleDateString()}</Typography>
            <Typography sx={{ mt: 1 }}>
              Prix: {finalPrice.toFixed(2)}DT
            </Typography>
            <Button
              variant="contained"
              className="btn-primary"
              onClick={handlePay}
              disabled={processing}
              sx={{ mt: 2 }}
            >
              Confirmer le paiement
            </Button>
          </Box>
        )}
      </Container>
    </Layout>
  )
}

export default PricingCheckout
