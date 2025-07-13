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

const PricingCheckout = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [plan, setPlan] = useState<bookcarsTypes.SubscriptionPlan>()
  const [period, setPeriod] = useState<bookcarsTypes.SubscriptionPeriod>()
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [currentSub, setCurrentSub] = useState<bookcarsTypes.Subscription>()

  const basePrices = {
    free: 0,
    basic: 10,
    premium: 30,
  }

  const getPrice = (
    p: bookcarsTypes.SubscriptionPlan,
    per: bookcarsTypes.SubscriptionPeriod,
  ) => {
    const monthly = basePrices[p]
    const total = per === 'monthly' ? monthly : monthly * 12 * 0.8
    return Math.round(total)
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
    if (!user || !plan || !period) return
    const startDate = new Date()
    const endDate = new Date(startDate)
    if (period === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }
    const payload: bookcarsTypes.CreateSubscriptionPayload = {
      supplier: user._id as string,
      plan,
      period,
      startDate,
      endDate,
    }
    const status = await SubscriptionService.create(payload)
    if (status === 200) {
      helper.info('Abonnement enregistré')
      navigate('/')
    } else {
      helper.error()
    }
  }

  const calculateFinalPrice = (
    sub: bookcarsTypes.Subscription | undefined,
    newPlan: bookcarsTypes.SubscriptionPlan | undefined,
    newPeriod: bookcarsTypes.SubscriptionPeriod | undefined,
  ) => {
    if (!newPlan || !newPeriod) {
      return 0
    }

    const priceNew = getPrice(newPlan, newPeriod)

    if (!sub) {
      return priceNew
    }

    const now = new Date()
    const endDate = new Date(sub.endDate)
    if (endDate <= now) {
      return priceNew
    }

    const totalDays = sub.period === 'monthly' ? 30 : 365
    const remainingDays = Math.max(
      Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      0,
    )
    const priceOld = getPrice(sub.plan, sub.period)
    const credit = (remainingDays / totalDays) * priceOld
    const final = priceNew - credit
    return final > 0 ? final : 0
  }

  const finalPrice = calculateFinalPrice(currentSub, plan, period)

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
            <Button variant="contained" className="btn-primary" onClick={handlePay} sx={{ mt: 2 }}>
              Confirmer le paiement
            </Button>
          </Box>
        )}
      </Container>
    </Layout>
  )
}

export default PricingCheckout
