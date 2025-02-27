export interface ViewTypes {
  download: "download"
  installed: "installed"
}
export type AllViewTypes = keyof ViewTypes
export const ViewType = {
  download: "download",
  installed: "installed",
} as Readonly<ViewTypes>
