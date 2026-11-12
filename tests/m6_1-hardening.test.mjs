import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextVisibleOptionId } from '../dist/internal/keyboard.js';
const source = (file) => readFileSync(new URL('../src/components/' + file, import.meta.url), 'utf8');

test('keyboard cycles through displayed options and skips disabled commands', () => {
  const visible = [{id:'a'}, {id:'b',disabled:true}, {id:'c'}];
  assert.equal(nextVisibleOptionId(visible,'a',1),'c');
  assert.equal(nextVisibleOptionId(visible,'c',1),'a');
  assert.equal(nextVisibleOptionId(visible,'a',-1),'c');
  assert.equal(nextVisibleOptionId(visible,'missing',-1),'c');
  assert.equal(nextVisibleOptionId(visible,null,1),'a');
  assert.equal(nextVisibleOptionId([{id:'disabled',disabled:true}],null,1),null);
  assert.equal(nextVisibleOptionId([],null,-1),null);
});
test('autocomplete has listbox active-descendant semantics and only moves visible options', () => {
  const code = source('NavioxAutocomplete.ts');
  assert.ok(code.includes('nextVisibleOptionId'));
  assert.ok(code.includes('aria-activedescendant'));
  assert.ok(code.includes('aria-controls'));
  assert.ok(code.includes('aria-haspopup'));
  assert.ok(!code.includes('controller.move('));
});
test('mega menu repositions during ancestor scroll and cleans up listeners', () => {
  const code = source('NavioxMegaMenu.ts');
  assert.ok(code.includes("addEventListener('scroll', positionPanel, true)"));
  assert.ok(code.includes("removeEventListener('scroll', positionPanel, true)"));
  assert.ok(code.includes('ResizeObserver'));
});
