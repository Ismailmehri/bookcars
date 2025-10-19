import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    DELETE_USER: 'Êtes-vous sûr de vouloir supprimer cet utilisateur et toutes ses données ?',
    DELETE_USERS: 'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés et toutes leurs données ?',
    DELETE_SELECTION: 'Supprimer les utilisateurs sélectionnés',
    BLACKLIST: 'Ajouter à la liste noire',
    AGENCY_NOTES_TITLE: 'Historique & notes',
    AGENCY_NOTES_EMPTY: 'Aucune note n’a encore été enregistrée pour cette agence.',
    AGENCY_NOTES_ERROR: 'Impossible de charger l’historique des notes pour cette agence.',
    AGENCY_NOTE_UNKNOWN_AUTHOR: 'Administrateur inconnu',
    AGENCY_NOTE_TYPE_EMAIL: 'Email',
    AGENCY_NOTE_TYPE_SMS: 'SMS',
    AGENCY_NOTE_TYPE_BLOCK: 'Blocage',
    AGENCY_NOTE_TYPE_UNBLOCK: 'Déblocage',
    AGENCY_NOTE_TYPE_NOTE: 'Note interne',
  },
  en: {
    DELETE_USER: 'Are you sure you want to delete this user and all his data?',
    DELETE_USERS: 'Are you sure you want to delete the selected users and all their data?',
    DELETE_SELECTION: 'Delete selectied users',
    BLACKLIST: 'Add to the blacklist',
    AGENCY_NOTES_TITLE: 'History & notes',
    AGENCY_NOTES_EMPTY: 'No notes have been recorded for this agency yet.',
    AGENCY_NOTES_ERROR: 'Unable to load the note history for this agency.',
    AGENCY_NOTE_UNKNOWN_AUTHOR: 'Unknown admin',
    AGENCY_NOTE_TYPE_EMAIL: 'Email',
    AGENCY_NOTE_TYPE_SMS: 'SMS',
    AGENCY_NOTE_TYPE_BLOCK: 'Block',
    AGENCY_NOTE_TYPE_UNBLOCK: 'Unblock',
    AGENCY_NOTE_TYPE_NOTE: 'Internal note',
  },
})

langHelper.setLanguage(strings)
export { strings }
