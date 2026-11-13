import { defineNavioxFlavor } from './flavor.js';
import { defineNavioxTheme } from './theme.js';

/** Optional precision launcher preset. Can be changed or overridden per instance.
 * UI inspiration: restrained launchers; not affiliated with any third-party app. */
export const navioxPrecisionFlavor = defineNavioxFlavor({
  theme: 'precision',
  themes: {
    precision: defineNavioxTheme({ colorScheme: 'dark', tokens: {
      surface: '#171719', elevated: '#242427', text: '#f4f4f5', muted: '#a2a1a7',
      soft: '#84838a', border: '#3a3a40', hover: '#29292d', selected: '#353539',
      accent: '#c7c6d4', accentText: '#f4f4f6',
      artStart: '#37333e', artEnd: '#1b1b20', artLine: '#797380',
      shadow: '0 28px 100px rgba(0,0,0,.64)',
      searchSurface: '#171719', searchBorder: '#34343a',
      backdropColor: 'rgba(9,9,13,.58)',
    } }),
  },
  appearance: { density: 'comfortable', radius: '20px', searchHeight: '78px' },
  variant: 'precision',
  size: 'wide',
  preview: false,
  searchPosition: 'top',
  searchDivider: true,
  showGroupControls: false,
  backdrop: 'dim',
  anatomy: {
    row: { iconSize: '36px', iconShape: 'rounded', minHeight: '49px',
      padding: '6px 12px', gap: '12px', radius: '12px',
      showDescription: true, showBadge: true, showTail: false },
    search: { iconPosition: 'start', clearable: true },
  },
});
