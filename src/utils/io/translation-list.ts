import * as fs from "@tauri-apps/plugin-fs"
import Papa from "papaparse"
import { decode, encode } from "@msgpack/msgpack"

export interface TranslationRecord {
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

async function fetchTranslationsCsv() {
  const response = await fetch(translationsUrl)
  if (!response.ok || response.status !== 200) {
    return null
  }

  const data = await response.text()
  return Papa.parse<TranslationRecord>(data, { header: true }).data
}

async function fetchUsfmTranslations() {
  const response = await fetch(zipListDocUrl)
  if (!response.ok || response.status !== 200) {
    return null
  }

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

async function fetchTranslationList() {
  try {
    const [records, usfmVersions] = await Promise.all([
      fetchTranslationsCsv(),
      fetchUsfmTranslations(),
    ])

    if (!(records && usfmVersions)) {
      return undefined
    }

    return records.filter((record) => usfmVersions.includes(record.translationId))
  } catch (error) {
    throw "Can't fetch translation metadata from internet."
  }
}

export async function getTranslationList() {
  if (!(await fs.exists(paths.data.translationList))) {
    const translations = await fetchTranslationList()
    await fs.writeFile(paths.data.translationList, encode(translations))
    return translations
  }

  const decoded = decode(await fs.readFile(paths.data.translationList))
  return (decoded as TranslationRecord[] | null) ?? undefined
}

export async function getInstalledTranslations() {
  if (!(await fs.exists(paths.data.translations))) {
    return undefined
  }

  const dirs = await fs.readDir(paths.data.translations)
  return dirs.map((dir) => dir.name)
}
