import test from 'node:test';
import assert from 'node:assert/strict';
import { createNaviox } from '@blcklab/naviox';

const items = [
  { id:'home',title:'Home',group:'places',kind:'route',href:'/home' },
  { id:'settings',title:'Settings',group:'actions',kind:'command' },
  { id:'theme',title:'Change theme',parentId:'settings',kind:'command',perform:()=> 'updated' },
];

test('M3 controller supports grouped palette results', () => {
  const c=createNaviox(items,{groups:[{id:'places',title:'Places'},{id:'actions',title:'Actions'}],groupResults:true,defaultOpen:true});
  assert.deepEqual(c.getState().sections.map(({title})=>title),['Places','Actions']);
  assert.equal(c.getState().results.length,2);
  c.destroy();
});

test('nested command navigates, executes and returns result', async () => {
  const c=createNaviox(items,{defaultOpen:true});
  assert.equal(c.activate('settings').kind,'page');
  assert.equal(c.getState().pageId,'settings');
  const result=await c.execute('theme');
  assert.equal(result.status,'success');
  assert.equal(result.value,'updated');
  c.destroy();
});

test('controller-based favorites and pin state are observable', () => {
  const c=createNaviox(items,{defaultOpen:true});
  c.toggleFavorite('home');c.togglePinned('home');
  assert.deepEqual(c.getState().favoriteIds,['home']);
  assert.deepEqual(c.getState().pinnedIds,['home']);
  c.toggleFavorite('home');assert.equal(c.getState().favoriteIds.length,0);
  c.destroy();
});

test('scoped preference and result state survive local search', () => {
  const c=createNaviox(items,{defaultOpen:true});
  c.setQuery('Settings');
  assert.deepEqual(c.getState().results.map(x=>x.id),['settings']);
  c.close();assert.equal(c.getState().open,false);
  c.open();assert.equal(c.getState().open,true);
  c.destroy();
});
