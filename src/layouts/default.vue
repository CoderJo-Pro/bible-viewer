<template>
  <div class="w-full h-screen p-2 flex flex-row bg-base-200 gap-2">
    <div class="box-content w-42 flex flex-col">
      <div
        class="w-full p-4 aspect-square flex flex-col justify-center font-mono font-bold text-3xl select-none"
      >
        <div class="self-start">Bible</div>
        <div class="self-end">Viewer</div>
      </div>
      <ul
        class="box-border w-full h-full border border-current/20 rounded-box bg-base-100 menu font-bold text-current/80 tracking-wider"
      >
        <li v-for="link in links">
          <NuxtLink :to="link[1]" :class="{ 'menu-active': isActive(link[1]) }">
            {{ link[0] }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <main class="w-full border border-current/20 overflow-y-auto rounded-box bg-base-100">
      <slot></slot>
    </main>
  </div>
</template>

<script lang="ts" setup>
const links: [string, string][] = [
  ["Passage", "/"],
  ["Translations", "/translations"],
]

function isActive(link: string) {
  return link === location.pathname
}
</script>

<style></style>
