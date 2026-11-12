# Public API

Import components and helpers from `@blcklab/naviox-vue`. Import the stylesheet separately from `@blcklab/naviox-vue/styles.css`. Internal source paths are not public APIs.

| Export | Use |
|---|---|
| `NavioxPalette` | Modal command palette and action launcher |
| `NavioxMegaMenu` | Grouped navigation with live previews |
| `NavioxAutocomplete` | Inline fuzzy search and async suggestions |
| `useNaviox` | Controller bridge for building a custom UI |
| `defineNavioxTheme` | Define your own themed visual tokens |
| `resolveNavioxTheme` | Resolve a selected theme configuration |
| `navioxHexRgb`, `navioxThemeClass`, `defaultSystemThemes` | Theme utilities |

TypeScript definitions include `NavioxPaletteProps`, theme and appearance types, and re-exports of common core types (`NavioxController`, `NavioxItem`, `NavioxGroup`, `NavioxOptions`, `NavioxState`, `NavioxProvider`). See the package declarations for the exact set of exported types.

## Which props do I need?

For a basic setup, use `items` and `theme`. For advanced behavior, pass `controller` and (where appropriate) `options` containing provider configuration. A `navigate` callback hands routing to the host application. Each component accepts its own rendering controls; see [Components](navigation.md).

## Controller ownership

When a component creates its own core controller it cleans it up on unmount. When you pass an existing controller, **your code owns it**. Share a controller to share its commands and state; create separate controllers for independent search surfaces.

Plugin registration, execution, providers, and core shortcut semantics are documented by the [headless core](https://www.npmjs.com/package/@blcklab/naviox). Avoid importing adapter implementation files directly.

Read [Getting started](getting-started.md) and [Compatibility](compatibility.md).

## M8.6 — Composable command UI

`NavioxCommand` (alias `NavioxRoot`) is an **inline** command root with its own controller unless one is injected. `NavioxCommandDialog`/`NavioxDialog` are aliases of the existing ready-made modal `NavioxPalette`—they are not compound child containers.

Compose `NavioxCommandInput`, `NavioxCommandList`, `NavioxCommandGroup`, `NavioxCommandItem`, `NavioxCommandSeparator`, `NavioxCommandEmpty`, `NavioxCommandLoading`, and `NavioxCommandShortcut`. For large fixed-row-height collections use `NavioxCommandVirtualList` with root-provided `items`.

The underlying `NavioxItem` and `NavioxGroup` remain **types from the core**; to avoid value/type export collisions the component aliases are `NavioxItemPrimitive` and `NavioxGroupPrimitive`.

Search/selection can be synchronized with host state. Filtering, group jumps, optional Vim keys, force-mounted DOM, direction, and themes are documented in [Composable command](composable-command.md). Rendering extensions remain in each adapter; the core package and its API are unchanged.
