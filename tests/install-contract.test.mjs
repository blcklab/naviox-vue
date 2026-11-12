import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(resolve(root, name), 'utf8');
const pkg = JSON.parse(read('package.json'));

test('adapter installs the core automatically as a regular dependency', () => {
  assert.equal(pkg.name, '@blcklab/naviox-vue');
  assert.equal(pkg.dependencies?.['@blcklab/naviox'], '0.1.0-alpha.7');
  assert.equal(pkg.peerDependencies?.['@blcklab/naviox'], undefined);
  assert.equal(pkg.optionalDependencies?.['@blcklab/naviox'], undefined);
});

test('host framework is a peer dependency, not bundled by the adapter', () => {
  assert.ok(pkg.peerDependencies?.vue);
  assert.ok(!pkg.dependencies?.vue);
});

test('public install guides require only the adapter package', () => {
  for (const file of ['README.md', 'docs/getting-started.md']) {
    const text = read(file);
    assert.ok(text.includes('npm install @blcklab/naviox-vue@next'), file);
    assert.doesNotMatch(text, /npm install[^\n]*@blcklab\/naviox@/);
  }
});
