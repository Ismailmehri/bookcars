import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    VIEW_ON_MAP: 'Voir sur la carte',
    SEARCH_LOADING: 'Merci de patienter pendant la préparation des offres.',
    SEARCH_ERROR_SUPPLIERS: 'Impossible de charger les fournisseurs pour le moment.',
    SEARCH_ERROR_GENERIC: 'Une erreur est survenue lors du chargement de la recherche.',
  },
  en: {
    VIEW_ON_MAP: 'View on map',
    SEARCH_LOADING: 'Hold on while we prepare the best offers.',
    SEARCH_ERROR_SUPPLIERS: 'Unable to load suppliers right now.',
    SEARCH_ERROR_GENERIC: 'Something went wrong while loading your search.',
  },
})

langHelper.setLanguage(strings)
export { strings }
