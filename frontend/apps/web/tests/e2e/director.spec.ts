import { test, expect } from '@playwright/test';

test.describe('Director E2E Features', () => {
  test.beforeEach(async ({ page }) => {
    // Đã được đăng nhập bởi storageState, chỉ cần chuyển trang
    await page.goto('/giamdoc');
    await expect(page.locator('h1')).toContainText('Bảng điều khiển Giám đốc', { timeout: 15000 });
  });

  test('Director can view pending plans and emergency incidents', async ({ page }) => {
    // Đợi dữ liệu load xong
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });
    
    // Kiểm tra phần Duyệt nhanh (Plans)
    await expect(page.locator('text=Duyệt nhanh')).toBeVisible();
    
    // Kiểm tra phần Cảnh báo Khẩn cấp (Incidents)
    await expect(page.locator('text=Cảnh báo Khẩn cấp')).toBeVisible();
  });

  test('Director can perform "Duyệt nhanh" on a plan', async ({ page }) => {
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });
    
    const planCard = page.locator('div.rounded-3xl').filter({ has: page.locator('button:has-text("DUYỆT")') }).first();
    
    if (await planCard.isVisible()) {
        const planName = await planCard.locator('p.text-base').innerText();
        console.log(`Found pending plan: "${planName}", clicking approve...`);
        
        await planCard.locator('button:has-text("DUYỆT")').click();
        
        // Chờ toast thông báo thành công
        await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Phê duyệt thành công' })).toBeVisible({ timeout: 15000 });
    } else {
        console.log('No pending plans found to approve.');
    }
  });

  test('Director can approve an emergency incident', async ({ page }) => {
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });
    
    const incidentCard = page.locator('div.rounded-3xl').filter({ hasText: 'CẦN XEM NGAY' }).first();
    
    if (await incidentCard.isVisible()) {
        console.log('Found emergency incident, clicking to open...');
        await incidentCard.click();
        
        // Chờ Sheet mở ra
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
        
        // Click PHÊ DUYỆT ĐIỀU PHỐI
        const approveBtn = page.locator('[role="dialog"] button:has-text("PHÊ DUYỆT ĐIỀU PHỐI")');
        await expect(approveBtn).toBeVisible();
        await approveBtn.click();
        
        // Chờ toast thông báo thành công
        await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Đã phê duyệt sự cố' })).toBeVisible({ timeout: 15000 });
    } else {
        console.log('No emergency incidents found.');
    }
  });

  test('Director can perform "Phê duyệt tổng thể" via AlertDialog', async ({ page }) => {
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 20000 });
    
    // Kiểm tra nếu có mục nào để duyệt không
    const hasPlans = await page.locator('button:has-text("DUYỆT")').count() > 0;
    const hasIncidents = await page.locator('text=CẦN XEM NGAY').count() > 0;
    
    if (!hasPlans && !hasIncidents) {
        console.log('Nothing to approve globally.');
        return;
    }

    // Click PHÊ DUYỆT TỔNG THỂ
    const globalApproveBtn = page.locator('button:has-text("PHÊ DUYỆT TỔNG THỂ")');
    await expect(globalApproveBtn).toBeVisible();
    await globalApproveBtn.click();
    
    // Chờ AlertDialog xuất hiện
    const alertDialog = page.locator('[role="alertdialog"]');
    await expect(alertDialog).toBeVisible({ timeout: 5000 });
    await expect(alertDialog.locator('text=Xác nhận phê duyệt tổng thể')).toBeVisible();
    
    // Xác nhận phê duyệt
    const confirmBtn = alertDialog.locator('button:has-text("Xác nhận phê duyệt")');
    await confirmBtn.click();
    
    // Chờ toast thông báo thành công
    await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Hoàn tất phê duyệt tổng thể' })).toBeVisible({ timeout: 30000 });
  });
});
