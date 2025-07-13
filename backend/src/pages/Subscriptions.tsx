import React, { useState } from 'react'
import Layout from '@/components/Layout'
import * as bookcarsTypes from ':bookcars-types'
import SubscriptionList from '@/components/SubscriptionList'
import * as helper from '@/common/helper'

const Subscriptions = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()

  const onLoad = (_user?: bookcarsTypes.User) => {
    setUser(_user)
    if (!helper.admin(_user)) {
      window.location.href = '/'
    }
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && helper.admin(user) && (
        <SubscriptionList />
      )}
    </Layout>
  )
}

export default Subscriptions
