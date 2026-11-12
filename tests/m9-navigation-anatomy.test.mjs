import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
const file=path=>readFileSync(join(root,path),'utf8');
const mega=file('src/components/NavioxMegaMenu.ts');
const auto=file('src/components/NavioxAutocomplete.ts');
const api=file('src/navigation-anatomy.ts');
const icons=file('src/internal/navigation-visual.ts');
const css=file('styles/naviox.css');
const exports=file('src/index.ts');
test('MegaMenu and Autocomplete expose optional anatomy and visuals without changing the core',()=>{
  for(const source of [mega,auto]) for(const key of ['anatomy:','visuals:','itemIcon','navioxNavigationItemIcon','data-naviox-part']) assert.match(source,new RegExp(key));
  assert.match(exports,/defineNavioxMegaMenuAnatomy/);assert.match(exports,/defineNavioxAutocompleteAnatomy/);
  assert.equal(JSON.parse(file('package.json')).dependencies['@blcklab/naviox'],'0.1.0-alpha.7');
});
test('Typed anatomy covers rows, previews, menu placement and autocomplete field anatomy',()=>{
  for(const key of ['width?: string','maxHeight?: string','previewPlacement?','accentLine?','footerDivider?','iconPosition?','clearable?','surface?','placement?','showDescription']) {
    if(key==='showDescription') assert.match(file('src/anatomy.ts'),/showDescription/);
    else assert.ok(api.includes(key),key);
  }
  for(const key of ['--nx-mega-width','--nx-mega-row-height','--nx-mega-preview-width','--nx-auto-field-height','--nx-auto-panel-width','--nx-auto-icon-size']) assert.match(css,new RegExp(key));
});
test('Icons allow colorful tiles, real images and monograms without untrusted HTML',()=>{
  for(const key of ['data-naviox-mode','data-naviox-shape','visual?.background','visual?.image','visual?.foreground','visual?.monogram','imageAlt']) assert.ok(icons.includes(key),key);
  assert.doesNotMatch(icons,/innerHTML|eval\(/);
  assert.match(css,/\.naviox-nav-icon\[data-naviox-shape="circle"\]/);
});
test('Render override precedence is retained, including old slots',()=>{
  for(const source of [mega,auto]) assert.match(source,/slots\.item\?\./);
  assert.match(mega,/slots\.preview\?\./);
  assert.match(auto,/slots\.prefix\?\./);
  assert.match(mega,/slots\.footer\?\./);
  assert.match(auto,/slots\.footer\?\./);
});
test('The public documentation describes limitations and the single install',()=>{
  const docs=file('docs/navigation-anatomy.md');
  assert.match(docs,/above.*below/s);
  assert.match(docs,/narrow mobile widths/);
  assert.match(docs,/npm install @blcklab\/naviox-vue@next/);
  assert.doesNotMatch(file('docs/getting-started.md'),/npm install @blcklab\/naviox-vue@next\s+@blcklab\/naviox/);
});
