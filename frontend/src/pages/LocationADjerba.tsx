import React from 'react'
import LocationLandingPage from '@/components/location/LocationLandingPage'
import { buildDescription } from '@/common/seo'
import locationData from './locationData'

const page = locationData.djerba

const LocationADjerba = () => {
  const { metaDescription: rawMetaDescription, ...rest } = page
  const metaDescription = buildDescription(rawMetaDescription)

  return <LocationLandingPage {...rest} metaDescription={metaDescription} />
}

export default LocationADjerba
