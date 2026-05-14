import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directorAuthFile = path.join(__dirname, '../../playwright/.auth/director.json');
const captainAuthFile = path.join(__dirname, '../../playwright/.auth/captain.json');
const workerAuthFile = path.join(__dirname, '../../playwright/.auth/worker.json');

setup('authenticate as director', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'giamdoc@localhost');
  await page.fill('#password', 'GiamDoc1!');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/giamdoc/, { timeout: 30000 });
  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: directorAuthFile });
});

setup('authenticate as captain', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'doitruong@localhost');
  await page.fill('#password', 'DoiTruong1!');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/doitruong/, { timeout: 30000 });
  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: captainAuthFile });
});

setup('authenticate as worker', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#email', 'emp1@localhost');
  await page.fill('#password', 'NhanVien1!');
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/nhanvien/, { timeout: 30000 });
  await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: workerAuthFile });
});
