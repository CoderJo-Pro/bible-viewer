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
    <PassageRenderer :reference="reference"></PassageRenderer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import PassageRenderer from "../components/PassageRenderer.vue"

const reference = ref("John 3:16")
</script>

<style></style>
