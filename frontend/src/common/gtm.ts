import TagManager from 'react-gtm-module'
import env from '@/config/env.config'

const TRACKING_ID = env.GOOGLE_ANALYTICS_ID
const isTestMode = !env.isProduction

export const initGTM = () => {
  if (TRACKING_ID) {
    TagManager.initialize({ gtmId: TRACKING_ID,
      dataLayer: {
      environment: isTestMode ? 'test' : 'production',
    }, })
  } else {
    console.warn('GTM is not enabled or GTM ID is missing.')
  }
}

export const pushEvent = (eventName: string, eventData: Record<string, any>) => {
  if (TRACKING_ID) {
    TagManager.dataLayer({
      dataLayer: {
        event: eventName,
        ...eventData,
      },
    })
  }
}

export const sendPageviewEvent = (pageUrl: string, pageTitle: string) => {
  const pageViewData = {
    event: 'pageview',
    page_url: pageUrl,
    page_title: pageTitle,
  }

  pushEvent('pageview', pageViewData)
}

export const sendPurchaseEvent = (transactionId: string, value: number, currency: string, items: any[]) => {
  const purchaseData = {
    event: 'purchase',
    transaction_id: transactionId,
    value,
    currency,
    items,
  }

  pushEvent('purchase', purchaseData)
}

export const sendCheckoutEvent = (checkoutValue: number, items: any[]) => {
  const checkoutData = {
    event: 'checkout',
    checkout_value: checkoutValue,
    items,
  }

  pushEvent('checkout', checkoutData)
}
