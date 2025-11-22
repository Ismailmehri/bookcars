/* eslint-disable react-refresh/only-export-components */
import { buildLocationSeo, createLocationPage, resolveLocationPage } from './locationPageBuilder.js'

const locationPageKey = 'tunisie'
const { pageProps, metaDescription } = resolveLocationPage(locationPageKey)

export const locationVoitureTunisiePageData = { ...pageProps, metaDescription }
export const locationVoitureTunisieSeo = buildLocationSeo(locationPageKey)

const LocationVoitureTunisie = createLocationPage(locationPageKey)

export default LocationVoitureTunisie
