import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const file = (name) => readFileSync(new URL(name, root), 'utf8');
const pkg = JSON.parse(file('package.json'));

test('standalone Vue adapter is not a monorepo', () => {
  assert.equal(pkg.name, '@blcklab/naviox-vue');
  assert.ok(!('workspaces' in pkg));
  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7');
  assert.ok(!JSON.stringify(pkg).includes('react'));
});
test('core is external and Vue is a peer dependency', () => {
  assert.ok(pkg.peerDependencies.vue);
  assert.equal(pkg.exports['./styles.css'], './dist/styles.css');
  assert.deepEqual(pkg.files, ['dist', 'README.md', 'LICENSE']);
});
test('themes and accessibility fallback are present', () => {
  const css = file('styles/naviox.css');
  for (const name of ['sakura', 'nocturne']) assert.ok(css.includes(`naviox-theme-${name}`));
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /forced-colors/);
  assert.match(css, /max-width:680px/);
});
test('Vue component delegates execution and provider handling to core', () => {
  const source = file('src/components/NavioxPalette.ts');
  for (const name of ['controller.activate(', 'controller.handleShortcut(', 'controller.loadMore(', 'controller.refreshProviders(', 'controller.toggleFavorite(', 'controller.cancelExecution(']) {
    assert.ok(source.includes(name), `${name} expected`);
  }
});
test('source entry and examples exist', () => {
  assert.ok(existsSync(fileURLToPath(new URL('src/index.ts', root))));
  assert.ok(existsSync(fileURLToPath(new URL('examples/portfolio/App.ts', root))));
});
