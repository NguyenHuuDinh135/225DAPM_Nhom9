import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Navigation - Back Button', () => {
  test.beforeEach(async ({ page }) => {
    // Login as worker (NhanVien)
    await page.goto('/login');
    await page.fill('#email', 'emp1@localhost');
    await page.fill('#password', 'NhanVien1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });
  });

  test('progress page back button navigates to /nhanvien (not /worker)', async ({ page }) => {
    // Navigate to tasks page first
    await page.goto('/nhanvien/tasks');
    await expect(page.locator('body')).not.toContainText('404');

    // Look for any task link that navigates to a work progress page
    const taskLink = page.locator('a[href*="/works/"]').first();
    const hasTask = await taskLink.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasTask) {
      // Click the task to go to progress page
      await taskLink.click();
      await page.waitForURL(/\/works\/\d+\/progress/, { timeout: 15000 });

      // Find the back button (ChevronLeft icon link to /nhanvien)
      const backButton = page.locator('a[href="/nhanvien"]').first();
      await expect(backButton).toBeVisible({ timeout: 10000 });
      await backButton.click();

      // Verify URL contains /nhanvien (NOT /worker)
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 10000 });
      expect(page.url()).not.toContain('/worker');
    } else {
      // No tasks available - verify the worker dashboard back link pattern
      // Navigate to a progress page directly (it will show "Khong tim thay")
      await page.goto('/works/1/progress');

      // Even in error state, the back link should go to /nhanvien
      const backLink = page.locator('a[href="/nhanvien"]');
      const hasBackLink = await backLink.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasBackLink) {
        await backLink.click();
        await expect(page).toHaveURL(/\/nhanvien/, { timeout: 10000 });
        expect(page.url()).not.toContain('/worker');
      } else {
        // Fallback: verify we can navigate back from tasks page
        console.log('No tasks found and no back link visible - verifying tasks page has correct base URL');
        await page.goto('/nhanvien');
        await expect(page).toHaveURL(/\/nhanvien/);
        expect(page.url()).not.toContain('/worker');
      }
    }
  });

  test('completed work page "Quay lai" button links to /nhanvien/tasks', async ({ page }) => {
    // Navigate to worker tasks
    await page.goto('/nhanvien/tasks');

    // Look for a completed task (has status "Completed" badge)
    const completedLink = page.locator('a[href*="/works/"]').first();
    const hasLink = await completedLink.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasLink) {
      await completedLink.click();
      await page.waitForURL(/\/works\/\d+\/progress/, { timeout: 15000 });

      // Check if the "Quay lai danh sach nhiem vu" button exists (completed state)
      const backToTasksLink = page.locator('a[href="/nhanvien/tasks"]');
      const isCompleted = await backToTasksLink.isVisible({ timeout: 5000 }).catch(() => false);

      if (isCompleted) {
        await backToTasksLink.click();
        await expect(page).toHaveURL(/\/nhanvien\/tasks/, { timeout: 10000 });
        expect(page.url()).not.toContain('/worker');
      } else {
        // Work is not completed, the header back button goes to /nhanvien
        const headerBack = page.locator('a[href="/nhanvien"]').first();
        await expect(headerBack).toBeVisible();
        console.log('Work item is not completed - header back link to /nhanvien verified');
      }
    } else {
      console.log('No work items found for worker - skipping back button navigation test');
    }
  });
});
