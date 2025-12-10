import React, { useState } from 'react'
import Seo from '@/components/Seo'
import * as bookcarsTypes from ':bookcars-types'
import Layout from '@/components/Layout'
import NotificationList from '@/components/NotificationList'
import { getStaticPageSeo } from '@/common/pageSeo'

const Notifications = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
  }

  return (
    <Layout onLoad={onLoad} strict>
      <Seo {...getStaticPageSeo('notifications')} />
      <NotificationList user={user} />
    </Layout>
  )
}

export default Notifications
