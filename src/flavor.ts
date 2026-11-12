/** A flavor configures the full presentation, not just its colors. */
import type { NavioxPaletteAnatomy } from './anatomy.js';
import type {
  NavioxAppearance, NavioxBackdrop, NavioxPaletteVariant,
  NavioxPreviewPlacement, NavioxSearchPosition, NavioxSearchStyle,
  NavioxThemeDefinition, NavioxThemeName,
} from './theme.js';

/** Spread directly onto NavioxPalette (Vue v-bind / React JSX props).
 * Icon and preview components remain composable via the adapter's slots/renderers.
 */
export interface NavioxFlavorDefinition {
  theme?: NavioxThemeName;
  themes?: Readonly<Record<string, NavioxThemeDefinition>>;
  appearance?: NavioxAppearance;
  anatomy?: NavioxPaletteAnatomy;
  variant?: NavioxPaletteVariant;
  size?: 'regular' | 'wide';
  preview?: boolean;
  searchPosition?: NavioxSearchPosition;
  searchDivider?: boolean;
  searchStyle?: NavioxSearchStyle;
  showSearchIcon?: boolean;
  showDismiss?: boolean;
  backdrop?: NavioxBackdrop;
  previewPlacement?: NavioxPreviewPlacement;
}

/** Type-checked, dependency-free flavor definition; no global registry. */
export function defineNavioxFlavor<T extends NavioxFlavorDefinition>(definition: T): T {
  return definition;
}
