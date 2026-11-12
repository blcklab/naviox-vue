import type {
  NavioxActivationResult, NavioxController, NavioxExecutionResult,
  NavioxGroup, NavioxItem, NavioxOptions, NavioxShortcutEvent, NavioxState,
} from '@blcklab/naviox';
import {
  computed, defineComponent, h, nextTick, onMounted, onBeforeUnmount, ref,
  shallowRef, Teleport, useId, watch,
} from 'vue';
import type { PropType, VNode, VNodeChild } from 'vue';
import { useNaviox } from '../composables/useNaviox.js';
import { commandNavigation, nextCommandId, commandSearchOptions } from '../internal/command-navigation.js';
import { icon } from '../internal/icons.js';
import { safeNavigationHref } from '../internal/urls.js';
import { wrapModalTabFocus } from '../internal/focus.js';
import { defaultSystemThemes, navioxThemeClass, resolveNavioxTheme } from '../theme.js';
import type { NavioxAppearance, NavioxPaletteVariant, NavioxSystemThemes, NavioxThemeDefinition, NavioxThemeName } from '../theme.js';

export type NavioxPaletteTheme = NavioxThemeName;

export interface NavioxPaletteProps {
  items?: readonly NavioxItem[];
  controller?: NavioxController;
  options?: NavioxOptions;
  groups?: readonly NavioxGroup[];
  label?: string;
  placeholder?: string;
  shortcut?: string;
  showTrigger?: boolean;
  preview?: boolean;
  theme?: NavioxPaletteTheme;
  /** Named, per-instance theme definitions; no global registration. */
  themes?: Readonly<Record<string, NavioxThemeDefinition>>;
  /** Reactively follow light/dark OS preference when theme='system'. */
  systemThemes?: NavioxSystemThemes;
  appearance?: NavioxAppearance;
  variant?: NavioxPaletteVariant;
  size?: 'regular' | 'wide';
  dir?: 'ltr' | 'rtl';
  vimNavigation?: boolean;
  groupNavigation?: boolean;
  shouldFilter?: boolean;
  /** For v-model: initial and subsequent external open-state changes. */
  modelValue?: boolean;
  teleportTo?: string;
  /** Route interception. If absent, browser location is used for href items. */
  navigate?: (item: NavioxItem) => unknown | Promise<unknown>;
}

export interface NavioxPaletteExpose {
  controller: NavioxController;
  open(): void;
  close(): void;
  toggle(): void;
  focusSearch(): void;
}

/** A Vue 3 command palette. DOM, focus, presentation and routing stay in the adapter. */
export const NavioxPalette = defineComponent({
  name: 'NavioxPalette',
  props: {
    items: { type: Array as PropType<readonly NavioxItem[]>, default: () => [] },
    controller: { type: Object as PropType<NavioxController>, default: undefined },
    options: { type: Object as PropType<NavioxOptions>, default: undefined },
    groups: { type: Array as PropType<readonly NavioxGroup[]>, default: undefined },
    label: { type: String, default: 'Quick navigation' },
    placeholder: { type: String, default: 'Search projects, pages, actions…' },
    shortcut: { type: String, default: 'Mod+K' },
    showTrigger: { type: Boolean, default: true },
    preview: { type: Boolean, default: true },
    theme: { type: String as PropType<NavioxPaletteTheme>, default: 'ink' },
    themes: { type: Object as PropType<Readonly<Record<string, NavioxThemeDefinition>>>, default: undefined },
    systemThemes: { type: Object as PropType<NavioxSystemThemes>, default: () => defaultSystemThemes },
    appearance: { type: Object as PropType<NavioxAppearance>, default: undefined },
    variant: { type: String as PropType<NavioxPaletteVariant>, default: 'floating' },
    size: { type: String as PropType<'regular' | 'wide'>, default: 'regular' },
    dir: { type: String as PropType<'ltr' | 'rtl'>, default: 'ltr' },
    vimNavigation: { type: Boolean, default: false },
    groupNavigation: { type: Boolean, default: false },
    shouldFilter: { type: Boolean, default: true },
    modelValue: { type: Boolean, default: undefined },
    teleportTo: { type: String, default: 'body' },
    navigate: { type: Function as PropType<(item: NavioxItem) => unknown | Promise<unknown>>, default: undefined },
  },
  emits: {
    'update:modelValue': (_value: boolean) => true,
    'open-change': (_value: boolean) => true,
    select: (_item: NavioxItem) => true,
    navigate: (_item: NavioxItem) => true,
    execute: (_result: NavioxExecutionResult) => true,
  },
  setup(props, { emit, expose, slots }) {
    const platform: 'mac' | 'other' = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
      ? 'mac' : 'other';
    const { controller, state, owned } = useNaviox({
      controller: props.controller,
      items: () => props.items,
      options: {
        ...commandSearchOptions(props.options, props.shouldFilter),
        groupResults: props.options?.groupResults ?? true,
        groups: props.groups ?? props.options?.groups,
        defaultOpen: props.modelValue ?? props.options?.defaultOpen,
        shortcuts: { ...props.options?.shortcuts, platform, toggle: props.shortcut },
        navigate: props.options?.navigate ?? (async (item) => {
          emit('navigate', item);
          if (props.navigate) return props.navigate(item);
          if (typeof window !== 'undefined') { const href = safeNavigationHref(item.href); if (href) window.location.assign(href); }
        }),
      },
    });
    const mounted = ref(false);
    const prefersDark = ref(false);
    const resolvedTheme = computed(() => resolveNavioxTheme({
      theme: props.theme, themes: props.themes, prefersDark: prefersDark.value,
      systemThemes: props.systemThemes, appearance: props.appearance,
    }));
    const themeClasses = computed(() => [
      navioxThemeClass(resolvedTheme.value.name),
      `naviox-variant-${props.variant}`,
      `naviox-density-${props.appearance?.density ?? 'comfortable'}`,
      props.appearance?.motion === 'reduced' && 'naviox-motion-reduced',
    ]);
    let themeMedia: MediaQueryList | null = null;
    const onSchemeChange = (event: MediaQueryListEvent) => { prefersDark.value = event.matches; };
    const dialog = ref<HTMLDialogElement | null>(null);
    const input = ref<HTMLInputElement | null>(null);
    const results = ref<HTMLElement | null>(null);
    const focusBefore = shallowRef<HTMLElement | null>(null);
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '-');
    const listId = `${id}-list`;
    const labelId = `${id}-label`;
    const hintId = `${id}-hint`;
    let dialogSyncGeneration = 0;
    let programmaticClose = false;
    const optionId = (item: NavioxItem) => `${id}-item-${Array.from(item.id, char => char.codePointAt(0)!.toString(16)).join('-')}`;
    const isFavorite = (item: NavioxItem) => state.value.favoriteIds.includes(item.id);
    const isPinned = (item: NavioxItem) => state.value.pinnedIds.includes(item.id);

    function open(): void { controller.open(); }
    function close(): void { controller.close(); }
    function toggle(): void { controller.toggle(); }
    function focusSearch(): void { input.value?.focus(); }
    expose({ controller, open, close, toggle, focusSearch } satisfies NavioxPaletteExpose);

    function handleActivation(outcome: NavioxActivationResult): void {
      if (outcome.kind === 'selected' && outcome.item) emit('select', outcome.item);
      if (outcome.kind === 'executing' && outcome.completion) {
        void outcome.completion.then((result) => emit('execute', result));
      }
      if (outcome.kind === 'page') void nextTick(focusSearch);
    }

    function activate(item?: NavioxItem): void {
      handleActivation(controller.activate(item?.id));
    }

    function onInputKey(event: KeyboardEvent): void {
      if (event.isComposing || event.key === 'Process') return;
      const special = commandNavigation(event, { vim: props.vimNavigation, jumpGroups: props.groupNavigation });
      if (special) {
        event.preventDefault(); event.stopPropagation();
        const id = nextCommandId(state.value.results, state.value.activeId, special.direction, special.groups);
        if (id) controller.setActive(id);
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        activate();
        return;
      }
      // Leave normal text editing and Home/End caret movement to the browser.
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Escape'].includes(event.key)
        && !(event.key === 'Backspace' && !state.value.query)
        && !(event.key === 'ArrowLeft' && event.altKey)) return;
      const key = event.key === 'ArrowLeft' && event.altKey ? 'Alt+ArrowLeft' : event.key;
      const result = controller.handleKey(key);
      if (result.handled) event.preventDefault();
    }

    function onDocumentKey(event: KeyboardEvent): void {
      const target = event.target as HTMLElement | null;
      const editable = !!target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (event.isComposing || event.defaultPrevented || (editable && !event.metaKey && !event.ctrlKey && !event.altKey)) return;
      const descriptor: NavioxShortcutEvent = {
        key: event.key, metaKey: event.metaKey, ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey, altKey: event.altKey, repeat: event.repeat,
        isComposing: event.isComposing, targetEditable: editable,
      };
      const outcome = controller.handleShortcut(descriptor);
      if (!outcome.handled) return;
      event.preventDefault();
      if (outcome.execution) void outcome.execution.then((result) => emit('execute', result));
    }

    async function syncDialog(): Promise<void> {
      if (!mounted.value) return;
      const generation = ++dialogSyncGeneration;
      await nextTick();
      if (generation !== dialogSyncGeneration) return;
      const node = dialog.value;
      if (!node) return;
      if (state.value.open && !node.open) {
        focusBefore.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        try { node.showModal(); } catch { return; }
        await nextTick();
        input.value?.focus({ preventScroll: true });
      } else if (!state.value.open && node.open) {
        programmaticClose = true;
        node.close();
        if (focusBefore.value?.isConnected) focusBefore.value.focus({ preventScroll: true });
        focusBefore.value = null;
      }
    }

    function onCancel(event: Event): void {
      event.preventDefault();
      if (!controller.back()) controller.close();
    }

    function onDialogClick(event: MouseEvent): void {
      if (event.target !== event.currentTarget) return;
      // Native dialog backdrop click only; click inside the panel is ignored.
      const rect = dialog.value?.getBoundingClientRect();
      if (!rect) return;
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    }

    watch(() => state.value.open, (value, previous) => {
      if (value !== previous) {
        emit('update:modelValue', value);
        emit('open-change', value);
      }
      void syncDialog();
    }, { flush: 'sync' });
    watch(() => state.value.activeId, (id) => {
      if (!id || !state.value.open || typeof document === 'undefined') return;
      void nextTick(() => {
        const match = document.getElementById(optionId({ id } as NavioxItem));
        if (match && results.value?.contains(match)) match.scrollIntoView({ block: 'nearest' });
      });
    }, { flush: 'post' });
    watch(() => props.modelValue, (next) => {
      if (next === undefined || next === controller.getState().open) return;
      if (next) open(); else close();
    }, { flush: 'sync' });
    watch(() => props.groups, (next) => {
      if (owned && next) controller.setGroups(next);
    });

    onMounted(() => {
      if (typeof window.matchMedia === 'function') {
        themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        prefersDark.value = themeMedia.matches;
        themeMedia.addEventListener?.('change', onSchemeChange);
      }
      mounted.value = true;
      document.addEventListener('keydown', onDocumentKey);
      void syncDialog();
    });
    onBeforeUnmount(() => {
      themeMedia?.removeEventListener?.('change', onSchemeChange);
      document.removeEventListener('keydown', onDocumentKey);
      // Native modal dialogs must be closed before unmount to release top layer.
      if (dialog.value?.open) dialog.value.close();
      if (focusBefore.value?.isConnected) focusBefore.value.focus({ preventScroll: true });
    });

    function renderOption(item: NavioxItem, snapshot: NavioxState): VNode {
      const active = snapshot.activeId === item.id;
      const chosen = slots.item?.({ item, state: snapshot, active, activate: () => activate(item) }) as VNodeChild | undefined;
      return h('div', {
        key: item.id, id: optionId(item), role: 'option',
        'aria-selected': active ? 'true' : 'false',
        'aria-disabled': item.disabled || item.readOnly ? 'true' : undefined,
        class: ['naviox-item', active && 'is-active', (item.disabled || item.readOnly) && 'is-disabled'],
        onPointerenter: (event: PointerEvent) => { if (event.pointerType !== 'touch') controller.setActive(item.id); },
        onMousedown: (event: MouseEvent) => event.preventDefault(),
        onClick: () => { if (!item.disabled && !item.readOnly) activate(item); },
      }, chosen ?? [
        h('span', { class: 'naviox-item-icon' }, [icon(item.href ? 'link' : item.kind === 'command' ? 'command' : 'folder', 17)]),
        h('span', { class: 'naviox-item-copy' }, [
          h('span', { class: 'naviox-item-title' }, item.title),
          item.description && h('span', { class: 'naviox-item-desc' }, item.description),
        ]),
        isPinned(item) && h('span', { class: 'naviox-mark', title: 'Pinned' }, [icon('pin', 12)]),
        isFavorite(item) && h('span', { class: 'naviox-mark', title: 'Favorite' }, [icon('star', 12)]),
        item.shortcuts?.[0] && h('kbd', { class: 'naviox-keycap naviox-item-shortcut' }, item.shortcuts[0]),
        h('span', { class: 'naviox-item-tail' }, [icon('chevron', 15)]),
      ]);
    }

    function renderPreview(item: NavioxItem | undefined, snapshot: NavioxState): VNode {
      const custom = slots.preview?.({ item, state: snapshot }) as VNodeChild | undefined;
      if (custom !== undefined) {
        return h(
          'aside',
          {
            class: 'naviox-preview',
            'aria-label': 'Selected item preview'
          },
          custom ?? undefined
        );
      }
      return h('aside', { class: 'naviox-preview', 'aria-label': 'Selected item preview' }, item ? [
        h('div', { class: ['naviox-art', !item.preview?.image && 'naviox-art-generated'] }, [
          item.preview?.image
            ? h('img', { src: item.preview.image, alt: item.preview.imageAlt ?? `Preview: ${item.title}`, loading: 'lazy' })
            : h('div', { class: 'naviox-art-symbol', 'aria-hidden': 'true' }, [
              h('span', { class: 'naviox-art-arc' }),
              h('span', { class: 'naviox-art-glyph' }, item.title.slice(0, 1).toUpperCase()),
              h('span', { class: 'naviox-art-caption' }, 'NAVIOX / ARCHIVE'),
            ]),
        ]),
        h('div', { class: 'naviox-preview-heading' }, [
          h('span', { class: 'naviox-eyebrow' }, item.kind ?? item.group ?? 'Selected'),
          h('h3', { class: 'naviox-preview-title' }, item.title),
          h('p', { class: 'naviox-preview-desc' }, item.preview?.description ?? item.description ?? 'Open this item to explore more.'),
        ]),
        ...(item.preview?.meta ?? []).map((entry) => h('div', { class: 'naviox-meta', key: entry.label }, [h('span', entry.label), h('span', entry.value)])),
        h('div', { class: 'naviox-preview-actions' }, [
          h('button', { type: 'button', class: 'naviox-mini-action', 'aria-label': isFavorite(item) ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`, onClick: () => controller.toggleFavorite(item.id) }, [icon('star', 14), isFavorite(item) ? 'Saved' : 'Save']),
          h('button', { type: 'button', class: 'naviox-mini-action', 'aria-label': isPinned(item) ? `Unpin ${item.title}` : `Pin ${item.title}`, onClick: () => controller.togglePinned(item.id) }, [icon('pin', 14), isPinned(item) ? 'Pinned' : 'Pin']),
        ]),
      ] : [h('div', { class: 'naviox-preview-idle' }, [icon('sparkle', 27), h('p', 'Select an item to see its details')])]);
    }

    function renderDialog(): VNode {
      const snapshot = state.value;
      const selected = snapshot.results.find((item) => item.id === snapshot.activeId);
      const anyErrors = Object.entries(snapshot.providers).filter(([, info]) => info.status === 'error');
      const hasMore = Object.entries(snapshot.providers).filter(([, info]) => info.hasMore);
      const groups = snapshot.sections;
      const activeId = selected ? optionId(selected) : undefined;
      const defaultContent = h('div', { class: 'naviox-layout' }, [
        h('div', { class: 'naviox-results-pane' }, [
          snapshot.breadcrumbs.length > 0 && h('nav', { class: 'naviox-breadcrumbs', 'aria-label': 'Command path' }, [
            h('button', { type: 'button', class: 'naviox-crumb', onClick: () => controller.setPage(null) }, 'Home'),
            ...snapshot.breadcrumbs.flatMap((crumb, i) => [
              icon('chevron', 12),
              h('button', { type: 'button', class: 'naviox-crumb', key: crumb.id, onClick: () => controller.setPage(crumb.id), 'aria-current': i === snapshot.breadcrumbs.length - 1 ? 'page' : undefined }, crumb.title),
            ]),
          ]),
          // Disclosures belong OUTSIDE the listbox. ARIA listboxes contain only
          // options (possibly grouped), never buttons or other widgets.
          !!groups.length && h('div', { class: 'naviox-group-controls', role: 'group', 'aria-label': 'Result group filters' }, groups.map((section) => h('button', {
            key: section.id, type: 'button', class: 'naviox-group-toggle',
            'aria-expanded': String(!section.collapsed),
            'aria-label': `${section.collapsed ? 'Expand' : 'Collapse'} ${section.title || 'Results'} group`,
            onClick: () => { controller.toggleGroup(section.id); focusSearch(); },
          }, [h('span', section.title || 'Results'), h('span', { class: 'naviox-section-count' }, String(section.total)), icon('chevron', 12)]))),
          h('div', { class: 'naviox-results-scroll', ref: results, tabindex: 0, role: 'region', 'aria-label': 'Scrollable command results' }, [
            h('div', { id: listId, role: 'listbox', 'aria-label': 'Search results', 'aria-busy': snapshot.providersLoading ? 'true' : 'false', class: 'naviox-listbox' }, groups.length
              ? groups.filter((section) => section.items.length).map((section) => h('div', { key: section.id, role: 'group', 'aria-label': section.title || 'Results', class: 'naviox-section' }, [
                h('div', { class: 'naviox-section-heading', 'aria-hidden': 'true' }, section.title || 'Results'),
                ...section.items.map((item) => renderOption(item, snapshot)),
              ])) : []),
            !snapshot.results.length && !snapshot.providersLoading && h('div', { class: 'naviox-empty', role: 'status' }, slots.empty?.({ query: snapshot.query }) ?? [
              icon('search', 24), h('strong', 'Nothing found'), h('span', snapshot.query ? `No results for “${snapshot.query}”.` : 'Try a search or explore the available commands.'),
            ]),
            snapshot.providersLoading && h('div', { class: 'naviox-feed-status', role: 'status' }, [icon('loading', 15), 'Searching connected sources…']),
            ...anyErrors.map(([provider]) => h('button', { key: provider, type: 'button', class: 'naviox-feed-action', onClick: () => { void controller.refreshProviders(); } }, `Retry ${provider} search`)),
            ...hasMore.map(([provider]) => h('button', { key: `more-${provider}`, type: 'button', class: 'naviox-feed-action', onClick: () => { void controller.loadMore(provider); } }, `Load more from ${provider}`)),
          ]),
        ]),
        props.preview && renderPreview(selected, snapshot),
      ]);
      const defaultFooter = h('footer', { class: 'naviox-footer' }, [
        h('span', { class: 'naviox-footer-count', role: 'status', 'aria-live': 'polite' }, snapshot.execution.status === 'running'
          ? snapshot.execution.progress?.message ?? 'Running command…'
          : `${snapshot.totalResults} ${snapshot.totalResults === 1 ? 'result' : 'results'}`),
        h('span', { class: 'naviox-footer-help' }, [h('kbd', '↑'), h('kbd', '↓'), 'Navigate', h('kbd', '↵'), 'Open', h('kbd', 'Esc'), 'Close']),
      ]);
      return h('dialog', {
        dir: props.dir, ref: dialog,
        class: ['naviox-dialog', ...themeClasses.value, `naviox-size-${props.size}`, !props.preview && 'naviox-no-preview'],
        style: resolvedTheme.value.style,
        'data-naviox-theme': resolvedTheme.value.name,
        'data-naviox-variant': props.variant,
        'aria-labelledby': labelId,
        'aria-describedby': hintId,
        onCancel,
        onKeydown: (event: KeyboardEvent) => wrapModalTabFocus(event, dialog.value),
        onClose: () => {
          if (programmaticClose) {
            programmaticClose = false;
            if (controller.getState().open) void syncDialog();
          } else if (controller.getState().open) close();
        },
        onClick: onDialogClick,
      }, [h('div', { class: 'naviox-shell' }, [
        h('header', { class: 'naviox-searchbar' }, [
          h('span', { class: 'naviox-search-icon' }, [icon('search', 20)]),
          h('label', { id: labelId, for: `${id}-search`, class: 'naviox-sr-only' }, props.label),
          h('input', {
            id: `${id}-search`, ref: input, type: 'search', role: 'combobox',
            class: 'naviox-search-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: false,
            'aria-label': props.label, 'aria-controls': listId, 'aria-expanded': 'true',
            'aria-haspopup': 'listbox', 'aria-autocomplete': 'list',
            'aria-activedescendant': activeId, placeholder: props.placeholder,
            value: snapshot.query,
            onInput: (event: Event) => controller.setQuery((event.target as HTMLInputElement).value),
            onKeydown: onInputKey,
          }),
          snapshot.query && h('button', { type: 'button', class: 'naviox-clear', 'aria-label': 'Clear search', onClick: () => { controller.setQuery(''); focusSearch(); } }, [icon('close', 14)]),
          h('button', { type: 'button', class: 'naviox-dismiss', 'aria-label': 'Close command palette', onClick: close }, [h('kbd', 'ESC')]),
        ]),
        h('div', { id: hintId, class: 'naviox-sr-only' }, 'Use up and down arrows to navigate; Enter to open; Escape to go back or close.'),
        slots.header?.({ state: snapshot, controller }),
        slots.content?.({ state: snapshot, controller, activate }) ?? defaultContent,
        snapshot.execution.status === 'running' && h('div', { class: 'naviox-progress', role: 'status' }, [
          h('span', snapshot.execution.progress?.message ?? 'Working…'),
          h('button', { type: 'button', onClick: () => controller.cancelExecution() }, 'Cancel'),
        ]),
        snapshot.execution.status === 'error' && h('div', { class: 'naviox-error', role: 'alert' }, 'This command failed. You can retry.'),
        slots.footer?.({ state: snapshot, controller }) ?? defaultFooter,
      ])]);
    }

    return () => h('div', {
      class: ['naviox-mount', ...themeClasses.value],
      style: resolvedTheme.value.style,
      'data-naviox-theme': resolvedTheme.value.name,
    }, [
      props.showTrigger && (slots.trigger
        ? slots.trigger({ open, close, toggle, state: state.value })
        : h('button', { type: 'button', class: 'naviox-trigger', 'aria-haspopup': 'dialog', 'aria-expanded': state.value.open, onClick: open }, [
          icon('search', 15), h('span', 'Search anything'), h('kbd', props.shortcut.replace('Mod', platform === 'mac' ? '⌘' : 'Ctrl')),
        ])),
      h(Teleport, { to: props.teleportTo, disabled: !mounted.value }, [renderDialog()]),
    ]);
  },
});
