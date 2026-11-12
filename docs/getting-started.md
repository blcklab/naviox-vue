# Get started with Naviox Vue

Naviox separates navigation behavior from the UI. This adapter provides the components; `@blcklab/naviox` supplies search, commands, groups, providers and extensions.

## 1. Install

```bash
npm install @blcklab/naviox-vue@next
```

The adapter automatically installs its required `@blcklab/naviox` core dependency. If you're adding it to an existing Vue 3 project, there is no need to install the core or framework again. For stable versions (once released), install without `@next`: `npm install @blcklab/naviox-vue`. The `@next` tag becomes available after the adapter is published; for local development of this repository, run `npm install`.

## 2. Import the stylesheet and render a component

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

The palette is a dialog, the mega-menu is a navigation disclosure, and autocomplete lives beside an input. You can use one or all three.

## 3. Add navigation behavior

When an item has an `href`, the components can use ordinary links. To use a client-side router, supply `:navigate="(item) => router.push(item.href)"` and return the navigation behavior that your app needs.

An externally created Naviox controller can be passed to multiple components using the `controller` prop. **Shared controller means shared query, page, and open state.** Use separate controllers for independent search fields and dispose of controllers you create.

Next: [Components](navigation.md), [Customization](customization.md), or the [Public API](public-api.md).
