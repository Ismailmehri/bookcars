import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TextField, MenuItem, Button, Box } from '@mui/material'
import Layout from '@/components/Layout'
import * as bookcarsTypes from ':bookcars-types'
import * as SubscriptionService from '@/services/SubscriptionService'
import * as helper from '@/common/helper'

import '@/assets/css/update-subscription.css'

const UpdateSubscription = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [subscription, setSubscription] = useState<bookcarsTypes.Subscription>()

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
    if (!helper.admin(_user)) {
      navigate('/')
    }
  }

  useEffect(() => {
    const id = params.get('id')
    if (id) {
      SubscriptionService.getSubscription(id)
        .then((sub) => setSubscription({
          ...sub,
          resultsCars: sub.resultsCars ?? 0,
          sponsoredCars: sub.sponsoredCars ?? 0,
        }))
        .catch(() => helper.error())
    }
  }, [params])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!subscription) return
    const payload: bookcarsTypes.UpdateSubscriptionPayload = {
      _id: subscription._id as string,
      supplier: (subscription.supplier as bookcarsTypes.User)._id as string,
      plan: subscription.plan,
      period: subscription.period,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      resultsCars: Number(subscription.resultsCars),
      sponsoredCars: Number(subscription.sponsoredCars),
    }
    const status = await SubscriptionService.update(payload)
    if (status === 200) {
      helper.info('Subscription updated')
      navigate('/subscriptions')
    } else {
      helper.error()
    }
  }

const handleChange = (field: keyof bookcarsTypes.Subscription) => (e: any) => {
  if (!subscription) return
  let { value } = e.target
  if (field === 'resultsCars' || field === 'sponsoredCars') {
    value = value === '' ? '' : Number(value)
  }
  setSubscription({ ...subscription, [field]: value })
}

  return (
    <Layout onLoad={onLoad} strict admin>
      {user && subscription && (
        <div className="update-subscription">
          <Box
            component="form"
            onSubmit={handleSubmit}
            className="subscription-form update-subscription-form-wrapper"
          >
            <TextField
              select
              margin="normal"
              label="Plan"
              value={subscription.plan}
              onChange={handleChange('plan')}
              fullWidth
            >
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
            </TextField>
            <TextField
              select
              margin="normal"
              label="Période"
              value={subscription.period}
              onChange={handleChange('period')}
              fullWidth
            >
              <MenuItem value="monthly">Mensuel</MenuItem>
              <MenuItem value="yearly">Annuel</MenuItem>
            </TextField>
            <TextField
              margin="normal"
              label="Voitures"
              type="number"
              value={subscription.resultsCars ?? ''}
              onChange={handleChange('resultsCars')}
              fullWidth
            />
            <TextField
              margin="normal"
              label="Sponsorisées"
              type="number"
              value={subscription.sponsoredCars ?? ''}
              onChange={handleChange('sponsoredCars')}
              fullWidth
            />
            <TextField
              margin="normal"
              label="Date début"
              type="date"
              value={subscription.startDate.toString().substring(0, 10)}
              onChange={handleChange('startDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="normal"
              label="Date fin"
              type="date"
              value={subscription.endDate.toString().substring(0, 10)}
              onChange={handleChange('endDate')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Button type="submit" variant="contained" className="btn-primary" sx={{ mt: 2 }}>
              Mettre à jour
            </Button>
          </Box>
        </div>
      )}
    </Layout>
  )
}

export default UpdateSubscription
