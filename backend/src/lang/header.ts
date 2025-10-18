import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    DASHBOARD: 'Tableau de bord',
    HOME: 'Accueil',
    COMPANIES: 'Fournisseurs',
    LOCATIONS: 'Lieux',
    CARS: 'Voitures',
    USERS: 'Utilisateurs',
    STATS: 'Statistiques',
    REVIEWS: 'Avis',
    ABOUT: 'À propos',
    TOS: "Conditions d'utilisation",
    CONTACT: 'Contact',
    LANGUAGE: 'Langue',
    SETTINGS: 'Paramètres',
    SIGN_OUT: 'Déconnexion',
    COUNTRIES: 'Pays',
    PRICING: 'Tarification',
    SUBSCRIPTIONS: 'Abonnements',
    VERIFICATION: 'Vérification agence',
    ADMIN_VERIFICATION: 'Documents agences',
    AGENCY_COMMISSIONS: 'Commissions agences',
  },
  en: {
    DASHBOARD: 'Dashboard',
    HOME: 'Home',
    COMPANIES: 'Suppliers',
    LOCATIONS: 'Locations',
    CARS: 'Cars',
    USERS: 'Users',
    ABOUT: 'About',
    STATS: 'insights',
    REVIEWS: 'Avis',
    TOS: 'Terms of Service',
    CONTACT: 'Contact',
    LANGUAGE: 'Language',
    SETTINGS: 'Settings',
    SIGN_OUT: 'Sign out',
    COUNTRIES: 'Countries',
    PRICING: 'Pricing',
    SUBSCRIPTIONS: 'Subscriptions',
    VERIFICATION: 'Agency verification',
    ADMIN_VERIFICATION: 'Agency documents',
    AGENCY_COMMISSIONS: 'Agency commissions',
  },
})

langHelper.setLanguage(strings)
export { strings }
