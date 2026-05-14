import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Settings Pages (Director Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'giamdoc@localhost');
    await page.fill('#password', 'GiamDoc1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
  });

  test('should display settings page with profile form', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('Cài đặt tài khoản', { timeout: 30000 });
    await expect(page.locator('text=Xem và cập nhật thông tin cá nhân')).toBeVisible();
  });

  test('should display profile information fields', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('Cài đặt tài khoản', { timeout: 30000 });

    // Wait for profile data to load (no more "Đang tải..." text)
    await expect(page.locator('text=Thông tin hồ sơ')).toBeVisible({ timeout: 15000 });

    // Verify form fields
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Vai trò")')).toBeVisible();
    await expect(page.locator('label:has-text("Họ và tên")')).toBeVisible();
    await expect(page.locator('label:has-text("Ngày sinh")')).toBeVisible();

    // Verify save button
    await expect(page.locator('button:has-text("Lưu thay đổi")')).toBeVisible();
  });

  test('should update profile name and save', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText('Cài đặt tài khoản', { timeout: 30000 });
    await expect(page.locator('text=Thông tin hồ sơ')).toBeVisible({ timeout: 15000 });

    // Update full name
    const nameInput = page.locator('#fullName');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await nameInput.fill('Giám Đốc E2E');

    // Click save
    await page.click('button:has-text("Lưu thay đổi")');

    // Expect success toast
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: 'Cập nhật hồ sơ thành công' })
    ).toBeVisible({ timeout: 15000 });
  });

  test('should display admin settings page with system sections', async ({ page }) => {
    await page.goto('/settings/admin');
    await expect(page.locator('h2')).toContainText('Quản trị hệ thống', { timeout: 30000 });
    await expect(page.locator('text=Quản lý tài khoản, phân quyền và vận hành hệ thống')).toBeVisible();
  });

  test('should display admin page cards for management modules', async ({ page }) => {
    await page.goto('/settings/admin');
    await expect(page.locator('h2')).toContainText('Quản trị hệ thống', { timeout: 30000 });

    // Verify management sections
    await expect(page.locator('text=Quản lý nhân viên')).toBeVisible();
    await expect(page.locator('text=Phân quyền')).toBeVisible();
    await expect(page.locator('text=Quản lý vị trí')).toBeVisible();
    await expect(page.locator('text=Bảo dưỡng tự động')).toBeVisible();
  });

  test('should navigate to staff page from admin settings', async ({ page }) => {
    await page.goto('/settings/admin');
    await expect(page.locator('h2')).toContainText('Quản trị hệ thống', { timeout: 30000 });

    // Click "Đến trang nhân viên" link
    await page.click('a:has-text("Đến trang nhân viên")');
    await expect(page).toHaveURL(/\/staff/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Hồ sơ Nhân sự', { timeout: 30000 });
  });

  test('should display locations settings page with table', async ({ page }) => {
    await page.goto('/settings/locations');
    await expect(page.locator('h1')).toContainText('Quản lý vị trí', { timeout: 30000 });
    await expect(page.locator('text=Danh sách vị trí cây xanh theo tuyến đường')).toBeVisible();

    // Verify table structure
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Mã")')).toBeVisible();
    await expect(page.locator('th:has-text("Mô tả")')).toBeVisible();
    await expect(page.locator('th:has-text("Số nhà")')).toBeVisible();
    await expect(page.locator('th:has-text("Tọa độ")')).toBeVisible();
  });

  test('should show add button and open create location dialog', async ({ page }) => {
    await page.goto('/settings/locations');
    await expect(page.locator('h1')).toContainText('Quản lý vị trí', { timeout: 30000 });

    // Click "Thêm vị trí" button
    await page.click('button:has-text("Thêm vị trí")');

    // Dialog should open
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('text=Thêm vị trí mới')).toBeVisible();

    // Verify form fields in dialog
    await expect(dialog.locator('text=Phường/Xã')).toBeVisible();
    await expect(dialog.locator('text=Tuyến đường')).toBeVisible();
    await expect(dialog.locator('#houseNumber')).toBeVisible();
    await expect(dialog.locator('#description')).toBeVisible();
    await expect(dialog.locator('#lat')).toBeVisible();
    await expect(dialog.locator('#lon')).toBeVisible();

    // Cancel should close dialog
    await dialog.locator('button:has-text("Hủy")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('should navigate to locations page from admin settings', async ({ page }) => {
    await page.goto('/settings/admin');
    await expect(page.locator('h2')).toContainText('Quản trị hệ thống', { timeout: 30000 });

    // Click "Đến trang vị trí" link
    await page.click('a:has-text("Đến trang vị trí")');
    await expect(page).toHaveURL(/\/settings\/locations/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Quản lý vị trí', { timeout: 30000 });
  });
});
