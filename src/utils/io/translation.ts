import * as fs from "@tauri-apps/plugin-fs"
import abbrs from "../../assets/json/book-abbr.json"
import usfm from "usfm-js"
import { invoke } from "@tauri-apps/api/core"
import { basename, extname, resolve, tempDir } from "@tauri-apps/api/path"
import { encode, decode } from "@msgpack/msgpack"

function getUsfmUrl(translationId: string) {
  return `https://ebible.org/Scriptures/${translationId}_usfm.zip`
}

async function fetchTranslation(translationId: string) {
  const url = getUsfmUrl(translationId)
  const tempExtractTranslationPath = await resolve(await tempDir(), translationId)

  console.log(`Translation download url: ${url}`)

  await invoke("download_file", {
    url,
    extractPath: tempExtractTranslationPath,
  })

  console.log("Translation successfully downloaded and extracted")
  return tempExtractTranslationPath
}

async function resolveTranslation(extracted: string) {
  const translationId = await basename(extracted)
  const translationFolder = await resolve(paths.data.translations, translationId)
  const files = await fs.readDir(translationId, { baseDir: fs.BaseDirectory.Temp })

  console.log(`Resolving translation ${translationId} at ${extracted} to ${translationFolder}`)

  if (await fs.exists(translationFolder)) {
    await fs.remove(translationFolder, { recursive: true })
  }

  await fs.mkdir(translationFolder, { recursive: true })

  const resolves: Promise<unknown>[] = []

  console.groupCollapsed("Resolving translation book files")

  for (const file of files) {
    if ((await extname(file.name)) === "usfm") {
      let bookNum = parseInt(file.name.slice(0, 2))
      if (bookNum >= 70) {
        bookNum -= 29
      }

      const fileName = abbrs[bookNum - 2].osis
      const filePath = await resolve(extracted, file.name)

      console.log(`Resolving ${fileName}.`)

      resolves.push(
        fs.readTextFile(filePath).then(async (content) => {
          const encoded = encode(transformBook(usfm.toJSON(content)))
          const encodedFile = await resolve(translationFolder, fileName)

          await fs.writeFile(encodedFile, encoded)
        }),
      )
    }
  }

  console.groupEnd()

  await Promise.all(resolves)

  console.log(`Translation ${translationId} successfully resolved to ${translationFolder}`)
}

export async function installTranslation(translationId: string) {
  const extracted = await fetchTranslation(translationId)
  await resolveTranslation(extracted)
}

export async function loadBook(translationId: string, book: string) {
  const chapterFile = await resolve(paths.data.translations, translationId, book)
  if (!(await fs.exists(chapterFile))) {
    console.log(`The ${book} book or the ${translationId} translation does not exist.`)
    return null
  }

  const decoded = decode(await fs.readFile(chapterFile))
  return decoded as Book
}
