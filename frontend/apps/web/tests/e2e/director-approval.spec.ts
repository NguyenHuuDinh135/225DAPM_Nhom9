import { test, expect } from '@playwright/test';

test.describe('Director Approval Flow', () => {
  test.beforeEach(async ({ page }) => {
    // In logs trình duyệt
    page.on('console', msg => console.log(`BROWSER LOG: [${msg.type()}] ${msg.text()}`));

    // Đăng nhập với quyền Giám đốc
    await page.goto('/login');
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    
    // Đợi URL chuyển sang dashboard giám đốc
    await page.waitForURL(/\/giamdoc/, { timeout: 30000 });
    console.log(`Log in successful, current URL: ${page.url()}`);
  });

  test('Should see pending plans and be able to approve one', async ({ page }) => {
    // Đợi tiêu đề xuất hiện
    await expect(page.locator('h1')).toContainText('Giám đốc', { timeout: 30000 });
    
    // Đợi stats load xong (Duyệt nhanh xuất hiện)
    const pendingSection = page.locator('text=Duyệt nhanh');
    await expect(pendingSection).toBeVisible({ timeout: 30000 });
    
    // Chờ dữ liệu list load (biến mất loader bên trong card)
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 30000 });

    // Duyệt một kế hoạch nếu có - dùng selector chính xác cho card kế hoạch
    const planCard = page.locator('div.rounded-3xl').filter({ has: page.locator('button:has-text("DUYỆT")') }).first();
    
    if (await planCard.isVisible()) {
        const planName = await planCard.locator('p.text-base').innerText();
        console.log(`Found pending plan: "${planName}", clicking approve...`);
        
        await planCard.locator('button:has-text("DUYỆT")').click();
        
        // Chờ toast xuất hiện
        console.log('Waiting for success toast...');
        await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Phê duyệt thành công' })).toBeVisible({ timeout: 25000 });
        console.log('Plan approved successfully.');
    } else {
        console.log('No pending plans found to approve.');
    }
  });

  test('Should be able to approve an emergency incident', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Giám đốc', { timeout: 30000 });
    
    // Đợi dữ liệu load xong
    await page.waitForTimeout(5000);
    
    // Đợi phần Cảnh báo Khẩn cấp xuất hiện
    const emergencyHeader = page.locator('text=Cảnh báo Khẩn cấp');
    await expect(emergencyHeader).toBeVisible({ timeout: 30000 });
    
    // Mở một sự cố khẩn cấp - dùng selector chính xác cho card sự cố
    const incidentCard = page.locator('div.rounded-3xl').filter({ hasText: 'CẦN XEM NGAY' }).first();
    
    if (await incidentCard.isVisible()) {
        console.log('Found emergency incident, clicking to open...');
        await incidentCard.click();
        
        // Chờ Sheet mở ra
        console.log('Waiting for detail sheet...');
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Thông tin chi tiết hiện trường')).toBeVisible({ timeout: 10000 });
        
        // Click PHÊ DUYỆT ĐIỀU PHỐI trong Sheet
        const approveBtn = page.locator('[role="dialog"] button:has-text("PHÊ DUYỆT ĐIỀU PHỐI")');
        await expect(approveBtn).toBeVisible({ timeout: 10000 });
        await approveBtn.click();
        
        await expect(page.locator('[data-sonner-toast]').filter({ hasText: 'Đã phê duyệt sự cố' })).toBeVisible({ timeout: 15000 });
        console.log('Incident approved successfully.');
    } else {
        console.log('No emergency incidents found.');
    }
  });
});
