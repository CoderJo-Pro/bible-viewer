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
  content: (Verse | Meta)[]
}

interface Verse extends Tag {
  tag: "v"
  verse: number
  content: Span[]
}

interface Span {
  tag?: string
  type: string
  content: string
}

interface Meta extends Tag {
  tag: "s" | "p"
  type: "section" | "paragraph"
  content: string
}

export type { Book, Tag, Chapter, Verse, Span, Meta }
