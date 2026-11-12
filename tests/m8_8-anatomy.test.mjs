import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const file=(name)=>readFileSync(join(root,name),'utf8');
const p=file('src/components/NavioxPalette.ts');
test('native anatomy and visuals props are public and remain additive',()=>{
  for(const name of ['NavioxPaletteAnatomy','NavioxItemVisual','resolveNavioxAnatomyStyle']) assert.match(p,new RegExp(name));
  for(const part of ['search','item','icon','preview','preview-art','results']) assert.match(p,new RegExp(`data-naviox-part.{0,15}${part}`));
  assert.match(file('src/index.ts'),/defineNavioxAnatomy/);
  assert.match(file('src/flavor.ts'),/anatomy\?: NavioxPaletteAnatomy/);
  assert.match(file('docs/palette-anatomy.md'),/renderItemIcon|itemIcon/);
});
test('result icons, geometry and previews support dynamic visuals and slots',()=>{
  for(const word of ['showArtwork','showMetadata','showActions','showDescription','showBadge','showTail','showShortcut','showMarkers','iconShape','iconPosition','clearable']) assert.match(p,new RegExp(word));
  assert.match(p,/visual\?\.image/);
  assert.match(p,/visual\?\.monogram/);
  assert.match(p,/itemIcon|renderItemIcon/);
  assert.match(p,/data-naviox-mode/);
});
test('public CSS vars are scoped; no dependency or core rewrite',()=>{
  const css=file('styles/naviox.css');
  for(const token of ['--nx-row-height','--nx-row-padding','--nx-row-gap','--nx-row-radius','--nx-item-icon-size','--nx-preview-art-ratio','--nx-preview-title-font']) assert.match(css,new RegExp(token));
  assert.match(css,/\.naviox-dialog/);
  const pkg=JSON.parse(file('package.json'));
  assert.equal(pkg.dependencies['@blcklab/naviox'],'0.1.0-alpha.7');
  assert.ok(!pkg.dependencies['vue']&&!pkg.dependencies['react']);
});
