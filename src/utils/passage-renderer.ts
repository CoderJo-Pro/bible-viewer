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

interface CvRef {
  c: number
  v: number
}

class PassageRenderer {
  tokens: string[] = []
  section: string[] = []
  paragraph: string[] = []

  isFront = false

  pushSection(tokens: string[]) {
    tokens.push(...this.section)
  }

  pushParagraph(section: string[]) {
    section.push("<p>")
    section.push(...this.paragraph)
    section.push("</p>")
  }

  renderVerseObjects(verseObjects: VerseObj[]): string {
    const tokens: string[] = []

    for (const obj of verseObjects) {
      if (obj.text) {
        this.paragraph.push("<span>")
        this.paragraph.push(obj.text!.trimEnd())
        this.paragraph.push("</span>")
      } else if (obj.type === "paragraph" && this.paragraph.length) {
        this.pushParagraph(tokens)
        this.paragraph.length = 0
      } else if (obj.type === "section") {
        if (this.isFront) {
          this.isFront = false

          tokens.push("<h2>")
          tokens.push(obj.content!.trim())
          tokens.push("</h2>")

          this.pushParagraph(this.section)
          this.paragraph.length = 0
          this.pushSection(tokens)
          this.section.length = 0
        } else {
          this.pushParagraph(this.section)
          this.paragraph.length = 0
          this.pushSection(tokens)
          this.section.length = 0

          tokens.push("<h2>")
          tokens.push(obj.content!.trim())
          tokens.push("</h2>")
        }
      }

      if (obj.children) {
        this.paragraph.push(this.renderVerseObjects(obj.children))
      }
    }

    return tokens.join("")
  }

  renderChapterObject(chapterObject: ChapterObj) {
    for (const verseKey of Object.keys(chapterObject)) {
      const verseObjects = chapterObject[verseKey].verseObjects

      if (isFinite(Number(verseKey))) {
        this.paragraph.push(`<sup>${verseKey}</sup>`)
      } else if (verseKey === "front") {
        this.isFront = true
      }

      this.section.push(this.renderVerseObjects(verseObjects))
    }
  }

  render(): string {
    const tokens = [...this.tokens]
    this.pushSection(tokens)
    this.pushParagraph(tokens)
    return tokens.join("")
  }
}

function sliceChapter(chapter: ChapterObj, comparer: (k: number) => boolean) {
  return Object.fromEntries(
    Object.entries(chapter).filter(([k]) => {
      const numberK = Number(k)
      return !isFinite(numberK) || comparer(numberK)
    }),
  )
}

function sliceChapters(book: BookObj, start: CvRef, end: CvRef): ChapterObj[] {
  // Filter verses within the range start of the entity
  const firstChapter = book.chapters[start.c]
  const chapters: ChapterObj[] = [sliceChapter(firstChapter, (k) => k >= start.v)]

  for (let c = start.c + 1; c <= end.c; c++) {
    chapters.push(book.chapters[c])
  }

  // Filter verses within the range end of the entity
  const lastChapter = chapters[chapters.length - 1]
  chapters[chapters.length - 1] = sliceChapter(lastChapter, (k) => k <= end.v)

  return chapters
}

export type { BookObj, ChapterObj, VerseObj }
export { PassageRenderer, sliceChapters }
