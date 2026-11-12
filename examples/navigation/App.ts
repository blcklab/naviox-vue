import { defineComponent, h, ref } from 'vue';
import type { NavioxItem } from '@blcklab/naviox';
import { NavioxMegaMenu, NavioxAutocomplete, NavioxPalette } from '../../src/index.js';

const pages: NavioxItem[] = [
  { id: 'guestbook', title: 'Guestbook', description: 'Sign it, say hi', group: 'Pages', href: '#guestbook',
    preview: { description: 'A quiet corner for everyone who passes through. Leave a few words in the archive.', meta: [{ label: 'Collection', value: 'People' }] } },
  { id: 'craft', title: 'My craft', description: 'Things I could not stop building', group: 'Pages', href: '#craft',
    preview: { description: 'Projects, experiments and open-source software. Each one begins as a question.', meta: [{ label: 'Collection', value: 'Open source' }, { label: 'Status', value: 'Always evolving' }] } },
  { id: 'about', title: 'About', description: 'The story behind the work', group: 'Pages', href: '#about' },
  { id: 'uses', title: 'Uses', description: 'Tools and favorite utilities', group: 'Elsewhere', href: '#uses' },
  { id: 'links', title: 'Links', description: 'Every profile in one place', group: 'Elsewhere', href: '#links' },
];

export const NavigationDemo = defineComponent({
  name: 'NavigationDemo',
  setup() {
    const theme = ref<'sakura' | 'nocturne' | 'ink'>('sakura');
    return () => h('main', { class: 'scene' }, [
      h('header', { class: 'scene-header' }, [
        h('div', { class: 'brand' }, ['BLCK ', h('em', 'LAB')]),
        h('div', { class: 'scene-nav' }, [
          h('button', { type: 'button', class: 'scene-theme', onClick: () => { theme.value = theme.value === 'sakura' ? 'nocturne' : theme.value === 'nocturne' ? 'ink' : 'sakura'; } }, `Theme: ${theme.value}`),
          h(NavioxMegaMenu, { items: pages, groups: [{ id: 'Pages', title: 'PAGES' }, { id: 'Elsewhere', title: 'OTHER' }], theme: theme.value, label: 'Site navigation', triggerLabel: 'Explore' }),
        ]),
      ]),
      h('section', { class: 'scene-hero' }, [
        h('span', { class: 'eyebrow' }, 'THE OPEN ARCHIVE · 2026'),
        h('h1', ['Every idea has ', h('em', 'a place.')]),
        h('p', 'A collection of things imagined, built, and shared. Browse the archive, or find something by name.'),
        h('div', { class: 'scene-search' }, [h(NavioxAutocomplete, { items: pages, theme: theme.value, label: 'Search pages', placeholder: 'Search pages and projects…' })]),
        h('span', { class: 'scene-helper' }, 'NAVIOX / MEGA-MENU + AUTOCOMPLETE'),
      ]),
      h('footer', { class: 'scene-footer' }, [
        h('span', 'Light on the surface. Powerful underneath.'),
        h(NavioxPalette, { items: pages, theme: theme.value, variant: 'spotlight', size: 'regular', placeholder: 'Open the archive…' }),
      ]),
    ]);
  },
});
