import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    RANGE: 'Gamme',
    MINI: 'Petite voiture',
    MIDI: 'Voiture moyenne',
    MAXI: 'Grande voiture',
    SCOOTER: 'Scooter',
  },
  en: {
    RANGE: 'Range',
    MINI: 'Mini',
    MIDI: 'Midi',
    MAXI: 'Maxi',
    SCOOTER: 'Scooter',
  },
  es: {
    RANGE: 'Gama',
    MINI: 'Mini',
    MIDI: 'Midi',
    MAXI: 'Maxi',
    SCOOTER: 'Scooter',
  },
})

langHelper.setLanguage(strings)
export { strings }
