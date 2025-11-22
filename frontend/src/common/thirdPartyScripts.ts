interface ThirdPartyScript {
  id: string
  src: string
}

const SCRIPTS: ThirdPartyScript[] = [
  { id: 'tiktok-pixel', src: 'https://analytics.tiktok.com/i18n/pixel/sdk.js' },
  { id: 'facebook-pixel', src: 'https://connect.facebook.net/en_US/fbevents.js' },
]

const appendAsyncScript = ({ id, src }: ThirdPartyScript) => {
  if (typeof document === 'undefined') {
    return
  }

  if (document.getElementById(id)) {
    return
  }

  const script = document.createElement('script')
  script.id = id
  script.src = src
  script.async = true
  script.defer = true
  script.crossOrigin = 'anonymous'
  document.body.appendChild(script)
}

const schedule = (cb: () => void) => {
  const delay = window.setTimeout(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb)
    } else {
      cb()
    }
  }, 3000)

  return () => window.clearTimeout(delay)
}

export const deferThirdPartyScripts = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return schedule(() => {
    SCRIPTS.forEach(appendAsyncScript)
  })
}
