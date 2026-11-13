/** Vue adapter-owned contextual actions. Core execution/navigation stays headless. */
import type { NavioxItem } from '@blcklab/naviox';
import type { NavioxPaletteIconName } from './anatomy.js';

export interface NavioxContextAction {
  /** Unique within the selected item's actions. */
  id: string;
  title: string;
  description?: string;
  group?: string;
  shortcut?: string;
  icon?: NavioxPaletteIconName;
  disabled?: boolean;
  /** Called for the currently selected item; may be asynchronous. */
  perform: (item: NavioxItem) => unknown | Promise<unknown>;
}

export type NavioxContextActions =
  | readonly NavioxContextAction[]
  | ((item: NavioxItem) => readonly NavioxContextAction[]);

/** Accent-insensitive, token-based filtering. No external search or core change. */
export function filterNavioxActions(
  actions: readonly NavioxContextAction[], query: string,
): NavioxContextAction[] {
  const words = query.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [...actions];
  return actions.filter((action) => {
    const haystack = [action.title, action.description, action.group].filter(Boolean).join(' ')
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

/** Wrap or start at first/last enabled action without selecting disabled entries. */
export function nextNavioxActionId(
  actions: readonly NavioxContextAction[], currentId: string | null,
  direction: 'next' | 'previous' | 'first' | 'last',
): string | null {
  const enabled = actions.filter((action) => !action.disabled);
  if (!enabled.length) return null;
  if (direction === 'first') return enabled[0]!.id;
  if (direction === 'last') return enabled[enabled.length - 1]!.id;
  const index = enabled.findIndex((action) => action.id === currentId);
  return enabled[((index < 0 ? (direction === 'next' ? -1 : 0) : index) +
    (direction === 'next' ? 1 : -1) + enabled.length) % enabled.length]!.id;
}

/** Mod+K is the default while the dialog is open; the app can turn it off. */
export function matchesNavioxActionShortcut(
  event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'repeat' | 'isComposing'>,
  shortcut: string,
  platform: 'mac' | 'other',
): boolean {
  if (!shortcut || event.repeat || event.isComposing || event.altKey) return false;
  const parts = shortcut.toLowerCase().replace(/\s+/g, '').split('+');
  const key = parts.pop();
  const wantsMod = parts.includes('mod');
  const wantsCtrl = parts.includes('ctrl') || (wantsMod && platform === 'other');
  const wantsMeta = parts.includes('meta') || (wantsMod && platform === 'mac');
  const wantsShift = parts.includes('shift');
  return !!key && event.key.toLowerCase() === key && event.ctrlKey === wantsCtrl &&
    event.metaKey === wantsMeta && event.shiftKey === wantsShift;
}
