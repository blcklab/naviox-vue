import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = (path) => readFileSync(new URL('../' + path, import.meta.url),'utf8');
const pkg = JSON.parse(read('package.json'));
const ci = read('.github/workflows/ci.yml');
const publish = read('.github/workflows/publish.yml');

test('standalone adapter depends on public Naviox core and framework peers', () => {
  assert.equal(pkg.workspaces, undefined);
  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7');
  assert(pkg.peerDependencies);
  assert.deepEqual(pkg.files, ['dist', 'README.md', 'LICENSE']);
  assert(!pkg.scripts.prepublishOnly);
});
test('CI uses only standard npm ci/check, Node 20, 22 and 24', () => {
  assert.match(ci, /node: \[20, 22, 24\]/);
  assert.match(ci, /npm ci/);
  assert.match(ci, /npm run check/);
  assert(!ci.includes('release:preflight'));
  assert(!ci.includes('browser-accessibility:'));
});
test('publish uses version-checked v tags and prereleases go to next', () => {
  assert.match(publish, /tags:[\s\S]*?- ['"]v\*['"]/);
  assert.match(publish, /environment: npm/);
  assert.match(publish, /npm ci/);
  assert.match(publish, /npm run check/);
  assert.match(publish, /GITHUB_REF_NAME/);
  assert.match(publish, /NPM_DIST_TAG=next/);
  assert.match(publish, /NPM_DIST_TAG=latest/);
  assert.match(publish, /npm publish --access public --provenance --tag/);
});
test('public docs exist; private notes are ignored', () => {
  assert.match(read('.gitignore'), /^\.internal\//m);
  for (const name of ['index','getting-started','navigation','customization','public-api','compatibility','accessibility','publishing']) {
    assert(existsSync(new URL('../docs/'+name+'.md',import.meta.url)), name);
  }
  assert(!read('README.md').includes('.internal/'));
});
