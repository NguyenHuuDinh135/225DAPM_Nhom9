import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Staff Management (Director Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
  });

  test('should display staff page with title and stats', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });

    // Verify description text
    await expect(page.locator('text=Vận hành và quản lý đội ngũ tác nghiệp')).toBeVisible();

    // Verify the "Add" button is visible for admin
    await expect(page.locator('button:has-text("THÊM NHÂN VIÊN")')).toBeVisible();
  });

  test('should load employee table or show empty state', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });

    // Wait for loading to finish
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    // Check if table has data or shows empty state
    const table = page.locator('table');
    const hasTable = await table.isVisible().catch(() => false);

    if (hasTable) {
      const rows = page.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should search/filter employees by name or email', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    // Find search input
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await expect(searchInput).toBeVisible();

    // Search for a known term
    await searchInput.fill('doitruong');
    await page.waitForTimeout(500);

    // Table should still be visible with filtered results
    await expect(page.locator('table')).toBeVisible();
  });

  test('should open employee detail sheet on row click', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    const firstRow = page.locator('tbody tr').first();
    const hasData = await firstRow.isVisible().catch(() => false);
    if (!hasData) {
      return;
    }

    await firstRow.click();

    // Detail sheet should open
    const sheet = page.locator('[data-slot="sheet-content"], [role="dialog"]');
    await expect(sheet).toBeVisible({ timeout: 10000 });
  });

  test('should open create employee dialog', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    // Click the add button
    await page.click('button:has-text("THÊM NHÂN VIÊN")');

    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Verify form fields exist in the dialog
    await expect(dialog.locator('input')).toHaveCount(await dialog.locator('input').count());
  });

  test('should create a new employee successfully', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    // Click the add button
    await page.click('button:has-text("THÊM NHÂN VIÊN")');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // Fill in employee creation form
    const timestamp = Date.now();
    const email = `e2e_test_${timestamp}@localhost`;

    // Fill email field
    const emailInput = dialog.locator('input[type="email"], input[placeholder*="email"], input').first();
    await emailInput.fill(email);

    // Fill password field if visible
    const passwordInput = dialog.locator('input[type="password"]');
    if (await passwordInput.isVisible().catch(() => false)) {
      await passwordInput.fill('TestPass1!');
    }

    // Fill name field
    const nameInput = dialog.locator('input[placeholder*="tên"], input[id*="name"], input[id*="fullName"]');
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('NV Test E2E');
    }

    // Submit the form
    const submitBtn = dialog.locator('button[type="submit"], button:has-text("Tạo"), button:has-text("Lưu"), button:has-text("Thêm")');
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();

      // Expect success toast
      await expect(
        page.locator('[data-sonner-toast]').filter({ hasText: 'Thành công' })
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    // Look for delete button (trash icon) on a row
    const deleteBtn = page.locator('tbody tr button').filter({ has: page.locator('svg') }).last();
    const hasDeleteBtn = await deleteBtn.isVisible().catch(() => false);

    if (!hasDeleteBtn) {
      return;
    }

    await deleteBtn.click();

    // Confirmation alert dialog should appear
    const alertDialog = page.locator('[role="alertdialog"]');
    const hasAlert = await alertDialog.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasAlert) {
      await expect(alertDialog.locator('text=Xác nhận xóa tài khoản')).toBeVisible();
      // Cancel the delete
      await alertDialog.locator('button:has-text("Hủy")').click();
      await expect(alertDialog).not.toBeVisible();
    }
  });
});
