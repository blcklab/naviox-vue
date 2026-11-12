import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { rankItems, sectionItems, createNaviox } from '@blcklab/naviox';
const file = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const pkg = JSON.parse(file('package.json'));
const pages = [
  { id: 'craft', title: 'My craft', description: 'Independent experiments', group: 'Pages', preview: { description: 'Projects' } },
  { id: 'guestbook', title: 'Guestbook', group: 'Pages' },
  { id: 'about', title: 'About', group: 'More' },
];
test('M6 remains a separate Vue package, with the M3 core as the only application dependency', () => {
  assert.equal(pkg.name, '@blcklab/naviox-vue');
  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7');
  assert.ok(!('workspaces' in pkg));
  assert.ok(!JSON.stringify(pkg).includes('react'));
});
test('new components and navigation demo are publicly exported', () => {
  assert.match(file('src/index.ts'), /NavioxMegaMenu/);
  assert.match(file('src/index.ts'), /NavioxAutocomplete/);
  assert.ok(existsSync(new URL('../examples/navigation/App.ts', import.meta.url)));
});
test('mega-menu grouping uses existing headless projection with preview metadata intact', () => {
  const results = sectionItems(rankItems(pages, '', 20).map(({ item }) => item), [{ id: 'More', title: 'Beyond', order: -1 }, { id: 'Pages', title: 'Pages', order: 1 }], new Set(), true);
  assert.equal(results.sections[0].id, 'More');
  assert.deepEqual(results.visible.map((item) => item.id), ['about', 'craft', 'guestbook']);
  assert.equal(results.visible[1].preview.description, 'Projects');
});
test('autocomplete fuzzy search comes from the headless core', () => {
  assert.deepEqual(rankItems(pages, 'exPeRiment', 5).map(({ item }) => item.id), ['craft']);
});
test('async autocomplete keeps remote results inside the core controller', async () => {
  const controller = createNaviox(pages, {
    defaultOpen: true,
    providers: { debounceMs: 0, initial: [{ id: 'remote', search: async ({ query }) => ({ items: query ? [{ id: 'remote-page', title: 'Remote design', description: query }] : [] }) }] },
  });
  controller.setQuery('design');
  await controller.refreshProviders();
  assert.ok(controller.getState().results.some((item) => item.id === 'remote-page'));
  controller.destroy();
});
test('mega menu and autocomplete are themeable and respect accessibility interactions', () => {
  const menu = file('src/components/NavioxMegaMenu.ts');
  const auto = file('src/components/NavioxAutocomplete.ts');
  for (const piece of ['aria-expanded', 'aria-controls', 'navioxThemeClass', 'onPointerLeave', 'Escape', 'ArrowDown', 'preview']) assert.ok(menu.includes(piece), piece);
  for (const piece of ['aria-activedescendant', 'role: \'combobox\'', 'providersLoading', 'controller.setQuery', 'controller.activate']) assert.ok(auto.includes(piece), piece);
});
test('styles cover menu, autocomplete, mobile and reduced motion', () => {
  const css = file('styles/naviox.css');
  for (const value of ['naviox-mega-panel', 'naviox-auto-panel', 'naviox-mega-art', 'max-width:680px', 'prefers-reduced-motion']) assert.ok(css.includes(value), value);
});

test('navigation URLs reject executable schemes and control-character bypasses', async () => {
  const { safeNavigationHref } = await import('../dist/internal/urls.js');
  assert.equal(safeNavigationHref('javascript:alert(1)'),undefined);
  assert.equal(safeNavigationHref('java\nscript:alert(1)'),undefined);
  assert.equal(safeNavigationHref('data:text/html,hello'),undefined);
  assert.equal(safeNavigationHref('//other.example/path'),undefined);
  assert.equal(safeNavigationHref('/work'),'/work');
  assert.equal(safeNavigationHref('https://example.com'), 'https://example.com');
});
test('autocomplete never cancels asynchronous commands by immediately closing', () => {
  const path='src/components/NavioxAutocomplete.ts';
  const code=file(path);
  assert.ok(!code.includes('if (props.closeOnSelect) close()'));
  assert.ok(!code.includes('if (closeOnSelect) controller.close()'));
  assert.match(code, /result\.completion/);
});
