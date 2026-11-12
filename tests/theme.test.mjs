import test from 'node:test';
import assert from 'node:assert/strict';
import { defineNavioxTheme, navioxHexRgb, navioxThemeClass, resolveNavioxTheme } from '../dist/theme.js';

test('theme helper returns a fresh token object without global mutation', () => {
  const initial = { accent: '#ABC' };
  const theme = defineNavioxTheme({ colorScheme: 'dark', tokens: initial });
  initial.accent = '#fff';
  assert.equal(theme.tokens.accent, '#ABC');
  assert.equal(theme.colorScheme, 'dark');
});

test('system theme maps light and dark predictably', () => {
  assert.equal(resolveNavioxTheme({ theme: 'system' }).name, 'ink');
  const dark = resolveNavioxTheme({ theme: 'system', prefersDark: true });
  assert.deepEqual([dark.name, dark.colorScheme], ['nocturne', 'dark']);
  assert.equal(resolveNavioxTheme({
    theme: 'system', prefersDark: true, systemThemes: { light: 'sakura', dark: 'aurora' },
    themes: { aurora: { colorScheme: 'dark', tokens: { surface: '#05090d' } } },
  }).style['--nx-surface'], '#05090d');
});

test('custom palettes are instance-local and expose CSS variables', () => {
  const themes = { aurora: defineNavioxTheme({
    colorScheme: 'dark', tokens: { surface: '#060d17', accent: '#7ab', text: '#f6faff' },
  }) };
  const customized = resolveNavioxTheme({ theme: 'aurora', themes });
  assert.equal(customized.colorScheme, 'dark');
  assert.equal(customized.style['--nx-surface'], '#060d17');
  assert.equal(customized.style['--nx-accent-rgb'], '119, 170, 187');
  assert.equal(customized.style.colorScheme, 'dark');
  assert.equal(resolveNavioxTheme({ theme: 'aurora' }).style['--nx-surface'], undefined);
});

test('appearance overrides accent, font and radius without changing theme', () => {
  const result = resolveNavioxTheme({ theme: 'sakura', themes: { sakura: {
    tokens: { accent: '#123456', accentRgb: '18,52,86' },
  } }, appearance: { accent: '#bada55', fontFamily: 'system-ui', radius: '11px' } });
  assert.equal(result.name, 'sakura');
  assert.equal(result.style['--nx-accent'], '#bada55');
  // Appearance accent takes precedence over preset channels, preventing a mismatched glow.
  assert.equal(result.style['--nx-accent-rgb'], '186, 218, 85');
  assert.equal(result.style['--nx-font'], 'system-ui');
  assert.equal(result.style['--nx-radius'], '11px');
});

test('hex parser supports short, full and alpha variants', () => {
  assert.equal(navioxHexRgb('#f0a'), '255, 0, 170');
  assert.equal(navioxHexRgb('#00bb55aa'), '0, 187, 85');
  assert.equal(navioxHexRgb('rebeccapurple'), undefined);
});

test('user-defined theme names do not become arbitrary CSS classes', () => {
  assert.equal(navioxThemeClass('Aurora Night'), 'naviox-theme-aurora-night');
  assert.equal(navioxThemeClass('><'), 'naviox-theme-custom');
});
