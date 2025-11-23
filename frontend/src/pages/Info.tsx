import React from 'react'
import Seo from '@/components/Seo'
import { strings as commonStrings } from '@/lang/common'

import '@/assets/css/info.css'

type InfoTone = 'success' | 'warning' | 'info'

interface InfoProps {
  className?: string
  message: string
  hideLink?: boolean
  style?: React.CSSProperties
  type?: InfoTone
}

const toneIcon = {
  success: '✓',
  warning: '!',
  info: 'i',
} satisfies Record<InfoTone, string>

const Info = ({ className, message, hideLink, style, type = 'info' }: InfoProps) => (
  <>
    <Seo robots="noindex,nofollow" />
    <section
      style={style}
      className={`${className ? `${className} ` : ''}info-overlay`}
      role="status"
      aria-live="polite"
    >
      <div className={`info-panel info-panel--${type}`}>
        <div className="info-panel__icon" aria-hidden>
          {toneIcon[type]}
        </div>
        <p className="info-panel__message">{message}</p>
        {!hideLink && (
          <a href="/" className="info-panel__link">
            {commonStrings.GO_TO_HOME}
          </a>
        )}
      </div>
    </section>
  </>
)

export default Info
