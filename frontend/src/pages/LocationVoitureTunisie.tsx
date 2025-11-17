import React, { Suspense, lazy } from 'react'
import { buildDescription } from '@/common/seo'
import Seo from '@/components/Seo'
import locationDataSEO from './locationData_SEO'

const page = locationDataSEO.tunisie

export const locationVoitureTunisiePageData = page

const LocationLandingPage = lazy(() => import('@/components/location/LocationLandingPage'))

const { metaDescription: rawMetaDescription, ...pageProps } = page
const metaDescription = buildDescription(rawMetaDescription, 250)
const canonical = `https://plany.tn${page.slug}`
const keywords = page.seoKeywords
  ? [...new Set([
      ...(page.seoKeywords.principal ?? []),
      ...(page.seoKeywords.secondaires ?? []),
      ...(page.seoKeywords.semantiques ?? []),
    ])]
  : undefined

export const locationVoitureTunisieSeo = { title: page.title, description: metaDescription, canonical, keywords }

const LocationVoitureTunisie = () => (
  <>
    <Seo title={page.title} description={metaDescription} canonical={canonical} keywords={keywords} />
    <Suspense fallback={<div className="page-loading" aria-busy="true">Chargement...</div>}>
      <LocationLandingPage {...pageProps} metaDescription={metaDescription} />
    </Suspense>
  </>
)

export default LocationVoitureTunisie
