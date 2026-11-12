/** Allow ordinary local and safe navigational links; never put executable schemes in the DOM. */
export function safeNavigationHref(href: string | undefined): string | undefined {
  const value = href?.trim().replace(/[\u0000-\u001F\u007F]/g, '');
  if (!value || value.startsWith('//')) return undefined;
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(value)?.[1]?.toLowerCase();
  if (scheme && !['http', 'https', 'mailto', 'tel'].includes(scheme)) return undefined;
  return value;
}
