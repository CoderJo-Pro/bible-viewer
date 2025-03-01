<template>
  <div class="p-4">
    <div class="w-full join join-horizontal">
      <button class="join-item btn btn-soft">Bible Menu</button>
      <input
        class="w-full join-item input font-bold text-current/80"
        type="text"
        v-model.lazy="reference"
      />
    </div>
    <div class="divider"></div>
    <PassageRenderer :reference="osis" :translations="selectedTranslations"></PassageRenderer>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import PassageRenderer from "../components/PassageRenderer.vue"
import { parse } from "../utils/reference-parser"
import { useTranslations } from "../composables/useTranslations"

definePageMeta({
  keepalive: true,
})

const { selectedTranslations } = useTranslations()

const reference = ref("Genesis 1")
const osis = computed((oldVal?: string) => parse(reference.value).osis() || oldVal || "")
</script>

<style></style>
