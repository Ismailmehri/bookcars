import React from 'react'
import LocationLandingPage from '@/components/location/LocationLandingPage'
import { buildDescription } from '@/common/seo'
import locationDataSEO from './locationData_SEO'

const page = locationDataSEO['sidi-bouzid']

const LocationASidiBouzid = () => {
  const { metaDescription: rawMetaDescription, ...rest } = page
  const metaDescription = buildDescription(rawMetaDescription, 250)

  return <LocationLandingPage {...rest} metaDescription={metaDescription} />
}

export default LocationASidiBouzid
