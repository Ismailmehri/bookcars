import React from 'react'
import Seo from '@/components/Seo'
import Layout from '@/components/Layout'
import { strings as commonStrings } from '@/lang/common'

interface NoMatchProps {
  hideHeader?: boolean
}

const NoMatch = ({ hideHeader }: NoMatchProps) => {
  const noMatch = () => (
    <>
      <Seo title="Page non trouvée | Plany.tn" robots="noindex,nofollow" />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-3">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{commonStrings.NO_MATCH}</h1>
        <p className="text-gray-600 mb-4 max-w-xl">{commonStrings.NO_MATCH_DESCRIPTION}</p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-2 rounded-md bg-primary text-white shadow hover:bg-primary/90"
        >
          <span className="mr-2">🏠</span>
          {commonStrings.GO_TO_HOME}
        </a>
      </div>
    </>
  )

  return hideHeader ? noMatch() : <Layout strict={false}>{noMatch()}</Layout>
}

export default NoMatch
