import { Book, Chapter, Meta, Verse, VerseItem } from "./passage-types"

interface CvRef {
  c: number
  v: number
}

class PassageRenderer {
  tokens: string[] = []
  paragraph: string[] = []

  rawPushParagraph(tokens: string[]) {
    tokens.push("<p>")
    tokens.push(...this.paragraph)
    tokens.push("</p>")
  }

  pushParagraph() {
    if (this.paragraph.length) {
      this.rawPushParagraph(this.tokens)
      this.paragraph.length = 0
    }
  }

  renderVerseItems(verseItems: VerseItem[]) {
    for (const verseItem of verseItems) {
      if (verseItem.type === "text") {
        this.paragraph.push(verseItem.content.trim())
      }

      if (verseItem.type === "style") {
        this.paragraph.push(`<span class="${verseItem.tag}">`)
        this.renderVerseItems(verseItem.content)
        this.paragraph.push("</span>")
      }
    }
  }

  renderChapter(chapter: Chapter) {
    for (const chapterItem of chapter.content) {
      if (chapterItem.tag === "v") {
        const verse = chapterItem as Verse

        if (verse.verse === 1) {
          this.paragraph.push(`<span chapter="${chapter.chapter}">${chapter.chapter}</span>`)
        }

        this.paragraph.push(`<span verse="${verse.verse}">`)
        this.paragraph.push(`<sup>${verse.verse}</sup>`)
        this.renderVerseItems(verse.content)
        this.paragraph.push("</span>")
      } else {
        const meta = chapterItem as Meta
        if (meta.tag === "p") {
          this.pushParagraph()
        } else if (meta.tag === "s") {
          this.pushParagraph()
          this.tokens.push(`<div class="section-title" role="heading">${meta.content?.trim()}</div>`)
        }
      }
    }
  }

  render(): string {
    const tokens = [...this.tokens]
    this.rawPushParagraph(tokens)
    return tokens.join("")
  }
}

function sliceChapterStart(chapter: Chapter, start: number): Chapter {
  const chapterItems = chapter.content
  let startIndex: number = 0
  let sectionIndex: number | undefined

  for (let i = 0; i < chapterItems.length; i++) {
    const item = chapterItems[i]
    if (["s", "ms"].includes(item.tag)) {
      sectionIndex = i
    } else if (item.tag === "v") {
      if (item.verse === start) {
        startIndex = sectionIndex ?? i
        break
      } else {
        sectionIndex = undefined
      }
    }
  }

  return {
    tag: "c",
    chapter: chapter.chapter,
    content: chapterItems.slice(startIndex, chapterItems.length + 1),
  }
}

function sliceChapterEnd(chapter: Chapter, end: number): Chapter {
  const chapterItems = chapter.content
  let endIndex: number | undefined

  for (let i = 0; i < chapterItems.length; i++) {
    const item = chapterItems[i]
    if (item.tag === "v" && item.verse === end) {
      endIndex = i
    } else if (item.tag === "p" && endIndex) {
      endIndex = i
      break
    }
  }
  return {
    tag: "c",
    chapter: chapter.chapter,
    content: chapterItems.slice(0, (endIndex ?? chapterItems.length) + 1),
  }
}

function sliceBook(book: Book, start: CvRef, end: CvRef): Chapter[] {
  // Filter verses within the range start of the entity
  const firstChapter = book.chapters[start.c - 1]
  const chapters: Chapter[] = [sliceChapterStart(firstChapter, start.v)]

  for (let c = start.c; c < end.c; c++) {
    chapters.push(book.chapters[c])
  }

  // Filter verses within the range end of the entity
  const lastChapter = chapters[chapters.length - 1]
  chapters[chapters.length - 1] = sliceChapterEnd(lastChapter, end.v)

  return chapters
}

// export type { BookObj, ChapterObj, VerseObj }
export { PassageRenderer, sliceBook }
