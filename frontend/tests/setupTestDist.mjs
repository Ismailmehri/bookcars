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
  ensureCopiedFromFrontend('common/supplier.js'),
])

const envFile = path.join(distRoot, 'config/env.config.js')
let envSource = await readFile(envFile, 'utf8')
envSource = envSource.replace(/import\.meta\.env/g, 'globalThis.__TEST_IMPORT_META_ENV')
envSource = envSource.replace(/'\.\/const';/g, "'./const.js';")
await writeFile(envFile, envSource)

const gtmFilePath = path.join(distRoot, 'common/gtm.js')
let gtmSource = await readFile(gtmFilePath, 'utf8')
let gtmUpdated = gtmSource.replace(/from '\@\//g, "from '../")
gtmUpdated = gtmUpdated.replace(/'\.\.\/config\/env\.config';/g, "'../config/env.config.js';")
if (gtmUpdated !== gtmSource) {
  await writeFile(gtmFilePath, gtmUpdated)
}
