import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Tìm kiếm thông báo lỗi linh hoạt
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 15000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Dùng tài khoản được seed từ backend
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    
    // Chờ chuyển hướng - có thể là /dashboard hoặc /giamdoc tùy cấu hình
    await page.waitForURL(/\/(dashboard|giamdoc)/, { timeout: 15000 });
    // Kiểm tra sidebar xuất hiện
    await expect(page.locator('[data-slot="sidebar"]').first()).toBeVisible();
  });
});
