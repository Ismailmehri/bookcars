import * as bookcarsTypes from ':bookcars-types'

export const filterSuppliersWithAvatars = (suppliers: bookcarsTypes.User[]): bookcarsTypes.User[] =>
  suppliers.filter((supplier) => {
    const avatar = supplier.avatar ?? ''
    return avatar.trim().length > 0 && !/no-image/i.test(avatar)
  })

export const filterCountriesWithLocations = (
  countries: bookcarsTypes.CountryInfo[],
  minimumLocations: number
): bookcarsTypes.CountryInfo[] =>
  countries.filter((country) => (country.locations?.length ?? 0) >= minimumLocations)
