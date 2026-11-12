import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {nextVisibleOptionId} from '../dist/internal/keyboard.js';
const source=(p)=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const css=readFileSync(new URL('../styles/naviox.css',import.meta.url),'utf8');

test('keyboard navigation excludes disabled and read-only results',()=>{
 const items=[{id:'a'},{id:'b',disabled:true},{id:'c',readOnly:true},{id:'d'}];
 assert.equal(nextVisibleOptionId(items,'a',1),'d');
 assert.equal(nextVisibleOptionId(items,'d',1),'a');
 assert.equal(nextVisibleOptionId(items,'a',-1),'d');
 assert.equal(nextVisibleOptionId(items,'x',1),'a');
 assert.equal(nextVisibleOptionId([{id:'locked',readOnly:true}],null,1),null);
});
test('group disclosure controls live outside the listbox',()=>{
 const s=source('components/NavioxPalette.ts');
 assert.ok(s.includes('naviox-group-controls'));
 assert.ok(s.includes('naviox-group-toggle'));
 assert.ok(s.includes('aria-expanded'));
 assert.ok(s.includes("role: 'listbox'") || s.includes('role="listbox"'));
 // Structural static guard: listbox groups themselves no longer render a button.
 assert.ok(!s.includes("class: 'naviox-section-header'"));
 assert.ok(!s.includes('className="naviox-section-header"'));
 assert.match(css,/naviox-group-toggle:focus-visible/);
});
test('accessible combobox relationships and IME safeguards remain',()=>{
 const palette=source('components/NavioxPalette.ts');
 const auto=source('components/NavioxAutocomplete.ts');
 for(const s of [palette,auto]){
   assert.match(s,/aria-activedescendant/);
   assert.match(s,/aria-controls/);
 }
 assert.match(auto,/isComposing/);
 assert.match(auto,/readOnly/);
});

test('modal includes a keyboard focus wrap and a labelled scroll region',()=>{
 const s=source('components/NavioxPalette.ts');
 assert.match(s,/wrapModalTabFocus/);
 assert.match(s,/Scrollable command results/);
 assert.match(source('internal/focus.ts'),/event.shiftKey/);
});
