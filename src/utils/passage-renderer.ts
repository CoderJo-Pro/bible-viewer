import PassageRenderer from "../components/PassageRenderer.vue"

interface BookObj {
  headers: VerseObj[]
  chapters: {
    [chapter: string]: ChapterObj
  }
}

interface ChapterObj {
  [verse: string]: {
    verseObjects: VerseObj[]
  }
}

interface VerseObj {
  tag?: string
  type?: string
  text?: string
  nextChar?: string
  content?: string
  children?: VerseObj[]
}

function renderVerseObjects(verseObjects: VerseObj[], paragraph: string[]): string {
  const tokens: string[] = []

  for (const obj of verseObjects) {
    if (obj.text) {
      paragraph.push("<span>")
      paragraph.push(obj.text!.trimEnd())
      paragraph.push("</span>")
    } else if (obj.type === "paragraph") {
      tokens.push("<p>")
      tokens.push(...paragraph)
      tokens.push("</p>")
      paragraph.length = 0
    } else if (obj.type === "section") {
      tokens.push("<h2>")
      tokens.push(obj.content!.trim())
      tokens.push("</h2>")
    }

    if (obj.children) {
      paragraph.push(renderVerseObjects(obj.children, paragraph))
    }
  }

  return tokens.join("")
}

function renderChapterObject(chapterObject: ChapterObj): string {
  const tokens: string[] = []
  const paragraph: string[] = []

  for (const verseKey of Object.keys(chapterObject)) {
    const verseObjects = chapterObject[verseKey].verseObjects

    if (isFinite(Number(verseKey))) {
      paragraph.push(`<sup>${verseKey}</sup>`)
    }

    tokens.push(renderVerseObjects(verseObjects, paragraph))
  }

  if (paragraph.length) {
    tokens.push("<p>")
    tokens.push(...paragraph)
    tokens.push("</p>")
  }

  return tokens.join("")
}

export type { BookObj, ChapterObj, VerseObj }
export { renderVerseObjects, renderChapterObject }
