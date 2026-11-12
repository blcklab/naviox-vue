import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createNaviox, rankItems, sectionItems } from '@blcklab/naviox';
import { mergeNavioxMenuItems } from '../dist/internal/menu-items.js';

const file = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const pkg = JSON.parse(file('package.json'));
const source = file('src/components/NavioxMegaMenu.ts');
const local = [{ id:'home', title:'Home', group:'Pages', href:'/home', preview:{ description:'Welcome' } }];

function createShared() {
  return createNaviox(local, { defaultOpen:true, providers: { debounceMs:0 } });
}

test('M7.1 uses the exact M7 dependency in an independent vue repository', () => {
  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7');
  assert.match(pkg.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  assert.equal(pkg.name, '@blcklab/naviox-vue');
  assert.ok(!pkg.workspaces);
  assert.ok(!JSON.stringify(pkg).includes('OTHER_@blcklab/naviox-vue'));
});

test('pure menu projection merges plugin-owned and site-provided items', () => {
  const c=createShared();
  const stop=c.use({ id:'site', setup(api) { api.registerItem({id:'tools',title:'Developer tools',kind:'command',group:'Tools'}); } });
  const combined=mergeNavioxMenuItems([{id:'home',title:'My homepage',group:'Pages',href:'/'}],c.getItems());
  assert.deepEqual(combined.map(x=>x.id),['home','tools']);
  assert.equal(combined[0].title, 'My homepage');
  assert.equal(combined[1].kind, 'command');
  stop();
  assert.deepEqual(mergeNavioxMenuItems([],c.getItems()).map(x=>x.id),['home']);
  c.destroy();
});

test('hidden and nested commands do not escape into top navigation', () => {
  const joined=mergeNavioxMenuItems([
    {id:'visible',title:'Visible'},
    {id:'hidden',title:'Hidden',hidden:true},
    {id:'nested',title:'Nested',parentId:'folder'},
    {id:'page',title:'Page',pageId:'settings'},
  ],[
    {id:'folder',title:'Folder'},
    {id:'nested2',title:'Nested 2',parentId:'folder'},
  ]);
  assert.deepEqual(joined.map(x=>x.id), ['folder','visible']);
});

test('static override can explicitly hide a registered item without mutation', () => {
  const result=mergeNavioxMenuItems([{id:'features',title:'No',hidden:true}], [{id:'features',title:'Shown'}]);
  assert.deepEqual(result, []);
});

test('extension commands execute with M7 before/after hooks even while palette is closed', async () => {
  const c=createShared();
  const trace=[];
  const stop=c.use({id:'automation', setup(api) {
    api.registerItem({id:'build',title:'Build project',kind:'command',group:'Tools',closeOnExecute:false,perform:async ()=> {trace.push('perform');await Promise.resolve();return 'built';}});
    api.beforeExecute(({item})=> {trace.push('before:'+item.id);});
    api.afterExecute((result)=> {trace.push('after:'+result.status);});
  }});
  const menu=mergeNavioxMenuItems([],c.getItems());
  assert.ok(menu.find(x=>x.id==='build'));
  c.close(); // activate('build') is unavailable while palette is closed; explicit execute is required.
  assert.equal(c.activate('build').kind,'none');
  const done=await c.execute('build');
  assert.equal(done.status,'success');
  assert.equal(done.value,'built');
  assert.deepEqual(trace,['before:build','perform','after:success']);
  stop(); c.destroy();
});

test('same registered items appear in palette fuzzy/group projections', () => {
  const c=createShared();
  const stop=c.use({id:'search',setup(api){api.registerItem({id:'design',title:'Design tokens',group:'Tools',keywords:['theme']});}});
  c.setQuery('theme');
  assert.deepEqual(c.getState().results.map(x=>x.id),['design']);
  const menu=mergeNavioxMenuItems([],c.getItems());
  const sections=sectionItems(rankItems(menu,'',100).map(x=>x.item), [{id:'Tools',title:'Tools'}],new Set(),true).sections;
  assert.ok(sections.some(section=>section.items.some(item=>item.id==='design')));
  stop(); c.destroy();
});

test('extension-provided async results integrate with autocomplete through shared controller', async () => {
  const c=createShared();
  const stop=c.use({id:'remote',setup(api) {
    api.registerProvider({id:'docs',debounceMs:0,search:async ({query})=>({items:query ? [{id:'docs-hit',title:'Docs: '+query,group:'Docs',kind:'command',perform:()=> 'opened'}] : []})});
  }});
  c.setQuery('router'); await c.refreshProviders();
  assert.deepEqual(c.getState().results.map(x=>x.id),['docs-hit']);
  const done=await c.execute('docs-hit');
  assert.equal(done.value,'opened');
  stop();
  assert.deepEqual(c.getProviders().map(p=>p.id), []);
  c.destroy();
});

test('async action completion is not cancelled by mega-menu disclosure closing', async () => {
  const c=createShared();
  let finish;
  const stop=c.use({id:'task',setup(api){api.registerItem({id:'task',title:'Async',kind:'command',closeOnExecute:false,perform:()=>new Promise(resolve=>{finish=resolve;})});}});
  c.close();
  const task=c.execute('task');
  await Promise.resolve();
  assert.equal(c.getState().execution.status,'running');
  finish(99); const outcome=await task;
  assert.equal(outcome.status,'success');
  stop();c.destroy();
});

test('adapter wiring uses public subscription and explicit execution, not palette-only activate', () => {
  assert.match(source, /controller.*getItems\(/s);
  assert.match(source, /controller.*execute\(item\.id\)/s);
  assert.match(source, /execute/);
  assert.doesNotMatch(source, /controller\.activate\(item\.id\)/);
  assert.match(file('src/components/NavioxPalette.ts'), /controller/);
  assert.match(file('src/components/NavioxAutocomplete.ts'), /controller/);
});
