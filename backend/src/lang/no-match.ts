import LocalizedStrings from 'react-localization'
import * as langHelper from '@/common/langHelper'

const strings = new LocalizedStrings({
  fr: {
    NO_MATCH: 'Page non trouvée',
  NO_MATCH_DESCRIPTION: 'La page que vous cherchez n\'existe pas ou a été déplacée.',
  },
  en: {
    NO_MATCH: 'Page not found',
    NO_MATCH_DESCRIPTION: 'The page you are looking for does not exist or has been moved.',
  },
})

langHelper.setLanguage(strings)
export { strings }
