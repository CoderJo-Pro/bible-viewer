<template>
  <div class="w-full h-screen flex bg-base-100">
    <div class="w-1/3 p-3 flex flex-col gap-4 items-center">
      <div
        class="w-34 px-4 py-1 flex flex-col justify-center font-mono font-bold text-2xl select-none"
      >
        <div class="self-start">Bible</div>
        <div class="self-end">Viewer</div>
      </div>
      <ul class="w-full h-full p-0 menu font-bold text-current/80 tracking-wider">
        <li v-for="link in links">
          <NuxtLink :to="link[1]" :class="{ 'menu-active': isActive(link[1]) }">
            {{ link[0] }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <main class="w-full overflow-hidden">
      <div ref="main" class="h-full overflow-y-auto bg-base-100">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { getCurrentWindow } from "@tauri-apps/api/window"
import hotkeys from "hotkeys-js"

const links: [string, string][] = [
  ["Passage", "/"],
  ["Translations", "/translations"],
]

function isActive(link: string) {
  return link === location.pathname
}

const main = ref<HTMLElement>()
const fullscreenShortcut = "f11"

hotkeys(fullscreenShortcut, (event) => {
  if (event.repeat) {
    return
  }

  const window = getCurrentWindow()
  window.isFullscreen().then(async (isFull) => {
    if (isFull) {
      document.exitFullscreen()
    } else {
      main.value?.requestFullscreen()
    }
    await window.setFullscreen(!isFull)
  })
})
</script>

<style></style>
