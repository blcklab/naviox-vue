#!/usr/bin/env node
/**
 * One-time, offline-friendly source upgrade: @blcklab/naviox-vue alpha.17 -> alpha.18.
 * Applies M9.2 fixes if absent; preserves independently edited documentation;
 * updates the existing genuine lockfile's root version (never fabricates one).
 * Does not publish, install dependencies, or create a git tag.
 *
 * Usage (from naviox-vue repository root):
 *    node ../patches/prepare-naviox-vue-alpha18.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const changes = new Map();
const take = (file) => {
  const path = resolve(root, file);
  if (!existsSync(path)) throw Error(`Required file is missing: ${file}`);
  return readFileSync(path, 'utf8');
};
const stage = (file, value) => { if (!existsSync(resolve(root, file)) || take(file) !== value) changes.set(file, value); };
const ensureChange = (text, original, replacement, name) => {
  if (text.includes(replacement)) return text;
  if (!text.includes(original)) throw Error(`${name}: expected pre-fix source was not found. No files have been modified. Provide the current file for a targeted rebase.`);
  return text.replace(original, replacement);
};
const pkg = JSON.parse(take('package.json'));
if (pkg.name !== '@blcklab/naviox-vue') throw Error(`This is not naviox-vue (${pkg.name}).`);
if (!['0.1.0-alpha.17', '0.1.0-alpha.18'].includes(pkg.version)) throw Error(`Expected alpha.17 or alpha.18; found ${pkg.version}.`);
if (pkg.dependencies?.['@blcklab/naviox'] !== '0.1.0-alpha.7') throw Error('Expected unchanged pinned core 0.1.0-alpha.7.');
if (pkg.workspaces) throw Error('Expected independent adapter repository, not a monorepo.');

// Safety: do not produce a tag-ready looking source with a missing or fake lockfile.
const lock = JSON.parse(take('package-lock.json'));
if (lock.name !== pkg.name || lock.packages?.['']?.name !== pkg.name) throw Error('Unexpected package-lock root identity.');
if ((lock.lockfileVersion ?? 0) < 2) throw Error('Expected npm lockfile v2 or v3.');
if (!['0.1.0-alpha.17','0.1.0-alpha.18'].includes(lock.version) ||
    !['0.1.0-alpha.17','0.1.0-alpha.18'].includes(lock.packages[''].version)) throw Error('Unexpected lockfile root version.');
for (const dependency of Object.keys({...pkg.dependencies, ...pkg.devDependencies})) {
  const entry = lock.packages[`node_modules/${dependency}`];
  if (!entry?.version || !entry?.resolved?.startsWith('https://') || !entry?.integrity?.startsWith('sha')) {
    throw Error(`Lockfile has no real registry resolution/integrity for ${dependency}. Run npm install on a connected machine and retry.`);
  }
}

// M9.2 fix: retain caller colors for tiles, not for plain icons.
const paletteOld = "...(visual?.foreground ? { color: visual.foreground } : {}),";
const paletteNew = "...(visual?.foreground && mode !== 'plain' ? { color: visual.foreground } : {}),";
stage('src/components/NavioxPalette.ts', ensureChange(take('src/components/NavioxPalette.ts'), paletteOld, paletteNew, 'Palette icon contrast'));

let css = take('styles/naviox.css');
css = ensureChange(css,
  '.naviox-dialog.naviox-preview-bottom .naviox-preview { flex: 0 1 38%; min-height: 130px;',
  '.naviox-dialog.naviox-preview-bottom .naviox-preview { flex: 0 0 min(42%, 220px); min-height: 130px;',
  'Bottom preview size');
const noPreviewRule = '.naviox-dialog.naviox-no-preview .naviox-layout { display: grid; grid-template-columns: minmax(0,1fr); }';
if (!css.includes(noPreviewRule)) {
  const anchor = '.naviox-dialog.naviox-search-bottom .naviox-layout { order:1; }';
  if (!css.includes(anchor)) throw Error('No-preview CSS insertion anchor unavailable.');
  css = css.replace(anchor, '/* Preview off must consume no grid track. */\n' + noPreviewRule + '\n' + anchor);
}
const customFooterRule = '.naviox-dialog.naviox-search-bottom .naviox-shell > :last-child { order:5; }';
if (!css.includes(customFooterRule)) {
  const anchor = '.naviox-dialog.naviox-search-bottom .naviox-footer { order:5; }';
  if (!css.includes(anchor)) throw Error('Custom footer insertion anchor unavailable.');
  css = css.replace(anchor, anchor + '\n/* Custom footer slots may use a different class. */\n' + customFooterRule);
}
css = ensureChange(css,
  '.naviox-dialog .naviox-item-icon[data-naviox-mode="plain"] {background:transparent;border-color:transparent;}',
  '.naviox-dialog .naviox-item-icon[data-naviox-mode="plain"] {background:transparent;border-color:transparent;color:var(--nx-text);}',
  'Plain icon CSS');
stage('styles/naviox.css', css);

// Replace stale version assertions in the two integration tests. This remains future-proof.
for (const file of ['tests/m7_1-integration.test.mjs', 'tests/m8_3-public-api.test.mjs']) {
  const original = take(file);
  const updated = original.replace(/assert\.equal\(pkg\.version,\s*(['"])0\.1\.0-alpha\.\d+\1\);/g,
    'assert.match(pkg.version, /^\\d+\\.\\d+\\.\\d+(?:-[0-9A-Za-z.-]+)?$/);');
  if (!updated.includes('assert.match(pkg.version,') && /assert\.equal\(pkg\.version,/.test(updated)) {
    throw Error(`${file}: unrecognized version assertion; please inspect manually.`);
  }
  stage(file, updated);
}

const layoutTest = `import test from 'node:test'\nimport assert from 'node:assert/strict'\nimport { readFileSync } from 'node:fs'\nconst styles = readFileSync(new URL('../styles/naviox.css', import.meta.url), 'utf8')\nconst palette = readFileSync(new URL('../src/components/NavioxPalette.ts', import.meta.url), 'utf8')\ntest('preview=false overrides all alternative preview grid placements', () => {\n  assert.match(styles, /\\.naviox-dialog\\.naviox-no-preview\\s+\\.naviox-layout\\s*\\{\\s*display:\\s*grid;\\s*grid-template-columns:\\s*minmax\\(0,1fr\\)/)\n})\ntest('bottom search orders a custom footer slot regardless of its CSS classes', () => {\n  assert.match(styles, /\\.naviox-dialog\\.naviox-search-bottom\\s+\\.naviox-shell\\s*>\\s*:last-child\\s*\\{\\s*order:\\s*5/)\n})\ntest('plain icons preserve contrast when visuals specify white tile glyphs', () => {\n  assert.match(palette, /visual\\?\\.foreground\\s*&&\\s*mode\\s*!==\\s*'plain'/)\n  assert.match(styles, /\\[data-naviox-mode="plain"\\]\\s*\\{[^}]*color:var\\(--nx-text\\)/)\n})\n`;
if (!existsSync(resolve(root, 'tests/m9_2-layout-regression.test.mjs')))
  stage('tests/m9_2-layout-regression.test.mjs', layoutTest);

const releaseTest = `import test from 'node:test'\nimport assert from 'node:assert/strict'\nimport { readFileSync } from 'node:fs'\nconst file = (path) => readFileSync(new URL(\`../\${path}\`, import.meta.url), 'utf8')\nconst pkg = JSON.parse(file('package.json'))\ntest('alpha release is independently publishable and docs match package version', () => {\n  assert.equal(pkg.name, '@blcklab/naviox-vue')\n  assert.match(pkg.version, /^0\\.1\\.0-alpha\\.\\d+$/)\n  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7')\n  assert.ok(!pkg.workspaces)\n  assert.ok(file('README.md').includes(pkg.version))\n  assert.ok(file('CHANGELOG.md').includes(\`## \${pkg.version}\`))\n})\n`;
if (!existsSync(resolve(root, 'tests/m9_2-release.test.mjs')))
  stage('tests/m9_2-release.test.mjs', releaseTest);

// Code-only alpha.17 patches deliberately omitted this guide; restore it if needed.
if (!existsSync(resolve(root, 'docs/navigation-anatomy.md'))) {
  stage('docs/navigation-anatomy.md', `# Naviox navigation anatomy

NavioxMegaMenu and NavioxAutocomplete support optional, typed anatomy and visuals via the Vue adapter. The headless Naviox core remains unchanged.

Install only the adapter:

\`\`\`sh
npm install @blcklab/naviox-vue@next
\`\`\`

MegaMenu anatomy controls panel width, preview placement, row height, icon shape, badges, and preview artwork. Autocomplete anatomy controls input surface, clear button, icon position, and popover placement explicitly **above** or **below** the input.

Per-item visuals can supply colored icon tiles, monograms or real image thumbnails. Existing item, preview and footer slots still take precedence over defaults. The preview is hidden at narrow mobile widths to prioritize the command list.

The \`above\` / \`below\` setting is manual; automatic viewport collision detection is not included in this release. Use the public \`data-naviox-part\` anatomy hooks and documented CSS custom properties for further styling.
`);
}
// Keep the adapter-only install rule, without overwriting the user's guide.
if (existsSync(resolve(root, 'docs/getting-started.md'))) {
  const guide = take('docs/getting-started.md');
  stage('docs/getting-started.md', guide.replace(
    /^npm install @blcklab\/naviox-vue@(?:next|0\.1\.0-alpha\.\d+)\s+@blcklab\/naviox[^\r\n]*$/gm,
    'npm install @blcklab/naviox-vue@next'));
}

// Preserve user-authored documents, updating only stale current-version references.
for (const file of ['README.md', 'docs/compatibility.md', 'docs/publishing.md']) {
  if (!existsSync(resolve(root, file))) continue;
  let content = take(file);
  if (file === 'README.md') {
    content = content.replace(/@blcklab\/naviox-vue@0\.1\.0-alpha\.\d+/g, '@blcklab/naviox-vue@0.1.0-alpha.18');
    if (!content.includes('0.1.0-alpha.18')) {
      content = content.replace(/^(#[^\r\n]*\r?\n)/, '$1\nVersion: `@blcklab/naviox-vue@0.1.0-alpha.18`\n');
    }
    if (!content.includes('0.1.0-alpha.18')) throw Error('Could not place current release in README.');
  } else {
    content = content.replace(/0\.1\.0-alpha\.17/g, '0.1.0-alpha.18');
  }
  stage(file, content);
}

const changelog = take('CHANGELOG.md');
const releaseNotes = `## 0.1.0-alpha.18 — M9.2 layout corrections\n\n- Fixed preview-disabled layouts reserving an empty column with alternate preview placement.\n- Fixed the ordering of custom footer slots when search is positioned at the bottom.\n- Preserved contrast of plain icons when tile visuals include a white foreground.\n- Improved bottom-preview height for stacked/Aurora-style layouts.\n- Includes the MegaMenu/Autocomplete anatomy work of alpha.17, with no new core dependency.\n\n`;
if (!changelog.includes('## 0.1.0-alpha.18')) stage('CHANGELOG.md', releaseNotes + changelog);

// Bump existing lockfile metadata ONLY. All resolved packages/integrities remain untouched.
const nextPkg = {...pkg, version: '0.1.0-alpha.18'};
stage('package.json', JSON.stringify(nextPkg, null, 2) + '\n');
lock.version = '0.1.0-alpha.18';
lock.packages[''].version = '0.1.0-alpha.18';
stage('package-lock.json', JSON.stringify(lock, null, 2) + '\n');

// Every preflight and transform completed successfully; now persist changes.
for (const [file, content] of changes) {
  writeFileSync(resolve(root, file), content, 'utf8');
  console.log(`Updated ${file}`);
}
console.log(`Prepared @blcklab/naviox-vue@0.1.0-alpha.18 (${changes.size} changed files).`);
console.log('Next: node scripts/verify-lock.mjs && npm run check && npm run test:ssr && npm run test:e2e');
console.log('Only push the matching v0.1.0-alpha.18 tag after CI and browser checks pass.');
