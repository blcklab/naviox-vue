import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const file = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const pkg = JSON.parse(file('package.json'))
test('release identifies itself and preserves independent core dependency', () => {
  assert.equal(pkg.name, '@blcklab/naviox-vue')
  assert.match(pkg.version, /^0\.1\.0-alpha\.\d+$/)
  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7')
  assert.ok(!pkg.workspaces)
  assert.match(file('README.md'), new RegExp(pkg.version.replaceAll('.', '\\.')))
  assert.ok(file('CHANGELOG.md').includes(`## ${pkg.version}`))
})
test('M9.2 fixes are present in the built adapter source', () => {
  const css = file('styles/naviox.css')
  const palette = file('src/components/NavioxPalette.ts')
  assert.match(css, /\.naviox-dialog\.naviox-no-preview\s+\.naviox-layout/)
  assert.match(css, /\.naviox-dialog\.naviox-search-bottom\s+\.naviox-shell\s*>\s*:last-child/)
  assert.match(palette, /visual\?\.foreground\s*&&\s*mode\s*!==\s*'plain'/)
})
