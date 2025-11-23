import React from 'react'
import Seo from '@/components/Seo'
import { strings as commonStrings } from '@/lang/common'

import '@/assets/css/error.css'

interface ErrorProps {
  style?: React.CSSProperties
}

const Error = ({ style }: ErrorProps) => (
  <>
    <Seo robots="noindex,nofollow" title="Erreur | Plany.tn" />
    <section className="error-page" style={style} role="alert">
      <div className="error-page__icon" aria-hidden>
        !
      </div>
      <h1 className="error-page__title">{commonStrings.GENERIC_ERROR}</h1>
      <p className="error-page__message">
        {commonStrings.ERROR_EXPLANATION || 'Un incident est survenu. Merci de réessayer ou de revenir à l’accueil.'}
      </p>
      <a className="error-page__cta" href="/">
        {commonStrings.GO_TO_HOME}
      </a>
    </section>
  </>
)

export default Error
