# Publish this adapter

The Vue and React adapters have **independent repositories and version numbers**. This guide applies to `@blcklab/naviox-vue@0.1.0-alpha.14`. The headless core `@blcklab/naviox@0.1.0-alpha.7` must be available on npm before installing this repository's dependencies.

## Prepare

On a connected development machine, in the adapter's own repository:

```bash
npm install
npm ci
npm run check
npm run demo:build
npm run demo:navigation:build
npm run test:ssr
npx playwright install chromium firefox webkit
npm run test:e2e
npm run pack:dry
```

Commit the generated **`package-lock.json`**; do not commit `node_modules/` or `dist/`. The lockfile isn't included in this source archive because npm registry access was unavailable during preparation, and creating a fabricated lockfile would break `npm ci`.

## GitHub Actions

`.github/workflows/ci.yml` tests Node.js 20, 22 and 24 using `npm ci` and `npm run check` for pushes and pull requests. `.github/workflows/publish.yml` runs after you push a matching version tag. It repeats `npm ci` and `npm run check`, checks the tag against `package.json`, and publishes with npm provenance.

Versions containing a hyphen (alpha, beta, rc) get npm's **`next`** tag. Stable versions get **`latest`**. The tag must match the package version exactly.

Configure a GitHub Actions environment named `npm` and the `NPM_TOKEN` secret with the right permissions (or configure the authentication method you use for trusted publishing). Do not tag until your CI and the additional browser/SSR checks above are green.

## Publish

```bash
git add .
git commit -m "Prepare @blcklab/naviox-vue 0.1.0-alpha.14"
git push origin master
git tag v0.1.0-alpha.14
git push origin v0.1.0-alpha.14
```

The GitHub workflow performs the publication; there are no local version-bump or release scripts. If that version was already published, bump `package.json` before tagging—the npm registry doesn't permit overwriting a published version.

See [Compatibility](compatibility.md) and [Accessibility](accessibility.md) for testing notes.
