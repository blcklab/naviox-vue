# Customizing the Naviox command palette

The Vue adapter owns visual rendering. Naviox's framework-free core remains unchanged.

## Common options

| Option | Values | Default |
| --- | --- | --- |
| `searchPosition` | `top`, `bottom`, `custom` | `top` |
| `searchDivider` | `true`, `false` | `true` |
| `searchStyle` | `plain`, `filled`, `outlined` | `plain` |
| `showSearchIcon` | `true`, `false` | `true` |
| `showDismiss` | `true`, `false` | `true` |
| `backdrop` | `blur`, `dim`, `none` | `blur` |
| `previewPlacement` | `right`, `left`, `bottom` | `right` |

- `backdrop="blur"` uses dimming plus background blur (existing behavior).
- `backdrop="dim"` darkens without blurring the application.
- `backdrop="none"` leaves the application visually unchanged behind the dialog (the native modal still blocks interaction).
- `searchDivider={false}` suppresses the horizontal divider. A subtle inset focus ring remains available.
- `searchPosition="custom"` allows placing the **one** built-in search field inside a custom header/content renderer. If no custom renderer is given, it falls back to the top position.

## Styling tokens

Custom `defineNavioxTheme({ tokens: {...} })` definitions accept `searchSurface`, `searchBorder` and `backdropColor` in addition to the existing theme tokens. Override per instance through `appearance`:

```ts
const appearance = {
  searchBackground: 'transparent',
  searchBorderColor: '#ddd',
  searchHeight: '60px',
  searchFontSize: '14px',
  searchPadding: '18px',
  previewWidth: '42%',
  backdropColor: 'rgba(10, 10, 20, .35)',
  backdropBlur: '4px',
};
```

## Anatomy and icons

- Vue: `#searchIcon`, `#itemIcon` slots provide individualized icons without replacing the entire row. `#search` accepts the internally managed `input` VNode, so a new search layout can retain native focus, combobox ARIA and keyboard navigation. `#content`/`#header` receive `search` for custom placement.
- React: `renderSearchIcon`, `renderItemIcon`, and `renderSearch` provide the same capabilities. The `renderSearch` callback receives the internally managed `input`. `renderContent`/`renderHeader` receive `search` for custom placement.
- If writing custom search chrome, **render the supplied input exactly once** and preserve its label. Avoid introducing a second competing combobox.
- Use item and preview slots/render callbacks to create completely distinct flavor compositions. This is not limited to color presets.

## Compatibility

All new options are optional. Existing palettes retain the top search field, divider, blur backdrop and right preview. No modification to `@blcklab/naviox` is required.

## Reusable full-composition flavors

Unlike a color-only theme, `defineNavioxFlavor()` groups the layout, input anatomy, preview geometry, backdrop and theme in one typed object:

```ts
import { defineNavioxFlavor } from '@blcklab/naviox-vue';

const spotlight = defineNavioxFlavor({
  theme: 'ink',
  variant: 'spotlight',
  preview: false,
  searchPosition: 'top',
  searchDivider: false,
  searchStyle: 'plain',
  backdrop: 'dim', // no blur
  appearance: { searchHeight: '64px', radius: '18px' },
});
```

Spread the result into your component (`v-bind="spotlight"` in Vue, `{...spotlight}` in React). For completely custom arrangements, combine this with public slots/render callbacks or the composable command primitives. Flavors do not register globally and do not alter engine behavior.
