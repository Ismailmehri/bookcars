import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    RANGE: 'Gamme',
    MINI: 'Mini',
    MIDI: 'Midi',
    MAXI: 'Maxi',
    SCOOTER: 'Scooter',
  },
  en: {
    RANGE: 'Range',
    MINI: 'Petite voiture',
    MIDI: 'Voiture moyenne',
    MAXI: 'Grande voiture',
    SCOOTER: 'Scooter',
  },
})

langHelper.setLanguage(strings)
export { strings }
