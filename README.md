# Naviox Vue

Beautiful, accessible-minded command and navigation components for **Vue 3**. Powered by the standalone TypeScript engine [`@blcklab/naviox`](https://www.npmjs.com/package/@blcklab/naviox).

Includes a keyboard-first **command palette**, a **preview-rich mega-menu**, and an **autocomplete**. Keep the minimalist Ink theme, use soft Sakura or cinematic Nocturne, or bring your own colors and content.

Version: `@blcklab/naviox-vue@0.1.0-alpha.16` (prerelease).

## Install

```bash
npm install @blcklab/naviox-vue@next
```

For prereleases, use `@next`; after a stable release, use `npm install @blcklab/naviox-vue`. The adapter installs the compatible `@blcklab/naviox` core automatically. Your existing Vue 3 application supplies the framework peer dependency. No second Naviox installation is needed. If the adapter has not yet been published, develop from its source repository instead.

## Try it

```vue
<script setup lang="ts">
import { NavioxPalette, NavioxMegaMenu, NavioxAutocomplete } from '@blcklab/naviox-vue'
import '@blcklab/naviox-vue/styles.css'

const items = [
  { id: 'about', title: 'About', href: '/about', group: 'pages' },
  { id: 'craft', title: 'My craft', href: '/work', group: 'pages' },
]
const groups = [{ id: 'pages', title: 'Pages' }]
</script>

<template>
  <NavioxMegaMenu :items="items" :groups="groups" theme="sakura" />
  <NavioxPalette :items="items" theme="nocturne" variant="cinematic" />
  <NavioxAutocomplete :items="items" theme="ink" placeholder="Search pages…" />
</template>
```

Your items decide what users see; the components provide the interaction and appearance. Import the stylesheet **once**. No Vue or React code is included in the core package.

## Make it yours

Choose `ink`, `sakura`, `nocturne`, or `system`, then adjust colors, type, motion, density, radius, previews and result templates. Five palette layouts are available: `floating`, `minimal`, `compact`, `spotlight`, and `cinematic`.

For router-controlled navigation, pass `:navigate="(item) => router.push(item.href)"`. For extension-installed commands, you may supply an existing core `controller`; the caller remains responsible for disposing it.

## Documentation

[Start here](docs/index.md) · [Getting started](docs/getting-started.md) · [Components](docs/navigation.md) · [Theming](docs/customization.md) · [Public API](docs/public-api.md) · [Accessibility](docs/accessibility.md) · [Compatibility](docs/compatibility.md) · [Publishing](docs/publishing.md)

## Develop

```bash
npm install
npm run check
npm run demo:navigation:build
npm run test:ssr
```

Browser and axe audits can be run using `npx playwright install` and `npm run test:e2e`. These are important before publishing; they are separate from the minimal GitHub CI workflow.

The GitHub workflows are deliberately simple: `npm ci` and `npm run check` on push/PR, and tag-triggered npm publication with provenance. A **real committed `package-lock.json`** is needed before tagging. See [publishing](docs/publishing.md).

Each adapter has its own repository, releases and workflow. MIT · BLCK LAB.

## Build your own command interface

The M8.6 release adds an inline, composable command UI alongside `NavioxPalette`. Use `NavioxCommand`/`NavioxRoot` with `NavioxCommandInput`, `NavioxCommandList`, `NavioxCommandGroup`, `NavioxCommandItem`, `NavioxCommandEmpty`, `NavioxCommandLoading`, `NavioxCommandSeparator`, and `NavioxCommandShortcut`. See the [primitives guide](docs/composable-command.md).

For full customization, supply `theme="ink"` for a modern neutral look, choose `sakura` or `nocturne`, or override design tokens. Vim navigation, group jumps, RTL direction and force-mounted items are opt-in.

## Flexible palette composition (next prerelease)

You can move the search bar, remove its divider, disable backdrop blur, and reposition the preview panel without changing the core. See [palette composition](docs/palette-composition.md) for all props, slots and styling tokens.

## Custom result rows and preview anatomy

See [Palette anatomy](docs/palette-anatomy.md) for native colored icon tiles, thumbnails, search placement, row geometry, preview visibility and responsive styling controls.
