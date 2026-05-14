import { test, expect } from '@playwright/test';

// All tests use no pre-existing auth state — each test logs in inline
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Role-Based Access Control (RBAC)', () => {
  test.describe('Cross-role hub protection', () => {
    test('director accessing /nhanvien is redirected to /giamdoc', async ({ page }) => {
      // Login as director
      await page.goto('/login');
      await page.fill('#email', 'giamdoc@localhost');
      await page.fill('#password', 'GiamDoc1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });

      // Attempt to access worker hub
      await page.goto('/nhanvien');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
    });

    test('director accessing /doitruong is redirected to /giamdoc', async ({ page }) => {
      // Login as director
      await page.goto('/login');
      await page.fill('#email', 'giamdoc@localhost');
      await page.fill('#password', 'GiamDoc1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });

      // Attempt to access captain hub
      await page.goto('/doitruong');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
    });

    test('worker accessing /giamdoc is redirected to /nhanvien', async ({ page }) => {
      // Login as worker
      await page.goto('/login');
      await page.fill('#email', 'emp1@localhost');
      await page.fill('#password', 'NhanVien1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });

      // Attempt to access director hub
      await page.goto('/giamdoc');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });
    });

    test('worker accessing /doitruong is redirected to /nhanvien', async ({ page }) => {
      // Login as worker
      await page.goto('/login');
      await page.fill('#email', 'emp1@localhost');
      await page.fill('#password', 'NhanVien1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });

      // Attempt to access captain hub
      await page.goto('/doitruong');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });
    });

    test('captain accessing /giamdoc is redirected to /doitruong', async ({ page }) => {
      // Login as captain
      await page.goto('/login');
      await page.fill('#email', 'doitruong@localhost');
      await page.fill('#password', 'DoiTruong1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });

      // Attempt to access director hub
      await page.goto('/giamdoc');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
    });

    test('captain accessing /nhanvien is redirected to /doitruong', async ({ page }) => {
      // Login as captain
      await page.goto('/login');
      await page.fill('#email', 'doitruong@localhost');
      await page.fill('#password', 'DoiTruong1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });

      // Attempt to access worker hub
      await page.goto('/nhanvien');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
    });
  });

  test.describe('Unauthenticated access to secured routes', () => {
    test('unauthenticated user accessing /plans is redirected to /login', async ({ page }) => {
      await page.goto('/plans');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated user accessing /giamdoc is redirected to /login', async ({ page }) => {
      await page.goto('/giamdoc');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated user accessing /doitruong is redirected to /login', async ({ page }) => {
      await page.goto('/doitruong');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated user accessing /nhanvien is redirected to /login', async ({ page }) => {
      await page.goto('/nhanvien');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated user accessing /staff is redirected to /login', async ({ page }) => {
      await page.goto('/staff');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated user accessing /settings is redirected to /login', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated user accessing /works is redirected to /login', async ({ page }) => {
      await page.goto('/works');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test('unauthenticated user accessing /incidents is redirected to /login', async ({ page }) => {
      await page.goto('/incidents');
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });
  });

  test.describe('Authenticated users cannot access login page', () => {
    test('director visiting /login is redirected to /giamdoc', async ({ page }) => {
      // Login as director
      await page.goto('/login');
      await page.fill('#email', 'giamdoc@localhost');
      await page.fill('#password', 'GiamDoc1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });

      // Attempt to access login page while already authenticated
      await page.goto('/login');
      await expect(page).toHaveURL(/\/giamdoc/, { timeout: 15000 });
    });

    test('worker visiting /login is redirected to /nhanvien', async ({ page }) => {
      // Login as worker
      await page.goto('/login');
      await page.fill('#email', 'emp1@localhost');
      await page.fill('#password', 'NhanVien1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });

      // Attempt to access login page while already authenticated
      await page.goto('/login');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });
    });
  });
});
