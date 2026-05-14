import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Reports Page (Director Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
  });

  test('should display strategic reports page with title', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText('Báo cáo chiến lược', { timeout: 30000 });
    await expect(page.locator('text=Tổng hợp số liệu, phân tích hiệu suất và định hướng quản lý')).toBeVisible();
  });

  test('should display report tabs: overview, performance, forecast', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText('Báo cáo chiến lược', { timeout: 30000 });

    // Wait for loading spinner to disappear
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

    // Verify tabs exist
    await expect(page.locator('[role="tab"]:has-text("Tổng quan")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Hiệu suất")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Dự báo")')).toBeVisible();
  });

  test('should display overview tab with stats cards', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText('Báo cáo chiến lược', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

    // Overview tab should be active by default
    await expect(page.locator('text=Mật độ phủ xanh')).toBeVisible();
    await expect(page.locator('text=Xu hướng sự cố')).toBeVisible();
    await expect(page.locator('text=Hiệu suất xử lý')).toBeVisible();
  });

  test('should switch to performance tab', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText('Báo cáo chiến lược', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

    // Click performance tab
    await page.click('[role="tab"]:has-text("Hiệu suất")');

    // Verify performance content loads
    await expect(page.locator('text=Hiệu suất xử lý sự cố')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Tỷ lệ hoàn thành')).toBeVisible();
    await expect(page.locator('text=Sự cố đang chờ')).toBeVisible();
  });

  test('should switch to forecast tab', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText('Báo cáo chiến lược', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

    // Click forecast tab
    await page.click('[role="tab"]:has-text("Dự báo")');

    // Verify forecast content
    await expect(page.locator('text=Dự báo chi phí bảo trì')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Chi phí trung bình/tháng')).toBeVisible();
    await expect(page.locator('text=Dự báo tháng tới')).toBeVisible();
    await expect(page.locator('text=Ngân sách khuyến nghị')).toBeVisible();
  });

  test('should have export button for downloading report', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('h1')).toContainText('Báo cáo chiến lược', { timeout: 30000 });
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

    // Verify export button exists
    const exportBtn = page.locator('button:has-text("Xuất báo cáo")');
    await expect(exportBtn).toBeVisible();
  });
});

test.describe('Analytics Page (Director Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
  });

  test('should display analytics page with title', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('h1')).toContainText('Phân tích hệ thống', { timeout: 30000 });
    await expect(page.locator('text=Theo dõi hiệu năng và tình trạng hoạt động thực tế')).toBeVisible();
  });

  test('should display analytics statistics cards', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('h1')).toContainText('Phân tích hệ thống', { timeout: 30000 });

    // Verify analytics cards with key metrics
    await expect(page.locator('text=Tỷ lệ hoàn thành công việc')).toBeVisible();
    await expect(page.locator('text=Năng suất nhân viên trung bình')).toBeVisible();
    await expect(page.locator('text=Tốc độ phản hồi sự cố')).toBeVisible();
  });

  test('should display performance dashboard section', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('h1')).toContainText('Phân tích hệ thống', { timeout: 30000 });

    // Verify the main content area
    await expect(page.locator('text=Bảng điều khiển hiệu suất')).toBeVisible();
  });

  test('should display numeric values in analytics cards', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('h1')).toContainText('Phân tích hệ thống', { timeout: 30000 });

    // Verify specific stat values are rendered
    await expect(page.locator('text=94.2%')).toBeVisible();
    await expect(page.locator('text=4.5 tasks/ngày')).toBeVisible();
    await expect(page.locator('text=1.2 giờ')).toBeVisible();
  });
});
