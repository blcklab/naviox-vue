/** Default result visuals shared by MegaMenu and Autocomplete.
 * No global registrations, no framework dependencies beyond Vue itself.
 * Consumers may replace the icon via #itemIcon or the entire row via #item.
 */
import type { NavioxItem } from '@blcklab/naviox';
import { h } from 'vue';
import type { VNode, VNodeChild } from 'vue';
import type { NavioxIconShape, NavioxItemVisual, NavioxPaletteAnatomy } from '../anatomy.js';
import { icon } from './icons.js';

export function navioxNavigationItemIcon(
  item: NavioxItem, visual?: NavioxItemVisual, row?: NavioxPaletteAnatomy['row'],
  replacement?: VNodeChild,
): VNode {
  const mode = visual?.mode ?? 'monogram';
  const shape: NavioxIconShape = row?.iconShape ?? 'rounded';
  const children: VNodeChild = replacement != null ? replacement :
    visual?.image && (mode === 'thumbnail' || mode === 'tile')
      ? h('img', { src: visual.image, alt: visual.imageAlt ?? '', loading: 'lazy' })
      : mode === 'monogram' || (!visual?.icon && !visual?.image)
        ? h('span', { class: 'naviox-nav-glyph' }, (visual?.monogram ?? item.title.slice(0, 1)).slice(0, 4))
        : icon(visual?.icon ?? 'folder', 18);
  return h('span', {
    class: 'naviox-nav-icon', 'data-naviox-part': 'icon',
    'data-naviox-mode': mode, 'data-naviox-shape': shape,
    'aria-hidden': 'true',
    style: {
      ...(visual?.background && mode !== 'plain' && mode !== 'outline' ? { background: visual.background } : {}),
      ...(visual?.foreground ? { color: visual.foreground } : {}),
      ...(visual?.borderColor ? { borderColor: visual.borderColor } : {}),
    },
  }, children ?? undefined);
}
