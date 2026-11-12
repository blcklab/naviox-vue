import { createNaviox } from '@blcklab/naviox';
import type { NavioxController, NavioxItem, NavioxOptions, NavioxState } from '@blcklab/naviox';
import { markRaw, onScopeDispose, shallowRef, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, ShallowRef } from 'vue';

export interface UseNavioxOptions {
  /** Reactive item list. Not applied if a pre-existing controller is injected. */
  items?: MaybeRefOrGetter<readonly NavioxItem[]>;
  /** Use an external core instance; never disposed by this composable. */
  controller?: NavioxController;
  /** Core options, used only for a controller created by this composable. */
  options?: NavioxOptions;
}

export interface UseNavioxReturn {
  controller: NavioxController;
  state: Readonly<ShallowRef<NavioxState>>;
  /** Whether this composable created and owns the controller. */
  owned: boolean;
}

/** Thin Vue signal bridge. No second search, state machine, or registry in the adapter. */
export function useNaviox(config: UseNavioxOptions = {}): UseNavioxReturn {
  const owned = config.controller === undefined;
  const controller = markRaw(config.controller ?? createNaviox(toValue(config.items) ?? [], config.options));
  const state = shallowRef<NavioxState>(controller.getState());
  const unsubscribe = controller.subscribe((next) => { state.value = next; });
  if (owned && config.items !== undefined) {
    watch(() => toValue(config.items) ?? [], (items) => controller.setItems(items));
  }
  onScopeDispose(() => {
    unsubscribe();
    if (owned) controller.destroy();
  });
  return { controller, state, owned };
}
