<template>
  <div class="p-4">
    <div class="join join-horizontal w-full">
      <button class="join-item btn btn-soft">Bible Menu</button>
      <input
        class="join-item input w-full font-bold text-current/80"
        type="text"
        v-model.lazy="reference"
      />
    </div>
    <div class="divider"></div>
    <PassageRenderer :reference="osis" :translations="selectedTranslations"></PassageRenderer>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  keepalive: true,
})

const { selectedTranslations } = useTranslations()

const reference = ref("Genesis 1")
const osis = computed((oldVal?: string) => parse(reference.value).osis() || oldVal || "")
</script>

<style></style>
