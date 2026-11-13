## 0.1.0-alpha.18 — M9.2 layout corrections

- Fixed preview-disabled layouts reserving an empty column with alternate preview placement.
- Fixed the ordering of custom footer slots when search is positioned at the bottom.
- Preserved contrast of plain icons when tile visuals include a white foreground.
- Improved bottom-preview height for stacked/Aurora-style layouts.
- Includes the MegaMenu/Autocomplete anatomy work of alpha.17, with no new core dependency.

## 0.1.0-alpha.16 — Palette anatomy and native result visuals

- Added typed `anatomy` and `visuals` options for the default palette, with colored icon tiles, image thumbnails, monograms, badges, controllable row geometry and preview anatomy.
- Added more built-in icon shapes and stable semantic `data-naviox-part` hooks.
- Preserved existing slots/render callbacks and the published core dependency without a breaking change.
- Added [Palette anatomy guide](docs/palette-anatomy.md). Not yet published; full framework builds require registry access.

## 0.1.0-alpha.16 — Palette composition and backdrop controls (unpublished)

- Search top/bottom/custom placement, divider and surface style.
- Blur, dim-only, or transparent backdrop options; preview left/right/bottom.
- Public search/item icon rendering hooks and appearance design tokens.
- Backward compatible with the previous adapter API and unchanged Naviox core.

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
