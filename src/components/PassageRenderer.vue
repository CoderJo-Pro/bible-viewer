<template>
  <div class="passage">
    <article>
      <section v-for="content in renderedSections" :key="content" v-html="content"></section>
    </article>
  </div>
</template>

<script lang="ts" setup>
import { loadBook } from "../utils/io"
import { parse } from "../utils/reference-parser"
import { PassageRenderer, sliceBook } from "../utils/passage-renderer"
import { ref, watchEffect } from "vue"

const props = defineProps<{
  reference: string
  translations: string[]
}>()

const renderedSections = ref<string[]>([])

watchEffect(async () => {
  const passage = parse(props.reference)
  console.log(passage.parsed_entities())

  const entitiesWrapper = passage.parsed_entities()[0] as any
  const entities = entitiesWrapper.entities

  const translation = props.translations[0]!

  renderedSections.value.length = 0

  for (const outerEntity of entities) {
    const renderer = new PassageRenderer()
    console.log(outerEntity)
    const entity = outerEntity.entities[0]

    const book = await loadBook(translation, entity.start.b)
    if (!book) {
      console.log(`Book ${entity.start.b} not found.`)
      continue
    }

    const chapters = sliceBook(book, entity.start, entity.end)
    console.log(chapters)

    for (const chapter of chapters) {
      renderer.renderChapter(chapter)
    }

    renderedSections.value.push(renderer.render())
  }
})
</script>

<style src="@/css/passage.css"></style>
