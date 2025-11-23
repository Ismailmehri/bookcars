import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const frontendSrcRoot = path.join(distRoot, 'frontend/src')

globalThis.__TEST_IMPORT_META_ENV = globalThis.__TEST_IMPORT_META_ENV || {}
globalThis.localStorage = globalThis.localStorage || {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const iconNames = [
  'LocationOn',
  'DirectionsCar',
  'Payment',
  'CheckCircle',
  'EventNote',
  'BarChart',
  'Visibility',
  'GroupAdd',
  'MailOutline',
]

const ensureCopiedFromFrontend = async (relativePath) => {
  const targetPath = path.join(distRoot, relativePath)

  try {
    await access(targetPath, fsConstants.F_OK)
    return
  } catch {
    // Continue and attempt to copy from the compiled frontend src folder
  }

  const sourcePath = path.join(frontendSrcRoot, relativePath)

  try {
    await access(sourcePath, fsConstants.F_OK)
  } catch {
    return
  }

  await mkdir(path.dirname(targetPath), { recursive: true })
  await copyFile(sourcePath, targetPath)
}

const ensureFile = async (filePath, contents) => {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, contents)
}

await Promise.all([
  ensureFile(
    path.join(distRoot, 'node_modules/react-gtm-module/index.js'),
    "export default {\n  initialize: () => {},\n  dataLayer: () => {},\n}\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/components/Layout.js'),
    "export default function Layout({ children }) { return children ?? null }\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/components/SearchForm.js'),
    "export default function SearchForm() { return null }\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/:bookcars-types/index.js'),
    "export const AppType = {\n  Frontend: 'frontend',\n  Backend: 'backend',\n}\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/:bookcars-helper/index.js'),
    [
      'export const clone = (value) => JSON.parse(JSON.stringify(value ?? null))',
      'export const days = () => 0',
      "export const joinURL = (...parts) => parts.filter(Boolean).join('/')",
      '',
    ].join('\n'),
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/react-localization/index.js'),
    'export default class LocalizedStrings { constructor(dict){Object.assign(this, dict)} setLanguage(){} }\n',
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@mui/icons-material/index.js'),
    [
      'export const MailOutline = () => null',
      'export const ArrowLeft = () => null',
      'export const ArrowRight = () => null',
      'export const LocationOn = () => null',
      'export default { MailOutline, ArrowLeft, ArrowRight, LocationOn }',
      '',
    ].join('\n'),
  ),
  ensureFile(
    path.join(frontendSrcRoot, 'components/Layout.js'),
    "export default function Layout({ children }) { return children ?? null }\n",
  ),
  ensureFile(
    path.join(frontendSrcRoot, 'components/SearchForm.js'),
    "export default function SearchForm() { return null }\n",
  ),
  ensureCopiedFromFrontend('config/env.config.js'),
  ensureCopiedFromFrontend('config/const.js'),
  ensureCopiedFromFrontend('common/analytics.types.js'),
  ensureCopiedFromFrontend('common/gtm.js'),
  ensureCopiedFromFrontend('common/pricing.js'),
  ensureCopiedFromFrontend('common/locationLinks.js'),
  ensureCopiedFromFrontend('common/locationPageRoutes.js'),
  ensureCopiedFromFrontend('common/supplier.js'),
  ensureCopiedFromFrontend('context/metaEvents.helpers.js'),
  ensureCopiedFromFrontend('services/MetaEventService.js'),
  ensureCopiedFromFrontend('services/UserService.js'),
  ensureCopiedFromFrontend('services/axiosInstance.js'),
  ensureFile(path.join(frontendSrcRoot, 'assets/css/how-it-works.css'), ''),
  ensureFile(path.join(frontendSrcRoot, 'assets/css/rental-agency-section.css'), ''),
])

await Promise.all(
  iconNames.map((icon) =>
    ensureFile(
      path.join(distRoot, `node_modules/@mui/icons-material/${icon}.js`),
      'export default function Icon() { return null }\n'
    )
  )
)

const envFile = path.join(distRoot, 'config/env.config.js')
let envSource = await readFile(envFile, 'utf8')
envSource = envSource.replace(/import\.meta\.env/g, 'globalThis.__TEST_IMPORT_META_ENV')
envSource = envSource.replace(/(['"])\.\/const\1/g, '$1./const.js$1')
await writeFile(envFile, envSource)

const compiledEnvFile = path.join(frontendSrcRoot, 'config/env.config.js')
try {
  let compiledEnvSource = await readFile(compiledEnvFile, 'utf8')
  let compiledUpdated = compiledEnvSource.replace(/import\.meta\.env/g, 'globalThis.__TEST_IMPORT_META_ENV')
  compiledUpdated = compiledUpdated.replace(/(['"])\.\/const\1/g, '$1./const.js$1')
  if (compiledUpdated !== compiledEnvSource) {
    await writeFile(compiledEnvFile, compiledUpdated)
  }
} catch {}

const compiledLocationComponentPath = path.join(frontendSrcRoot, 'components/location/LocationLandingPage.js')
try {
  let compiledLocationComponent = await readFile(compiledLocationComponentPath, 'utf8')
  const compiledLocationComponentUpdated = compiledLocationComponent
    .replace(/@\/components\//g, '../')
    .replace(/@\/common\//g, '../../common/')
    .replace(/@\/services\//g, '../../services/')
    .replace(/@\/assets\//g, '../../assets/')
    .replace("../Layout'", "../Layout.js'")
    .replace("../Footer'", "../Footer.js'")
    .replace("../Seo'", "../Seo.js'")
    .replace("../SearchForm'", "../SearchForm.js'")
    .replace("../Map'", "../Map.js'")
    .replace("../HowItWorks'", "../HowItWorks.js'")
    .replace("../SupplierCarrousel'", "../SupplierCarrousel.js'")
    .replace("../RentalAgencySection'", "../RentalAgencySection.js'")
    .replace("../location/utils'", "../location/utils.js'")
    .replace("../location/schema'", "../location/schema.js'")
    .replace("../../services/SupplierService'", "../../services/SupplierService.js'")
    .replace("import MiniImage from '../../assets/img/mini.png';", "const MiniImage = '/assets/img/mini.png';")
    .replace("import MidiImage from '../../assets/img/midi.png';", "const MidiImage = '/assets/img/midi.png';")
    .replace("import MaxiImage from '../../assets/img/maxi.png';", "const MaxiImage = '/assets/img/maxi.png';")
  if (compiledLocationComponentUpdated !== compiledLocationComponent) {
    await writeFile(compiledLocationComponentPath, compiledLocationComponentUpdated)
  }
} catch {}

const compiledHowItWorksPath = path.join(frontendSrcRoot, 'components/HowItWorks.js')
try {
  const compiledHowItWorks = await readFile(compiledHowItWorksPath, 'utf8')
  const iconStub = `const LocationOnIcon = () => null\nconst DirectionsCarIcon = () => null\nconst PaymentIcon = () => null\nconst CheckCircleIcon = () => null\n`
  const cleanedHowItWorks = compiledHowItWorks
    .replace(/import[^\n]*how-it-works\.css['"];?\s*/g, '')
    .replace(/import[^\n]*@mui\/icons-material[^\n]*\n/g, '')
  const patchedHowItWorks = cleanedHowItWorks.includes('const steps = [')
    ? cleanedHowItWorks.replace('const steps = [', `${iconStub}const steps = [`)
    : cleanedHowItWorks
  if (patchedHowItWorks !== compiledHowItWorks) {
    await writeFile(compiledHowItWorksPath, patchedHowItWorks)
  }
} catch {}

const compiledRentalAgencyPath = path.join(frontendSrcRoot, 'components/RentalAgencySection.js')
try {
  const compiledRentalAgency = await readFile(compiledRentalAgencyPath, 'utf8')
  const iconStub = `const EventNote = () => null\nconst BarChart = () => null\nconst Visibility = () => null\nconst GroupAdd = () => null\n`
  const cleanedRentalAgency = compiledRentalAgency
    .replace(/import[^\n]*rental-agency-section\.css['"];?\s*/g, '')
    .replace(/import[^\n]*@mui\/icons-material[^\n]*\n/g, '')
  const patchedRentalAgency = cleanedRentalAgency.includes('const advantages')
    ? cleanedRentalAgency.replace('const advantages = [', `${iconStub}const advantages = [`)
    : cleanedRentalAgency
  if (patchedRentalAgency !== compiledRentalAgency) {
    await writeFile(compiledRentalAgencyPath, patchedRentalAgency)
  }
} catch {}

const patchAliases = async (filePath, replacements) => {
  try {
    let source = await readFile(filePath, 'utf8')
    let updated = source
    replacements.forEach(([find, replace]) => {
      updated = updated.replace(new RegExp(find, 'g'), replace)
    })
    if (updated !== source) {
      await writeFile(filePath, updated)
    }
  } catch {}
}

await patchAliases(path.join(frontendSrcRoot, 'pages/About.js'), [
  ['@/components/Layout', '../components/Layout.js'],
  ['@/components/Footer', '../components/Footer.js'],
  ['@/components/Seo', '../components/Seo.js'],
  ['@/common/seo', '../common/seo.js'],
  ['import[^\\n]*about\\.css[^\\n]*\\n', ''],
])

await patchAliases(path.join(frontendSrcRoot, 'pages/Contact.js'), [
  ['@/components/Layout', '../components/Layout.js'],
  ['@/components/Footer', '../components/Footer.js'],
  ['@/components/ContactForm', '../components/ContactForm.js'],
  ['@/components/Seo', '../components/Seo.js'],
  ['@/common/seo', '../common/seo.js'],
  ['import[^\\n]*contact\\.css[^\\n]*\\n', ''],
])

await patchAliases(path.join(frontendSrcRoot, 'pages/Error.js'), [
  ['@/components/Seo', '../components/Seo.js'],
  ['@/lang/common', '../lang/common.js'],
  ['import[^\\n]*error\\.css[^\\n]*\\n', ''],
])

await patchAliases(path.join(frontendSrcRoot, 'pages/Info.js'), [
  ['@/components/Seo', '../components/Seo.js'],
  ['@/lang/common', '../lang/common.js'],
  ['import[^\\n]*info\\.css[^\\n]*\\n', ''],
])

await patchAliases(path.join(frontendSrcRoot, 'components/ContactForm.js'), [
  ['@/config/env.config', '../config/env.config.js'],
  ['@/lang/common', '../lang/common.js'],
  ['@/lang/contact-form', '../lang/contact-form.js'],
  ['@/services/UserService', '../services/UserService.js'],
  ['@/components/ReCaptchaProvider', './ReCaptchaProvider.js'],
  ['@/common/helper', '../common/helper.js'],
  ['@/common/gtm', '../common/gtm.js'],
  ['import[^\\n]*contact-form\\.css[^\\n]*\\n', ''],
])

await patchAliases(path.join(frontendSrcRoot, 'components/Footer.js'), [
  ['@/lang/footer', '../lang/footer.js'],
  ['@/services/LocationService', '../services/LocationService.js'],
  ['import[^\\n]*footer\\.css[^\\n]*\\n', ''],
  ['import SecurePayment[^\\n]*\n', "const SecurePayment = '/assets/img/secure-payment.png'\n"],
])

await patchAliases(path.join(frontendSrcRoot, 'components/SupplierCarrousel.js'), [
  ["import Slider from 'react-slick';", 'const Slider = ({ children }) => children'],
  ['@/config/env.config', '../config/env.config.js'],
  ['@/assets/css/supplier-carrousel.css', ''],
  ["import 'slick-carousel/slick/slick.css';", ''],
  ["import 'slick-carousel/slick/slick-theme.css';", ''],
  ["import '';", ''],
])

await patchAliases(path.join(frontendSrcRoot, 'components/LocationCarrousel.js'), [
  ["import Slider from 'react-slick';", 'const Slider = ({ children }) => children'],
  ['@/config/env.config', '../config/env.config.js'],
  ['@/lang/location-carrousel', '../lang/location-carrousel.js'],
  ['@/lang/common', '../lang/common.js'],
  ['import[^\\n]*location-carrousel\\.css[^\\n]*\\n', ''],
  ['./Badge', './Badge.js'],
  ["import 'slick-carousel/slick/slick.css';", ''],
  ["import 'slick-carousel/slick/slick-theme.css';", ''],
  ["import '';", ''],
])

await patchAliases(path.join(frontendSrcRoot, 'components/Badge.js'), [
  ['import[^\\n]*badge\\.css[^\\n]*\\n', ''],
])

await patchAliases(path.join(frontendSrcRoot, 'lang/common.js'), [
  ['@/config/env.config', '../config/env.config.js'],
  ['@/common/langHelper', '../common/langHelper.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'lang/location-carrousel.js'), [
  ['@/common/langHelper', '../common/langHelper.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'lang/footer.js'), [
  ['@/common/langHelper', '../common/langHelper.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'lang/contact-form.js'), [
  ['@/common/langHelper', '../common/langHelper.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'services/LocationService.js'), [
  ['@/services/axiosInstance', './axiosInstance.js'],
  ['@/config/env.config', '../config/env.config.js'],
  ['./axiosInstance', './axiosInstance.js'],
  ['./UserService', './UserService.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'components/ReCaptchaProvider.js'), [
  ['@/config/env.config', '../config/env.config.js'],
  ['@/services/UserService', '../services/UserService.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'common/helper.js'), [
  ['@/lang/cars', '../lang/cars.js'],
  ['@/lang/common', '../lang/common.js'],
  ['@/config/env.config', '../config/env.config.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'common/langHelper.js'), [
  ['@/config/env.config', '../config/env.config.js'],
  ['@/services/', '../services/'],
  ['@/services/UserService', '../services/UserService.js'],
  ['\.\./services/UserService', '../services/UserService.js'],
])

await patchAliases(path.join(frontendSrcRoot, 'lang/cars.js'), [
  ['@/common/langHelper', '../common/langHelper.js'],
  ['@/config/env.config', '../config/env.config.js'],
  ['@/services/', '../services/'],
  ['@/services/UserService', '../services/UserService.js'],
  ['\.\./services/UserService', '../services/UserService.js'],
])

const gtmFilePath = path.join(distRoot, 'common/gtm.js')
let gtmSource = await readFile(gtmFilePath, 'utf8')
let gtmUpdated = gtmSource.replace(/@\/config\/env.config/g, '../config/env.config.js')
gtmUpdated = gtmUpdated.replace(/@\/services\/MetaEventService/g, '../services/MetaEventService.js')
gtmUpdated = gtmUpdated.replace(/@\/services\/UserService/g, '../services/UserService.js')
if (gtmUpdated !== gtmSource) {
  await writeFile(gtmFilePath, gtmUpdated)
}

const serviceFilePath = path.join(distRoot, 'frontend/src/services/MetaEventService.js')
try {
  let serviceSource = await readFile(serviceFilePath, 'utf8')
  let serviceUpdated = serviceSource.replace(/@\/services\/axiosInstance/g, './axiosInstance.js')
  serviceUpdated = serviceUpdated.replace(/\.\/axiosInstance(?=['"])/g, './axiosInstance.js')
  if (serviceUpdated !== serviceSource) {
    await writeFile(serviceFilePath, serviceUpdated)
  }
} catch {}

const compiledUserServicePath = path.join(frontendSrcRoot, 'services/UserService.js')
try {
  let compiledUserSource = await readFile(compiledUserServicePath, 'utf8')
  let compiledUserUpdated = compiledUserSource.replace(/@\/services\/axiosInstance/g, './axiosInstance.js')
  compiledUserUpdated = compiledUserUpdated.replace(/\.\/axiosInstance(?=['"])/g, './axiosInstance.js')
  compiledUserUpdated = compiledUserUpdated.replace(/@\/config\/env.config/g, '../config/env.config.js')
  compiledUserUpdated = compiledUserUpdated.replace(/new URLSearchParams\(window.location.search\)/g, 'new URLSearchParams("")')
  if (compiledUserUpdated !== compiledUserSource) {
    await writeFile(compiledUserServicePath, compiledUserUpdated)
  }
} catch {}

const rootServiceFilePath = path.join(distRoot, 'services/MetaEventService.js')
try {
  let rootServiceSource = await readFile(rootServiceFilePath, 'utf8')
  let rootServiceUpdated = rootServiceSource.replace(/@\/services\/axiosInstance/g, './axiosInstance.js')
  rootServiceUpdated = rootServiceUpdated.replace(/\.\/axiosInstance(?=['"])/g, './axiosInstance.js')
  rootServiceUpdated = rootServiceUpdated.replace(/@\/config\/env.config/g, '../config/env.config.js')
  if (rootServiceUpdated !== rootServiceSource) {
    await writeFile(rootServiceFilePath, rootServiceUpdated)
  }
} catch {}

const rootUserServicePath = path.join(distRoot, 'services/UserService.js')
try {
  let rootUserSource = await readFile(rootUserServicePath, 'utf8')
  let rootUserUpdated = rootUserSource.replace(/@\/services\/axiosInstance/g, './axiosInstance.js')
  rootUserUpdated = rootUserUpdated.replace(/\.\/axiosInstance(?=['"])/g, './axiosInstance.js')
  rootUserUpdated = rootUserUpdated.replace(/@\/config\/env.config/g, '../config/env.config.js')
  if (rootUserUpdated !== rootUserSource) {
    await writeFile(rootUserServicePath, rootUserUpdated)
  }
} catch {}

const rootAxiosServicePath = path.join(distRoot, 'services/axiosInstance.js')
try {
  let rootAxiosSource = await readFile(rootAxiosServicePath, 'utf8')
  const rootAxiosUpdated = rootAxiosSource.replace(/@\/config\/env.config/g, '../config/env.config.js')
  if (rootAxiosUpdated !== rootAxiosSource) {
    await writeFile(rootAxiosServicePath, rootAxiosUpdated)
  }
} catch {}

const compiledGtmFilePath = path.join(frontendSrcRoot, 'common/gtm.js')
try {
  let compiledGtmSource = await readFile(compiledGtmFilePath, 'utf8')
  let compiledGtmUpdated = compiledGtmSource.replace(/@\/config\/env.config/g, '../config/env.config.js')
  compiledGtmUpdated = compiledGtmUpdated.replace(/@\/services\/MetaEventService/g, '../services/MetaEventService.js')
  compiledGtmUpdated = compiledGtmUpdated.replace(/@\/services\/UserService/g, '../services/UserService.js')
  if (compiledGtmUpdated !== compiledGtmSource) {
    await writeFile(compiledGtmFilePath, compiledGtmUpdated)
  }
} catch {}

const compiledLocationPagePath = path.join(frontendSrcRoot, 'pages/LocationVoitureTunisie.js')
try {
  let compiledLocationPage = await readFile(compiledLocationPagePath, 'utf8')
  const compiledLocationPageUpdated = compiledLocationPage
    .replace(/@\/components\//g, '../components/')
    .replace(/@\/common\//g, '../common/')
    .replace("../components/Seo'", "../components/Seo.js'")
    .replace("../components/location/LocationLandingPage'", "../components/location/LocationLandingPage.js'")
    .replace("../common/seo'", "../common/seo.js'")
    .replace("./locationData_SEO'", "./locationData_SEO.js'")
  if (compiledLocationPageUpdated !== compiledLocationPage) {
    await writeFile(compiledLocationPagePath, compiledLocationPageUpdated)
  }
} catch {}

const helpersFilePath = path.join(distRoot, 'frontend/src/context/metaEvents.helpers.js')
try {
  let helpersSource = await readFile(helpersFilePath, 'utf8')
  let helpersUpdated = helpersSource.replace(/@\/services\/MetaEventService/g, '../services/MetaEventService.js')
  helpersUpdated = helpersUpdated.replace(/@\/common\/gtm/g, '../common/gtm.js')
  if (helpersUpdated !== helpersSource) {
    await writeFile(helpersFilePath, helpersUpdated)
  }
} catch {}

const axiosFilePath = path.join(distRoot, 'frontend/src/services/axiosInstance.js')
try {
  let axiosSource = await readFile(axiosFilePath, 'utf8')
  const axiosUpdated = axiosSource.replace(/@\/config\/env.config/g, '../config/env.config.js')
  if (axiosUpdated !== axiosSource) {
    await writeFile(axiosFilePath, axiosUpdated)
  }
} catch {}
