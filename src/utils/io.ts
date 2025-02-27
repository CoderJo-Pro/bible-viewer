import { invoke } from "@tauri-apps/api/core"
import { resolve, appDataDir, tempDir, extname, basename } from "@tauri-apps/api/path"
import { decode, encode } from "@msgpack/msgpack"
import { transformBook } from "./passage-transformer"
import { Book } from "./passage-types"
import * as fs from "@tauri-apps/plugin-fs"
import Papa from "papaparse"
import abbrs from "../assets/json/book-abbr.json"
import usfm from "usfm-js"

interface TranslationRecord {
  languageCode: string
  translationId: string
  languageName: string
  languageNameInEnglish: string
  dialect: string
  homeDomain: string
  title: string
  description: string
  Redistributable: string
  Copyright: string
  UpdateDate: string
  publicationURL: string
  OTbooks: string
  OTchapters: string
  OTverses: string
  NTbooks: string
  NTchapters: string
  NTverses: string
  DCbooks: string
  DCchapters: string
  DCverses: string
  FCBHID: string
  Certified: string
  inScript: string
  swordName: string
  rodCode: string
  textDirection: string
  downloadable: string
  font: string
  shortTitle: string
  PODISBN: string
  script: string
  sourceDate: string
}

const translationsUrl = "https://ebible.org/Scriptures/translations.csv"
const zipListDocUrl = "https://ebible.org/Scriptures/dir.php"

const translationsPath = await resolve(await appDataDir(), "translations")

function getUsfmUrl(translationId: string) {
  return `https://ebible.org/Scriptures/${translationId}_usfm.zip`
}

async function fetchTranslationList() {
  const response = await fetch(translationsUrl)
  if (!response.ok || response.status !== 200) {
    return null
  }

  const data = await response.text()
  return Papa.parse<TranslationRecord>(data, { header: true })
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

async function fetchUsfmTranslations() {
  const response = await fetch(zipListDocUrl)
  const doc = new DOMParser().parseFromString(await response.text(), "text/html")

  const zipLinks = doc.querySelector("tbody")?.querySelectorAll("a")
  if (!zipLinks) {
    return null
  }

  const translationIds: string[] = []

  for (const zipLink of zipLinks) {
    const match = zipLink.innerHTML.match(/^((?:\w|-)+)_usfm\.zip$/)
    if (match) {
      translationIds.push(match[1])
    }
  }

  return translationIds
}

async function fetchTranslations() {
  const [records, usfmVersions] = await Promise.all([
    fetchTranslationList(),
    fetchUsfmTranslations(),
  ])

  if (!(records && usfmVersions)) {
    return undefined
  }

  return records.data.filter((record) => usfmVersions.includes(record.translationId))
}

async function resolveTranslation(extracted: string) {
  const translationId = await basename(extracted)
  const translationFolder = await resolve(translationsPath, translationId)
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

async function installTranslation(translationId: string) {
  const extracted = await fetchTranslation(translationId)
  await resolveTranslation(extracted)
}

async function getInstalledTranslations() {
  if (!(await fs.exists(translationsPath))) {
    return undefined
  }

  const dirs = await fs.readDir(translationsPath)
  return dirs.map((dir) => dir.name)
}

async function loadBook(translationId: string, book: string) {
  const chapterFile = await resolve(translationsPath, translationId, book)
  if (!(await fs.exists(chapterFile))) {
    console.log(`The ${book} book or the ${translationId} translation does not exist.`)
    return null
  }

  const decoded = decode(await fs.readFile(chapterFile))
  return decoded as Book
}

export type { TranslationRecord }
export { fetchTranslations, installTranslation, getInstalledTranslations, loadBook }
