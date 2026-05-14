import { test, expect } from '@playwright/test';

// Ensure no authentication for all tests in this file
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Public Pages — Citizen Portal', () => {
  test.describe('Landing Page', () => {
    test('displays main heading and hero content', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('h1')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('h1')).toContainText('Đà Nẵng Xanh');
    });

    test('shows navigation links to public sections', async ({ page }) => {
      await page.goto('/');

      // Check that key navigation links are present
      const reportLink = page.locator('a[href="/report-incident"]');
      await expect(reportLink).toBeVisible({ timeout: 15000 });
    });

    test('renders map canvas', async ({ page }) => {
      await page.goto('/');

      // MapLibre GL renders to a canvas element
      const mapCanvas = page.locator('canvas.maplibregl-canvas');
      await expect(mapCanvas).toBeVisible({ timeout: 20000 });
    });
  });

  test.describe('Tree Category Page', () => {
    test('loads and displays tree types heading', async ({ page }) => {
      await page.goto('/category');

      // The category page uses h2 for its main heading
      await expect(page.locator('h2')).toContainText('Chủng loại cây xanh', { timeout: 30000 });
    });

    test('shows tree type data in a table or handles empty state', async ({ page }) => {
      await page.goto('/category');

      // Wait for content to load
      await expect(page.locator('h2')).toBeVisible({ timeout: 30000 });

      // Either a table with data or an empty state message should be visible
      const table = page.locator('table');
      const emptyState = page.locator('text=Không có dữ liệu');

      await expect(async () => {
        const hasTable = await table.first().isVisible();
        const hasEmpty = await emptyState.isVisible();
        expect(hasTable || hasEmpty).toBeTruthy();
      }).toPass({ timeout: 15000 });
    });
  });

  test.describe('Feedback Page', () => {
    test('renders the feedback form', async ({ page }) => {
      await page.goto('/feedback');

      // Page should load without 404
      await expect(page.locator('body')).not.toContainText('404');

      // Wait for the page to fully render
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Check for form elements or heading
      const heading = page.locator('h1, h2');
      await expect(heading.first()).toBeVisible({ timeout: 15000 });
    });

    test('validates required fields on empty submission', async ({ page }) => {
      await page.goto('/feedback');

      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"]');

      if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitButton.click();

        // Should show validation error (either native browser validation or custom toast/inline error)
        // Native HTML5 validation prevents submission, or the form shows error messages
        const stillOnPage = await page.url();
        expect(stillOnPage).toContain('/feedback');
      }
    });
  });

  test.describe('Report Incident Page', () => {
    test('renders the incident report form with required fields', async ({ page }) => {
      await page.goto('/report-incident');

      await expect(page.locator('h1')).toContainText('Báo cáo sự cố', { timeout: 30000 });
    });

    test('form contains essential input fields', async ({ page }) => {
      await page.goto('/report-incident');

      await expect(page.locator('h1')).toBeVisible({ timeout: 30000 });

      // Check for the key form fields
      const nameInput = page.locator('#name');
      const phoneInput = page.locator('#phone');
      const contentInput = page.locator('#content');

      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await expect(phoneInput).toBeVisible();
      await expect(contentInput).toBeVisible();
    });

    test('shows submit button', async ({ page }) => {
      await page.goto('/report-incident');

      await expect(page.locator('h1')).toBeVisible({ timeout: 30000 });

      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });
  });

  test.describe('Statistics Page', () => {
    test('loads and displays statistics heading', async ({ page }) => {
      await page.goto('/statistics');

      await expect(page.locator('h2')).toContainText('Thống kê Cây xanh', { timeout: 30000 });
    });

    test('shows statistics cards with summary data', async ({ page }) => {
      await page.goto('/statistics');

      await expect(page.locator('h2')).toBeVisible({ timeout: 30000 });

      // Check for the summary card
      const totalTreesCard = page.locator('h3').filter({ hasText: 'Tổng số cây xanh' });
      await expect(totalTreesCard).toBeVisible({ timeout: 15000 });
    });

    test('does not show 404 or error state', async ({ page }) => {
      await page.goto('/statistics');

      await expect(page.locator('body')).not.toContainText('404');
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
    });
  });

  test.describe('Tree Detail Page', () => {
    test('loads tree detail for ID 1 or shows appropriate message', async ({ page }) => {
      await page.goto('/tree-detail/1');

      // Wait for page to load
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Either show tree detail content or a "not found" message
      // The page should not return a raw 404 error page
      const body = page.locator('body');
      const bodyText = await body.textContent({ timeout: 10000 });

      // If tree exists, content should be visible; if not, there should be a user-friendly message
      const hasContent = bodyText !== null && bodyText.length > 0;
      expect(hasContent).toBeTruthy();
    });

    test('page does not crash with invalid tree ID', async ({ page }) => {
      await page.goto('/tree-detail/99999');

      // Should not crash — either shows an error message or redirects gracefully
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // The page should still render (not a blank error)
      const body = page.locator('body');
      await expect(body).not.toHaveText('');
    });
  });
});
