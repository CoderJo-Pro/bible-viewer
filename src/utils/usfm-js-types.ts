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

export type { BookObj, ChapterObj, VerseObj }
