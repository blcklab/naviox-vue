/** Public, framework-neutral appearance contracts for the palette UI.
 * The search engine, navigation and execution remain in @blcklab/naviox.
 * No CSS selector knowledge is required by consumers.
 */
export type NavioxResultIconMode = 'tile' | 'outline' | 'plain' | 'monogram' | 'thumbnail';
export type NavioxIconShape = 'rounded' | 'square' | 'circle';
export type NavioxPaletteIconName = 'search' | 'arrow' | 'back' | 'chevron' | 'close' | 'command' |
  'folder' | 'link' | 'sparkle' | 'clock' | 'loading' | 'star' | 'pin' | 'keyboard' |
  'home' | 'user' | 'book' | 'list' | 'send' | 'document' | 'code' | 'laptop' | 'layers' | 'refresh' | 'bolt' | 'terminal';

/** Visual data for a single result. Framework-specific SVGs are supported through itemIcon slots/renderers. */
export interface NavioxItemVisual {
  mode?: NavioxResultIconMode;
  icon?: NavioxPaletteIconName;
  image?: string;
  imageAlt?: string;
  monogram?: string;
  background?: string;
  foreground?: string;
  borderColor?: string;
  badge?: string;
}

/** Optional anatomy of the *default* palette. For wholly custom layouts, use slots/render props. */
export interface NavioxPaletteAnatomy {
  search?: {
    /** Position of the search glyph inside the input chrome. */
    iconPosition?: 'start' | 'end' | 'none';
    /** Whether the clear button appears when there is a query. */
    clearable?: boolean;
    gap?: string;
  };
  row?: {
    minHeight?: string;
    padding?: string;
    gap?: string;
    radius?: string;
    iconSize?: string;
    iconShape?: NavioxIconShape;
    showDescription?: boolean;
    showShortcut?: boolean;
    showTail?: boolean;
    showMarkers?: boolean;
    showBadge?: boolean;
  };
  /** Contextual action subview geometry; supported with or without Precision. */
  actions?: {
    width?: string;
    maxHeight?: string;
    radius?: string;
    rowMinHeight?: string;
    placement?: 'left' | 'right';
  };
  preview?: {
    showArtwork?: boolean;
    showDescription?: boolean;
    showMetadata?: boolean;
    showActions?: boolean;
    padding?: string;
    imageAspectRatio?: string;
    imageFit?: 'cover' | 'contain';
    titleFont?: 'serif' | 'sans';
  };
}

/** Returns a fresh, typed object; does not register any global styles. */
export function defineNavioxAnatomy<T extends NavioxPaletteAnatomy>(definition: T): T {
  return {
    ...definition,
    ...(definition.search && { search: { ...definition.search } }),
    ...(definition.row && { row: { ...definition.row } }),
    ...(definition.preview && { preview: { ...definition.preview } }),
    ...(definition.actions && { actions: { ...definition.actions } }),
  } as T;
}

/** Stable, public CSS custom properties applied to the teleported dialog. */
export function resolveNavioxAnatomyStyle(anatomy?: NavioxPaletteAnatomy): Record<string, string> {
  const style: Record<string, string> = {};
  const entries: readonly [string | undefined, string][] = [
    [anatomy?.search?.gap, '--nx-search-gap'],
    [anatomy?.row?.minHeight, '--nx-row-height'],
    [anatomy?.row?.padding, '--nx-row-padding'],
    [anatomy?.row?.gap, '--nx-row-gap'],
    [anatomy?.row?.radius, '--nx-row-radius'],
    [anatomy?.row?.iconSize, '--nx-item-icon-size'],
    [anatomy?.preview?.padding, '--nx-preview-padding'],
    [anatomy?.preview?.imageAspectRatio, '--nx-preview-art-ratio'],
    [anatomy?.actions?.width, '--nx-actions-width'],
    [anatomy?.actions?.maxHeight, '--nx-actions-max-height'],
    [anatomy?.actions?.radius, '--nx-actions-radius'],
    [anatomy?.actions?.rowMinHeight, '--nx-actions-row-height'],
  ];
  for (const [value, token] of entries) if (value !== undefined && value !== '') style[token] = value;
  if (anatomy?.preview?.imageFit) style['--nx-preview-image-fit'] = anatomy.preview.imageFit;
  if (anatomy?.preview?.titleFont) style['--nx-preview-title-font'] = anatomy.preview.titleFont === 'sans' ? 'var(--nx-font)' : 'var(--nx-serif)';
  return style;
}
