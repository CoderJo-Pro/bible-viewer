<template>
  <div>
    <main class="p-4">
      <input class="input w-full h-8" type="text" v-model.lazy="reference" />
      <div class="divider"></div>
      <PassageRenderer :reference="reference"></PassageRenderer>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import PassageRenderer from "../components/PassageRenderer.vue"

const reference = ref("John 3:16")
</script>

<style>
</style>
