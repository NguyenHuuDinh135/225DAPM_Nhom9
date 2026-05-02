import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate as director', async ({ page }) => {
  console.log('Starting authentication for Director...');
  await page.goto('/login');
  await page.fill('#email', 'giamdoc@localhost');
  await page.fill('#password', 'GiamDoc1!');
  await page.click('button[type="submit"]');

  // Chờ chuyển hướng thành công
  await page.waitForURL(/\/giamdoc/, { timeout: 30000 });
  await expect(page.locator('h1')).toContainText('Bảng điều khiển Giám đốc');

  // Lưu trạng thái đăng nhập
  await page.context().storageState({ path: authFile });
  console.log('Authentication successful, state saved to:', authFile);
});
