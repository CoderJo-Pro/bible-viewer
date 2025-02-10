interface Book {
  header: HeaderTag[]
  chapters: Chapter[]
}

interface Tag {
  tag: string
}

interface HeaderTag extends Tag {
  content: string
}

interface Chapter extends Tag {
  tag: "c"
  chapter: number
  content: ChapterItem[]
}

interface Verse extends Tag {
  tag: "v"
  verse: number
  content: VerseItem[]
}

interface Text {
  type: "text"
  content: string
}

interface Style extends Tag {
  tag: "add" | "pn"
  type: "style"
  content: VerseItem[]
}

interface Meta extends Tag {
  tag: "s" | "p" | "ms" | "r"
  content?: string
}

type ChapterItem = Verse | Meta
type VerseItem = Text | Style

export type { Book, Tag, HeaderTag, Chapter, Verse, Text, Style, Meta, ChapterItem, VerseItem }
