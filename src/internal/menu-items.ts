import type { NavioxItem } from '@blcklab/naviox';

/** Local navigation entries override registered entries with the same id.
 * Nested commands stay in palettes and are not shown at a mega-menu root.
 * No DOM or framework dependency; pure projection of public core data.
 */
export function mergeNavioxMenuItems(
  staticItems: readonly NavioxItem[] = [],
  registeredItems: readonly NavioxItem[] = [],
): readonly NavioxItem[] {
  const merged = new Map<string, NavioxItem>();
  for (const item of registeredItems) {
    if (!item.hidden && !item.parentId && !item.pageId) merged.set(item.id, item);
  }
  for (const item of staticItems) {
    if (!item.hidden && !item.parentId && !item.pageId) merged.set(item.id, item);
    else merged.delete(item.id);
  }
  return [...merged.values()];
}
