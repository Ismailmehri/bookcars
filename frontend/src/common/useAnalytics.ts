import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import * as analytics from './gtm'

export const useAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname + location.search
    analytics.sendPageviewEvent(path, document.title)
  }, [location])
}
