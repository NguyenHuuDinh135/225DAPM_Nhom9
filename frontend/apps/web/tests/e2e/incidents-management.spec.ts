import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Incidents Management (Captain Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'doitruong@localhost');
    await page.fill('#password', 'DoiTruong1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
  });

  test('should display incidents page with title and status cards', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page.locator('h1')).toContainText('Trung tâm Sự cố', { timeout: 30000 });

    // Verify status summary cards are visible
    await expect(page.locator('text=Khẩn cấp')).toBeVisible();
    await expect(page.locator('text=Mới ghi nhận')).toBeVisible();
    await expect(page.locator('text=Đang xử lý')).toBeVisible();
    await expect(page.locator('text=Đã khắc phục')).toBeVisible();
  });

  test('should display incidents table or empty state', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page.locator('h1')).toContainText('Trung tâm Sự cố', { timeout: 30000 });

    // Wait for loading to finish
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    // Either data rows or empty message should appear
    const hasRows = await page.locator('tbody tr').first().isVisible().catch(() => false);
    if (!hasRows) {
      await expect(page.locator('text=Không có báo cáo sự cố nào được tìm thấy')).toBeVisible();
    } else {
      // Verify table headers exist
      await expect(page.locator('th:has-text("Sự cố")')).toBeVisible();
      await expect(page.locator('th:has-text("Mức độ")')).toBeVisible();
      await expect(page.locator('th:has-text("Trạng thái")')).toBeVisible();
    }
  });

  test('should filter incidents using search input', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page.locator('h1')).toContainText('Trung tâm Sự cố', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('cây');
    // Wait briefly for filtering
    await page.waitForTimeout(500);

    // The table should still be visible (filtered results or empty)
    await expect(page.locator('table')).toBeVisible();
  });

  test('should open incident detail sheet when clicking a row', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page.locator('h1')).toContainText('Trung tâm Sự cố', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    const firstRow = page.locator('tbody tr').first();
    const hasData = await firstRow.isVisible().catch(() => false);
    if (!hasData) {
      // No incidents to test detail view
      return;
    }

    await firstRow.click();

    // Sheet should open with incident details
    const sheet = page.locator('[data-slot="sheet-content"], [role="dialog"]');
    await expect(sheet).toBeVisible({ timeout: 10000 });

    // Verify detail content
    await expect(sheet.locator('text=Chi tiết Sự cố')).toBeVisible();
    await expect(sheet.locator('text=Nội dung phản ánh')).toBeVisible();
    await expect(sheet.locator('text=Thời gian')).toBeVisible();
    await expect(sheet.locator('text=Người báo cáo')).toBeVisible();
  });

  test('should show approve/reject buttons for pending incidents', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page.locator('h1')).toContainText('Trung tâm Sự cố', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });

    const firstRow = page.locator('tbody tr').first();
    const hasData = await firstRow.isVisible().catch(() => false);
    if (!hasData) {
      return;
    }

    await firstRow.click();

    const sheet = page.locator('[data-slot="sheet-content"], [role="dialog"]');
    await expect(sheet).toBeVisible({ timeout: 10000 });

    // If the incident is pending, approve/reject buttons should be shown
    const approveBtn = sheet.locator('button:has-text("DUYỆT XỬ LÝ")');
    const rejectBtn = sheet.locator('button:has-text("TỪ CHỐI")');

    const isPending = await approveBtn.isVisible().catch(() => false);
    if (isPending) {
      await expect(approveBtn).toBeVisible();
      await expect(rejectBtn).toBeVisible();
    }
  });
});

test.describe('Citizen Reports Incident (No Auth)', () => {
  test('should load report incident page with form', async ({ page }) => {
    await page.goto('/report-incident');
    await expect(page.locator('h1')).toContainText('Báo cáo sự cố', { timeout: 15000 });

    // Verify form fields exist
    await expect(page.locator('#treeId')).toBeVisible();
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#content')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should submit incident report and show confirmation', async ({ page }) => {
    await page.goto('/report-incident');
    await expect(page.locator('h1')).toContainText('Báo cáo sự cố', { timeout: 15000 });

    // Fill in the form
    await page.fill('#treeId', '1');
    await page.fill('#name', 'Người dân E2E Test');
    await page.fill('#phone', '0912345678');
    await page.fill('#content', 'Cây bị nghiêng nghiêm trọng, có nguy cơ đổ vào nhà dân. Cần kiểm tra khẩn cấp.');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show success confirmation
    await expect(page.locator('h2')).toContainText('Cảm ơn sự đóng góp của bạn!', { timeout: 15000 });
    await expect(page.locator('a', { hasText: 'Quay lại trang chủ ngay' })).toBeVisible();
  });
});
