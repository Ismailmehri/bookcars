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
    path.join(distRoot, 'node_modules/:bookcars-types/index.js'),
    "export const AppType = {\n  Frontend: 'frontend',\n  Backend: 'backend',\n}\n",
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

const gtmFilePath = path.join(distRoot, 'common/gtm.js')
let gtmSource = await readFile(gtmFilePath, 'utf8')
let gtmUpdated = gtmSource.replace(/from '\@\//g, "from '../")
gtmUpdated = gtmUpdated.replace(/'\.\.\/config\/env\.config';/g, "'../config/env.config.js';")
if (gtmUpdated !== gtmSource) {
  await writeFile(gtmFilePath, gtmUpdated)
}

const serviceFilePath = path.join(distRoot, 'frontend/src/services/MetaEventService.js')
try {
  let serviceSource = await readFile(serviceFilePath, 'utf8')
  const serviceUpdated = serviceSource.replace("from '@/services/axiosInstance';", "from './axiosInstance.js';")
  if (serviceUpdated !== serviceSource) {
    await writeFile(serviceFilePath, serviceUpdated)
  }
} catch {}

const helpersFilePath = path.join(distRoot, 'frontend/src/context/metaEvents.helpers.js')
try {
  let helpersSource = await readFile(helpersFilePath, 'utf8')
  const helpersUpdated = helpersSource.replace("from '@/services/MetaEventService'", "from '../services/MetaEventService.js'")
  if (helpersUpdated !== helpersSource) {
    await writeFile(helpersFilePath, helpersUpdated)
  }
} catch {}

const axiosFilePath = path.join(distRoot, 'frontend/src/services/axiosInstance.js')
try {
  let axiosSource = await readFile(axiosFilePath, 'utf8')
  const axiosUpdated = axiosSource.replace("from '@/config/env.config'", "from '../config/env.config.js'")
  if (axiosUpdated !== axiosSource) {
    await writeFile(axiosFilePath, axiosUpdated)
  }
} catch {}
