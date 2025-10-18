import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const specifierPattern = /(['"]):bookcars-types\1/g

export const applySpecifierReplacement = (content, transform) => {
  if (!content) {
    return content
  }

  return content.replace(specifierPattern, (match, quote) => transform(quote))
}

export const replacementRules = [
  {
    file: 'index.js',
    transform: (quote) => `${quote}../bookcars-types/index.js${quote}`,
  },
  {
    file: 'index.d.ts',
    transform: (quote) => `${quote}../bookcars-types${quote}`,
  },
]

const getPackageRoot = (metaUrl = import.meta.url) => {
  return path.resolve(path.dirname(fileURLToPath(metaUrl)), '..')
}

export const resolveAliases = async (rootDir = getPackageRoot()) => {
  await Promise.all(
    replacementRules.map(async ({ file, transform }) => {
      const filePath = path.join(rootDir, file)
      let content

      try {
        content = await readFile(filePath, 'utf8')
      } catch (error) {
        if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) {
          return
        }

        throw error
      }

      const nextContent = applySpecifierReplacement(content, transform)

      if (nextContent !== content) {
        await writeFile(filePath, nextContent, 'utf8')
      }
    }),
  )
}

const modulePath = fileURLToPath(import.meta.url)
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : undefined

if (invokedPath === modulePath) {
  resolveAliases().catch((error) => {
    console.error('[resolve-alias] Failed to update compiled files', error)
    process.exitCode = 1
  })
}
