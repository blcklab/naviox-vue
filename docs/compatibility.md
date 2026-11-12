# Compatibility

This release uses:

- Adapter: `@blcklab/naviox-vue@0.1.0-alpha.16` (prerelease)
- Headless core: `@blcklab/naviox@0.1.0-alpha.7` (normal dependency)
- Framework: Vue 3.5 or newer (peer dependency)
- Node.js 20 or later for development and build tools

The adapter is its **own npm package and Git repository**. It depends only on the public core API and does not import the other framework adapter. There is no monorepo or shared workspace.

## Server rendering and browser behavior

Browser APIs are accessed by the mounted components; the headless core is framework-neutral. Server rendering and hydration should still be tested in the host framework (for example, Next.js, Nuxt, Vite SSR) before production deployment.

## Prerelease expectations

Alpha APIs may change before a stable release. Keep exact prerelease versions pinned during evaluation, and read the changelog when upgrading.

Our local evaluation does not replace a clean framework installation, browser test matrix or manual assistive-technology testing. See [Accessibility](accessibility.md) and [Publishing](publishing.md).
