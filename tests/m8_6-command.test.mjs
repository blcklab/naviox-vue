import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(path.join(repo, 'src/index.ts'), 'utf8');
const react = repo.endsWith('react');
const command = readFileSync(path.join(repo, react ? 'src/components/NavioxCommand.tsx' : 'src/components/NavioxCommand.ts'), 'utf8');
const css = readFileSync(path.join(repo, 'styles/naviox.css'), 'utf8');

test('public API exports every composable primitive without bundling cmdk', () => {
  for (const symbol of ['NavioxCommand', 'NavioxCommandInput', 'NavioxCommandList', 'NavioxCommandGroup',
    'NavioxCommandItem', 'NavioxCommandSeparator', 'NavioxCommandEmpty', 'NavioxCommandLoading', 'NavioxCommandShortcut']) {
    assert.match(index, new RegExp(`\\b${symbol}\\b`));
    assert.match(command, new RegExp(`\\b${symbol}\\b`));
  }
  const pkg = JSON.parse(readFileSync(path.join(repo, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies['@blcklab/naviox'], '0.1.0-alpha.7');
  assert.equal(pkg.dependencies?.cmdk, undefined);
});

test('new options cover RTL, force mount, external search, and optional navigation', () => {
  for (const term of ['shouldFilter', 'vimNavigation', 'groupNavigation', 'forceMount', 'dir', 'aria-activedescendant', 'role="option"']) {
    if (term === 'role="option"' && !react) { assert.match(command, /role: 'option'/); continue; }
    assert.ok(command.includes(term), `${term} missing`);
  }
  assert.match(css, /naviox-command-input/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\[dir="rtl"\]/);
  assert.ok(existsSync(path.join(repo, 'docs/composable-command.md')));
});

test('component composition and filtering stay in adapter, not in published core', () => {
  assert.match(command, /controller\.(register|activate)/);
  assert.match(command, /NavioxCommandList/);
  assert.match(command, /aria-hidden/);
  assert.match(index, /'\.\/components\/NavioxCommand\.js'/);
});
