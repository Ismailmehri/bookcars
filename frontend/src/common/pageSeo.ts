import { buildDescription } from './seo.js'

export type StaticSeoPageKey =
  | 'bookings'
  | 'booking'
  | 'activate'
  | 'forgotPassword'
  | 'resetPassword'
  | 'changePassword'
  | 'review'
  | 'settings'
  | 'notifications'

interface StaticPageSeoConfig {
  title: string
  description: string
  canonical: string
  robots: string
}

const staticSeoMap: Record<StaticSeoPageKey, StaticPageSeoConfig> = {
  bookings: {
    title: 'Mes réservations | Plany.tn',
    description:
      'Gérez vos réservations de location de voiture en Tunisie avec Plany.tn et suivez vos confirmations en ligne.',
    canonical: 'https://plany.tn/bookings',
    robots: 'noindex,nofollow',
  },
  booking: {
    title: 'Créer une réservation | Plany.tn',
    description:
      'Créez ou modifiez une réservation de voiture en Tunisie avec Plany.tn et sécurisez votre location en ligne.',
    canonical: 'https://plany.tn/booking',
    robots: 'noindex,nofollow',
  },
  activate: {
    title: 'Activation du compte | Plany.tn',
    description:
      'Activez votre compte Plany.tn pour finaliser vos réservations de location voiture en Tunisie en toute sécurité.',
    canonical: 'https://plany.tn/activate',
    robots: 'noindex,nofollow',
  },
  forgotPassword: {
    title: 'Mot de passe oublié | Plany.tn',
    description:
      'Réinitialisez votre mot de passe Plany.tn pour protéger vos réservations de location de voiture en Tunisie.',
    canonical: 'https://plany.tn/forgot-password',
    robots: 'noindex,nofollow',
  },
  resetPassword: {
    title: 'Réinitialiser le mot de passe | Plany.tn',
    description:
      'Choisissez un nouveau mot de passe Plany.tn et gardez vos locations de voiture en Tunisie en toute sécurité.',
    canonical: 'https://plany.tn/reset-password',
    robots: 'noindex,nofollow',
  },
  changePassword: {
    title: 'Changer le mot de passe | Plany.tn',
    description:
      'Modifiez votre mot de passe Plany.tn et sécurisez l’accès à vos réservations de location de voiture.',
    canonical: 'https://plany.tn/change-password',
    robots: 'noindex,nofollow',
  },
  review: {
    title: 'Donner un avis | Plany.tn',
    description:
      'Partagez votre avis sur votre expérience de location de voiture en Tunisie pour aider les autres voyageurs.',
    canonical: 'https://plany.tn/review',
    robots: 'noindex,nofollow',
  },
  settings: {
    title: 'Paramètres du compte | Plany.tn',
    description:
      'Mettez à jour vos informations et préférences de location de voiture sur Plany.tn en toute sécurité.',
    canonical: 'https://plany.tn/settings',
    robots: 'noindex,nofollow',
  },
  notifications: {
    title: 'Notifications | Plany.tn',
    description:
      'Consultez vos alertes Plany.tn : confirmations, rappels et messages liés à vos locations de voiture en Tunisie.',
    canonical: 'https://plany.tn/notifications',
    robots: 'noindex,nofollow',
  },
}

export const getStaticPageSeo = (key: StaticSeoPageKey) => {
  const seo = staticSeoMap[key]

  return {
    ...seo,
    description: buildDescription(seo.description),
  }
}

export const getCheckoutSessionSeo = (sessionId?: string) => ({
  title: 'Statut du paiement | Plany.tn',
  description: buildDescription(
    'Vérifiez le statut de votre paiement Plany.tn pour votre location de voiture en Tunisie.',
  ),
  canonical: `https://plany.tn/checkout-session/${sessionId ?? ''}`,
  robots: 'noindex,nofollow',
})
