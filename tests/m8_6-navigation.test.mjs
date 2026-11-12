import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextCommandId, commandNavigation, commandSearchOptions } from '../dist/internal/command-navigation.js';
const items = [
  { id: 'a', title: 'Alpha', group: 'One' },
  { id: 'skip', title: 'Skip', group: 'One', disabled: true },
  { id: 'b', title: 'Beta', group: 'One' },
  { id: 'c', title: 'Gamma', group: 'Two' },
  { id: 'd', title: 'Delta', group: 'Three' },
];
test('keyboard loops without entering disabled items and jumps between groups', () => {
  assert.equal(nextCommandId(items, 'a', 1), 'b');
  assert.equal(nextCommandId(items, 'a', -1), 'd');
  assert.equal(nextCommandId(items, 'b', 1, true), 'c');
  assert.equal(nextCommandId(items, 'd', 1, true), 'a');
  assert.equal(nextCommandId(items, 'a', -1, true), 'd');
});
test('Vim and group keys are opt-in, composition-safe and avoid global shortcut collisions', () => {
  assert.equal(commandNavigation({ key: 'k', ctrlKey: true }), null);
  assert.deepEqual(commandNavigation({ key: 'k', ctrlKey: true }, { vim: true }), { direction: -1, groups: false });
  assert.deepEqual(commandNavigation({ key: 'j', ctrlKey: true }, { vim: true }), { direction: 1, groups: false });
  assert.equal(commandNavigation({ key: 'k', ctrlKey: true, isComposing: true }, { vim: true }), null);
  assert.deepEqual(commandNavigation({ key: 'ArrowDown', altKey: true }, { jumpGroups: true }), { direction: 1, groups: true });
});
test('shouldFilter=false installs a nonfuzzy scorer without mutating caller options', () => {
  const input = { search: { weights: { title: 5 } } };
  const configured = commandSearchOptions(input, false);
  assert.equal(configured.search.score?.({}, 'abc', ['abc']), 1);
  assert.equal(input.search.score, undefined);
});
