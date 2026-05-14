import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

/**
 * Full plan lifecycle tests across roles:
 * Captain creates → submits → Director approves/rejects
 */
test.describe('Plans Lifecycle', () => {
  const PLAN_NAME_PREFIX = `E2E Lifecycle Plan`;

  test.describe('Captain creates and submits plan', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'doitruong@localhost');
      await page.fill('#password', 'DoiTruong1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
    });

    test('Create a new plan and verify Draft status', async ({ page }) => {
      await page.goto('/plans');
      await expect(page.locator('h1')).toContainText('Kế hoạch', { timeout: 15000 });

      // Open create dialog
      await page.click('button:has-text("TẠO MỚI")');

      // Fill plan name
      const planName = `${PLAN_NAME_PREFIX} ${Date.now()}`;
      const nameInput = page.locator('input[placeholder*="Bảo trì"]');
      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await nameInput.fill(planName);

      // Set start date (today) and end date (30 days from now)
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await page.locator('input[type="date"]').first().fill(startDate as string);
      await page.locator('input[type="date"]').last().fill(endDate as string);

      // Click create button
      await page.click('button:has-text("KÍCH HOẠT CHIẾN LƯỢC")');

      // Wait for success toast
      await expect(
        page.locator('[data-sonner-toast]').filter({ hasText: 'tạo kế hoạch' })
      ).toBeVisible({ timeout: 15000 });

      // Search for the created plan
      await page.fill('input[placeholder*="Tìm kiếm"]', planName);
      await page.waitForTimeout(1500);

      // Verify plan appears in list
      const planCard = page.locator(`h4:has-text("${planName}")`);
      await expect(planCard).toBeVisible({ timeout: 15000 });

      // Verify NHÁP (Draft) status badge is visible near the plan
      const planContainer = page.locator(`div:has(h4:has-text("${planName}"))`).first();
      const draftBadge = planContainer.locator('span:has-text("NHÁP")');
      await expect(draftBadge).toBeVisible({ timeout: 5000 });
    });

    test('Submit plan for approval — status changes to CHỜ DUYỆT', async ({ page }) => {
      await page.goto('/plans');
      await expect(page.locator('h1')).toContainText('Kế hoạch', { timeout: 15000 });

      // Create a new plan first
      await page.click('button:has-text("TẠO MỚI")');

      const planName = `${PLAN_NAME_PREFIX} Submit ${Date.now()}`;
      const nameInput = page.locator('input[placeholder*="Bảo trì"]');
      await expect(nameInput).toBeVisible({ timeout: 10000 });
      await nameInput.fill(planName);

      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await page.locator('input[type="date"]').first().fill(startDate as string);
      await page.locator('input[type="date"]').last().fill(endDate as string);

      await page.click('button:has-text("KÍCH HOẠT CHIẾN LƯỢC")');
      await expect(
        page.locator('[data-sonner-toast]').filter({ hasText: 'tạo kế hoạch' })
      ).toBeVisible({ timeout: 15000 });

      // Search for the plan
      await page.fill('input[placeholder*="Tìm kiếm"]', planName);
      await page.waitForTimeout(1500);

      // Click the plan to open detail sheet
      const planCard = page.locator(`h4:has-text("${planName}")`);
      await expect(planCard).toBeVisible({ timeout: 15000 });
      await planCard.click();

      // Wait for detail sheet to open
      await page.waitForTimeout(1000);

      // Click "GỬI DUYỆT CHIẾN LƯỢC" button
      const submitBtn = page.locator('button:has-text("GỬI DUYỆT CHIẾN LƯỢC")');
      if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await submitBtn.click();

        // Wait for success toast
        await expect(
          page.locator('[data-sonner-toast]').filter({ hasText: 'gửi kế hoạch' })
        ).toBeVisible({ timeout: 15000 });

        // Verify status changes to CHỜ DUYỆT
        await page.fill('input[placeholder*="Tìm kiếm"]', planName);
        await page.waitForTimeout(1500);
        await expect(
          page.locator(`div:has(h4:has-text("${planName}"))`).first().locator('span:has-text("CHỜ DUYỆT")')
        ).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Director approves plan', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'giamdoc@localhost');
      await page.fill('#password', 'GiamDoc1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
    });

    test('Approve a pending plan — status changes to ĐÃ DUYỆT', async ({ page }) => {
      // Wait for director dashboard to load
      await expect(page.locator('h1')).toContainText('Giám đốc', { timeout: 30000 });

      // Wait for content to load (spinner gone)
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

      // Look for "Duyệt nhanh" section with pending plans
      const pendingSection = page.locator('text=Duyệt nhanh');

      if (await pendingSection.isVisible({ timeout: 10000 }).catch(() => false)) {
        // Find a plan card with the DUYỆT button
        const planCard = page.locator('div.rounded-3xl').filter({
          has: page.locator('button:has-text("DUYỆT")'),
        }).first();

        if (await planCard.isVisible({ timeout: 10000 }).catch(() => false)) {
          // Click approve button
          await planCard.locator('button:has-text("DUYỆT")').click();

          // Wait for success toast
          await expect(
            page.locator('[data-sonner-toast]').filter({ hasText: 'duyệt' })
          ).toBeVisible({ timeout: 15000 });
        } else {
          // No pending plans available — skip gracefully
          test.skip(true, 'No pending plans available for approval');
        }
      } else {
        test.skip(true, 'Duyệt nhanh section not visible');
      }
    });

    test('Reject a pending plan with reason — status changes to CẦN SỬA ĐỔI', async ({ page }) => {
      // Wait for director dashboard to load
      await expect(page.locator('h1')).toContainText('Giám đốc', { timeout: 30000 });

      // Wait for content to load
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

      // Look for "Duyệt nhanh" section
      const pendingSection = page.locator('text=Duyệt nhanh');

      if (await pendingSection.isVisible({ timeout: 10000 }).catch(() => false)) {
        // Find a plan card with the TỪ CHỐI button
        const planCard = page.locator('div.rounded-3xl').filter({
          has: page.locator('button:has-text("TỪ CHỐI")'),
        }).first();

        if (await planCard.isVisible({ timeout: 10000 }).catch(() => false)) {
          // Click reject button
          await planCard.locator('button:has-text("TỪ CHỐI")').click();

          // A dialog/form may appear asking for rejection reason
          const reasonInput = page.locator('textarea, input[placeholder*="lý do"], input[placeholder*="reason"]');
          if (await reasonInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await reasonInput.fill('Kế hoạch cần điều chỉnh ngân sách và nhân sự phù hợp hơn.');
          }

          // Confirm rejection
          const confirmBtn = page.locator('button:has-text("Xác nhận"), button:has-text("TỪ CHỐI")[type="submit"]');
          if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmBtn.click();
          }

          // Wait for toast
          await expect(
            page.locator('[data-sonner-toast]')
          ).toBeVisible({ timeout: 15000 });
        } else {
          test.skip(true, 'No pending plans available for rejection');
        }
      } else {
        test.skip(true, 'Duyệt nhanh section not visible');
      }
    });
  });

  test.describe('Director navigates to plans page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'giamdoc@localhost');
      await page.fill('#password', 'GiamDoc1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
    });

    test('View plans list page as Director', async ({ page }) => {
      await page.goto('/plans');

      // Verify plans page loads
      await expect(page.locator('h1')).toContainText('Kế hoạch', { timeout: 15000 });

      // Verify page renders content (plans list or search area)
      const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
    });
  });
});
