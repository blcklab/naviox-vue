import test from 'node:test';
import assert from 'node:assert/strict';
import { defineNavioxAnatomy, resolveNavioxAnatomyStyle } from '../dist/anatomy.js';

test('anatomy definitions are instance-local and do not mutate input', () => {
  const raw = { row: { minHeight: '53px', iconShape: 'circle' } };
  const anatomy = defineNavioxAnatomy(raw);
  raw.row.minHeight = '100px';
  assert.equal(anatomy.row.minHeight, '53px');
  assert.notEqual(anatomy.row, raw.row);
});
test('palette anatomy resolves only explicitly configured semantic variables', () => {
  const style = resolveNavioxAnatomyStyle({
    search: { iconPosition: 'end', gap: '9px' },
    row: { minHeight: '64px', iconSize: '38px', radius: '12px' },
    preview: { imageAspectRatio: '16 / 9', titleFont: 'sans', imageFit: 'contain' },
  });
  assert.equal(style['--nx-search-gap'], '9px');
  assert.equal(style['--nx-row-height'], '64px');
  assert.equal(style['--nx-item-icon-size'], '38px');
  assert.equal(style['--nx-row-radius'], '12px');
  assert.equal(style['--nx-preview-art-ratio'], '16 / 9');
  assert.equal(style['--nx-preview-image-fit'], 'contain');
  assert.equal(style['--nx-preview-title-font'], 'var(--nx-font)');
  assert.equal(Object.keys(resolveNavioxAnatomyStyle()).length, 0);
});
