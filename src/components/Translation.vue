<template>
  <label class="w-full flex items-center gap-4 select-none">
    <input
      v-if="props.type === ViewType.installed"
      type="checkbox"
      class="checkbox checkbox-primary"
      v-model="selected"
    />
    <div class="grow font-bold">
      {{ props.record.title }}
    </div>
    <button class="btn btn-soft capitalize" :class="btnType" @click="action">
      {{ btnAction }}
    </button>
  </label>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { installTranslation, type TranslationRecord } from "../utils/io"
import { useTranslations } from "../composables/useTranslations"
import { AllViewTypes, ViewType } from "../utils/translation-manage-types"

const props = defineProps<{
  type: AllViewTypes
  record: TranslationRecord
}>()

const translations = useTranslations()

const selected = ref(translations.isEnabled(props.record.translationId))
const btnAction = computed(() => {
  return {
    [ViewType.download]: "Install",
    [ViewType.installed]: "Uninstall",
  }[props.type]
})
const btnType = computed(() => ({
  "btn-success": props.type === ViewType.download,
  "btn-error": props.type === ViewType.installed,
}))

async function action() {
  switch (props.type) {
    case ViewType.download:
      await installTranslation(props.record.translationId)
      useTranslations().loadInstalledTranslations()
      break

    case ViewType.installed:
      break
  }
}

watch(selected, (value) => {
  if (value) {
    translations.enable(props.record.translationId)
  } else {
    translations.disable(props.record.translationId)
  }
  console.log(translations.selectedTranslations.value)
})
</script>

<style></style>
