import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const code = readFileSync(new URL('../src/components/NavioxPalette.ts', import.meta.url),'utf8');
const css = readFileSync(new URL('../styles/naviox.css',import.meta.url),'utf8');
test('busy state is exposed to assistive technology',()=>assert.match(code,/aria-busy/));
test('read-only results are reported as non-executable',()=>assert.match(code,/aria-disabled.*readOnly/));
test('search input has an explicit focus-within cue',()=>assert.match(css,/searchbar:focus-within/));
