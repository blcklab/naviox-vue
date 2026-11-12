# Compose an inline command menu

`NavioxPalette` is the complete modal experience. For your own layout, start with the composable `NavioxCommand` root. Its Input, List, Group, Item, Empty, Loading, Separator, and Shortcut components use the same headless controller as the palette.

```vue
<script setup lang="ts">
import {
  NavioxCommand, NavioxCommandInput, NavioxCommandList,
  NavioxCommandGroup, NavioxCommandItem, NavioxCommandEmpty,
} from '@blcklab/naviox-vue'
import '@blcklab/naviox-vue/styles.css'

const pages = [
  { id: 'home', title: 'Home', href: '/' },
  { id: 'work', title: 'My craft', href: '/work', keywords: ['portfolio', 'projects'] },
]
</script>

<template>
  <NavioxCommand theme="ink" dir="ltr" vim-navigation group-navigation>
    <NavioxCommandInput placeholder="Search anything…" />
    <NavioxCommandList :max-height="320" animated-height>
      <NavioxCommandGroup id="pages" heading="Pages">
        <NavioxCommandItem v-for="page in pages" :key="page.id" :item="page">
          {{ page.title }}
        </NavioxCommandItem>
      </NavioxCommandGroup>
      <NavioxCommandEmpty>No matching pages.</NavioxCommandEmpty>
    </NavioxCommandList>
  </NavioxCommand>
</template>
```

The root creates and disposes its own controller unless `:controller` is supplied. You may pass `:items` to the root, or declare items through the `NavioxCommandItem` primitive—do not duplicate the same ID between the two strategies. The command root is inline, not a modal, so it does not trap focus. Route execution uses the controller's `navigate` option.

For search controls use `v-model` (`modelValue`) and `v-model:activeId` to synchronize selected IDs with a parent. `:should-filter="false"` disables local fuzzy filtering, but normal page scopes/hidden items still apply. `vim-navigation` enables Ctrl+J/K on the input, and `group-navigation` enables Alt+Up/Down. `force-mount` keeps filtered DOM nodes mounted but hidden, never keyboard selectable.

`dir="rtl"` supports right-to-left layouts. Themed appearance remains optional: Ink (neutral), Sakura (warm), and Nocturne (cinematic). `animated-height` exposes `--nx-list-height` while respecting reduced-motion preference.

## Large lists

Use `NavioxCommandVirtualList` as an alternative to `NavioxCommandList` when the root owns a large `items` array. The virtual list uses the public `getNavioxVirtualWindow` helper and a fixed `itemHeight` estimate. It keeps only a window of rows in the DOM, scrolling to the active option so `aria-activedescendant` remains valid. Pass items to the root instead of declaring individual `NavioxCommandItem` components. For variable-height rows, use the regular list or supply your own renderer.
