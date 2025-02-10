<template>
  <div class="passage">
    <article>
      <section v-for="content in renderedSections" :key="content" v-html="content"></section>
    </article>
  </div>
</template>

<script lang="ts" setup>
import { getInstalledTranslations, loadBook } from "../utils/io"
import { parse } from "../utils/reference-parser"
import { PassageRenderer, sliceBook } from "../utils/passage-renderer"
import { ref, watch } from "vue"

const props = defineProps<{
  reference: string
}>()

const renderedSections = ref<string[]>([])

const render = async (reference: string) => {
  const passage = parse(reference)
  console.log(passage.parsed_entities())

  const entitiesWrapper = passage.parsed_entities()[0] as any
  const entities = entitiesWrapper.entities

  const translation = (await getInstalledTranslations())![0]
  const renderer = new PassageRenderer()

  renderedSections.value.length = 0

  for (const outerEntity of entities) {
    console.log(outerEntity)
    const entity = outerEntity.entities[0]

    const book = await loadBook(translation, entity.start.b)
    if (!book) {
      console.log(`Book ${entity.start.b} not found.`)
      continue
    }

    const chapters = sliceBook(book, entity.start, entity.end)
    console.log(chapters);

    for (const chapter of chapters) {
      renderer.renderChapter(chapter)
    }

    renderedSections.value.push(renderer.render())
  }
}

render(props.reference)
watch(() => props.reference, render)
</script>

<style src="@/css/passage.css"></style>
