<template>
  <ul class="w-full list">
    <li class="p-1 list-row block" v-for="record in props.records" :key="record.translationId">
      <Translation :record="record" :type="props.type"></Translation>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { type TranslationRecord } from "../utils/io"
import { AllViewTypes } from "../utils/translation-manage-types";

const props = defineProps<{
  type: AllViewTypes
  records: TranslationRecord[]
}>()
</script>

<style></style>
