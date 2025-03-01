import { ref } from "vue"
import { getInstalledTranslations } from "../utils/io"

const translations = {
  installedTranslations: ref<string[]>(),
  selectedTranslations: ref<string[]>([]),

  async loadInstalledTranslations() {
    this.installedTranslations.value = await getInstalledTranslations()
  },

  isEnabled(translationId: string) {
    return this.selectedTranslations.value.includes(translationId)
  },

  enable(...translationIds: string[]) {
    this.selectedTranslations.value?.push(
      ...translationIds.filter((id) => !this.selectedTranslations.value?.includes(id)),
    )
  },
  disable(...translationIds: string[]) {
    this.selectedTranslations.value = this.selectedTranslations.value?.filter(
      (id) => !translationIds.includes(id),
    )
  },
}

export const useTranslations = () => translations
