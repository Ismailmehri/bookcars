import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const frontendSrcRoot = path.join(distRoot, 'frontend/src')

globalThis.__TEST_IMPORT_META_ENV = {
  VITE_BC_MAX_BOOKING_MONTHS: '6',
  VITE_BC_DEFAULT_LANGUAGE: 'en',
  VITE_BC_CURRENCY: '$',
}

const memoryStorage = new Map()
globalThis.localStorage = {
  getItem: (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
  setItem: (key, value) => memoryStorage.set(key, String(value)),
  removeItem: (key) => memoryStorage.delete(key),
  clear: () => memoryStorage.clear(),
}

globalThis.window = {
  location: {
    search: '',
  },
}

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
    path.join(distRoot, 'node_modules/react-localization/index.js'),
    "export default class LocalizedStrings {\n  constructor(dict) { this.dict = dict }\n  setLanguage() {}\n}\n",
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
    "export const days = () => 1;\n"
    + "export const calculateTotalPrice = (car, from, to) => {\n"
    + "  const start = from ? new Date(from) : new Date();\n"
    + "  const end = to ? new Date(to) : start;\n"
    + "  const daysCount = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) || 1);\n"
    + "  return (car?.dailyPrice ?? 0) * daysCount;\n"
    + "};\n"
    + "export const formatPrice = (value) => value?.toString() ?? '';\n"
    + "export const joinURL = (base = '', path = '') => base + (path ? '/' + path : '');\n"
    + "export const getLanguage = () => 'fr';\n",
  ),
  ensureFile(
    path.join(frontendSrcRoot, 'components/Layout.js'),
    "export default function Layout({ children }) { return children ?? null }\n",
  ),
  ensureFile(
    path.join(frontendSrcRoot, 'components/SearchForm.js'),
    "export default function SearchForm() { return null }\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/config/env.config.js'),
    "export { default } from '../../../config/env.config.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/pricing.js'),
    "export * from '../../../common/pricing.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/pricing'),
    "export * from './pricing.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/helper.js'),
    "export * from '../../../common/helper.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/helper'),
    "export * from './helper.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/langHelper.js'),
    "export * from '../../../common/langHelper.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/langHelper'),
    "export * from './langHelper.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/supplier.js'),
    "export * from '../../../common/supplier.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/supplier'),
    "export * from './supplier.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/gtm.js'),
    "export * from '../../../common/gtm.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/common/gtm'),
    "export * from './gtm.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/lang/common.js'),
    "export { strings as default, strings } from '../../../lang/common.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/lang/common'),
    "export { strings as default, strings } from './common.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/lang/cars.js'),
    "export { strings as default, strings } from '../../../lang/cars.js'\n",
  ),
  ensureFile(
    path.join(distRoot, 'node_modules/@/lang/cars'),
    "export { strings as default, strings } from './cars.js'\n",
  ),
  ensureCopiedFromFrontend('config/env.config.js'),
  ensureCopiedFromFrontend('config/const.js'),
  ensureCopiedFromFrontend('common/analytics.types.js'),
  ensureCopiedFromFrontend('common/gtm.js'),
  ensureCopiedFromFrontend('common/pricing.js'),
  ensureCopiedFromFrontend('common/locationLinks.js'),
  ensureCopiedFromFrontend('common/locationPageRoutes.js'),
  ensureCopiedFromFrontend('common/helper.js'),
  ensureCopiedFromFrontend('common/langHelper.js'),
  ensureCopiedFromFrontend('common/supplier.js'),
  ensureCopiedFromFrontend('context/metaEvents.helpers.js'),
  ensureCopiedFromFrontend('services/MetaEventService.js'),
  ensureCopiedFromFrontend('services/UserService.js'),
  ensureCopiedFromFrontend('services/axiosInstance.js'),
  ensureCopiedFromFrontend('pages/auth.utils.js'),
  ensureCopiedFromFrontend('lang/common.js'),
  ensureCopiedFromFrontend('lang/cars.js'),
])

const envFile = path.join(distRoot, 'config/env.config.js')
let envSource = await readFile(envFile, 'utf8')
envSource = envSource.replace(/import\.meta\.env/g, 'globalThis.__TEST_IMPORT_META_ENV')
envSource = envSource.replace(/(['"])\.\/const\1/g, '$1./const.js$1')
const envDefaults = `globalThis.__TEST_IMPORT_META_ENV = globalThis.__TEST_IMPORT_META_ENV || { VITE_BC_MAX_BOOKING_MONTHS: '6', VITE_BC_DEFAULT_LANGUAGE: 'en', VITE_BC_CURRENCY: '$' };\n`
envSource = envDefaults + envSource
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

const helperPath = path.join(distRoot, 'common/helper.js')
try {
  let helperSource = await readFile(helperPath, 'utf8')
  const helperUpdated = helperSource.replace(/@\/config\/env.config(?!\.js)/g, '@/config/env.config.js')
  if (helperUpdated !== helperSource) {
    await writeFile(helperPath, helperUpdated)
  }
} catch {}

const langHelperPath = path.join(distRoot, 'common/langHelper.js')
try {
  let langHelperSource = await readFile(langHelperPath, 'utf8')
  const langHelperUpdated = langHelperSource
    .replace(/@\/config\/env.config(?!\.js)/g, '@/config/env.config.js')
    .replace(/@\/services\//g, '../services/')
    .replace(/\.\.\/services\/([^'"/]+?)(?:\.js)?(?=['"])/g, '../services/$1.js')
    .replace(/\.js\.js/g, '.js')
  if (langHelperUpdated !== langHelperSource) {
    await writeFile(langHelperPath, langHelperUpdated)
  }
} catch {}

const langCommonPath = path.join(distRoot, 'lang/common.js')
try {
  let langCommonSource = await readFile(langCommonPath, 'utf8')
  const langCommonUpdated = langCommonSource
    .replace(/@\/config\/env.config(?!\.js)/g, '@/config/env.config.js')
    .replace(/@\/services\//g, '../services/')
    .replace(/\.\.\/services\/([^'"/]+?)(?:\.js)?(?=['"])/g, '../services/$1.js')
    .replace(/\.js\.js/g, '.js')
  if (langCommonUpdated !== langCommonSource) {
    await writeFile(langCommonPath, langCommonUpdated)
  }
} catch {}

const langCarsPath = path.join(distRoot, 'lang/cars.js')
try {
  let langCarsSource = await readFile(langCarsPath, 'utf8')
  const langCarsUpdated = langCarsSource
    .replace(/@\/config\/env.config(?!\.js)/g, '@/config/env.config.js')
    .replace(/@\/services\//g, '../services/')
    .replace(/\.\.\/services\/([^'"/]+?)(?:\.js)?(?=['"])/g, '../services/$1.js')
    .replace(/\.js\.js/g, '.js')
  if (langCarsUpdated !== langCarsSource) {
    await writeFile(langCarsPath, langCarsUpdated)
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
