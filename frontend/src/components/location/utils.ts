import { formatCityFromSlug } from '../../common/locationLinks.js'

export const pickCrosslinks = (links: string[], max = 4) => links.slice(0, max)

export const labelFromSlug = (slug: string) => formatCityFromSlug(slug)
