import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const navigation = 'http://127.0.0.1:4174/';

test('palette: search, keyboard focus confinement, Escape, and shortcut reopening', async ({ page }) => {
  await page.goto('/');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const search = dialog.getByRole('combobox');
  await expect(search).toBeFocused();
  await search.fill('Selected works');
  await expect(dialog.getByRole('option', { name: /selected works/i })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.keyboard.press('Control+k');
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press(i % 3 === 0 ? 'Shift+Tab' : 'Tab');
    expect(await page.evaluate(() => {
      const active = document.activeElement;
      const modal = document.querySelector('dialog[open]');
      return !!(active && modal && modal.contains(active));
    })).toBe(true);
  }
});

test('navigation: mega-menu, autocomplete and escape', async ({ page }) => {
  await page.goto(navigation);
  const explore = page.getByRole('button', { name: 'Explore' });
  await explore.click();
  await expect(page.getByRole('navigation', { name: 'Site navigation' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Site navigation' }).getByText('Guestbook')).toBeVisible();
  await page.keyboard.press('Escape');
  const input = page.getByRole('combobox', { name: 'Search pages' });
  await input.fill('craft');
  await expect(page.getByRole('listbox', { name: /search pages suggestions/i }).getByRole('option', { name: /my craft/i })).toBeVisible();
  await page.keyboard.press('ArrowDown');
  const activeId = await input.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
  await expect(page.locator(`#${CSS_ESCAPE(activeId)}`)).toHaveCount(1);
});

// CSS.escape is intentionally replaced here by a test-side attribute selector
// so this spec works in all Playwright runner environments without a DOM global.
function CSS_ESCAPE(value) { return value.replace(/[^a-zA-Z0-9_-]/g, c => `\\${c.charCodeAt(0).toString(16)} `); }

test('responsive: no page-level horizontal overflow at mobile widths', async ({ page }) => {
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto(navigation);
    await page.getByRole('button', { name: 'Explore' }).click();
    const measurement = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(measurement.content).toBeLessThanOrEqual(measurement.viewport + 1);
  }
});

test('WCAG 2.1 AA automated axe scan: palette and navigation', async ({ page }) => {
  await page.goto('/');
  let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  await page.goto(navigation);
  await page.getByRole('button', { name: 'Explore' }).click();
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
});
