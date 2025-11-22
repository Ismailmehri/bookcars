import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SUPPLIERS_TITLE: 'Agences partenaires certifiées Plany',
    SUPPLIERS_LOADING: 'Chargement de la liste des agences...',
    SUPPLIERS_ERROR: 'Une erreur est survenue lors du chargement des agences.',
    SUPPLIERS_RETRY: 'Relancer le chargement',
    SUPPLIERS_A11Y: 'Section listant les agences partenaires.',
  },
  en: {
    SUPPLIERS_TITLE: 'Certified Plany partner agencies',
    SUPPLIERS_LOADING: 'Loading the supplier list...',
    SUPPLIERS_ERROR: 'An error occurred while loading suppliers.',
    SUPPLIERS_RETRY: 'Reload list',
    SUPPLIERS_A11Y: 'Section listing partner agencies.',
  },
  es: {
    SUPPLIERS_TITLE: 'Agencias asociadas certificadas por Plany',
    SUPPLIERS_LOADING: 'Cargando la lista de agencias...',
    SUPPLIERS_ERROR: 'Se produjo un error al cargar las agencias.',
    SUPPLIERS_RETRY: 'Recargar lista',
    SUPPLIERS_A11Y: 'Sección que muestra las agencias asociadas.',
  },
})

langHelper.setLanguage(strings)
export { strings }
