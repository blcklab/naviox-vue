import { getNavioxVirtualWindow } from '@blcklab/naviox';
import type { NavioxController, NavioxGroup as CoreGroup, NavioxItem, NavioxOptions, NavioxState, NavioxExecutionResult } from '@blcklab/naviox';
import { computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, shallowRef, useId, watch } from 'vue';
import type { InjectionKey, PropType } from 'vue';
import { useNaviox } from '../composables/useNaviox.js';
import { commandItemId, commandNavigation, commandSearchOptions, nextCommandId } from '../internal/command-navigation.js';
import { defaultSystemThemes, navioxThemeClass, resolveNavioxTheme } from '../theme.js';
import type { NavioxAppearance, NavioxSystemThemes, NavioxThemeDefinition, NavioxThemeName } from '../theme.js';

export interface NavioxCommandContext {
  controller: NavioxController;
  state: Readonly<{ value: NavioxState }>;
  listId: string;
  optionId(id: string): string;
  vimNavigation: Readonly<{ value: boolean }>;
  groupNavigation: Readonly<{ value: boolean }>;
  activate(item: NavioxItem): void;
  syncGroup(id: string, group: CoreGroup | null): void;
  registerSelect(id: string, listener: (item: NavioxItem) => void): () => void;
}
const commandKey: InjectionKey<NavioxCommandContext> = Symbol('naviox-command');
const groupKey: InjectionKey<string | null> = Symbol('naviox-group');
function useCommand(): NavioxCommandContext {
  const context = inject(commandKey, null);
  if (!context) throw new Error('Naviox command primitives must be rendered within <NavioxCommand>.');
  return context;
}

/** Inline composable command root; NavioxPalette remains the ready-made modal. */
export const NavioxCommand = defineComponent({
  name: 'NavioxCommand',
  props: {
    controller: { type: Object as PropType<NavioxController>, default: undefined },
    items: { type: Array as PropType<readonly NavioxItem[]>, default: () => [] },
    options: { type: Object as PropType<NavioxOptions>, default: undefined },
    modelValue: { type: String, default: undefined },
    defaultQuery: { type: String, default: '' },
    activeId: { type: String as PropType<string | null>, default: undefined },
    shouldFilter: { type: Boolean, default: true },
    vimNavigation: { type: Boolean, default: false },
    groupNavigation: { type: Boolean, default: false },
    dir: { type: String as PropType<'ltr' | 'rtl'>, default: 'ltr' },
    theme: { type: String as PropType<NavioxThemeName>, default: 'ink' },
    themes: { type: Object as PropType<Readonly<Record<string, NavioxThemeDefinition>>>, default: undefined },
    systemThemes: { type: Object as PropType<NavioxSystemThemes>, default: () => defaultSystemThemes },
    appearance: { type: Object as PropType<NavioxAppearance>, default: undefined },
  },
  emits: {
    'update:modelValue': (_value: string) => true,
    'update:activeId': (_value: string | null) => true,
    select: (_item: NavioxItem) => true,
    execute: (_result: NavioxExecutionResult) => true,
  },
  setup(props, { emit, slots, attrs, expose }) {
    const { controller, state } = useNaviox({
      controller: props.controller, items: () => props.items,
      options: {
        ...commandSearchOptions(props.options, props.shouldFilter),
        defaultOpen: true,
        groupResults: true,
        maxResults: props.options?.maxResults ?? 1000,
        defaultQuery: props.modelValue ?? props.defaultQuery ?? props.options?.defaultQuery ?? '',
      },
    });
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '-');
    const listId = `${uid}-list`;
    const registeredGroups = new Map<string, CoreGroup>();
    const originalGroups = controller.getGroups();
    const syncGroup = (id: string, value: CoreGroup | null) => {
      if (value) registeredGroups.set(id, value);
      else registeredGroups.delete(id);
      controller.setGroups([...originalGroups.filter((entry) => !registeredGroups.has(entry.id)), ...registeredGroups.values()]);
    };
    const itemSelects = new Map<string, Set<(item: NavioxItem) => void>>();
    const registerSelect = (id: string, listener: (item: NavioxItem) => void) => {
      const listeners = itemSelects.get(id) ?? new Set<(item: NavioxItem) => void>();
      listeners.add(listener); itemSelects.set(id, listeners);
      return () => { listeners.delete(listener); if (!listeners.size) itemSelects.delete(id); };
    };
    const activate = (item: NavioxItem) => {
      if (item.disabled || item.readOnly || !controller.getState().results.some((entry) => entry.id === item.id)) return;
      const result = controller.activate(item.id);
      if (result.kind === 'selected' || result.kind === 'executing') {
        itemSelects.get(item.id)?.forEach((callback) => callback(item));
        emit('select', item);
      }
      if (result.kind === 'executing' && result.completion) void result.completion.then((done) => emit('execute', done));
    };
    const context: NavioxCommandContext = {
      controller, state, listId,
      optionId: (id) => commandItemId(uid, id),
      vimNavigation: computed(() => props.vimNavigation),
      groupNavigation: computed(() => props.groupNavigation),
      activate, syncGroup, registerSelect,
    };
    provide(commandKey, context);
    const prefersDark = ref(false);
    let media: MediaQueryList | undefined;
    const changed = (event: MediaQueryListEvent) => { prefersDark.value = event.matches; };
    onMounted(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      media = window.matchMedia('(prefers-color-scheme: dark)');
      prefersDark.value = media.matches;
      media.addEventListener?.('change', changed);
    });
    onBeforeUnmount(() => media?.removeEventListener?.('change', changed));
    const visual = computed(() => resolveNavioxTheme({ theme: props.theme, themes: props.themes,
      prefersDark: prefersDark.value, systemThemes: props.systemThemes, appearance: props.appearance }));
    watch(() => props.modelValue, (value) => { if (value !== undefined && value !== state.value.query) controller.setQuery(value); });
    watch(() => props.activeId, (value) => { if (value && value !== state.value.activeId) controller.setActive(value); });
    let oldQuery = state.value.query;
    let oldActive = state.value.activeId;
    watch(() => state.value.query, (value) => { if (value !== oldQuery) emit('update:modelValue', value); oldQuery = value; });
    watch(() => state.value.activeId, (value) => { if (value !== oldActive) emit('update:activeId', value); oldActive = value; });
    expose({ controller, focus: () => {}, setQuery: (value: string) => controller.setQuery(value) });
    return () => h('div', {
      ...attrs, dir: props.dir,
      class: ['naviox-command', navioxThemeClass(visual.value.name), `naviox-density-${props.appearance?.density ?? 'comfortable'}`, attrs.class],
      style: [visual.value.style, attrs.style], 'data-naviox-theme': visual.value.name,
    }, slots.default?.({ controller, state: state.value }));
  },
});

export const NavioxCommandInput = defineComponent({
  name: 'NavioxCommandInput',
  props: { placeholder: { type: String, default: 'Type a command or search…' }, label: { type: String, default: 'Search commands' }, autoFocus: Boolean },
  setup(props, { attrs, expose }) {
    const context = useCommand();
    const input = ref<HTMLInputElement | null>(null);
    onMounted(() => { if (props.autoFocus) input.value?.focus(); });
    expose({ focus: () => input.value?.focus() });
    const onKeydown = (event: KeyboardEvent) => {
      if (event.isComposing || event.key === 'Process') return;
      const { controller, state } = context;
      const direction = commandNavigation(event, { vim: context.vimNavigation.value, jumpGroups: context.groupNavigation.value });
      if (direction) {
        event.preventDefault(); event.stopPropagation();
        const next = nextCommandId(state.value.results, state.value.activeId, direction.direction, direction.groups);
        if (next) controller.setActive(next);
        return;
      }
      if (event.key === 'Enter') {
        const item = state.value.results.find((entry) => entry.id === state.value.activeId);
        if (item) { event.preventDefault(); context.activate(item); }
      } else if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) {
        event.preventDefault(); controller.handleKey(event.key);
      } else if (event.key === 'Escape' && state.value.query) {
        event.preventDefault(); controller.setQuery('');
      }
    };
    return () => {
      const selected = context.state.value.results.some((item) => item.id === context.state.value.activeId) ? context.state.value.activeId : null;
      return h('input', { ...attrs, ref: input, type: 'search', role: 'combobox', value: context.state.value.query,
        class: ['naviox-command-input', attrs.class], placeholder: props.placeholder, 'aria-label': props.label,
        'aria-autocomplete': 'list', 'aria-expanded': 'true', 'aria-controls': context.listId,
        'aria-activedescendant': selected ? context.optionId(selected) : undefined,
        autocomplete: 'off', spellcheck: false,
        onInput: (event: Event) => context.controller.setQuery((event.target as HTMLInputElement).value),
        onKeydown,
      });
    };
  },
});

export const NavioxCommandList = defineComponent({
  name: 'NavioxCommandList',
  props: { maxHeight: { type: [Number, String] as PropType<number | string>, default: 320 }, animatedHeight: Boolean },
  setup(props, { slots, attrs }) {
    const { state, listId } = useCommand();
    const content = ref<HTMLElement | null>(null);
    const height = ref<number | null>(null);
    let observer: ResizeObserver | null = null;
    onMounted(() => {
      if (!props.animatedHeight || typeof ResizeObserver === 'undefined') return;
      const element = content.value;
      if (!element) return;
      observer = new ResizeObserver(() => { height.value = element.scrollHeight; });
      observer.observe(element);
      height.value = element.scrollHeight;
    });
    onBeforeUnmount(() => observer?.disconnect());
    return () => h('div', {
      ...attrs, class: ['naviox-command-scroll', props.animatedHeight && 'naviox-command-animated', attrs.class],
      style: [{ maxHeight: props.animatedHeight && height.value !== null ? `min(${height.value}px, ${typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight})` : (typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight),
        '--nx-list-height': height.value === null ? 'auto' : `${height.value}px` }, attrs.style],
    }, [h('div', { id: listId, role: 'listbox', ref: content, 'aria-label': 'Command results', 'aria-busy': String(state.value.providersLoading) }, slots.default?.())]);
  },
});

export const NavioxCommandGroup = defineComponent({
  name: 'NavioxCommandGroup',
  props: { id: { type: String, required: true }, heading: String, forceMount: Boolean },
  setup(props, { slots, attrs }) {
    const { state, syncGroup } = useCommand();
    provide(groupKey, props.id);
    onMounted(() => syncGroup(props.id, { id: props.id, title: props.heading ?? props.id }));
    onBeforeUnmount(() => syncGroup(props.id, null));
    return () => {
      const visible = state.value.results.some((item) => (item.group ?? '') === props.id);
      return h('div', { ...attrs, hidden: !visible && !props.forceMount, role: 'group', 'aria-label': props.heading ?? props.id,
        class: ['naviox-command-group', attrs.class] }, [
          props.heading && h('div', { class: 'naviox-command-heading', 'aria-hidden': 'true' }, props.heading),
          slots.default?.(),
        ]);
    };
  },
});

export const NavioxCommandItem = defineComponent({
  name: 'NavioxCommandItem',
  props: { item: { type: Object as PropType<NavioxItem>, required: true }, forceMount: Boolean },
  emits: { select: (_item: NavioxItem) => true },
  setup(props, { slots, emit, attrs }) {
    const { controller, state, activate, optionId, registerSelect } = useCommand();
    const group = inject(groupKey, null);
    const materialized = computed<NavioxItem>(() => ({ ...props.item, group: props.item.group ?? group ?? undefined }));
    let unregister: (() => void) | null = null;
    let owned = false;
    let unsubscribeSelect: (() => void) | null = null;
    onMounted(() => {
      unsubscribeSelect = registerSelect(materialized.value.id, (item) => emit('select', item));
      if (controller.getItems().some((item) => item.id === materialized.value.id)) return;
      unregister = controller.register(materialized.value);
      owned = true;
    });
    onBeforeUnmount(() => { unsubscribeSelect?.(); unregister?.(); unregister = null; });
    watch(materialized, (next) => { if (owned) controller.updateItem(next.id, next); });
    return () => {
      const item = materialized.value;
      const visible = state.value.results.some((entry) => entry.id === item.id);
      if (!visible && !props.forceMount) return null;
      const active = visible && state.value.activeId === item.id;
      const disabled = Boolean(item.disabled || item.readOnly);
      return h('div', {
        ...attrs, id: optionId(item.id), role: 'option', hidden: !visible, 'aria-hidden': !visible ? 'true' : undefined,
        'aria-selected': String(active), 'aria-disabled': disabled ? 'true' : undefined,
        'data-selected': active ? 'true' : undefined, 'data-disabled': disabled ? 'true' : undefined,
        class: ['naviox-command-item', active && 'is-active', disabled && 'is-disabled', attrs.class],
        onPointerenter: (event: PointerEvent) => { if (event.pointerType !== 'touch' && !item.disabled && visible) controller.setActive(item.id); },
        onMousedown: (event: MouseEvent) => event.preventDefault(),
        onClick: () => { if (!disabled && visible) activate(item); },
      }, slots.default?.({ item, active }) ?? item.title);
    };
  },
});

export const NavioxCommandEmpty = defineComponent({
  name: 'NavioxCommandEmpty',
  setup(_props, { slots }) {
    const { state } = useCommand();
    return () => !state.value.results.length && !state.value.providersLoading
      ? h('div', { class: 'naviox-command-empty', role: 'status' }, slots.default?.() ?? 'No results found.') : null;
  },
});
export const NavioxCommandLoading = defineComponent({
  name: 'NavioxCommandLoading',
  setup(_props, { slots }) {
    const { state } = useCommand();
    return () => state.value.providersLoading
      ? h('div', { class: 'naviox-command-status', role: 'status' }, slots.default?.() ?? 'Searching…') : null;
  },
});
export const NavioxCommandSeparator = defineComponent({
  name: 'NavioxCommandSeparator',
  props: { forceMount: Boolean },
  setup(props, { attrs }) {
    const { state } = useCommand();
    return () => state.value.results.length || props.forceMount
      ? h('div', { ...attrs, 'aria-hidden': 'true', class: ['naviox-command-separator', attrs.class] }) : null;
  },
});
export const NavioxCommandShortcut = defineComponent({
  name: 'NavioxCommandShortcut',
  setup(_props, { slots, attrs }) { return () => h('kbd', { ...attrs, class: ['naviox-command-shortcut', attrs.class] }, slots.default?.()); },
});


/** Fixed-row-size virtualization via the public core helper. Use root :items
 * (or an external controller) rather than declarative Item children. */
export const NavioxCommandVirtualList = defineComponent({
  name: 'NavioxCommandVirtualList',
  props: {
    height: { type: Number, default: 320 },
    itemHeight: { type: Number, default: 46 },
    overscan: { type: Number, default: 4 },
  },
  setup(props, { slots }) {
    const { controller, state, listId, optionId, activate } = useCommand();
    const scroller = ref<HTMLElement | null>(null);
    const offset = ref(0);
    const windowed = computed(() => getNavioxVirtualWindow(state.value.results, {
      scrollOffset: offset.value, viewportSize: props.height,
      estimatedItemSize: props.itemHeight, overscan: props.overscan,
    }));
    watch(() => state.value.activeId, (id) => {
      const node = scroller.value;
      if (!node || !id) return;
      const index = state.value.results.findIndex((item) => item.id === id);
      if (index < 0) return;
      const top = index * props.itemHeight;
      if (top < node.scrollTop) node.scrollTop = top;
      else if (top + props.itemHeight > node.scrollTop + props.height) node.scrollTop = top + props.itemHeight - props.height;
      offset.value = node.scrollTop;
    }, { flush: 'post' });
    return () => h('div', { ref: scroller, class: 'naviox-command-scroll naviox-command-virtual',
      style: { height: `${props.height}px`, overflowY:'auto' },
      onScroll: (event: Event) => { offset.value = (event.target as HTMLElement).scrollTop; },
    }, [h('div', { id: listId, role:'listbox', 'aria-label':'Command results',
      'aria-busy': String(state.value.providersLoading), style: { height: `${windowed.value.totalSize}px`, position:'relative' },
    }, windowed.value.items.map((item, i) => {
      const index = windowed.value.start + i;
      const active = item.id === state.value.activeId;
      const disabled = Boolean(item.disabled || item.readOnly);
      return h('div', { key:item.id, id:optionId(item.id), role:'option',
        'aria-selected': String(active), 'aria-disabled': disabled ? 'true' : undefined,
        class: ['naviox-command-item', active && 'is-active', disabled && 'is-disabled'],
        style: { position:'absolute', top:`${index * props.itemHeight}px`, height:`${props.itemHeight}px`, width:'100%', insetInlineStart:'0' },
        onPointerenter: (event: PointerEvent) => { if (event.pointerType !== 'touch' && !item.disabled) controller.setActive(item.id); },
        onMousedown: (event: MouseEvent) => event.preventDefault(),
        onClick: () => { if (!disabled) activate(item); },
      }, slots.item?.({ item, active, index }) ?? item.title);
    }))]);
  },
});

export { NavioxCommand as NavioxRoot, NavioxCommandInput as NavioxInput, NavioxCommandList as NavioxList,
  NavioxCommandGroup as NavioxGroupPrimitive, NavioxCommandItem as NavioxItemPrimitive,
  NavioxCommandEmpty as NavioxEmpty, NavioxCommandLoading as NavioxLoading,
  NavioxCommandSeparator as NavioxSeparator, NavioxCommandShortcut as NavioxShortcut };
