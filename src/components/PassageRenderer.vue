<template>
  <div class="passage">
    <article v-html="renderedPassage"></article>
  </div>
</template>

<script lang="ts" setup>
import { getInstalledTranslations, loadBook } from "../utils/io"
import { parse } from "../utils/passage-parser"
import { ChapterObj, renderChapterObject } from "../utils/passage-renderer"
import { ref, watch } from "vue"

const props = defineProps<{
  reference: string
}>()

const renderedPassage = ref("")

const render = async (reference: string) => {
  const passage = parse(reference)
  console.log(passage.parsed_entities())

  const entitiesWrapper = passage.parsed_entities()[0] as any
  const entities = entitiesWrapper.entities

  const translation = (await getInstalledTranslations())![0]
  renderedPassage.value = ""

  for (const outerEntity of entities) {
    console.log(outerEntity)
    const entity = outerEntity.entities[0]

    const book = await loadBook(translation, entity.start.b)
    if (!book) {
      console.log(`Book ${entity.start.b} not found.`)
      continue
    }

    // Filter verses within the range start of the entity
    const firstChapter = book.chapters[entity.start.c]
    const chapters: ChapterObj[] = [
      Object.fromEntries(
        Object.entries(firstChapter).filter(([k]) => !isFinite(Number(k)) || k >= entity.start.v),
      ),
    ]

    for (let c = entity.start.c + 1; c <= entity.end.c; c++) {
      chapters.push(book.chapters[c.toString()])
    }

    // Filter verses within the range end of the entity
    const lastChapter = chapters[chapters.length - 1]
    chapters[chapters.length - 1] = Object.fromEntries(
      Object.entries(lastChapter).filter(([k]) => !isFinite(Number(k)) || k <= entity.end.v),
    )

    for (const chapter of chapters) {
      renderedPassage.value += "<section>"
      renderedPassage.value += renderChapterObject(chapter)
      renderedPassage.value += "</section>"
    }
  }
}

render(props.reference)
watch(() => props.reference, render)
</script>

<style src="@/css/passage.css"></style>
