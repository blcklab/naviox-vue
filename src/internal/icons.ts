import { h } from 'vue';
import type { VNode } from 'vue';

export type NavioxIconName = 'search' | 'arrow' | 'back' | 'chevron' | 'close' | 'command' |
  'folder' | 'link' | 'sparkle' | 'clock' | 'loading' | 'star' | 'pin' | 'keyboard' |
  'home' | 'user' | 'book' | 'list' | 'send' | 'document' | 'code' | 'laptop' | 'layers' | 'refresh' | 'bolt' | 'terminal';

const paths: Record<NavioxIconName, string> = {
  search: 'm21 21-4.35-4.35 M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  arrow: 'M5 12h14m-7-7 7 7-7 7',
  back: 'm15 18-6-6 6-6',
  chevron: 'm9 18 6-6-6-6',
  close: 'M18 6 6 18 M6 6l12 12',
  command: 'M9 7V5a2 2 0 1 0-2 2h10a2 2 0 1 0 2-2v12a2 2 0 1 0 2 2H5a2 2 0 1 0 2 2V9h12',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10H3z',
  link: 'M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-2 2m3 5a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l2-2',
  sparkle: 'm12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z M19 18l.5 1.5L21 20l-1.5.5L19 22l-.5-1.5L17 20l1.5-.5z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  loading: 'M12 2a10 10 0 0 1 10 10',
  star: 'm12 2 3.1 6.3L22 9.3l-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z',
  pin: 'm16 3 5 5-3 1-3 4 1 3-2 2-4-4-7 7-1-1 7-7-4-4 2-2 3 1 4-3z',
  keyboard: 'M3 6h18v12H3z M7 10h.01 M11 10h.01 M15 10h.01 M7 14h10',
  home: 'M3 10 12 3l9 7v10H3z M9 20v-7h6v7',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2 M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  book: 'M4 5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 0-2 2z M4 5v15a2 2 0 0 1 2-2h14',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  send: 'm22 2-7 20-4-9-9-4z M22 2 11 13',
  document: 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h6',
  code: 'm8 8-4 4 4 4 M16 8l4 4-4 4 M14 4 10 20',
  laptop: 'M4 4h16v12H4z M2 20h20',
  layers: 'm12 2 9 5-9 5-9-5z m-9 9 9 5 9-5 M3 16l9 5 9-5',
  refresh: 'M20 11a8 8 0 0 0-14-5L3 9 M3 3v6h6 M4 13a8 8 0 0 0 14 5l3-3 M21 21v-6h-6',
  bolt: 'm13 2-9 12h7l-1 8 10-12h-7z',
  terminal: 'm4 6 6 6-6 6 M12 18h8',

};

export function icon(name: NavioxIconName, size = 18): VNode {
  return h('svg', {
    viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
    'stroke-width': 1.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'aria-hidden': 'true', focusable: 'false', class: ['naviox-icon', name === 'loading' && 'naviox-spin'],
  }, [h('path', { d: paths[name] })]);
}
