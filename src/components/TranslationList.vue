<template>
  <ul class="list w-full">
    <li class="list-row block p-1" v-for="record in props.records" :key="record.translationId">
      <Translation :record="record" :type="props.type"></Translation>
    </li>
  </ul>
</template>

<script lang="ts" setup>
const props = defineProps<{
  type: AllViewTypes
  records: TranslationRecord[]
}>()
</script>

<style></style>
