import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createNaviox } from '@blcklab/naviox';

const adapter = JSON.parse(readFileSync('package.json', 'utf8'));
const installed = JSON.parse(readFileSync('node_modules/@blcklab/naviox/package.json', 'utf8'));

test('M8.4: installed public core matches adapter exact pinned version', () => {
  assert.equal(installed.name, '@blcklab/naviox');
  assert.equal(installed.version, adapter.dependencies['@blcklab/naviox']);
});

test('M8.4: M7 extension-driven command executes through packed public core', async () => {
  const controller = createNaviox([]);
  const events = [];
  const uninstall = controller.use({
    id: 'm8-release-smoke',
    setup(api) {
      api.registerItem({ id:'m8-action', title:'Run action', kind:'command', perform:()=>'confirmed' });
      api.beforeExecute(({item}) => events.push('before:' + item.id));
      api.afterExecute((result) => events.push('after:' + result.status));
    }
  });
  const result = await controller.execute('m8-action');
  assert.equal(result.status, 'success');
  assert.equal(result.value, 'confirmed');
  assert.deepEqual(events, ['before:m8-action','after:success']);
  uninstall();
  assert.ok(!controller.getItems().some(item => item.id === 'm8-action'));
  controller.destroy();
});
