import type { NavioxItem } from '@blcklab/naviox';

/** Pure navigation helpers. Adapters own key handling; the core remains DOM-free. */
export function nextCommandId(items: readonly NavioxItem[], current: string | null, delta: 1 | -1, byGroup = false): string | null {
  const eligible = items.filter((item) => !item.disabled && !item.hidden);
  if (!eligible.length) return null;
  if (!byGroup) {
    const index = eligible.findIndex((item) => item.id === current);
    const next = index < 0 ? (delta === 1 ? 0 : eligible.length - 1) : (index + delta + eligible.length) % eligible.length;
    return eligible[next]?.id ?? null;
  }
  const groups: string[] = [];
  for (const item of eligible) if (!groups.includes(item.group ?? '')) groups.push(item.group ?? '');
  const currentItem = eligible.find((item) => item.id === current);
  const position = groups.indexOf(currentItem?.group ?? '');
  const target = groups[(position < 0 ? (delta === 1 ? 0 : groups.length - 1) : (position + delta + groups.length) % groups.length)];
  return eligible.find((item) => (item.group ?? '') === target)?.id ?? null;
}

/** Preserve IME, plain-text editing, and avoid stealing the global palette shortcut. */
export function commandNavigation(event: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean; isComposing?: boolean }, options: { vim?: boolean; jumpGroups?: boolean } = {}): { direction: 1 | -1; groups: boolean } | null {
  if (event.isComposing || event.shiftKey || event.metaKey) return null;
  if (options.jumpGroups && event.altKey && !event.ctrlKey && ['ArrowDown','ArrowUp'].includes(event.key)) {
    return { direction: event.key === 'ArrowDown' ? 1 : -1, groups: true };
  }
  if (options.vim && event.ctrlKey && !event.altKey && (event.key.toLowerCase() === 'j' || event.key.toLowerCase() === 'k')) {
    return { direction: event.key.toLowerCase() === 'j' ? 1 : -1, groups: false };
  }
  return null;
}

export function commandItemId(prefix: string, id: string): string {
  return `${prefix}-option-${Array.from(id, (char) => char.codePointAt(0)!.toString(16)).join('-')}`;
}

export function commandSearchOptions<T extends { search?: { score?: (...args: any[]) => number } }>(options: T | undefined, shouldFilter: boolean | undefined): T {
  if (shouldFilter !== false) return ({ ...options } as T);
  return { ...options, search: { ...options?.search, score: () => 1 } } as T;
}
