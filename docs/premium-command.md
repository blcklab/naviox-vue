# Precision launcher and contextual actions (M9.5)

The opt-in **Precision** preset offers compact rows, matte surfaces and a contextual action subview. It is not an OS launcher and cannot control local apps or browser tabs without a host-specific integration.

```vue
<script setup lang="ts">
import { NavioxPalette, navioxPrecisionFlavor } from '@blcklab/naviox-vue'
import type { NavioxContextAction, NavioxItem } from '@blcklab/naviox-vue'
import '@blcklab/naviox-vue/styles.css'

const items: NavioxItem[] = [
  { id: 'docs', title: 'Documentation', group: 'Favorites', href: '/docs' },
  { id: 'project', title: 'Project', group: 'Suggestions', href: '/project' },
]
const contextActions = (item: NavioxItem): NavioxContextAction[] => [
  { id: 'copy', title: 'Copy title', group: 'Clipboard', shortcut: 'Mod+C',
    perform: async () => navigator.clipboard.writeText(item.title) },
  { id: 'save', title: 'Save for later', group: 'Workspace',
    perform: () => console.log('Save', item.id) },
]
</script>

<template>
  <NavioxPalette v-bind="navioxPrecisionFlavor" :items="items"
    :context-actions="contextActions" placeholder="Search for apps and commands…" />
</template>
```

### Interaction

- Open the palette using its `Mod+K` shortcut. **When the palette is already open**, `Mod+K` opens the current item's actions instead of closing the palette (only when actions exist).
- Arrow Up/Down or Home/End navigates enabled actions; Enter runs the focused action. `Escape` returns focus to the original search instead of closing the palette.
- Search within actions with the bottom action input. In that subview, any action's optional `shortcut` (e.g. `Mod+C`) is also active.
- `perform(item)` may return a Promise. Pending state is displayed; rejected actions remain open and show an error. `action` emits after successful completion.
- Override the `#action` slot to render custom rows, or the `#footer` slot to place the `openActions()` control anywhere. The `NavioxPalette` instance also exposes `openActions()`/`closeActions()`.
- Pass an empty `actionShortcut` to disable the global contextual action shortcut. `showGroupControls="false"` hides the optional collapsible group navigation but keeps grouped results.

### Limitations and accessibility

These actions are provided by your application, **not** by the headless core. No native app switching, browser tab control, OS file search, or AI functionality is provided automatically. Clipboard actions require browser support and appropriate permissions. Treat any user-provided URLs as untrusted. Contextual action rows use combobox/listbox semantics; the underlying palette is inert while the subview is active. Use real keyboard and assistive-technology testing before production. Reduced-motion preferences disable the transition.
