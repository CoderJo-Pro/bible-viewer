<template>
  <div class="bg-base-100 flex h-screen w-full">
    <div class="flex w-1/3 flex-col items-center gap-4 p-3">
      <div
        class="flex w-34 flex-col justify-center px-4 py-1 font-mono text-2xl font-bold select-none"
      >
        <div class="self-start">Bible</div>
        <div class="self-end">Viewer</div>
      </div>
      <ul class="menu h-full w-full p-0 font-bold tracking-wider text-current/80">
        <li v-for="link in links">
          <NuxtLink :to="link[1]" :class="{ 'menu-active': isActive(link[1]) }">
            {{ link[0] }}
          </NuxtLink>
        </li>
      </ul>
    </div>
    <main class="w-full overflow-hidden">
      <div ref="main" class="bg-base-100 h-full overflow-y-auto">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
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
