import { Book, HeaderTag, Chapter, Meta, ChapterItem, VerseItem, Style } from "./passage-types"
import { BookObj, VerseObj } from "./usfm-js-types"

function matchAlphabets(str: string): string {
  return str.match(/[A-Za-z]+/)![0]
}

function transformVerseObjects(verseObjects: VerseObj[]): [VerseItem[], Meta[]] {
  const verseItems: VerseItem[] = []
  const metas: Meta[] = []

  for (const verseObj of verseObjects) {
    if (verseObj.tag) {
      const tag = matchAlphabets(verseObj.tag)
      let isPlainText = false

      if (["add", "pn"].includes(tag)) {
        const children: VerseItem[] = []

        if (verseObj.text) {
          children.push({ type: "text", content: verseObj.text })
        }

        if (verseObj.children) {
          const [v, m] = transformVerseObjects(verseObj.children)
          children.push(...v)
          metas.push(...m)
        }

        const style: Style = { tag: tag as any, type: "style", content: children }
        verseItems.push(style)
      } else if (["s", "p"].includes(tag)) {
        const meta: Meta = {
          tag: tag as any,
          content: verseObj.content,
        }
        metas.push(meta)
      } else {
        isPlainText = true
      }

      if (!isPlainText) {
        continue
      }
    }

    if (verseObj.text) {
      verseItems.push({ type: "text", content: verseObj.text })
    }
  }

  return [verseItems, metas]
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
        if (verseObj.tag) {
          const tag = matchAlphabets(verseObj.tag)
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
    }

    for (const verseKey in chapterObj) {
      if (verseKey === "front") {
        continue
      }

      const verseObjects = chapterObj[verseKey].verseObjects
      const [verseItems, metas] = transformVerseObjects(verseObjects)

      chapterItems.push({ tag: "v", verse: parseInt(verseKey), content: verseItems })
      chapterItems.push(...metas)
    }

    chapters.push({ tag: "c", chapter: chapterNumber, content: chapterItems })
  }

  return { header, chapters }
}
