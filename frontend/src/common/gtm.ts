import TagManager from 'react-gtm-module'
import env from '@/config/env.config'

const TRACKING_ID = env.GOOGLE_ANALYTICS_ID

// Initialisation de Google Tag Manager
export const initGTM = () => {
  if (TRACKING_ID) {
    TagManager.initialize({ gtmId: TRACKING_ID })
  } else {
    console.warn('GTM is not enabled or GTM ID is missing.')
  }
}

// Fonction générique pour envoyer des événements
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

// Événement PageView (compatible avec le Pixel Facebook `PageView`)
export const sendPageviewEvent = (pageUrl: string, pageTitle: string) => {
  const pageViewData = {
    event: 'PageView', // Événement standard Pixel Facebook
    page_url: pageUrl,
    page_title: pageTitle,
  }

  pushEvent('PageView', pageViewData)
}

// Événement InitiateCheckout (Pixel Facebook: `InitiateCheckout`)
export const sendCheckoutEvent = (checkoutValue: number, items: any[]) => {
  const checkoutData = {
    event: 'InitiateCheckout', // Événement standard Pixel Facebook
    value: checkoutValue,
    currency: 'TND', // Remplacez par votre devise
    contents: items.map((item) => ({
      id: item.item_id,
      name: item.item_name,
      quantity: item.quantity,
      price: item.price,
    })),
  }

  pushEvent('InitiateCheckout', checkoutData)
}

// Événement Purchase (Pixel Facebook: `Purchase`)
export const sendPurchaseEvent = (transactionId: string, value: number, currency: string, items: any[]) => {
  const purchaseData = {
    event: 'Purchase', // Événement standard Pixel Facebook
    transaction_id: transactionId,
    value,
    currency,
    contents: items.map((item) => ({
      id: item.item_id,
      name: item.item_name,
      quantity: item.quantity,
      price: item.price,
    })),
  }

  pushEvent('Purchase', purchaseData)
}

// Événement Search (Pixel Facebook: `Search`)
export const sendSearchEvent = (searchTerm: string, searchParams: Record<string, any>) => {
  const searchData = {
    event: 'Search', // Événement standard Pixel Facebook
    search_term: searchTerm,
    ...searchParams,
  }

  pushEvent('Search', searchData)
}

// Événement ViewContent (Pixel Facebook: `ViewContent`)
export const sendViewContentEvent = (item: { id: string; name: string; price: number; currency: string }) => {
  const viewContentData = {
    event: 'ViewContent', // Événement standard Pixel Facebook
    content_id: item.id,
    content_name: item.name,
    value: item.price,
    currency: item.currency,
  }

  pushEvent('ViewContent', viewContentData)
}
