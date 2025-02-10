# Bible Viewer

This is a Bible viewer based on [Tauri](https://tauri.app/) with the [Nuxt](https://nuxt.com/) frontend framework. It downloads bible versions from [ebible.org](https://ebible.org/) to local disk storage and displays them in a responsive and user-friendly interface.

## How to Build and Run

For more information on how to work with the project, see the [Tauri documentation](https://tauri.app/start/) and [Nuxt documentation](https://nuxt.com/docs/getting-started/installation)

### Prerequisites

- Node.js
- Tauri CLI
- Rust
- Webview2 runtime

Remember to install the npm dependencies before running the project.

```sh
# Get inside the repository
cd bible-viewer
# Install dependencies
npm install
```

### Run the project

You can launch the project in development mode by running the following command:

```sh
npm run tauri dev
```

### Build Steps

You can build the project for production by running the following command:

```sh
npm run tauri build
```

The built executable will be located at `src-tauri/target/release`.

## Development

### TODOs

The TODOs is a set of short period goals of features or tasks that need to be completed.

- Add UI support for managing bible versions
- Add support for parsing passage references for multiple languages

### Roadmap

Roadmap is a set of long-term goals or milestones that the project is aiming for.

- Replace the `usfm-js` library with a more robust and feature-rich library for parsing and manipulating the USFM documents.
- Migrate this npm-based project to the newer Deno technology
