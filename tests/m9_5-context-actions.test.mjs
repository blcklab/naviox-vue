import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const temp = mkdtempSync(join(tmpdir(), 'naviox-actions-'));
try {
  execFileSync('tsc', ['--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--skipLibCheck', '--outDir', temp, '--noEmitOnError', 'false',
    new URL('src/context-actions.ts', root).pathname], { stdio: 'pipe' });
} catch (error) {
  // Type-only imports rely on the user-installed public core; test only the helper's emitted JS.
  if (!existsSync(join(temp, 'context-actions.js'))) throw error;
}
const { filterNavioxActions, nextNavioxActionId, matchesNavioxActionShortcut } = await import(`file://${join(temp, 'context-actions.js')}`);
const actions = [
  {id:'open',title:'Open Item',group:'General'},
  {id:'copy',title:'Copy Résumé URL',group:'Clipboard'},
  {id:'disabled',title:'Unsafe Action',disabled:true},
  {id:'pin',title:'Pin item',group:'General'},
];
test('contextual action search ignores accents and filters all query tokens',()=> {
  assert.deepEqual(filterNavioxActions(actions, 'resume clipboard').map(x=>x.id),['copy']);
  assert.deepEqual(filterNavioxActions(actions,'').map(x=>x.id),actions.map(x=>x.id));
});
test('action navigation skips disabled rows and wraps correctly',()=> {
  assert.equal(nextNavioxActionId(actions,'copy','next'),'pin');
  assert.equal(nextNavioxActionId(actions,'open','previous'),'pin');
  assert.equal(nextNavioxActionId(actions,null,'first'),'open');
  assert.equal(nextNavioxActionId([{id:'x',disabled:true}],null,'first'),null);
});
test('mod shortcut matches platform and modifiers exactly without autorepeat',()=> {
  const base={key:'k',metaKey:true,ctrlKey:false,shiftKey:false,altKey:false,repeat:false,isComposing:false};
  assert.equal(matchesNavioxActionShortcut(base,'Mod+K','mac'),true);
  assert.equal(matchesNavioxActionShortcut(base,'Mod+K','other'),false);
  assert.equal(matchesNavioxActionShortcut({...base,repeat:true},'Mod+K','mac'),false);
  assert.equal(matchesNavioxActionShortcut({...base,shiftKey:true},'Mod+K','mac'),false);
});
test('palette exposes contextual action support without rewriting the core',()=> {
  const code=read('src/components/NavioxPalette.ts');
  assert.match(code,/contextActions: /);
  assert.match(code,/actionShortcut: /);
  assert.match(code,/openActions/);
  assert.match(code,/aria-activedescendant/);
  assert.match(read('src/index.ts'),/NavioxContextAction/);
});
test('action focus stays within contextual panel and Escape returns to palette',()=> {
  const code=read('src/components/NavioxPalette.ts');
  assert.match(code,/event\.key === 'Tab'[\s\S]{0,220}event\.stopPropagation\(\)/);
  assert.match(code,/event\.key === 'Escape'[\s\S]{0,180}closeActions\(\)/);
  assert.match(code,/function closeActions[\s\S]{0,480}input\.value\?\.focus/);
});
test('premium variant remains opt-in and respects reduced motion',()=> {
  assert.match(read('src/theme.ts'),/precision/);
  assert.match(read('styles/naviox.css'),/naviox-variant-precision/);
  assert.match(read('styles/naviox.css'),/prefers-reduced-motion/);
});
rmSync(temp,{recursive:true,force:true});
