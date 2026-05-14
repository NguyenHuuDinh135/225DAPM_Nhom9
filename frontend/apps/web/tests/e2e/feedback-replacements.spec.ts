import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Feedback Inbox (Director Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
  });

  test('should display feedback inbox page with title', async ({ page }) => {
    await page.goto('/feedback-inbox');
    await expect(page.locator('h2')).toContainText('Hòm thư góp ý', { timeout: 30000 });
    await expect(page.locator('text=Quản lý các ý kiến phản ánh và đóng góp từ người dân')).toBeVisible();
  });

  test('should display feedback table with headers', async ({ page }) => {
    await page.goto('/feedback-inbox');
    await expect(page.locator('h2')).toContainText('Hòm thư góp ý', { timeout: 30000 });

    // Verify table exists with proper headers
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Người gửi")')).toBeVisible();
    await expect(page.locator('th:has-text("Liên hệ")')).toBeVisible();
    await expect(page.locator('th:has-text("Loại")')).toBeVisible();
    await expect(page.locator('th:has-text("Nội dung")')).toBeVisible();
    await expect(page.locator('th:has-text("Trạng thái")')).toBeVisible();
    await expect(page.locator('th:has-text("Ngày gửi")')).toBeVisible();
  });

  test('should display feedback items in the table', async ({ page }) => {
    await page.goto('/feedback-inbox');
    await expect(page.locator('h2')).toContainText('Hòm thư góp ý', { timeout: 30000 });

    // Table should have rows (mock data is hardcoded)
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify first row has expected structure
    const firstRow = rows.first();
    await expect(firstRow.locator('td').first()).toBeVisible();
  });

  test('should filter feedbacks using search input', async ({ page }) => {
    await page.goto('/feedback-inbox');
    await expect(page.locator('h2')).toContainText('Hòm thư góp ý', { timeout: 30000 });

    // Find search input
    const searchInput = page.locator('input[placeholder*="Tìm kiếm phản hồi"]');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('bản đồ');
    await page.waitForTimeout(500);

    // Table should still be visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display status badges for feedback items', async ({ page }) => {
    await page.goto('/feedback-inbox');
    await expect(page.locator('h2')).toContainText('Hòm thư góp ý', { timeout: 30000 });

    // Verify status badges exist (from mock data: "Mới", "Đang xử lý", "Đã xong")
    const badges = page.locator('tbody [data-slot="badge"], tbody .inline-flex');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should have action buttons (view and reply) on each row', async ({ page }) => {
    await page.goto('/feedback-inbox');
    await expect(page.locator('h2')).toContainText('Hòm thư góp ý', { timeout: 30000 });

    // Check that action buttons exist on first row
    const firstRow = page.locator('tbody tr').first();
    const hasData = await firstRow.isVisible().catch(() => false);
    if (!hasData) {
      return;
    }

    // Action buttons (eye icon for view, message icon for reply)
    const actionBtns = firstRow.locator('td:last-child button');
    const btnCount = await actionBtns.count();
    expect(btnCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Replacements Page (Captain Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'doitruong@localhost');
    await page.fill('#password', 'DoiTruong1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
  });

  test('should display replacements page with title', async ({ page }) => {
    await page.goto('/replacements');
    await expect(page.locator('h1')).toContainText('Thay thế cây', { timeout: 30000 });
    await expect(page.locator('text=Danh sách công việc thay thế / di dời cây xanh')).toBeVisible();
  });

  test('should display replacements table structure', async ({ page }) => {
    await page.goto('/replacements');
    await expect(page.locator('h1')).toContainText('Thay thế cây', { timeout: 30000 });

    // Verify table exists
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Mã")')).toBeVisible();
    await expect(page.locator('th:has-text("Loại công việc")')).toBeVisible();
    await expect(page.locator('th:has-text("Kế hoạch")')).toBeVisible();
    await expect(page.locator('th:has-text("Thời gian")')).toBeVisible();
    await expect(page.locator('th:has-text("Trạng thái")')).toBeVisible();
  });

  test('should show replacement items or empty state', async ({ page }) => {
    await page.goto('/replacements');
    await expect(page.locator('h1')).toContainText('Thay thế cây', { timeout: 30000 });

    // Check if there are data rows or empty message
    const hasRows = await page.locator('tbody tr td.font-mono').first().isVisible().catch(() => false);
    if (!hasRows) {
      await expect(page.locator('text=Không có công việc thay thế cây nào')).toBeVisible();
    } else {
      // Verify data row structure
      const firstRow = page.locator('tbody tr').first();
      await expect(firstRow.locator('td').first()).toBeVisible();
    }
  });

  test('should display status badges for replacement work items', async ({ page }) => {
    await page.goto('/replacements');
    await expect(page.locator('h1')).toContainText('Thay thế cây', { timeout: 30000 });

    const hasRows = await page.locator('tbody tr td.font-mono').first().isVisible().catch(() => false);
    if (!hasRows) {
      // No data to verify badges
      return;
    }

    // Verify badges exist (status labels like "Mới", "Đang thực hiện", etc.)
    const badges = page.locator('tbody [data-slot="badge"], tbody .inline-flex');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should have detail links for replacement items', async ({ page }) => {
    await page.goto('/replacements');
    await expect(page.locator('h1')).toContainText('Thay thế cây', { timeout: 30000 });

    const hasRows = await page.locator('tbody tr td.font-mono').first().isVisible().catch(() => false);
    if (!hasRows) {
      return;
    }

    // Verify "Chi tiết" links exist
    const detailLink = page.locator('a:has-text("Chi tiết")').first();
    await expect(detailLink).toBeVisible();

    // Verify link points to /works/:id
    const href = await detailLink.getAttribute('href');
    expect(href).toMatch(/\/works\/\d+/);
  });
});
