import React, { Suspense, lazy } from 'react'
import { buildDescription } from '@/common/seo'
import locationDataSEO from './locationData_SEO'

const page = locationDataSEO.tunisie

export const locationVoitureTunisiePageData = page

const LocationLandingPage = lazy(() => import('@/components/location/LocationLandingPage'))

const LocationVoitureTunisie = () => {
  const { metaDescription: rawMetaDescription, ...rest } = page
  const metaDescription = buildDescription(rawMetaDescription, 250)

  return (
    <Suspense fallback={<div className="page-loading" aria-busy="true">Chargement...</div>}>
      <LocationLandingPage {...rest} metaDescription={metaDescription} />
    </Suspense>
  )
}

export default LocationVoitureTunisie
