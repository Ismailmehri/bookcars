import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    NEW_BOOKING: 'Nouvelle réservation',
    SUPPLIERS_LOADING: 'Chargement des agences en cours... merci de patienter.',
    SUPPLIERS_ERROR: 'Impossible de charger les agences pour le moment.',
    SUPPLIERS_RETRY: 'Réessayer',
    SUPPLIERS_EMPTY: 'Aucune agence disponible pour le moment.',
  },
  en: {
    NEW_BOOKING: 'New Booking',
    SUPPLIERS_LOADING: 'Loading suppliers... please wait.',
    SUPPLIERS_ERROR: 'Unable to load suppliers right now.',
    SUPPLIERS_RETRY: 'Retry',
    SUPPLIERS_EMPTY: 'No suppliers are available right now.',
  },
  es: {
    NEW_BOOKING: 'Nueva reserva',
    SUPPLIERS_LOADING: 'Cargando agencias... por favor espere.',
    SUPPLIERS_ERROR: 'No se pueden cargar las agencias en este momento.',
    SUPPLIERS_RETRY: 'Reintentar',
    SUPPLIERS_EMPTY: 'No hay agencias disponibles por ahora.',
  },
})

langHelper.setLanguage(strings)
export { strings }
