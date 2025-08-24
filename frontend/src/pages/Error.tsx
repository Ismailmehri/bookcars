import React from 'react'
import Seo from '@/components/Seo'
import { strings as commonStrings } from '@/lang/common'

interface ErrorProps {
  style?: React.CSSProperties
}

const Error = ({ style }: ErrorProps) => (
  <>
    <Seo robots="noindex,nofollow" title="Erreur | Plany.tn" />
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-3 text-center"
      style={style}
    >
      <div className="text-6xl mb-2">⚠️</div>
      <h1 className="text-2xl font-bold mb-1 text-gray-800">{commonStrings.GENERIC_ERROR}</h1>
      <a
        href="/"
        className="mt-3 px-6 py-2 rounded-md bg-primary text-white shadow hover:bg-primary/90"
      >
        {commonStrings.GO_TO_HOME}
      </a>
    </div>
  </>
)

export default Error
