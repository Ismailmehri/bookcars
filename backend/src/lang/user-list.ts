import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    DELETE_USER: 'Êtes-vous sûr de vouloir supprimer cet utilisateur et toutes ses données ?',
    DELETE_USERS: 'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés et toutes leurs données ?',
    DELETE_SELECTION: 'Supprimer les utilisateurs sélectionnés',
    BLACKLIST: 'Ajouter à la liste noire',
    CHANGE_TYPE_TO_SUPPLIER: 'Convertir en fournisseur',
    CHANGE_TYPE_TO_USER: 'Convertir en conducteur',
    CONFIRM_CHANGE_TYPE_SUPPLIER: 'Êtes-vous sûr de vouloir convertir ce conducteur en agence ?',
    CONFIRM_CHANGE_TYPE_USER: 'Êtes-vous sûr de vouloir convertir cette agence en conducteur ?',
    CHANGE_TYPE_SUCCESS: 'Le type de profil a été mis à jour.'
  },
  en: {
    DELETE_USER: 'Are you sure you want to delete this user and all his data?',
    DELETE_USERS: 'Are you sure you want to delete the selected users and all their data?',
    DELETE_SELECTION: 'Delete selectied users',
    BLACKLIST: 'Add to the blacklist',
    CHANGE_TYPE_TO_SUPPLIER: 'Convert to supplier',
    CHANGE_TYPE_TO_USER: 'Convert to driver',
    CONFIRM_CHANGE_TYPE_SUPPLIER: 'Are you sure you want to convert this user into an agency?',
    CONFIRM_CHANGE_TYPE_USER: 'Are you sure you want to convert this agency into a driver?',
    CHANGE_TYPE_SUCCESS: 'Profile type updated successfully.'
  },
})

langHelper.setLanguage(strings)
export { strings }
