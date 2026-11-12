// Real Vue server-renderer smoke test; run only with installed Vue dependencies.
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { NavioxPalette, NavioxMegaMenu, NavioxAutocomplete } from '../dist/index.js';
const items = [{ id: 'home', title: 'Home', href: '/home' }, { id: 'about', title: 'About', href: '/about' }];
for (const [name, component, props] of [
  ['palette', NavioxPalette, { items, modelValue: false }],
  ['mega-menu', NavioxMegaMenu, { items, modelValue: false }],
  ['autocomplete', NavioxAutocomplete, { items }],
]) {
  const markup = await renderToString(createSSRApp({ render: () => h(component, props) }));
  assert(markup.length > 0, `${name} returned empty SSR HTML`);
  console.log(`${name} server render passed (${markup.length} characters)`);
}
