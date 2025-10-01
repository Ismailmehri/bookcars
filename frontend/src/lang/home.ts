import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    PICK_UP_DATE: 'Date de prise en charge',
    DROP_OFF_DATE: 'Date de retour',
    DROP_OFF: 'Restituer au même endroit',
    COVER: 'Les meilleurs agences de location de voitures',
    SUPPLIERS_TITLE: 'Nos agences partenaires',
    MAP_TITLE: 'Découvrez les meilleures agences de location de voitures en tunisie.',
    MAP_PICK_UP_SELECTED: 'Lieu de prise en charge sélectionné',
    MAP_DROP_OFF_SELECTED: 'Lieu de restitution sélectionné',
    DESTINATIONS_TITLE: 'Parcourir par destinations',
    CAR_SIZE_TITLE: 'Découvrez nos catégories de véhicules',
    CAR_SIZE_TEXT: 'Nous proposons des véhicules de tailles variées pour répondre à toutes vos envies, du trajet urbain au grand voyage',
    MINI: 'Petite voiture',
    MIDI: 'Voiture moyenne',
    MAXI: 'Grande voiture',
    SEARCH_FOR_CAR: 'Rechercher une voiture',
    AGENCY_VERIFICATION_REMINDER_MESSAGE:
      "Votre agence n'a pas encore envoyé ses documents de vérification. Déposez-les dès maintenant pour renforcer votre crédibilité, améliorer votre visibilité sur Plany.tn et accélérer la validation de vos réservations.",
    AGENCY_VERIFICATION_REMINDER_BUTTON: 'Envoyer mes documents',
  },
  en: {
    PICK_UP_DATE: 'Pick-up Date',
    DROP_OFF_DATE: 'Drop-off Date',
    DROP_OFF: 'Return to same location',
    COVER: 'Top Car Rental Companies',
    SUPPLIERS_TITLE: 'Connecting you to the Biggest Brands',
    MAP_TITLE: 'Map of Car Rental Locations',
    MAP_PICK_UP_SELECTED: 'Pick-up Location selected',
    MAP_DROP_OFF_SELECTED: 'Drop-off Location selected',
    DESTINATIONS_TITLE: 'Browse by Destinations',
    CAR_SIZE_TITLE: 'Meet Some of Our Car sizes',
    CAR_SIZE_TEXT: 'Our vehicles come in three main sizes.',
    MINI: 'MINI',
    MIDI: 'MIDI',
    MAXI: 'MAXI',
    SEARCH_FOR_CAR: 'Search for a car',
    AGENCY_VERIFICATION_REMINDER_MESSAGE:
      'Your agency has not submitted its verification documents yet. Upload them now to build trust, boost your visibility on Plany.tn, and speed up the approval of your bookings.',
    AGENCY_VERIFICATION_REMINDER_BUTTON: 'Upload my documents',
  },
  es: {
    PICK_UP_DATE: 'Fecha de recogida',
    DROP_OFF_DATE: 'Fecha de devolución',
    DROP_OFF: 'Devolver en el mismo lugar',
    COVER: 'Las mejores empresas de alquiler de coches',
    SUPPLIERS_TITLE: 'Conectándote con las marcas más grandes',
    MAP_TITLE: 'Mapa de ubicaciones de alquiler de coches',
    MAP_PICK_UP_SELECTED: 'Ubicación de recogida seleccionada',
    MAP_DROP_OFF_SELECTED: 'Ubicación de devolución seleccionada',
    DESTINATIONS_TITLE: 'Buscar por destinos',
    CAR_SIZE_TITLE: 'Descubre algunos de nuestros tamaños de coches',
    CAR_SIZE_TEXT: 'Nuestros vehículos están disponibles en tres tamaños principales.',
    MINI: 'MINI',
    MIDI: 'MIDI',
    MAXI: 'MAXI',
    SEARCH_FOR_CAR: 'Buscar un coche',
    AGENCY_VERIFICATION_REMINDER_MESSAGE:
      'Tu agencia aún no ha enviado sus documentos de verificación. Súbelos ahora para reforzar tu credibilidad, aumentar tu visibilidad en Plany.tn y acelerar la aprobación de tus reservas.',
    AGENCY_VERIFICATION_REMINDER_BUTTON: 'Enviar mis documentos',
  },
})

langHelper.setLanguage(strings)
export { strings }
