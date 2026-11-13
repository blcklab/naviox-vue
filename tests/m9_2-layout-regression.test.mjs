import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const styles = readFileSync(new URL('../styles/naviox.css', import.meta.url), 'utf8')
const palette = readFileSync(new URL('../src/components/NavioxPalette.ts', import.meta.url), 'utf8')
test('preview=false overrides all alternative preview grid placements', () => {
  assert.match(styles, /\.naviox-dialog\.naviox-no-preview\s+\.naviox-layout\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*minmax\(0,1fr\)/)
})
test('bottom search orders a custom footer slot regardless of its CSS classes', () => {
  assert.match(styles, /\.naviox-dialog\.naviox-search-bottom\s+\.naviox-shell\s*>\s*:last-child\s*\{\s*order:\s*5/)
})
test('plain icons preserve contrast when visuals specify white tile glyphs', () => {
  assert.match(palette, /visual\?\.foreground\s*&&\s*mode\s*!==\s*'plain'/)
  assert.match(styles, /\[data-naviox-mode="plain"\]\s*\{[^}]*color:var\(--nx-text\)/)
})
