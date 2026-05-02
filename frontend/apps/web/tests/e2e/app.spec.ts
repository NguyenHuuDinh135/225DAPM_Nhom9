import { test, expect } from '@playwright/test';

test.describe('Full App Functionality', () => {
  test.beforeAll(async () => {
    // Ép buộc seed lại dữ liệu trước khi chạy bộ test
    try {
      await fetch('http://localhost:5000/api/Trees/seed', { method: 'POST' });
    } catch (e) {
      console.warn('Cảnh báo: Không thể gọi API seed dữ liệu.');
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
  });

  test('Tree Management functionality', async ({ page }) => {
    await page.goto('/trees');
    await expect(page.locator('h2').filter({ hasText: 'Quản lý Cây xanh' }).first()).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
    await expect(page.locator('table').first()).toContainText(/Tên cây|Loại cây/i);
  });

  test('Incident Management functionality', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page.locator('h2').filter({ hasText: 'Quản lý Sự cố' }).first()).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
    await expect(page.locator('table').first()).toContainText(/ID Cây|Người báo cáo/i);
  });

  test('Work Item Management functionality', async ({ page }) => {
    await page.goto('/works');
    // Heading là "Danh sách công tác" hoặc "Quản lý công việc" tùy màn hình
    const heading = page.locator('h1, h2').filter({ hasText: /Danh sách công tác|Quản lý Công việc/i }).first();
    await expect(heading).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('Staff Management functionality', async ({ page }) => {
    await page.goto('/staff');
    await expect(page.locator('h2').filter({ hasText: 'Quản lý Nhân viên' }).first()).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
    
    // Kiểm tra xem đã có dữ liệu chưa, nếu "Không có dữ liệu" thì reload lại 1 lần
    const tableText = await page.locator('table').first().innerText();
    if (tableText.includes('Không có dữ liệu')) {
        await page.reload();
        await page.waitForTimeout(2000);
    }
    
    // Kiểm tra role Giám Đốc (đã được refactor sang tiếng Việt có dấu)
    await expect(page.locator('table').first()).toContainText('Giám Đốc', { timeout: 15000 });
  });

  test('Planning Management functionality', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.locator('h2').filter({ hasText: 'Quản lý Kế hoạch' }).first()).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('Analytics and Reports functionality', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Báo cáo', exact: true }).first()).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Công việc quá hạn' }).first()).toBeVisible();
    await expect(page.locator('table').first()).toBeVisible();
  });
});
