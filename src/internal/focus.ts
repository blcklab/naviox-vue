/** Keep Tab focus inside an open native modal even when a browser's
 * scrollable region introduces a transient document-body stop. */
export function wrapModalTabFocus(
  event: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'preventDefault'>,
  dialog: HTMLDialogElement | null,
): void {
  if (event.key !== 'Tab' || !dialog?.open || typeof document === 'undefined') return;
  const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(
    'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
  )).filter((node) => node.getClientRects().length > 0 && !node.closest('[inert]'));
  if (!focusables.length) { event.preventDefault(); dialog.focus(); return; }
  const first = focusables[0]!;
  const last = focusables[focusables.length - 1]!;
  const current = document.activeElement;
  if ((event.shiftKey && (current === first || current === dialog)) ||
      (!event.shiftKey && (current === last || current === dialog))) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus({ preventScroll: true });
  }
}
