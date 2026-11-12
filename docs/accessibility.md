# Keyboard and accessibility

Naviox is designed for keyboard-first navigation. The palette uses a native dialog, accessible search results and active-option announcements. The mega-menu exposes regular site navigation links, while autocomplete uses combobox/listbox semantics.

## Expected keyboard behavior

- **Arrow Up / Down:** move between available results
- **Enter:** activate the current command or link
- **Escape:** close the menu or dialog
- **Tab / Shift+Tab:** move focus through available controls; dialogs keep focus inside
- **Home / End:** move to the first/last supported item in menus

Disabled results are not executable. Read-only results can be previewed without running their actions. The stylesheet responds to reduced-motion and high-contrast/forced-colors settings.

## What to test in your application

Before a public release, test keyboard-only operation, focus restoration, touch, screen readers, the host router and theme contrast. We keep automated Playwright + axe and SSR smoke tests in the repository:

```bash
npm run demo:navigation:build
npm run test:ssr
npx playwright install chromium firefox webkit
npm run test:e2e
```

These tests require genuine installed framework dependencies and browser executables. They are **not run automatically** by the intentionally minimal CI workflow. Passing source tests alone does not establish WCAG conformance.

For custom templates, preserve the semantic roles, accessible labels and focus management described in [Components](navigation.md).

## M8.6 inline commands

Inline commands use a combobox input with an `aria-controls` listbox and `aria-activedescendant` pointing to the selected visible option. Hidden force-mounted options are not keyboard-focusable. Keyboard activation invokes item-level selection callbacks as well as root callbacks. Separators are presentational. The virtualized list scrolls the active option into the DOM; it assumes fixed-height rows and may be unsuitable for highly variable content.

Unlike `NavioxPalette`, inline components do not trap focus. For an accessible modal use `NavioxPalette` and test it alongside the rest of your application. Basic RTL direction is supported; manual testing with your target language, browser and screen reader remains essential.
