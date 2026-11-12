import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const palette = fs.readFileSync(new URL('../src/components/NavioxPalette.ts', import.meta.url), 'utf8');
const theme = fs.readFileSync(new URL('../src/theme.ts', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles/naviox.css', import.meta.url), 'utf8');
test('search placement, divider and styles have public API and styles', () => {
  for (const token of ['searchPosition','searchDivider','searchStyle','showSearchIcon','showDismiss'])
    assert.match(palette, new RegExp(token));
  for (const token of ['naviox-search-bottom','naviox-search-no-divider','naviox-search-filled','naviox-search-outlined'])
    assert.ok(css.includes(token), token);
});
test('the backdrop can blur, dim without blur, or stay transparent', () => {
  assert.match(palette, /backdrop === 'blur'/);
  assert.match(palette, /backdrop === 'none'/);
  assert.match(css, /--nx-backdrop-filter/);
  assert.match(theme, /backdropColor/);
});
test('preview layout and per-item icons are adapter-owned', () => {
  assert.match(palette, /previewPlacement/);
  for (const token of ['naviox-preview-left','naviox-preview-bottom']) assert.ok(css.includes(token));
  assert.match(palette, /itemIcon/);
  assert.match(palette, /searchIcon/);
  assert.match(palette, /slots.search/);
});
test('styling contracts expose public tokens and preserve original default behavior', () => {
  for (const token of ['searchBackground','searchBorderColor','searchHeight','searchFontSize','backdropBlur','previewWidth'])
    assert.ok(theme.includes(token), token);
  assert.match(palette, /default: 'top'/);
});

test('a flavor groups presentation settings and is exported through public adapter API', () => {
  const flavor = fs.readFileSync(new URL('../src/flavor.ts', import.meta.url), 'utf8');
  const index = fs.readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
  assert.match(flavor, /defineNavioxFlavor/);
  assert.match(flavor, /searchPosition/);
  assert.match(flavor, /backdrop/);
  assert.match(index, /export \{ defineNavioxFlavor \}/);
});
