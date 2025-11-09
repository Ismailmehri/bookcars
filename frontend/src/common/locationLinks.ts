export interface InternalLink {
  href: string
  label: string
}

const slugCityPrefix = 'location-voiture-pas-cher-a-'

export const formatCityFromSlug = (slug: string): string => {
  const trimmed = slug.trim()
  if (!trimmed) {
    return ''
  }

  const parts = trimmed.split('/').filter(Boolean)
  if (parts.length === 0) {
    return ''
  }

  const lastPart = parts[parts.length - 1]
  const citySlug = lastPart.startsWith(slugCityPrefix)
    ? lastPart.slice(slugCityPrefix.length)
    : lastPart

  return citySlug
    .split('-')
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export const createInternalLinks = (slugs: string[]): InternalLink[] =>
  slugs
    .map((slug) => ({
      href: slug,
      label: `Location voiture pas cher à ${formatCityFromSlug(slug)}`,
    }))
    .filter((link) => Boolean(link.label.trim()))
