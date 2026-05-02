import { test, expect } from '@playwright/test';

test.describe('Citizen Portal Flow', () => {
  test.beforeAll(async () => {
    // Seed dữ liệu cây xanh để đảm bảo có dữ liệu hiển thị trên bản đồ
    try {
      await fetch('http://localhost:5000/api/Trees/seed', { method: 'POST' });
    } catch (e) {
      console.warn('Cảnh báo: Không thể gọi API seed dữ liệu.');
    }
  });

  test('Home page should display map and basic UI', async ({ page }) => {
    await page.goto('/');
    
    // Kiểm tra tiêu đề trang chủ
    await expect(page.locator('h1')).toContainText('Đà Nẵng Xanh');
    
    // Kiểm tra bản đồ có tồn tại (maplibre-gl canvas)
    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible({ timeout: 10000 });
    
    // Kiểm tra nút CTA báo cáo sự cố
    const reportButton = page.locator('a[href="/report-incident"]');
    await expect(reportButton).toBeVisible();
    await expect(reportButton).toContainText('Báo cáo sự cố');
  });

  test('Report incident flow', async ({ page }) => {
    await page.goto('/report-incident');
    
    // Kiểm tra tiêu đề form
    await expect(page.locator('h1')).toContainText('Báo cáo sự cố');
    
    // Điền thông tin vào form
    await page.fill('#treeId', '1'); // Giả định cây ID 1 tồn tại sau khi seed
    await page.fill('#name', 'Người dân Test');
    await page.fill('#phone', '0901234567');
    await page.fill('#content', 'Cây ngã đè lên dây điện cực kỳ nguy hiểm, cần xử lý ngay!');
    
    // Click gửi báo cáo
    await page.click('button[type="submit"]');
    
    // Kiểm tra thông báo thành công
    await expect(page.locator('h2')).toContainText('Cảm ơn sự đóng góp của bạn!', { timeout: 15000 });
    
    // Kiểm tra nút quay lại trang chủ
    await expect(page.locator('a', { hasText: 'Quay lại trang chủ ngay' })).toBeVisible();
  });

  test('Statistics page accessibility', async ({ page }) => {
    await page.goto('/statistics');
    
    // Kiểm tra tiêu đề trang thống kê (Thống kê Cây xanh dùng h2)
    await expect(page.locator('h2')).toContainText('Thống kê Cây xanh');
    
    // Kiểm tra xem các card thống kê có hiển thị không
    await expect(page.locator('h3').filter({ hasText: 'Tổng số cây xanh' })).toBeVisible();
  });

  test('Tree category page should load', async ({ page }) => {
    await page.goto('/category');
    
    // Tiêu đề trong tab là h2
    await expect(page.locator('h2')).toContainText('Chủng loại cây xanh');
    
    // Kiểm tra table hiển thị
    const table = page.locator('table');
    await expect(table.first()).toBeVisible({ timeout: 10000 });
  });
});
