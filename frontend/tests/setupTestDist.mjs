import { mkdir, readFile, writeFile, copyFile, access } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const frontendSrcRoot = path.join(distRoot, 'frontend/src')

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
  ensureCopiedFromFrontend('pages/auth.utils.js'),
])

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
