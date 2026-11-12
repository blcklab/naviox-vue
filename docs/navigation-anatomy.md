# Make navigation look like your application

`NavioxMegaMenu` and `NavioxAutocomplete` use the same core search and command engine as `NavioxPalette`. Starting with the alpha.17 source candidate, they also accept an optional, typed `anatomy` configuration and per-item `visuals`.

You still install **only** the Vue adapter:

```sh
npm install @blcklab/naviox-vue@next
```

Import the stylesheet once and create ordinary Vue values:

```vue
<script setup lang="ts">
import {
  NavioxMegaMenu, NavioxAutocomplete,
  defineNavioxMegaMenuAnatomy, defineNavioxAutocompleteAnatomy,
} from '@blcklab/naviox-vue'
import '@blcklab/naviox-vue/styles.css'

const items = [
  { id: 'docs', title: 'Docs', group: 'Pages', href: '/docs', description: 'Read the guide' },
  { id: 'craft', title: 'My craft', group: 'Pages', href: '/work' },
]
const visuals = {
  docs: { mode: 'tile', icon: 'book', background: '#4b83ee', foreground: '#fff', badge: 'Page' },
  craft: { mode: 'thumbnail', image: '/assets/craft.webp', badge: 'Work' },
}
const menuAnatomy = defineNavioxMegaMenuAnatomy({
  row: { iconSize: '40px', iconShape: 'rounded', showDescription: true, showBadge: true },
  panel: { width: '760px', previewPlacement: 'left', accentLine: false },
  preview: { showArtwork: true, showMetadata: false, titleFont: 'sans' },
})
const autoAnatomy = defineNavioxAutocompleteAnatomy({
  field: { height: '58px', surface: 'outlined', iconPosition: 'end', clearable: true },
  panel: { placement: 'above', maxHeight: '300px', footerDivider: false },
  row: { iconSize: '36px', iconShape: 'circle', showBadge: true },
})
</script>

<template>
  <NavioxMegaMenu :items="items" :visuals="visuals" :anatomy="menuAnatomy" />
  <NavioxAutocomplete :items="items" :visuals="visuals" :anatomy="autoAnatomy" />
</template>
```

**Not every design needs a new flavor.** A flavor combines default theme, geometry, search and preview behavior. Set all of that using ordinary Vue data; no global registration is needed.

## What you can change

- **Menu panel:** width, maximum height, preview location (`left`, `right`, `bottom`), preview width, accent line and footer divider.
- **Result rows:** minimum height, padding, gap, radius, icon size, icon shape, descriptions, badges, shortcuts and trailing arrow.
- **Preview:** artwork, description, metadata, padding, image ratio, image fit and serif/sans title.
- **Autocomplete field:** height, radius, padding, icon at start/end/none, clear button and `plain`/`filled`/`outlined` surface.
- **Autocomplete popup:** above or below the input, width, max height, horizontal alignment, footer divider.
- **Item icons:** plain SVG, monogram, colored tile, outlined icon or thumbnail via `visuals[id]`.

For completely custom content, use `#item`, `#itemIcon`, `#preview` and `#footer` slots. Slots take precedence over default anatomy. The styles expose stable `data-naviox-part` markers and documented `--nx-mega-*` / `--nx-auto-*` CSS variables. They do not require consumers to target private class selectors.

## Behavior and limitations

MegaMenu is a disclosure, not a modal dialog. Autocomplete is a combobox: its suggestions are positioned relative to the input. The `above` placement is an explicit choice; it doesn't automatically detect viewport collisions yet. The preview is hidden at narrow mobile widths, even when placed on the left or bottom, to keep navigation accessible. The underlying Naviox core is unchanged.

Set `anatomy` and `visuals` reactively to switch among macOS-inspired, Windows-inspired, Linux-inspired and BLCK LAB compositions. Existing consumers without these props retain their default behavior.
