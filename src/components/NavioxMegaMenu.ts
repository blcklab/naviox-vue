import { rankItems, sectionItems } from '@blcklab/naviox';
import type { NavioxController, NavioxExecutionResult, NavioxGroup, NavioxItem } from '@blcklab/naviox';
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useId, watch } from 'vue';
import type { PropType, VNodeChild } from 'vue';
import type { NavioxItemVisual } from '../anatomy.js';
import type { NavioxMegaMenuAnatomy } from '../navigation-anatomy.js';
import { resolveMegaMenuAnatomyStyle } from '../navigation-anatomy.js';
import { navioxNavigationItemIcon } from '../internal/navigation-visual.js';
import { safeNavigationHref } from '../internal/urls.js';
import { mergeNavioxMenuItems } from '../internal/menu-items.js';
import { defaultSystemThemes, navioxThemeClass, resolveNavioxTheme } from '../theme.js';
import type { NavioxAppearance, NavioxSystemThemes, NavioxThemeDefinition, NavioxThemeName } from '../theme.js';

/** Responsive navigation disclosure with an optional contextual preview. No React or DOM logic in core. */
export const NavioxMegaMenu = defineComponent({
  name: 'NavioxMegaMenu',
  props: {
    dir: { type: String as PropType<'ltr' | 'rtl'>, default: 'ltr' },
    items: { type: Array as PropType<readonly NavioxItem[]>, default: () => [] },
    /** Optional shared M7 controller; never owned by this menu. */
    controller: { type: Object as PropType<NavioxController>, default: undefined },
    groups: { type: Array as PropType<readonly NavioxGroup[]>, default: () => [] },
    label: { type: String, default: 'Explore' },
    triggerLabel: { type: String, default: 'More' },
    preview: { type: Boolean, default: true },
    openOnHover: { type: Boolean, default: true },
    hoverDelay: { type: Number, default: 90 },
    closeDelay: { type: Number, default: 170 },
    closeOnSelect: { type: Boolean, default: true },
    modelValue: { type: Boolean, default: undefined },
    theme: { type: String as PropType<NavioxThemeName>, default: 'ink' },
    themes: { type: Object as PropType<Readonly<Record<string, NavioxThemeDefinition>>>, default: undefined },
    systemThemes: { type: Object as PropType<NavioxSystemThemes>, default: () => defaultSystemThemes },
    appearance: { type: Object as PropType<NavioxAppearance>, default: undefined },
    /** Default rendering controls. Existing slots continue to override these defaults. */
    anatomy: { type: Object as PropType<NavioxMegaMenuAnatomy>, default: undefined },
    visuals: { type: Object as PropType<Readonly<Record<string, NavioxItemVisual>>>, default: undefined },
    navigate: { type: Function as PropType<(item: NavioxItem) => unknown>, default: undefined },
  },
  emits: {
    'update:modelValue': (_value: boolean) => true,
    'open-change': (_value: boolean) => true,
    select: (_item: NavioxItem) => true,
    execute: (_result: NavioxExecutionResult) => true,
  },
  setup(props, { emit, expose, slots }) {
    const root = ref<HTMLElement | null>(null);
    const trigger = ref<HTMLButtonElement | null>(null);
    const panel = ref<HTMLElement | null>(null);
    const panelShift = ref(0);
    const panelFlipped = ref(false);
    const panelMaxHeight = ref<string | undefined>();
    const expanded = ref(props.modelValue ?? false);
    const activeId = ref<string | null>(null);
    const prefersDark = ref(false);
    const panelId = `${useId().replace(/[^\w-]/g, '-')}-mega`;
    let media: MediaQueryList | undefined;
    let opening: ReturnType<typeof setTimeout> | undefined;
    let closing: ReturnType<typeof setTimeout> | undefined;
    let resizeObserver: ResizeObserver | undefined;
    const onScheme = (event: MediaQueryListEvent) => { prefersDark.value = event.matches; };
    const theme = computed(() => resolveNavioxTheme({ theme: props.theme, themes: props.themes, appearance: props.appearance, prefersDark: prefersDark.value, systemThemes: props.systemThemes }));
    const registered = shallowRef<readonly NavioxItem[]>([]);
    watch(() => props.controller, (controller, _previous, onCleanup) => {
      registered.value = controller?.getItems() ?? [];
      if (controller) onCleanup(controller.subscribe(() => { registered.value = controller.getItems(); }));
    }, { immediate: true });
    const ordered = computed(() => rankItems(mergeNavioxMenuItems(props.items, registered.value), '', Number.MAX_SAFE_INTEGER).map(({ item }) => item));
    const sections = computed(() => sectionItems(ordered.value, props.groups, new Set<string>(), true).sections);
    const focusable = computed(() => ordered.value.filter((item) => !item.disabled && !item.hidden && !item.readOnly));
    const active = computed(() => ordered.value.find((item) => item.id === activeId.value) ?? focusable.value[0]);
    const safeId = (id: string) => `${panelId}-${Array.from(id, (c) => c.codePointAt(0)!.toString(16)).join('-')}`;
    const clearTimers = () => { clearTimeout(opening); clearTimeout(closing); opening = undefined; closing = undefined; };
    function setOpen(next: boolean) {
      clearTimers();
      if (expanded.value === next) return;
      expanded.value = next;
      if (next && !focusable.value.some((item) => item.id === activeId.value)) activeId.value = focusable.value[0]?.id ?? null;
      emit('update:modelValue', next);
      emit('open-change', next);
    }
    function positionPanel() {
      const node = panel.value, anchor = root.value;
      if (!node || !anchor || typeof window === 'undefined') return;
      const right = anchor.getBoundingClientRect().right;
      const width = node.offsetWidth;
      const leftOverflow = Math.max(0, 12 - (right - width));
      const rightOverflow = Math.max(0, right - (window.innerWidth - 12));
      panelShift.value = leftOverflow - rightOverflow;
      const bounds = anchor.getBoundingClientRect();
      const below = Math.max(48, window.innerHeight - bounds.bottom - 25);
      const above = Math.max(48, bounds.top - 25);
      panelFlipped.value = below < Math.min(node.scrollHeight, 330) && above > below;
      panelMaxHeight.value = `${Math.min(580, panelFlipped.value ? above : below)}px`;
    }
    watch(() => expanded.value, (open) => { if (open) void nextTick(() => { positionPanel(); if (panel.value) resizeObserver?.observe(panel.value); }); else { panelShift.value = 0; if (panel.value) resizeObserver?.unobserve(panel.value); } });
    function focusItem(id: string | null) { if (id) void nextTick(() => root.value?.querySelector<HTMLElement>(`[id="${safeId(id)}"]`)?.focus()); }
    function move(direction: number) {
      const enabled = focusable.value;
      if (!enabled.length) return;
      const at = enabled.findIndex((item) => item.id === activeId.value);
      const index = at < 0 ? (direction > 0 ? 0 : enabled.length - 1) : (at + direction + enabled.length) % enabled.length;
      activeId.value = enabled[index]!.id;
      focusItem(activeId.value);
    }
    function open() { setOpen(true); }
    function close() { setOpen(false); }
    function toggle() { setOpen(!expanded.value); }
    expose({ open, close, toggle });
    function activate(item: NavioxItem, event?: MouseEvent) {
      if (item.disabled || item.readOnly) { event?.preventDefault(); return; }
      emit('select', item);
      if (props.controller && (item.kind === 'command' || item.perform) && props.controller.getItems().some((entry) => entry.id === item.id)) {
        event?.preventDefault();
        // A mega-menu can be open while the shared command palette is closed.
        // execute(id) is intentional: activate(id) requires the core palette to be open.
        void props.controller.execute(item.id).then((outcome) => emit('execute', outcome));
      } else if (item.href && props.navigate) { event?.preventDefault(); void props.navigate(item); }
      if (props.closeOnSelect) close();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && expanded.value) { event.preventDefault(); close(); trigger.value?.focus(); return; }
      if (!expanded.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault(); open(); void nextTick(() => { const target = event.key === 'ArrowDown' ? focusable.value[0] : focusable.value.at(-1); activeId.value = target?.id ?? null; focusItem(activeId.value); }); return;
      }
      if (!expanded.value) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1); }
      else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); const option = event.key === 'Home' ? focusable.value[0] : focusable.value.at(-1);
        activeId.value = option?.id ?? null; focusItem(activeId.value);
      }
    }
    function onOutside(event: PointerEvent) { if (!root.value?.contains(event.target as Node)) close(); }
    function onPointerEnter(event: PointerEvent) {
      clearTimeout(closing);
      if (props.openOnHover && event.pointerType !== 'touch' && !expanded.value) opening = setTimeout(open, Math.max(0, props.hoverDelay));
    }
    function onPointerLeave(event: PointerEvent) {
      clearTimeout(opening);
      if (props.openOnHover && event.pointerType !== 'touch') closing = setTimeout(close, Math.max(0, props.closeDelay));
    }
    watch(() => props.modelValue, (value) => { if (value !== undefined) { expanded.value = value; clearTimers(); } });
    watch(() => focusable.value, (items) => { if (!items.some((item) => item.id === activeId.value)) activeId.value = items[0]?.id ?? null; });
    onMounted(() => {
      document.addEventListener('pointerdown', onOutside);
      window.addEventListener('resize', positionPanel);
      // Capture scrolls from scrollable ancestors as well as the window.
      window.addEventListener('scroll', positionPanel, true);
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(positionPanel);
        if (root.value) resizeObserver.observe(root.value);
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        media = window.matchMedia('(prefers-color-scheme: dark)'); prefersDark.value = media.matches;
        media.addEventListener?.('change', onScheme);
      }
    });
    onBeforeUnmount(() => { clearTimers(); document.removeEventListener('pointerdown', onOutside); window.removeEventListener('resize', positionPanel); window.removeEventListener('scroll', positionPanel, true); resizeObserver?.disconnect(); media?.removeEventListener?.('change', onScheme); });
    return () => h('div', {
      dir: props.dir,
      ref: root,
      class: ['naviox-mount', 'naviox-mega', navioxThemeClass(theme.value.name), `naviox-density-${props.appearance?.density ?? 'comfortable'}`, props.appearance?.motion === 'reduced' && 'naviox-motion-reduced'],
      style: { ...theme.value.style, ...resolveMegaMenuAnatomyStyle(props.anatomy) },
      onKeydown: onKey, onPointerenter: onPointerEnter, onPointerleave: onPointerLeave,
      onFocusout: (event: FocusEvent) => { if (event.relatedTarget && !root.value?.contains(event.relatedTarget as Node)) close(); },
    }, [
      h('button', { ref: trigger, type: 'button', class: 'naviox-mega-trigger', 'aria-expanded': String(expanded.value), 'aria-controls': panelId, onClick: toggle }, slots.trigger?.({ open, close, toggle, expanded: expanded.value }) ?? [props.triggerLabel, h('span', { class: 'naviox-mega-caret', 'aria-hidden': 'true' }, expanded.value ? '⌃' : '⌄')]),
      expanded.value && h('div', { ref: panel, id: panelId, 'data-naviox-part': 'panel',
        'data-naviox-preview-placement': props.anatomy?.panel?.previewPlacement ?? 'right',
        'data-naviox-accent-line': String(props.anatomy?.panel?.accentLine !== false),
        'data-naviox-footer-divider': String(props.anatomy?.panel?.footerDivider !== false),
        class: ['naviox-mega-panel', panelFlipped.value && 'is-flipped', !props.preview && 'naviox-mega-no-preview'],
        style: { right: `${-panelShift.value}px`, maxHeight: panelMaxHeight.value ? `min(${panelMaxHeight.value}, var(--nx-mega-max-height, 580px))` : undefined } }, [
        h('nav', { class: 'naviox-mega-results', 'aria-label': props.label }, sections.value.map((section) => h('section', { key: section.id, class: 'naviox-mega-section' }, [
          section.title && h('h3', { class: 'naviox-mega-section-label' }, section.title),
          ...section.items.map((item) => {
            const selected = item.id === active.value?.id;
            const attrs = { id: safeId(item.id), class: ['naviox-mega-link', selected && 'is-active'],
              'data-naviox-part': 'item', 'aria-disabled': item.disabled || item.readOnly ? 'true' : undefined,
              tabindex: item.disabled || item.readOnly ? -1 : 0,
              onFocus: () => { if (!item.disabled && !item.readOnly) activeId.value = item.id; },
              onPointerenter: (event: PointerEvent) => { if (event.pointerType !== 'touch' && !item.disabled && !item.readOnly) activeId.value = item.id; }, onClick: (event: MouseEvent) => activate(item, event) };
            const href = safeNavigationHref(item.href);
            return h(href && item.kind !== 'command' && !item.perform && !item.disabled && !item.readOnly ? 'a' : 'button', {
              ...attrs, key: item.id, ...(href && item.kind !== 'command' && !item.perform && !item.disabled && !item.readOnly ? { href } : { type: 'button' }),
            }, slots.item?.({ item, active: selected, activate: (event?: MouseEvent) => activate(item, event) }) as VNodeChild ?? [
              navioxNavigationItemIcon(item, props.visuals?.[item.id], props.anatomy?.row,
                slots.itemIcon?.({ item, active: selected }) as VNodeChild | undefined),
              h('span', { class: 'naviox-mega-copy', 'data-naviox-part': 'item-copy' }, [
                h('strong', item.title),
                props.anatomy?.row?.showDescription !== false && item.description && h('small', item.description),
              ]),
              props.anatomy?.row?.showBadge !== false && props.visuals?.[item.id]?.badge && h('span', { class: 'naviox-nav-badge' }, props.visuals[item.id]!.badge),
              props.anatomy?.row?.showShortcut !== false && item.shortcuts?.[0] && h('kbd', { class: 'naviox-nav-shortcut' }, item.shortcuts[0]),
              props.anatomy?.row?.showTail !== false && h('span', { class: 'naviox-mega-link-arrow', 'aria-hidden': 'true' }, '↗'),
            ]);
          }),
        ]))),
        props.preview && h('aside', { class: 'naviox-mega-preview', 'data-naviox-part': 'preview', 'aria-label': 'Navigation preview' }, slots.preview?.({ item: active.value }) as VNodeChild ?? (active.value ? [
          props.anatomy?.preview?.showArtwork !== false && h('div', { class: ['naviox-mega-art', !active.value.preview?.image && 'is-generated'], 'data-naviox-part': 'preview-art' }, active.value.preview?.image ? [h('img', { src: active.value.preview.image, alt: active.value.preview.imageAlt ?? '', loading: 'lazy' })] : [h('span', { 'aria-hidden': 'true' }, active.value.title.slice(0, 1))]),
          h('span', { class: 'naviox-mega-eyebrow' }, active.value.group ?? active.value.kind ?? 'Explore'),
          h('h3', { class: 'naviox-mega-title' }, active.value.title),
          props.anatomy?.preview?.showDescription !== false && h('p', { class: 'naviox-mega-description' }, active.value.preview?.description ?? active.value.description ?? ''),
          ...(props.anatomy?.preview?.showMetadata === false ? [] : (active.value.preview?.meta ?? [])).map((entry) => h('div', { class: 'naviox-mega-meta', key: entry.label }, [h('span', entry.label), h('span', entry.value)])),
        ] : h('p', 'Explore the collection'))),
        slots.footer?.() as VNodeChild ?? h('footer', { class: 'naviox-mega-footer', 'data-naviox-part': 'footer' }, [h('span', `${ordered.value.length} destinations`), h('span', '↑ ↓ Navigate  ·  Esc Close')]),
      ]),
    ]);
  },
});
