# Palette anatomy and result visuals

Naviox keeps commands, ranking, providers and actions in the standalone `@blcklab/naviox` engine. Presentation belongs to your framework adapter. Install **only** the adapter in a normal app; it installs the core automatically.

The ready-made palette has two new, optional and reactive props: `anatomy` defines how its standard search, result rows and preview are presented, and `visuals` maps item IDs to icons, thumbnails and badges. These are **adapter props**, not new core command fields. No private CSS selectors or separate package are required.

## Native icon tiles and result rows

```vue
<script setup lang="ts">
import { NavioxPalette, defineNavioxAnatomy } from '@blcklab/naviox-vue'
import '@blcklab/naviox-vue/styles.css'

const items = [
  { id: 'home', title: 'Home', description: 'Back to the start', group: 'Pages', href: '/' },
  { id: 'work', title: 'My craft', description: 'Explore projects', group: 'Pages', href: '/work' },
]
const visuals = {
  home: { mode: 'tile', icon: 'home', background: '#4b83ee', foreground: '#fff', badge: 'Page' },
  work: { mode: 'thumbnail', image: '/project-thumb.png', imageAlt: '', badge: 'Project' },
}
const anatomy = defineNavioxAnatomy({
  search: { iconPosition: 'end', clearable: true },
  row: { iconSize: '38px', iconShape: 'rounded', minHeight: '58px', showBadge: true },
  preview: { imageAspectRatio: '16 / 9', imageFit: 'cover', showActions: false, titleFont: 'sans' },
})
</script>
<template>
  <NavioxPalette :items="items" :visuals="visuals" :anatomy="anatomy"
    :search-divider="false" backdrop="dim" theme="ink" />
</template>
```

## Available controls

| Part | Public options |
|---|---|
| Search | `iconPosition` start/end/none, `clearable`, `gap` |
| Result row | `minHeight`, `padding`, `gap`, `radius`, `iconSize`, `iconShape`, `showDescription`, `showShortcut`, `showTail`, `showMarkers`, `showBadge` |
| Preview | `showArtwork`, `showDescription`, `showMetadata`, `showActions`, `padding`, `imageAspectRatio`, `imageFit`, `titleFont` |

`visuals[id]` accepts `mode` (tile, outline, plain, monogram, thumbnail), `icon` (a built-in icon name), `image`, `imageAlt`, `monogram`, `background`, `foreground`, `borderColor`, and `badge`. A result without a visual entry keeps the previous default icon. Use the `itemIcon` slot (Vue) or `renderItemIcon` (React) for any external SVG/icon library, arbitrary icon component or animated content. A complete `item` slot/`renderItem` replaces the **entire** row, including anatomy-managed content.

## Stable styling API

Styling is scoped to each palette instance. For bespoke visual systems, customize `appearance`, define a theme with `defineNavioxTheme`, or set tokens on the dialog using `anatomy`. The adapter exposes stable semantic attributes `data-naviox-part="search"`, `item`, `icon`, `results`, `preview` and `preview-art`. Do not depend on private class naming. Tokens include `--nx-row-height`, `--nx-row-padding`, `--nx-row-gap`, `--nx-row-radius`, `--nx-item-icon-size`, `--nx-search-gap`, `--nx-preview-padding`, `--nx-preview-art-ratio`, `--nx-preview-image-fit`, and `--nx-preview-title-font`.

For more radical layouts, use the existing `search`, `content`, `item`, `itemIcon`, `preview`, and `footer` slots (Vue), or equivalent `render*` functions (React). A custom `search` implementation should reuse the supplied input to preserve combobox semantics and keyboard behavior. `searchPosition="custom"` remains available. `backdrop="blur"`, `"dim"`, and `"none"` are independent of palette anatomy. The input field never automatically blurs the page unless you choose `backdrop="blur"`.

## Compatibility and security

These are additive APIs. Defaults preserve the previous appearance. No core API changes or extra runtime dependencies are needed. Images are rendered with ordinary `<img>` tags; prefer assets you control, including for sensitive documents or local/private user data. No arbitrary HTML is injected.
