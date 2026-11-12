import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const component = readFileSync(new URL('../src/components/NavioxPalette.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles/naviox.css', import.meta.url), 'utf8');
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('the Vue adapter exposes optional variants and scoped appearance', () => {
  for (const variation of ['floating', 'minimal', 'compact', 'spotlight', 'cinematic']) {
    assert.match(component + css, new RegExp(`naviox-variant-${variation}|variant: \\{ type:`));
  }
  assert.match(component, /style: dialogStyle\.value/);
  assert.match(component, /data-naviox-theme/);
  assert.match(component, /window\.matchMedia/);
  assert.match(component, /removeEventListener\?\.\('change', onSchemeChange\)/);
});

test('the new public theme helper does not bring framework runtime into core', () => {
  assert.ok(!('workspaces' in pkg));
  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7');
  assert.ok(!JSON.stringify(pkg).includes('react'));
});

test('reduced motion and mobile layout rules cover all variants', () => {
  assert.match(css, /\.naviox-dialog\.naviox-motion-reduced/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  for (const type of ['minimal', 'compact', 'spotlight', 'cinematic']) {
    assert.match(css, new RegExp(`\\.naviox-dialog\\.naviox-variant-${type}`));
  }
});
