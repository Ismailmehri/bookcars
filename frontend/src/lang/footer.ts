import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const COPYRIGHT_PART1 = `Copyright © ${new Date().getFullYear()} Plany`

const strings = new LocalizedStrings({
  fr: {
    COPYRIGHT_PART1,
    COPYRIGHT_PART2: '. Tous droits réservés.',
    CORPORATE: 'À Propos',
    ABOUT: 'À propos de Nous',
    TOS: "Conditions d'utilisation",
    PRIVACY: 'Politique de Confidentialité',
    RENT: 'Louer une Voiture',
    SUPPLIERS: 'Fournisseurs',
    LOCATIONS: 'Lieux',
    SUPPORT: 'Support',
    CONTACT: 'Contact',
    SECURE_PAYMENT: 'Paiement 100% sécurisé avec Plany',
  },
  en: {
    COPYRIGHT_PART1,
    COPYRIGHT_PART2: '. All rights reserved.',
    CORPORATE: 'Corporate',
    ABOUT: 'About Us',
    TOS: 'Terms of Service',
    PRIVACY: 'Politique de Confidentialité',
    RENT: 'Rent a Car',
    SUPPLIERS: 'Suppliers',
    LOCATIONS: 'Locations',
    SUPPORT: 'Support',
    CONTACT: 'Contact',
    SECURE_PAYMENT: '100% secure payment with Plany',
  },
  es: {
    COPYRIGHT_PART1,
    COPYRIGHT_PART2: '. Todos los derechos reservados.',
    CORPORATE: 'Corporativo',
    ABOUT: 'Sobre Nosotros',
    TOS: 'Términos de Servicio',
    RENT: 'Alquilar un Coche',
    SUPPLIERS: 'Proveedores',
    LOCATIONS: 'Ubicaciones',
    SUPPORT: 'Soporte',
    CONTACT: 'Contacto',
    SECURE_PAYMENT: 'Pago 100% seguro con Plany',
  },
})

langHelper.setLanguage(strings)
export { strings }
