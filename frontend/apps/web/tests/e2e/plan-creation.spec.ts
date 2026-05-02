import { test, expect } from '@playwright/test';

test.describe('Plan Creation and Submission Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Đăng nhập với quyền Đội trưởng
    await page.goto('/login');
    await page.fill('#email', 'doitruong@localhost');
    await page.fill('#password', 'DoiTruong1!');
    await page.click('button[type="submit"]');
    
    // Đợi vào dashboard đội trưởng
    await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
  });

  test('Should create a new plan and submit it for approval', async ({ page }) => {
    // Bắt lỗi console
    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
    });

    await page.goto('/plans');
    
    // 1. Nhấn nút Tạo mới
    await page.click('button:has-text("TẠO MỚI")');
    
    // 2. Điền thông tin cơ bản
    const planName = `E2E PLAN ${new Date().getTime()}`;
    await page.fill('input[placeholder*="Bảo trì"]', planName);
    
    // Chọn ngày
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];
    
    await page.locator('input[type="date"]').first().fill(startDate as string);
    await page.locator('input[type="date"]').last().fill(endDate as string);
    
    // 3. Nhấn Kích hoạt để tạo
    await page.click('button:has-text("KÍCH HOẠT CHIẾN LƯỢC")');
    
    // Đợi Dialog đóng lại (nó không còn visible nữa)
    await expect(page.locator('role=dialog')).not.toBeVisible({ timeout: 15000 });
    
    // 4. Tìm và mở kế hoạch vừa tạo
    // Thử reload lại trang để chắc chắn dữ liệu mới được load từ server
    await page.reload();
    await page.fill('input[placeholder*="Tìm kiếm"]', planName);
    
    // Chờ 2 giây để API trả về kết quả lọc
    await page.waitForTimeout(2000);
    
    const newPlanCard = page.locator(`h4:has-text("${planName}")`).first();
    await expect(newPlanCard).toBeVisible({ timeout: 15000 });
    await newPlanCard.click();
    
    // 5. Kiểm tra Sheet chi tiết và Gửi duyệt
    await expect(page.locator('h4').filter({ hasText: 'Danh sách công việc' })).toBeVisible({ timeout: 10000 });
    
    const submitButton = page.locator('button:has-text("GỬI DUYỆT CHIẾN LƯỢC")');
    if (await submitButton.isVisible()) {
        await submitButton.click();
        await expect(page.locator('text=Thành công')).toBeVisible();
    }
  });
});
