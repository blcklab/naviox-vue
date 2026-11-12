/** Resolve a combobox arrow key within the rendered window, not the full registry. */
export function nextVisibleOptionId<T extends { readonly id: string; readonly disabled?: boolean; readonly readOnly?: boolean }>(
  items: readonly T[], activeId: string | null | undefined, direction: 1 | -1,
): string | null {
  const available = items.filter((item) => !item.disabled && !item.readOnly);
  if (!available.length) return null;
  const current = available.findIndex((item) => item.id === activeId);
  const next = current < 0 ? (direction > 0 ? 0 : available.length - 1) :
    (current + direction + available.length) % available.length;
  return available[next]!.id;
}
