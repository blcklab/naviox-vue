import type { NavioxPaletteAnatomy } from './anatomy.js';

/** Public, optional anatomy for the default MegaMenu. Slots can replace any region. */
export interface NavioxMegaMenuAnatomy {
  row?: NavioxPaletteAnatomy['row'];
  preview?: NavioxPaletteAnatomy['preview'];
  panel?: {
    width?: string;
    maxHeight?: string;
    previewWidth?: string;
    previewPlacement?: 'left' | 'right' | 'bottom';
    accentLine?: boolean;
    footerDivider?: boolean;
  };
}

/** Public, optional anatomy for the default contextual Autocomplete. */
export interface NavioxAutocompleteAnatomy {
  row?: NavioxPaletteAnatomy['row'];
  field?: {
    height?: string;
    radius?: string;
    padding?: string;
    gap?: string;
    surface?: 'plain' | 'filled' | 'outlined';
    iconPosition?: 'start' | 'end' | 'none';
    clearable?: boolean;
  };
  panel?: {
    width?: string;
    maxHeight?: string;
    placement?: 'below' | 'above';
    align?: 'start' | 'end';
    footerDivider?: boolean;
  };
}

/** Creates a separate immutable-by-convention configuration without global registration. */
export function defineNavioxMegaMenuAnatomy<T extends NavioxMegaMenuAnatomy>(definition: T): T {
  return { ...definition, ...(definition.row && { row: { ...definition.row } }),
    ...(definition.preview && { preview: { ...definition.preview } }),
    ...(definition.panel && { panel: { ...definition.panel } }) } as T;
}
export function defineNavioxAutocompleteAnatomy<T extends NavioxAutocompleteAnatomy>(definition: T): T {
  return { ...definition, ...(definition.row && { row: { ...definition.row } }),
    ...(definition.field && { field: { ...definition.field } }),
    ...(definition.panel && { panel: { ...definition.panel } }) } as T;
}

function put(target: Record<string, string>, variable: string, value?: string): void {
  if (typeof value === 'string' && value.trim()) target[variable] = value;
}

export function resolveMegaMenuAnatomyStyle(anatomy?: NavioxMegaMenuAnatomy): Record<string, string> {
  const style: Record<string, string> = {};
  put(style, '--nx-mega-width', anatomy?.panel?.width);
  put(style, '--nx-mega-max-height', anatomy?.panel?.maxHeight);
  put(style, '--nx-mega-preview-width', anatomy?.panel?.previewWidth);
  put(style, '--nx-mega-row-height', anatomy?.row?.minHeight);
  put(style, '--nx-mega-row-padding', anatomy?.row?.padding);
  put(style, '--nx-mega-row-gap', anatomy?.row?.gap);
  put(style, '--nx-mega-row-radius', anatomy?.row?.radius);
  put(style, '--nx-mega-icon-size', anatomy?.row?.iconSize);
  put(style, '--nx-mega-preview-padding', anatomy?.preview?.padding);
  put(style, '--nx-mega-art-ratio', anatomy?.preview?.imageAspectRatio);
  if (anatomy?.preview?.imageFit) style['--nx-mega-art-fit'] = anatomy.preview.imageFit;
  if (anatomy?.preview?.titleFont) style['--nx-mega-title-font'] = anatomy.preview.titleFont === 'sans' ? 'var(--nx-font)' : 'var(--nx-serif)';
  return style;
}

export function resolveAutocompleteAnatomyStyle(anatomy?: NavioxAutocompleteAnatomy): Record<string, string> {
  const style: Record<string, string> = {};
  put(style, '--nx-auto-field-height', anatomy?.field?.height);
  put(style, '--nx-auto-field-radius', anatomy?.field?.radius);
  put(style, '--nx-auto-field-padding', anatomy?.field?.padding);
  put(style, '--nx-auto-field-gap', anatomy?.field?.gap);
  put(style, '--nx-auto-panel-width', anatomy?.panel?.width);
  put(style, '--nx-auto-panel-max-height', anatomy?.panel?.maxHeight);
  put(style, '--nx-auto-row-height', anatomy?.row?.minHeight);
  put(style, '--nx-auto-row-padding', anatomy?.row?.padding);
  put(style, '--nx-auto-row-gap', anatomy?.row?.gap);
  put(style, '--nx-auto-row-radius', anatomy?.row?.radius);
  put(style, '--nx-auto-icon-size', anatomy?.row?.iconSize);
  return style;
}
