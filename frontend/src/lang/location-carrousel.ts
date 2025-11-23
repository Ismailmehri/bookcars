import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SELECT_LOCATION: 'Choisir ce lieu',
    AVALIABLE_LOCATION: 'lieu disponible',
    AVALIABLE_LOCATIONS: 'lieux disponibles',
    LOADING: 'Chargement des emplacements...',
    EMPTY_STATE: 'Aucun lieu disponible pour le moment.',
    ARIA_LABEL: 'Destinations populaires',
  },
  en: {
    SELECT_LOCATION: 'Select Location',
    AVALIABLE_LOCATION: 'available location',
    AVALIABLE_LOCATIONS: 'available locations',
    LOADING: 'Loading destinations...',
    EMPTY_STATE: 'No locations available right now.',
    ARIA_LABEL: 'Popular destinations',
  },
  es: {
    SELECT_LOCATION: 'Seleccionar ubicación',
    AVALIABLE_LOCATION: 'ubicación disponible',
    AVALIABLE_LOCATIONS: 'ubicaciones disponibles',
    LOADING: 'Cargando destinos...',
    EMPTY_STATE: 'Ningún destino disponible por ahora.',
    ARIA_LABEL: 'Destinos populares',
  },
})

langHelper.setLanguage(strings)
export { strings }
