# Components

These three components use the same `@blcklab/naviox` engine but solve different navigation tasks.

## Command palette: `NavioxPalette`

A keyboard-first dialog for finding pages, executing actions, and navigating nested command pages. It supports grouped results, live previews, async status, favorites and custom content. Use the `shortcut` prop to change its hotkey.

```vue
<template>
  <NavioxPalette :items="items" theme="system" variant="spotlight" />
</template>
```

The `variant` prop changes presentation, not search behavior: `floating`, `minimal`, `compact`, `spotlight`, or `cinematic`.

## Mega-menu: `NavioxMegaMenu`

A grouped navigation disclosure with a contextual preview column. Suitable for project indexes and site navigation. Pass `items` and optional `groups`; define `preview` data on items or supply your own preview template.

- Hover intent and a click/touch trigger
- Arrow keys, Home, End and Escape navigation
- Optional controlled disclosure and router interception
- Optional `controller` to surface extension-registered actions

Items with an `href` behave like links. With a shared controller, registered actions can execute even if the palette is closed; without one, use the menu's selection callback for application work.

## Autocomplete: `NavioxAutocomplete`

An inline search box with fuzzy matching, arrow-key navigation, result limits and async-provider states. Use it for projects, pages, tags or commands. For remote suggestions, pass the core provider configuration through `options`.

You can control text with `v-model` (autocomplete query), `:model-value` and `@update:model-value` (dialog/menu visibility). Result caps apply to keyboard selection as well as visual rendering.

## Custom content

In Vue, you can use the `trigger`, `header`, `content`, `item`, `preview`, `empty`, and `footer` slots. For a completely custom view, start with the `useNaviox()` composable.

## Navigation and safety

Items marked disabled cannot be activated. Read-only items can be inspected without running commands. Avoid passing untrusted destinations as links. The package includes URL validation, but apps should still control what routes/actions they allow.

Read [Getting started](getting-started.md), [Customization](customization.md), and [Accessibility](accessibility.md) for more details.
