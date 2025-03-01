import { computed, reactive, ref } from "vue"
import { getInstalledTranslations } from "../utils/io"

const selectedTranslations = reactive(new Set<string>())

const translations = {
  installedTranslations: ref<string[]>(),
  selectedTranslations: computed(() => [...selectedTranslations.values()]),

  async loadInstalledTranslations() {
    this.installedTranslations.value = await getInstalledTranslations()
  },

  isEnabled(translationId: string) {
    return selectedTranslations.has(translationId)
  },

  enable(translationId: string) {
    selectedTranslations.add(translationId)
  },
  disable(translationId: string) {
    selectedTranslations.delete(translationId)
  },
}

export const useTranslations = () => translations
