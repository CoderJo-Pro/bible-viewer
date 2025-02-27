<template>
  <div>
    <div class="px-4 navbar border-b border-current/20 bg-base-100 sticky top-0 z-10 join">
      <select class="join-item w-1/3 select" v-model="selectedType">
        <option value="download">Download</option>
        <option value="installed">Installed</option>
      </select>
      <select class="join-item grow select" v-model="selectedLanguage">
        <option :disabled="!isInstalledType" value="give me all!">All Languages</option>
        <option v-for="t in languages" :value="t.languageCode">{{ t.languageName }}</option>
      </select>
      <button class="join-item btn btn-primary" @click="load">Reload</button>
    </div>

    <div class="p-4">
      <TranslationList v-if="!isInstalledType" :type="ViewType.download" :records="downloadList" />
      <TranslationList v-if="isInstalledType" :type="ViewType.installed" :records="installedList" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useTranslations } from "../composables/useTranslations.ts"
import { fetchTranslations, getInstalledTranslations, TranslationRecord } from "../utils/io"
import { ViewType } from "../utils/translation-manage-types.ts"

const selectedType = ref("download")
const selectedLanguage = ref("give me all!")

const { translations, installedTranslations } = useTranslations()

const isInstalledType = computed(() => selectedType.value === ViewType.installed)

const filteredTranslations = computed(() => {
  if (isInstalledType.value && selectedLanguage.value === "give me all!") {
    return translations.value
  } else {
    return translations.value?.filter((t) => t.languageCode === selectedLanguage.value)
  }
})
const downloadList = computed(
  () =>
    filteredTranslations.value?.filter(
      (t) => !installedTranslations.value?.includes(t.translationId) || true,
    ) ?? [],
)
const installedList = computed(
  () =>
    filteredTranslations.value?.filter((t) =>
      installedTranslations.value?.includes(t.translationId),
    ) ?? [],
)

const languages = computed(() => {
  if (!translations.value) {
    return undefined
  }

  let extraChecker = (_translation: TranslationRecord) => true

  if (isInstalledType.value) {
    const installedLanguages = installedList.value.map((t) => t.languageCode)
    extraChecker = (translation) => installedLanguages.includes(translation.languageCode)
  }

  const items: { languageCode: string; languageName: string }[] = []
  const codes = new Set<string>()

  for (const t of translations.value) {
    if (!codes.has(t.languageCode) && extraChecker(t)) {
      codes.add(t.languageCode)
      items.push({
        languageCode: t.languageCode,
        languageName: t.languageName,
      })
    }
  }

  return items.sort((a, b) => a.languageName.localeCompare(b.languageName))
})

async function load() {
  await Promise.all([
    fetchTranslations().then((v) => (translations.value = v)),
    getInstalledTranslations().then((v) => (installedTranslations.value = v)),
  ])
  console.log("Translations loaded")
}

load()
</script>

<style></style>
