# Changelog

Changes worth knowing about when using Naviox Vue. For detailed milestone history, see the maintainers' internal notes.

## 0.1.0-alpha.14 — M8.6 composable command primitives

- Introduced a first-class inline command API (Root, Input, List, Group, Item, Empty, Loading, Separator, Shortcut and optional fixed-height virtualization).
- Added optional Vim keys, group jumping, local filtering overrides, force-mounted elements, RTL and list-height transitions.
- Preserved the modal palette, mega-menu, and autocomplete APIs and pinned core dependency.
- No changes to framework-independent core.

## 0.1.0-alpha.13 — First publication candidate

- Prepared the independent Vue package for a simple tag-based npm release.
- Added publication-ready getting-started, components, theming, accessibility and API documentation.
- Kept the full component feature set and public core dependency at `@blcklab/naviox@0.1.0-alpha.7`.
- No runtime component behavior or public API changes in this documentation/repository cleanup.

## 0.1.0-alpha.11–alpha.12 — Accessibility and API clarity

- Improved accessible result groups, keyboard focus handling and autocomplete navigation.
- Clarified controller ownership, public exports and compatibility guidance.

## 0.1.0-alpha.7–alpha.10 — Navigation and extension integration

- Added the preview-rich mega-menu and contextual autocomplete.
- Supported extension-installed commands through the shared Naviox controller.
- Improved mobile positioning and async command handling.

## 0.1.0-alpha.4–alpha.6 — Vue adapter and themes

- Introduced the independent Vue 3 command palette and `useNaviox()` composable.
- Added Ink, Sakura, and Nocturne themes, custom named themes and system colors.
- Added customizable layouts, slots, motion and responsive behavior.
