import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    EMPTY_LIST: 'Pas de notifications',
    LOADING: 'Chargement des notifications...',
    FETCH_ERROR: 'Une erreur est survenue lors du chargement des notifications.',
    RETRY: 'Réessayer',
    REFRESH: 'Actualiser',
    VIEW: 'Consulter',
    MARK_AS_READ: 'Marquer comme lu',
    MARK_AS_UNREAD: 'Marquer comme non lu',
    MARK_ALL_AS_READ: 'Tout marquer comme lu',
    MARK_ALL_AS_UNREAD: 'Tout marquer comme non lu',
    DELETE_ALL: 'Tout supprimer',
    DELETE_NOTIFICATION: 'Êtes-vous sûr de vouloir supprimer cette notification ?',
    DELETE_NOTIFICATIONS: 'Êtes-vous sûr de vouloir supprimer ces notifications ?',
  },
  en: {
    EMPTY_LIST: 'No notifications',
    LOADING: 'Loading notifications...',
    FETCH_ERROR: 'Something went wrong while loading notifications.',
    RETRY: 'Retry',
    REFRESH: 'Refresh',
    VIEW: 'View',
    MARK_AS_READ: 'Mark as read',
    MARK_AS_UNREAD: 'Mark as unread',
    MARK_ALL_AS_READ: 'Mark all as read',
    MARK_ALL_AS_UNREAD: 'Mark all as unread',
    DELETE_ALL: 'Delete all',
    DELETE_NOTIFICATION: 'Are you sure you want to delete this notification?',
    DELETE_NOTIFICATIONS: 'Are you sure you want to delete these notifications?',
  },
})

langHelper.setLanguage(strings)
export { strings }
