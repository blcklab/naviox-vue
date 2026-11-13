export { NavioxPalette } from './components/NavioxPalette.js';
export { useNaviox } from './composables/useNaviox.js';
export type { NavioxPaletteProps, NavioxPaletteTheme, NavioxPaletteExpose } from './components/NavioxPalette.js';
export type { UseNavioxOptions, UseNavioxReturn } from './composables/useNaviox.js';
// Core is a direct adapter dependency, automatically installed with Naviox Vue; these are convenient public type re-exports.
export type { NavioxController, NavioxItem, NavioxGroup, NavioxOptions, NavioxState, NavioxProvider } from '@blcklab/naviox';

export { defineNavioxTheme, resolveNavioxTheme, navioxHexRgb, navioxThemeClass, defaultSystemThemes } from './theme.js';
export type { NavioxThemeDefinition, NavioxThemeTokens, NavioxAppearance, NavioxThemeName, NavioxBuiltInTheme, NavioxPaletteVariant, NavioxSearchPosition, NavioxSearchStyle, NavioxBackdrop, NavioxPreviewPlacement, NavioxSystemThemes, NavioxColorScheme } from './theme.js';

export { NavioxMegaMenu } from './components/NavioxMegaMenu.js';
export { NavioxAutocomplete } from './components/NavioxAutocomplete.js';

export { NavioxCommand, NavioxCommandInput, NavioxCommandList, NavioxCommandItem, NavioxCommandGroup, NavioxCommandEmpty, NavioxCommandLoading, NavioxCommandSeparator, NavioxCommandShortcut, NavioxRoot, NavioxInput, NavioxList, NavioxItemPrimitive, NavioxGroupPrimitive, NavioxEmpty, NavioxLoading, NavioxSeparator, NavioxShortcut } from './components/NavioxCommand.js';

export { NavioxCommandVirtualList } from './components/NavioxCommand.js';
export { NavioxPalette as NavioxCommandDialog, NavioxPalette as NavioxDialog } from './components/NavioxPalette.js';

export { defineNavioxFlavor } from './flavor.js';
export type { NavioxFlavorDefinition } from './flavor.js';

export { defineNavioxAnatomy, resolveNavioxAnatomyStyle } from './anatomy.js';
export type { NavioxPaletteAnatomy, NavioxItemVisual, NavioxResultIconMode, NavioxIconShape, NavioxPaletteIconName } from './anatomy.js';

// Advanced navigation anatomy — usable without internal CSS class knowledge.
export { defineNavioxMegaMenuAnatomy, defineNavioxAutocompleteAnatomy,
  resolveMegaMenuAnatomyStyle, resolveAutocompleteAnatomyStyle } from './navigation-anatomy.js';
export type { NavioxMegaMenuAnatomy, NavioxAutocompleteAnatomy } from './navigation-anatomy.js';

export { navioxPrecisionFlavor } from './precision.js';
export { filterNavioxActions, nextNavioxActionId, matchesNavioxActionShortcut } from './context-actions.js';
export type { NavioxContextAction, NavioxContextActions } from './context-actions.js';
