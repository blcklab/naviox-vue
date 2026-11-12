/** Appearance and theme contracts; no Vue, DOM, or core-engine dependency. */
export type NavioxBuiltInTheme = 'ink' | 'sakura' | 'nocturne';
export type NavioxThemeName = NavioxBuiltInTheme | 'system' | (string & {});
export type NavioxPaletteVariant = 'floating' | 'minimal' | 'compact' | 'spotlight' | 'cinematic';
export type NavioxColorScheme = 'light' | 'dark';

/** Public names deliberately do not expose internal CSS selectors. */
export interface NavioxThemeTokens {
  font: string;
  serif: string;
  mono: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  soft: string;
  border: string;
  hover: string;
  selected: string;
  accent: string;
  /** Comma-separated RGB channels, e.g. `123, 89, 240`. Derived from a hex accent if omitted. */
  accentRgb: string;
  accentText: string;
  artStart: string;
  artEnd: string;
  artLine: string;
  shadow: string;
}

export interface NavioxThemeDefinition {
  colorScheme?: NavioxColorScheme;
  tokens?: Partial<NavioxThemeTokens>;
}

export interface NavioxAppearance {
  /** Applies to the whole palette, including the teleported dialog. */
  accent?: string;
  /** CSS border-radius value, e.g. `18px` or `1.2rem`. */
  radius?: string;
  fontFamily?: string;
  density?: 'comfortable' | 'compact';
  motion?: 'system' | 'reduced';
}

export interface NavioxSystemThemes {
  light: string;
  dark: string;
}

export const defaultSystemThemes: Readonly<NavioxSystemThemes> = Object.freeze({
  light: 'ink', dark: 'nocturne',
});

const names: Readonly<Record<keyof NavioxThemeTokens, string>> = {
  font: '--nx-font', serif: '--nx-serif', mono: '--nx-mono',
  surface: '--nx-surface', elevated: '--nx-elevated', text: '--nx-text',
  muted: '--nx-muted', soft: '--nx-soft', border: '--nx-border',
  hover: '--nx-hover', selected: '--nx-selected', accent: '--nx-accent',
  accentRgb: '--nx-accent-rgb', accentText: '--nx-accent-text',
  artStart: '--nx-art-start', artEnd: '--nx-art-end', artLine: '--nx-art-line',
  shadow: '--nx-shadow',
};

/** Registers nothing globally; return a typed theme for a component's `themes` prop. */
export function defineNavioxTheme(definition: NavioxThemeDefinition): NavioxThemeDefinition {
  return { colorScheme: definition.colorScheme, tokens: { ...definition.tokens } };
}

/** Only class-safe characters are emitted, even for user-defined theme names. */
export function navioxThemeClass(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '');
  return `naviox-theme-${normalized || 'custom'}`;
}

/** Translate e.g. #abc / #aabbcc / #aabbccdd into CSS rgb channel syntax. */
export function navioxHexRgb(value: string): string | undefined {
  const hex = value.trim().replace(/^#/, '');
  if (!/^(?:[a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i.test(hex)) return undefined;
  const normalized = (hex.length === 3 || hex.length === 4)
    ? hex.slice(0, 3).split('').map((part) => part + part).join('')
    : hex.slice(0, 6);
  return [0, 2, 4].map((index) => String(parseInt(normalized.slice(index, index + 2), 16))).join(', ');
}

export interface ResolvedNavioxTheme {
  name: string;
  colorScheme: NavioxColorScheme;
  style: Record<string, string>;
}

/** Deterministic and SSR-safe; the adapter supplies the system preference. */
export function resolveNavioxTheme(input: {
  theme?: NavioxThemeName;
  themes?: Readonly<Record<string, NavioxThemeDefinition>>;
  prefersDark?: boolean;
  systemThemes?: NavioxSystemThemes;
  appearance?: NavioxAppearance;
}): ResolvedNavioxTheme {
  const requested = input.theme ?? 'ink';
  const system = input.systemThemes ?? defaultSystemThemes;
  const name = requested === 'system' ? (input.prefersDark ? system.dark : system.light) : requested;
  const definition = input.themes?.[name];
  const tokens = definition?.tokens ?? {};
  const style: Record<string, string> = {};
  for (const [key, variable] of Object.entries(names)) {
    const value = tokens[key as keyof NavioxThemeTokens];
    if (value !== undefined) style[variable] = value;
  }
  const accent = input.appearance?.accent;
  if (accent) style['--nx-accent'] = accent;
  if ((accent || !tokens.accentRgb) && (accent ?? tokens.accent)) {
    const rgb = navioxHexRgb(accent ?? tokens.accent!);
    if (rgb) style['--nx-accent-rgb'] = rgb;
  }
  if (input.appearance?.fontFamily) style['--nx-font'] = input.appearance.fontFamily;
  if (input.appearance?.radius) style['--nx-radius'] = input.appearance.radius;
  const colorScheme = definition?.colorScheme ?? (name === 'nocturne' ? 'dark' : 'light');
  style.colorScheme = colorScheme;
  return { name, colorScheme, style };
}
