import { test, expect } from '@playwright/test';

test.describe('Route Accessibility - No 404', () => {

  test.describe('Public routes (no auth needed)', () => {
    // Clear auth state for public route tests
    test.use({ storageState: { cookies: [], origins: [] } });

    test('home page loads', async ({ page }) => {
      await page.goto('/');
      await expect(page).not.toHaveTitle(/404/);
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('login page loads', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('body')).not.toContainText('404');
      // Verify login form is present
      await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
    });

    test('tree categories page loads', async ({ page }) => {
      await page.goto('/category');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('report incident page loads', async ({ page }) => {
      await page.goto('/report-incident');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('statistics page loads', async ({ page }) => {
      await page.goto('/statistics');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('feedback page loads', async ({ page }) => {
      await page.goto('/feedback');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('trees page loads (public)', async ({ page }) => {
      await page.goto('/trees');
      await expect(page.locator('body')).not.toContainText('404');
    });
  });

  test.describe('Director routes (authenticated)', () => {
    // Uses stored auth state from setup (director)
    test('director dashboard loads', async ({ page }) => {
      await page.goto('/giamdoc');
      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    });

    test('plans management loads', async ({ page }) => {
      await page.goto('/plans');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('incidents management loads', async ({ page }) => {
      await page.goto('/incidents');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('staff management loads', async ({ page }) => {
      await page.goto('/staff');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('reports page loads', async ({ page }) => {
      await page.goto('/reports');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('analytics page loads', async ({ page }) => {
      await page.goto('/analytics');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('map page loads', async ({ page }) => {
      await page.goto('/map');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('settings page loads', async ({ page }) => {
      await page.goto('/settings');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('feedback-inbox page loads', async ({ page }) => {
      await page.goto('/feedback-inbox');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('works page loads', async ({ page }) => {
      await page.goto('/works');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('tasks page loads', async ({ page }) => {
      await page.goto('/tasks');
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('replacements page loads', async ({ page }) => {
      await page.goto('/replacements');
      await expect(page.locator('body')).not.toContainText('404');
    });
  });

  test.describe('Captain routes', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('captain dashboard loads', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'doitruong@localhost');
      await page.fill('#password', 'DoiTruong1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
      await expect(page.locator('body')).not.toContainText('404');
    });
  });

  test.describe('Worker routes', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('worker dashboard loads', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'emp1@localhost');
      await page.fill('#password', 'NhanVien1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });
      await expect(page.locator('body')).not.toContainText('404');
    });

    test('worker tasks page loads', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'emp1@localhost');
      await page.fill('#password', 'NhanVien1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });

      await page.goto('/nhanvien/tasks');
      await expect(page.locator('body')).not.toContainText('404');
    });
  });

  test.describe('Auth protection - unauthenticated access redirects to login', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('unauthenticated access to /feedback-inbox redirects to /login', async ({ page }) => {
      await page.goto('/feedback-inbox');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated access to /giamdoc redirects to /login', async ({ page }) => {
      await page.goto('/giamdoc');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated access to /plans redirects to /login', async ({ page }) => {
      await page.goto('/plans');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated access to /nhanvien redirects to /login', async ({ page }) => {
      await page.goto('/nhanvien');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated access to /doitruong redirects to /login', async ({ page }) => {
      await page.goto('/doitruong');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated access to /settings redirects to /login', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });
  });
});
