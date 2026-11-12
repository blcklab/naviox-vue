import type { NavioxController, NavioxExecutionResult, NavioxItem, NavioxOptions } from '@blcklab/naviox';
import { computed, defineComponent, h, onMounted, onBeforeUnmount, ref, useId, watch } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import type { NavioxItemVisual } from '../anatomy.js';
import type { NavioxAutocompleteAnatomy } from '../navigation-anatomy.js';
import { resolveAutocompleteAnatomyStyle } from '../navigation-anatomy.js';
import { navioxNavigationItemIcon } from '../internal/navigation-visual.js';
import { useNaviox } from '../composables/useNaviox.js';
import { safeNavigationHref } from '../internal/urls.js';
import { nextVisibleOptionId } from '../internal/keyboard.js';
import { defaultSystemThemes, navioxThemeClass, resolveNavioxTheme } from '../theme.js';
import type { NavioxAppearance, NavioxSystemThemes, NavioxThemeDefinition, NavioxThemeName } from '../theme.js';

/** Inline combobox powered by the M3 controller; supports registered async providers. */
export const NavioxAutocomplete = defineComponent({
  name: 'NavioxAutocomplete',
  props: {
    dir: { type: String as PropType<'ltr' | 'rtl'>, default: 'ltr' },
    items: { type: Array as PropType<readonly NavioxItem[]>, default: () => [] },
    controller: { type: Object as PropType<NavioxController>, default: undefined },
    options: { type: Object as PropType<NavioxOptions>, default: undefined },
    modelValue: { type: String, default: undefined },
    placeholder: { type: String, default: 'Find something…' },
    label: { type: String, default: 'Search' },
    maxResults: { type: Number, default: 8 },
    minChars: { type: Number, default: 0 },
    theme: { type: String as PropType<NavioxThemeName>, default: 'ink' },
    themes: { type: Object as PropType<Readonly<Record<string, NavioxThemeDefinition>>>, default: undefined },
    systemThemes: { type: Object as PropType<NavioxSystemThemes>, default: () => defaultSystemThemes },
    appearance: { type: Object as PropType<NavioxAppearance>, default: undefined },
    anatomy: { type: Object as PropType<NavioxAutocompleteAnatomy>, default: undefined },
    visuals: { type: Object as PropType<Readonly<Record<string, NavioxItemVisual>>>, default: undefined },
    navigate: { type: Function as PropType<(item: NavioxItem) => unknown>, default: undefined },
  },
  emits: {
    'update:modelValue': (_value: string) => true,
    'open-change': (_value: boolean) => true,
    select: (_item: NavioxItem) => true,
    execute: (_result: NavioxExecutionResult) => true,
  },
  setup(props, { emit, expose, slots }) {
    const { controller, state } = useNaviox({
      controller: props.controller,
      items: () => props.items,
      options: {
        ...props.options,
        maxResults: props.maxResults,
        defaultOpen: false,
        defaultQuery: props.modelValue ?? props.options?.defaultQuery ?? '',
        navigate: props.options?.navigate ?? ((item) => {
          if (props.navigate) return props.navigate(item);
          if (typeof window !== 'undefined') { const href = safeNavigationHref(item.href); if (href) window.location.assign(href); }
        }),
      },
    });
    const root = ref<HTMLElement | null>(null);
    const input = ref<HTMLInputElement | null>(null);
    const uid = useId().replace(/[^\w-]/g, '-');
    const listId = `${uid}-suggestions`;
    const itemDomId = (item: NavioxItem) => `${uid}-${Array.from(item.id, (c) => c.codePointAt(0)!.toString(16)).join('-')}`;
    const prefersDark = ref(false);
    let media: MediaQueryList | undefined;
    const onScheme = (event: MediaQueryListEvent) => { prefersDark.value = event.matches; };
    const theme = computed(() => resolveNavioxTheme({ theme: props.theme, themes: props.themes, prefersDark: prefersDark.value, systemThemes: props.systemThemes, appearance: props.appearance }));
    const enough = computed(() => state.value.query.trim().length >= Math.max(0, props.minChars));
    const results = computed(() => enough.value ? state.value.results.slice(0, Math.max(0, props.maxResults)) : []);
    const visible = computed(() => state.value.open);
    const selected = computed(() => results.value.find((item) => item.id === state.value.activeId));
    // The core can contain more results than this combobox displays. Keyboard
    // navigation must stay inside the exposed listbox, not hidden core results.
    function moveVisible(direction: 1 | -1) {
      const id = nextVisibleOptionId(results.value, state.value.activeId, direction);
      if (id !== null) controller.setActive(id);
    }
    function open() { controller.open(); }
    function close() { controller.close(); }
    function focus() { input.value?.focus(); }
    expose({ controller, open, close, focus });
    function activate(item?: NavioxItem) {
      const target = item ?? selected.value;
      if (!target || target.disabled || target.readOnly) return;
      const result = controller.activate(target.id);
      if (result.kind === 'selected' || result.kind === 'executing') emit('select', target);
      if (result.kind === 'executing' && result.completion) void result.completion.then((value) => emit('execute', value));
      if (result.kind === 'page') { input.value?.focus(); return; }
    }
    function onInput(event: Event) {
      const value = (event.target as HTMLInputElement).value;
      controller.setQuery(value);
      emit('update:modelValue', value);
      if (!state.value.open) open();
    }
    function onKey(event: KeyboardEvent) {
      if (event.isComposing || event.key === 'Process') return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!state.value.open) open();
        moveVisible(event.key === 'ArrowDown' ? 1 : -1);
      } else if (event.key === 'Enter' && visible.value && selected.value) {
        event.preventDefault(); activate();
      } else if (event.key === 'Escape' && visible.value) { event.preventDefault(); close(); }
    }
    function onOutside(event: PointerEvent) { if (!root.value?.contains(event.target as Node)) close(); }
    watch(() => props.modelValue, (value) => { if (value !== undefined && value !== controller.getState().query) controller.setQuery(value); });
    watch(() => state.value.open, (value, old) => { if (value !== old) emit('open-change', value); });
    onMounted(() => {
      document.addEventListener('pointerdown', onOutside);
      if (typeof window !== 'undefined' && window.matchMedia) {
        media = window.matchMedia('(prefers-color-scheme: dark)'); prefersDark.value = media.matches; media.addEventListener?.('change', onScheme);
      }
    });
    onBeforeUnmount(() => { document.removeEventListener('pointerdown', onOutside); media?.removeEventListener?.('change', onScheme); });
    return () => h('div', {
      ref: root, dir: props.dir, class: ['naviox-mount', 'naviox-auto', navioxThemeClass(theme.value.name)],
      style: { ...theme.value.style, ...resolveAutocompleteAnatomyStyle(props.anatomy) },
      'data-naviox-panel-placement': props.anatomy?.panel?.placement ?? 'below',
      'data-naviox-panel-align': props.anatomy?.panel?.align ?? 'start',
      'data-naviox-field-surface': props.anatomy?.field?.surface ?? 'filled',
      'data-naviox-field-icon-position': props.anatomy?.field?.iconPosition ?? 'start',
      onFocusout: (event: FocusEvent) => { if (event.relatedTarget && !root.value?.contains(event.relatedTarget as Node)) close(); },
    }, [
      h('div', { class: 'naviox-auto-field', 'data-naviox-part': 'search' }, [
        props.anatomy?.field?.iconPosition !== 'none' && (slots.prefix?.() as VNodeChild ?? h('span', { 'aria-hidden': 'true', class: 'naviox-auto-search-icon' }, '⌕')),
        h('input', { ref: input, type: 'search', autocomplete: 'off', class: 'naviox-auto-input', role: 'combobox',
          'aria-label': props.label, 'aria-autocomplete': 'list', 'aria-haspopup': 'listbox', 'aria-controls': visible.value ? listId : undefined,
          'aria-expanded': String(visible.value), 'aria-activedescendant': visible.value && selected.value ? itemDomId(selected.value) : undefined,
          placeholder: props.placeholder, value: state.value.query, onFocus: open, onInput, onKeydown: onKey,
        }),
        props.anatomy?.field?.clearable !== false && state.value.query && h('button', { type: 'button', class: 'naviox-auto-clear', 'aria-label': 'Clear search', onClick: () => { controller.setQuery(''); emit('update:modelValue', ''); focus(); } }, '×'),
      ]),
      visible.value && h('div', { class: 'naviox-auto-panel', 'data-naviox-part': 'panel',
        'data-naviox-footer-divider': String(props.anatomy?.panel?.footerDivider !== false) }, [
        h('div', { id: listId, role: 'listbox', class: 'naviox-auto-list', 'aria-label': `${props.label} suggestions`, 'aria-busy': state.value.providersLoading ? 'true' : 'false' }, results.value.map((item) =>
          h('div', { id: itemDomId(item), key: item.id, role: 'option', 'aria-selected': item.id === state.value.activeId ? 'true' : 'false', 'aria-disabled': item.disabled || item.readOnly ? 'true' : undefined, 'data-naviox-part': 'item', class: ['naviox-auto-option', item.id === state.value.activeId && 'is-active', (item.disabled || item.readOnly) && 'is-disabled'],
            onPointerenter: (event: PointerEvent) => { if (event.pointerType !== 'touch' && !item.disabled && !item.readOnly) controller.setActive(item.id); }, onMousedown: (event: MouseEvent) => event.preventDefault(), onClick: () => activate(item),
          }, slots.item?.({ item, active: item.id === state.value.activeId, activate: () => activate(item) }) as VNodeChild ?? [
            navioxNavigationItemIcon(item, props.visuals?.[item.id], props.anatomy?.row,
              slots.itemIcon?.({ item, active: item.id === state.value.activeId }) as VNodeChild | undefined),
            h('span', { class: 'naviox-auto-copy', 'data-naviox-part': 'item-copy' }, [
              h('strong', item.title), props.anatomy?.row?.showDescription !== false && item.description && h('small', item.description),
            ]),
            props.anatomy?.row?.showBadge !== false && props.visuals?.[item.id]?.badge && h('span', { class: 'naviox-nav-badge' }, props.visuals[item.id]!.badge),
            props.anatomy?.row?.showShortcut !== false && item.shortcuts?.[0] && h('kbd', { class: 'naviox-nav-shortcut' }, item.shortcuts[0]),
            props.anatomy?.row?.showTail !== false && h('span', { 'aria-hidden': 'true', class: 'naviox-auto-arrow' }, '↗'),
          ]))),
        state.value.providersLoading && h('div', { role: 'status', class: 'naviox-auto-status' }, 'Searching…'),
        !results.value.length && !state.value.providersLoading && h('div', { role: 'status', class: 'naviox-auto-empty' }, slots.empty?.({ query: state.value.query }) ?? (enough.value ? 'No matching results' : `Type at least ${props.minChars} characters`)),
        slots.footer?.({ controller, state: state.value }) as VNodeChild ?? h('div', { class: 'naviox-auto-footer', 'data-naviox-part': 'footer' }, [h('span', `${results.value.length} suggestions`), h('span', '↑↓ · Enter · Esc')]),
      ]),
    ]);
  },
});
