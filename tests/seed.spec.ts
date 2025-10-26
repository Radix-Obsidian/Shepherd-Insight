import { test, expect } from '@playwright/test';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'New Insight', href: '/intake' },
  { name: 'Vault', href: '/vault' },
  { name: 'Mind Map', href: '/mindmap' },
  { name: 'Exports', href: '/exports' },
  { name: 'Account', href: '/account' },
];

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const authState = {
        user: { id: 'test-user-id', email: 'test@example.com' },
        session: { access_token: 'test-access-token', refresh_token: 'test-refresh-token' },
        authReady: true,
      };
      localStorage.setItem('app-store', JSON.stringify({ state: { authReady: true, user: authState.user, session: authState.session }, version: 0 }));
    });
    await page.reload();
  });

  for (const item of NAVIGATION_ITEMS) {
    test(`should navigate to the ${item.name} page`, async ({ page }) => {
      try {
        await page.click(`nav >> text=${item.name}`);
        await page.waitForURL(item.href, { timeout: 5000 });
        await expect(page).toHaveURL(item.href);
        const title = await page.title();
        expect(title.toLowerCase()).toContain(item.name.toLowerCase());
      } catch (error) {
        console.error(`Test for "${item.name}" failed:`, error);
        const html = await page.content();
        console.log(html);
        throw error;
      }
    });
  }
});