/* eslint-disable react-refresh/only-export-components */
import React, { Suspense, lazy } from 'react'
import { buildDescription } from '../common/seo.js'
import type { LocationLandingPageProps } from '../components/location/LocationLandingPage'
import locationDataSEO from './locationData_SEO.js'

const LocationLandingPage = lazy(() => import('../components/location/LocationLandingPage.js'))

interface LocationPageResolution {
  pageProps: Omit<LocationLandingPageProps, 'metaDescription'>
  metaDescription: string
}

const LoadingState = () => (
  <div className="page-loading" aria-busy="true" role="status">
    Chargement de la page de location...
  </div>
)

export const resolveLocationPage = (pageKey: keyof typeof locationDataSEO): LocationPageResolution => {
  const page = locationDataSEO[pageKey]

  if (!page) {
    throw new Error(`Location page data missing for key: ${String(pageKey)}`)
  }

  const { metaDescription: rawMetaDescription, ...pageProps } = page
  const metaDescription = buildDescription(rawMetaDescription, 250)

  return { pageProps, metaDescription }
}

export const buildLocationSeo = (pageKey: keyof typeof locationDataSEO) => {
  const { pageProps, metaDescription } = resolveLocationPage(pageKey)
  const { seoKeywords } = pageProps

  const keywordList = seoKeywords
    ? [...new Set([...(seoKeywords.principal ?? []), ...(seoKeywords.secondaires ?? []), ...(seoKeywords.semantiques ?? [])])]
    : undefined

  return {
    title: pageProps.title,
    description: metaDescription,
    canonical: `https://plany.tn${pageProps.slug}`,
    keywords: keywordList,
  }
}

export const createLocationPage = (pageKey: keyof typeof locationDataSEO) => {
  const LocationPage: React.FC = () => {
    const { pageProps, metaDescription } = resolveLocationPage(pageKey)

    return (
      <Suspense fallback={<LoadingState />}>
        <LocationLandingPage {...pageProps} metaDescription={metaDescription} />
      </Suspense>
    )
  }

  LocationPage.displayName = `LocationPage(${String(pageKey)})`

  return LocationPage
}
