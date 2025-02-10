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
  publicationURL: string
}

const translationsUrl = "https://ebible.org/Scriptures/translations.csv"

const translationsPath = await resolve(await appDataDir(), "translations")
const tempDownloadTranslationPath = await resolve(await tempDir(), "TEMP_ZIP.zip")

function getUsfmUrl(record: TranslationRecord) {
  return `https://ebible.org/Scriptures/${record.translationId}_usfm.zip`
}

async function fetchTranslationList() {
  const response = await fetch(translationsUrl)
  if (!response.ok || response.status !== 200) {
    return null
  }

  const data = await response.text()
  return Papa.parse<TranslationRecord>(data, { header: true })
}

async function fetchTranslation(record: TranslationRecord) {
  const url = getUsfmUrl(record)
  const tempExtractTranslationPath = await resolve(await tempDir(), record.translationId)

  console.log(`Translation download url: ${url}`)
  console.log(tempDownloadTranslationPath, tempExtractTranslationPath)

  await invoke("download_file", {
    url,
    savePath: tempDownloadTranslationPath,
    extractPath: tempExtractTranslationPath,
  })

  console.log("Translation successfully downloaded and extracted")
  return tempExtractTranslationPath
}

async function fetchUsfmTranslations() {
  const translations = await fetchTranslationList()
  if (!translations) {
    return null
  }

  const responses = translations.data.map((record) =>
    fetch(getUsfmUrl(record), { mode: "no-cors" }).then((response) =>
      response.status === 200 && response.ok ? record : null,
    ).catch(() => null),
  )

  const results = await Promise.all(responses)
  return results.filter((result) => result !== null)
}

async function resolveTranslation(extracted: string) {
  const translationId = await basename(extracted)
  const translationFolder = await resolve(translationsPath, translationId)
  const files = await fs.readDir(translationId, { baseDir: fs.BaseDirectory.Temp })

  console.log(`Resolving translation ${translationId} at ${extracted} to ${translationFolder}`)

  await fs.remove(translationFolder, { recursive: true })
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

async function installTranslation(record: TranslationRecord) {
  const extracted = await fetchTranslation(record)
  await resolveTranslation(extracted)
}

async function getInstalledTranslations() {
  if (!(await fs.exists(translationsPath))) {
    return null
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

export { fetchTranslationList, fetchUsfmTranslations, installTranslation, getInstalledTranslations, loadBook }
