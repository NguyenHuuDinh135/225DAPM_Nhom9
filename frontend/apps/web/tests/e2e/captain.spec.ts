import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Captain Workflow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Đăng nhập với quyền Đội trưởng
    await page.goto('/login');
    await page.fill('#email', 'doitruong@localhost');
    await page.fill('#password', 'DoiTruong1!');
    await page.click('button[type="submit"]');
    
    // Đợi vào dashboard đội trưởng
    await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
  });

  test('Should create and submit a plan for approval', async ({ page }) => {
    // Chuyển sang trang Kế hoạch
    await page.goto('/plans');
    await expect(page.locator('h1')).toContainText('Kế hoạch Chiến lược');

    // Mở dialog tạo mới
    await page.click('button:has-text("TẠO MỚI")');
    
    // Điền thông tin kế hoạch
    const planName = `Kế hoạch E2E ${new Date().getTime()}`;
    await page.fill('input[placeholder="VD: Bảo trì công viên 29/3 - Giai đoạn 1"]', planName);
    
    // Thiết lập ngày (Bắt đầu hôm nay, Kết thúc sau 30 ngày)
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const endDate = nextMonth.toISOString().split('T')[0];
    
    // Tìm các input date. Do có 2 cái, ta dùng nth(0) và nth(1)
    await page.locator('input[type="date"]').nth(0).fill(today as string);
    await page.locator('input[type="date"]').nth(1).fill(endDate as string);
    
    // Click Kích hoạt chiến lược
    await page.click('button:has-text("KÍCH HOẠT CHIẾN LƯỢC")');
    
    // Chờ toast thành công
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Đã tạo kế hoạch mới.' })).toBeVisible({ timeout: 15000 });
    
    // Tìm kế hoạch vừa tạo trong danh sách và click
    await page.fill('input[placeholder="Tìm kiếm tên kế hoạch..."]', planName);
    const planCard = page.locator(`h4:has-text("${planName}")`);
    await expect(planCard).toBeVisible();
    await planCard.click();
    
    // Trong Detail Sheet, click Gửi duyệt
    await expect(page.locator('h2')).toContainText(planName);
    const submitBtn = page.locator('button:has-text("GỬI DUYỆT CHIẾN LƯỢC")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    // Chờ toast thành công và kiểm tra trạng thái chuyển sang CHỜ DUYỆT
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Đã gửi kế hoạch chờ duyệt.' })).toBeVisible({ timeout: 15000 });
    
    // Kiểm tra badge trạng thái trong danh sách
    await page.fill('input[placeholder="Tìm kiếm tên kế hoạch..."]', planName);
    await expect(page.locator('div:has(h4:has-text("' + planName + '"))').locator('span:has-text("CHỜ DUYỆT")')).toBeVisible();
    
    console.log('Plan created and submitted successfully.');

    // Chuyển sang trang Nhiệm vụ (Công tác) để thực hiện phân công
    await page.goto('/works');
    await expect(page.locator('h1')).toContainText('Danh sách công tác');
    
    // Tìm một công việc bất kỳ và nhấn vào nút "Thao tác" (3 chấm)
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });
    await firstRow.locator('button:has-text("Thao tác")').click();
    
    // Chọn "Phân công" từ dropdown menu
    await page.click('a:has-text("Phân công")');
    
    // Đợi trang phân công tải xong
    await expect(page.locator('h1')).toContainText('Phân công nhân viên');
    
    // Mở Dialog "Thêm nhân viên"
    await page.click('button:has-text("Thêm nhân viên")');
    
    // Chờ Select (Combobox) hiển thị và click để mở danh sách
    const selectTrigger = page.locator('button[role="combobox"]');
    await expect(selectTrigger).toBeVisible({ timeout: 15000 });
    await selectTrigger.click();
    
    // Chọn nhân viên đầu tiên trong dropdown menu của Select (role="option")
    const firstOption = page.locator('div[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 15000 });
    await firstOption.click();
    
    // (Tuỳ chọn) Điền vai trò
    await page.fill('input#role', 'Nhân viên hiện trường');
    
    // Click nút Phân công trong Dialog
    await page.click('button[type="submit"]:has-text("Phân công")');
    
    // Chờ toast thông báo thành công
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Đã phân công nhân viên' })).toBeVisible({ timeout: 15000 });
    console.log('Work item assigned successfully.');
  });
});
