# Themes and customization

Naviox looks good out of the box but doesn't lock you into one style. The built-in appearances are **Ink** (quiet/light), **Sakura** (warm/pink), and **Nocturne** (dark/cinematic). Use `theme="system"` to follow the user's OS light/dark preference.

## Define a theme

```ts
import { defineNavioxTheme } from '@blcklab/naviox-vue'

export const aurora = defineNavioxTheme({
  colorScheme: 'dark',
  tokens: { surface: '#121820', text: '#ecf6f9', accent: '#89d7cd' },
})
```

```vue
<NavioxPalette :items="items" theme="aurora" :themes="{ aurora }" />
```

Use a unique name per theme and pass it via `themes`. The theme is scoped to the component instance; it doesn't change the entire application.

## Adjust appearance

Change font, accent, radius, spacing density and motion through the `appearance` prop. The palette also accepts a `variant`: `floating`, `minimal`, `compact`, `spotlight`, or `cinematic`.

Most of the built-in CSS is driven by variables prefixed with `--nx-`. Import `styles.css` before your own stylesheet, or use `appearance`/custom theme tokens. Avoid overriding the same token via both props and CSS at the same time.

## Preview and item templates

In Vue, you can use the `trigger`, `header`, `content`, `item`, `preview`, `empty`, and `footer` slots. For a completely custom view, start with the `useNaviox()` composable.

## Animations and accessibility

Effects are restrained by default and the stylesheet respects `prefers-reduced-motion`. System-themed components may render with the light preset on the server until the browser determines the OS preference; test hydration in your application.

Continue with [Components](navigation.md) or the [Public API](public-api.md).
