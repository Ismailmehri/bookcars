import type {
  LocationLandingPageProps,
  FaqItem,
  VehicleCategory,
} from '@/components/location/LocationLandingPage'

export type LocationSchemaInput = Pick<LocationLandingPageProps, 'city' | 'slug' | 'metaDescription' | 'blogUrl'>

export const buildFaqSchema = (faqItems: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((faqItem) => ({
    '@type': 'Question',
    name: faqItem.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faqItem.answer,
    },
  })),
})

export const buildOfferCatalogSchema = (city: string, canonicalUrl: string, vehicleCategories: VehicleCategory[]) => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: `Offres de location de voitures à ${city}`,
  url: canonicalUrl,
  itemListElement: vehicleCategories.map((vehicle) => ({
    '@type': 'Offer',
    name: `${vehicle.name} - ${city}`,
    description: vehicle.description,
    price: vehicle.price.toString(),
    priceCurrency: 'TND',
    url: canonicalUrl,
    availability: 'http://schema.org/InStock',
  })),
})

export const buildLocalBusinessSchema = (
  city: string,
  canonicalUrl: string,
  description: string,
  blogUrl: string,
) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: `Plany ${city}`,
  description,
  url: canonicalUrl,
  image: 'https://plany.tn/assets/brand/plany-cover.png',
  sameAs: ['https://plany.tn', blogUrl],
  priceRange: '50-250 TND',
  telephone: '+21671000000',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rue de la Liberté',
    addressLocality: city,
    addressCountry: 'TN',
  },
  areaServed: {
    '@type': 'City',
    name: city,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1240',
  },
})

export const buildBreadcrumbSchema = (city: string, canonicalUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: 'https://plany.tn/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: `Location voiture ${city}`,
      item: canonicalUrl,
    },
  ],
})
