import { Book, HeaderTag, Chapter, Meta, ChapterItem, VerseItem, Style } from "./passage-types"
import { BookObj, VerseObj } from "./usfm-js-types"

function matchAlphabets(str: string): string {
  return str.match(/[A-Za-z]+/)![0]
}

function transformVerseObjects(verseObjects: VerseObj[]): VerseItem[] {
  const verseItems: VerseItem[] = []

  for (const verseObj of verseObjects) {
    if (verseObj.type === "text") {
      verseItems.push({ type: "text", content: verseObj.text! })
    } else if (verseObj.children) {
      const tag = matchAlphabets(verseObj.tag!) as any
      const children = transformVerseObjects(verseObj.children)

      if (verseObj.text) children.unshift({ type: "text", content: verseObj.text })
      const style: Style = { tag, type: "style", content: children }
      verseItems.push(style)
    }
  }

  return verseItems
}

export function transformBook(bookObj: BookObj): Book {
  const header: HeaderTag[] = bookObj.headers.map((verseObj: VerseObj) => ({
    tag: matchAlphabets(verseObj.tag!),
    content: verseObj.content!,
  }))
  const chapters: Chapter[] = []

  for (const chapterKey in bookObj.chapters) {
    const chapterObj = bookObj.chapters[chapterKey]
    const chapterItems: ChapterItem[] = []
    const chapterNumber = parseInt(chapterKey)

    if (chapterObj.front) {
      const verseObjects = chapterObj.front.verseObjects
      let isAfterSection = false

      for (const verseObj of verseObjects) {
        const tag = matchAlphabets(verseObj.tag!)
        const meta: Meta = {
          tag: tag as any,
          content: verseObj.content,
        }

        if (tag === "s") {
          isAfterSection = true
        }

        if (isAfterSection) {
          chapterItems.push(meta)
        } else {
          chapters[chapterNumber - 1]?.content.push(meta)
        }
      }
    }

    for (const verseKey in chapterObj) {
      if (verseKey === "front") {
        continue
      }

      const verseObjects = chapterObj[verseKey].verseObjects
      const verseItems: VerseItem[] = transformVerseObjects(verseObjects)

      chapterItems.push({ tag: "v", verse: parseInt(verseKey), content: verseItems })
    }

    chapters.push({ tag: "c", chapter: chapterNumber, content: chapterItems })
  }

  return { header, chapters }
}
