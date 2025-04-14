import { appDataDir, resolve } from "@tauri-apps/api/path"

const paths = {
  data: {
    translations: "translations/",
    translationList: "translations.msgpack",
  },
}

await initPaths(paths)

async function initPaths(paths: { data: { [path: string]: string } }) {
  const dir = await appDataDir()
  for (const key in paths.data) {
    paths.data[key] = await resolve(dir, paths.data[key])
  }
}

export { paths }
