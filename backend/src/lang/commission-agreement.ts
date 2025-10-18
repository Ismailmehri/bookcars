import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Commission Plany sur les réservations',
    INTRO: 'À partir du {date}, Plany appliquera une commission de {percent}% sur le prix de chaque réservation.',
    COLLECTION: 'Cette commission est récupérée auprès du client au moment du paiement et versée mensuellement à Plany lorsque le total des commissions du mois dépasse {threshold}.',
    CARRY_OVER: 'Si le total mensuel est inférieur au seuil, le montant est reporté jusqu’à atteindre le seuil.',
    EXAMPLE_TITLE: 'Exemple :',
    EXAMPLE_BASE: 'Prix de location saisi par l’agence : {amount}',
    EXAMPLE_CLIENT: 'Prix affiché au client : {amount} ({base} + {percent}%)',
    EXAMPLE_PAYMENT: 'Ce que le client vous paie : {amount}',
    EXAMPLE_REMIT: 'Ce que vous reversez à Plany : {amount} (soit {percent}% de {base})',
    EXAMPLE_FOOTER: 'Le reversement s’effectue en fin de mois si le total des commissions atteint {threshold} (sinon, report au mois suivant).',
    CALLOUT_INCLUDED: 'Le prix affiché au client inclut la commission Plany.',
    CALLOUT_FLOW: 'Vous encaissez d’abord le total (prix + commission) ; vous reversez ensuite la commission à Plany.',
    ACCEPT: 'Accepter',
    VIEW_POLICY: 'Voir la politique des commissions',
    ACCEPT_ERROR: 'Une erreur est survenue lors de l’enregistrement de votre accord.',
  },
  en: {
    TITLE: 'Plany booking commission',
    INTRO: 'Starting {date}, Plany will apply a {percent}% commission to every booking price.',
    COLLECTION: 'The commission is collected from the client at payment and transferred to Plany each month once the total commissions exceed {threshold}.',
    CARRY_OVER: 'If the monthly total is below the threshold, the amount is carried forward until the threshold is reached.',
    EXAMPLE_TITLE: 'Example:',
    EXAMPLE_BASE: 'Price entered by the agency: {amount}',
    EXAMPLE_CLIENT: 'Price shown to the client: {amount} ({base} + {percent}%)',
    EXAMPLE_PAYMENT: 'Amount paid to you by the client: {amount}',
    EXAMPLE_REMIT: 'Amount you remit to Plany: {amount} ({percent}% of {base})',
    EXAMPLE_FOOTER: 'The transfer takes place at the end of the month when commissions reach {threshold} (otherwise it is carried forward).',
    CALLOUT_INCLUDED: 'The client-facing price already includes Plany’s commission.',
    CALLOUT_FLOW: 'You collect the total amount first (price + commission) and then transfer the commission to Plany.',
    ACCEPT: 'Accept',
    VIEW_POLICY: 'View the commission policy',
    ACCEPT_ERROR: 'We could not record your acceptance. Please try again.',
  },
  es: {
    TITLE: 'Comisión de Plany sobre las reservas',
    INTRO: 'A partir del {date}, Plany aplicará una comisión del {percent}% sobre el precio de cada reserva.',
    COLLECTION: 'Esta comisión se cobra al cliente en el momento del pago y se transfiere a Plany mensualmente cuando el total del mes supera {threshold}.',
    CARRY_OVER: 'Si el total mensual es inferior al umbral, el importe se acumula hasta alcanzarlo.',
    EXAMPLE_TITLE: 'Ejemplo:',
    EXAMPLE_BASE: 'Precio introducido por la agencia: {amount}',
    EXAMPLE_CLIENT: 'Precio mostrado al cliente: {amount} ({base} + {percent}%)',
    EXAMPLE_PAYMENT: 'Lo que paga el cliente: {amount}',
    EXAMPLE_REMIT: 'Lo que transfieres a Plany: {amount} ({percent}% de {base})',
    EXAMPLE_FOOTER: 'La transferencia se realiza a fin de mes cuando las comisiones alcanzan {threshold} (de lo contrario, se acumulan).',
    CALLOUT_INCLUDED: 'El precio mostrado al cliente incluye la comisión de Plany.',
    CALLOUT_FLOW: 'Cobras primero el total (precio + comisión) y después transfieres la comisión a Plany.',
    ACCEPT: 'Aceptar',
    VIEW_POLICY: 'Ver la política de comisiones',
    ACCEPT_ERROR: 'No se pudo registrar tu aceptación. Inténtalo de nuevo.',
  },
})

langHelper.setLanguage(strings)
export { strings }
