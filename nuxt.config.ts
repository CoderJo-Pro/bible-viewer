import { defineNuxtConfig } from "nuxt/config"
import { resolve } from "path"
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  srcDir: "src/",
  ssr: false,
  devServer: { host: process.env.TAURI_DEV_HOST || "localhost" },
  vite: {
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
    server: {
      strictPort: true,
    },
    plugins: [tailwindcss()],
  },

  alias: {
    "@": resolve(__dirname, "src/assets"),
  },
  css: ["~/assets/css/main.css"],
})