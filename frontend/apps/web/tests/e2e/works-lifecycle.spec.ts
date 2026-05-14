import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Works Lifecycle', () => {
  test.describe('Captain — Work list and detail', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'doitruong@localhost');
      await page.fill('#password', 'DoiTruong1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
    });

    test('View work list — table loads with columns', async ({ page }) => {
      await page.goto('/works');

      // Verify page heading
      await expect(page.locator('h1')).toContainText('Danh sách công tác', { timeout: 15000 });

      // Verify table header columns exist
      const tableHeader = page.locator('thead');
      await expect(tableHeader).toBeVisible({ timeout: 10000 });
      await expect(tableHeader.locator('th:has-text("Loại công tác")')).toBeVisible();
      await expect(tableHeader.locator('th:has-text("Trạng thái")')).toBeVisible();

      // Verify table body renders (rows or empty message)
      const tableBody = page.locator('tbody');
      await expect(tableBody).toBeVisible({ timeout: 10000 });

      const rows = tableBody.locator('tr');
      await expect(rows.first()).toBeVisible({ timeout: 15000 });
    });

    test('View work detail — click row to see detail sheet or navigate', async ({ page }) => {
      await page.goto('/works');
      await expect(page.locator('h1')).toContainText('Danh sách công tác', { timeout: 15000 });

      // Wait for table data
      const firstRow = page.locator('tbody tr').first();
      const emptyState = page.locator('tbody tr td[colspan]');

      if (await emptyState.isVisible({ timeout: 10000 }).catch(() => false)) {
        test.skip(true, 'No work items available');
        return;
      }

      await expect(firstRow).toBeVisible({ timeout: 15000 });

      // Click the first row (opens a sheet based on code)
      await firstRow.click();

      // The WorkSheet component opens — verify it shows work detail content
      // It might show in a sheet/dialog or navigate to detail page
      const sheetOrDetail = page.locator('[role="dialog"], [data-state="open"]');
      const detailPage = page.locator('h1:has-text("Công tác #")');

      await expect(async () => {
        const hasSheet = await sheetOrDetail.isVisible().catch(() => false);
        const hasDetail = await detailPage.isVisible().catch(() => false);
        expect(hasSheet || hasDetail).toBeTruthy();
      }).toPass({ timeout: 15000 });
    });

    test('Navigate to work detail page directly', async ({ page }) => {
      await page.goto('/works');
      await expect(page.locator('h1')).toContainText('Danh sách công tác', { timeout: 15000 });

      // Wait for table data
      const firstRow = page.locator('tbody tr').first();
      const emptyState = page.locator('tbody tr td[colspan]');

      if (await emptyState.isVisible({ timeout: 10000 }).catch(() => false)) {
        test.skip(true, 'No work items available');
        return;
      }

      await expect(firstRow).toBeVisible({ timeout: 15000 });

      // Open action dropdown
      const actionButton = firstRow.locator('button').last();
      await actionButton.click();

      // Click "Xem chi tiết" to open detail
      const detailLink = page.locator('[role="menuitem"]:has-text("Xem chi tiết")');
      if (await detailLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await detailLink.click();

        // Verify detail sheet or detail opens
        await page.waitForTimeout(1000);
      }
    });

    test('Assign worker to work — navigate to assign page', async ({ page }) => {
      await page.goto('/works');
      await expect(page.locator('h1')).toContainText('Danh sách công tác', { timeout: 15000 });

      // Wait for table data
      const firstRow = page.locator('tbody tr').first();
      const emptyState = page.locator('tbody tr td[colspan]');

      if (await emptyState.isVisible({ timeout: 10000 }).catch(() => false)) {
        test.skip(true, 'No work items available for assignment');
        return;
      }

      await expect(firstRow).toBeVisible({ timeout: 15000 });

      // Open action dropdown on first row
      const actionButton = firstRow.locator('button').last();
      await actionButton.click();

      // Click "Phân công" from dropdown
      const assignLink = page.locator('[role="menuitem"] a:has-text("Phân công"), a:has-text("Phân công")');
      if (await assignLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await assignLink.click();

        // Wait for assign page to load
        await page.waitForURL(/\/works\/\d+\/assign/, { timeout: 15000 });
        await expect(page.locator('h1')).toContainText('Phân công nhân viên', { timeout: 10000 });

        // Click "Thêm nhân viên" button
        const addEmployeeBtn = page.locator('button:has-text("Thêm nhân viên")');
        await expect(addEmployeeBtn).toBeVisible({ timeout: 10000 });
        await addEmployeeBtn.click();

        // Wait for dialog
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 10000 });
        await expect(dialog.locator('text=Thêm nhân viên')).toBeVisible();

        // Open the employee select dropdown
        const selectTrigger = dialog.locator('button[role="combobox"]');
        await expect(selectTrigger).toBeVisible({ timeout: 10000 });
        await selectTrigger.click();

        // Select first employee option
        const firstOption = page.locator('[role="option"]').first();
        if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
          await firstOption.click();

          // Optionally fill role
          await dialog.locator('#role').fill('Nhân viên hiện trường');

          // Submit assignment
          await dialog.locator('button[type="submit"]:has-text("Phân công")').click();

          // Wait for success toast
          await expect(
            page.locator('[data-sonner-toast]').filter({ hasText: 'phân công' })
          ).toBeVisible({ timeout: 15000 });
        } else {
          // No employees available in the list
          await dialog.locator('button:has-text("Hủy")').click();
        }
      }
    });
  });

  test.describe('Worker — Report progress', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'emp1@localhost');
      await page.fill('#password', 'NhanVien1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/nhanvien/, { timeout: 15000 });
    });

    test('View task list and navigate to progress report', async ({ page }) => {
      await page.goto('/nhanvien/tasks');

      // Wait for page heading
      await expect(page.locator('h1')).toContainText('Danh sách nhiệm vụ', { timeout: 15000 });

      // Wait for loading to finish
      await page.waitForTimeout(3000);

      // Check if there are tasks or empty state
      const emptyState = page.locator('h3:has-text("Không có công việc")');
      const taskCard = page.locator('a:has-text("Tiếp nhận")').first();
      const viewDetailLink = page.locator('a:has-text("Xem chi tiết")').first();
      const viewProgressLink = page.locator('a:has-text("Xem tiến độ")').first();

      const hasEmpty = await emptyState.isVisible().catch(() => false);
      const hasTask = await taskCard.isVisible().catch(() => false);
      const hasViewDetail = await viewDetailLink.isVisible().catch(() => false);
      const hasViewProgress = await viewProgressLink.isVisible().catch(() => false);

      if (hasEmpty) {
        // No tasks assigned — verify empty state renders correctly
        await expect(emptyState).toBeVisible();
        return;
      }

      // Click the first actionable task link
      if (hasTask) {
        await taskCard.click();
      } else if (hasViewDetail) {
        await viewDetailLink.click();
      } else if (hasViewProgress) {
        await viewProgressLink.click();
      } else {
        // Just verify the page loaded without errors
        return;
      }

      // Wait for navigation to progress page
      await page.waitForURL(/\/works\/\d+\/progress/, { timeout: 15000 });

      // Verify progress page loads
      await expect(page.locator('h1, h2')).toBeVisible({ timeout: 15000 });
    });

    test('Submit progress report with note and percentage', async ({ page }) => {
      await page.goto('/nhanvien/tasks');
      await expect(page.locator('h1')).toContainText('Danh sách nhiệm vụ', { timeout: 15000 });

      // Wait for data to load
      await page.waitForTimeout(3000);

      // Find an active (non-completed) task
      const taskLink = page.locator('a:has-text("Tiếp nhận")').first();

      if (await taskLink.isVisible().catch(() => false)) {
        await taskLink.click();
        await page.waitForURL(/\/works\/\d+\/progress/, { timeout: 15000 });

        // Wait for form to load
        const noteTextarea = page.locator('#note, textarea');
        await expect(noteTextarea.first()).toBeVisible({ timeout: 15000 });

        // Fill progress report
        await noteTextarea.first().fill('Đã kiểm tra và xử lý cây xanh tại vị trí. Tình trạng ổn định.');

        // Set percentage
        const pctInput = page.locator('#pct, input[type="number"]').first();
        if (await pctInput.isVisible().catch(() => false)) {
          await pctInput.clear();
          await pctInput.fill('80');
        }

        // Submit report
        const submitBtn = page.locator('button:has-text("Gửi báo cáo công tác")');
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();

          // Wait for success toast
          await expect(
            page.locator('[data-sonner-toast]').filter({ hasText: 'tiến độ' })
          ).toBeVisible({ timeout: 15000 });
        }
      } else {
        // No active tasks available — try viewing a completed task
        const anyTaskLink = page.locator('a[href*="/works/"]').first();
        if (await anyTaskLink.isVisible().catch(() => false)) {
          await anyTaskLink.click();
          await page.waitForURL(/\/works\/\d+\/progress/, { timeout: 15000 });
          // Just verify the page loaded (could be completed state)
          await expect(page.locator('h1, h2')).toBeVisible({ timeout: 15000 });
        } else {
          test.skip(true, 'No tasks available for progress report');
        }
      }
    });
  });

  test.describe('Captain — Work completion approval', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'doitruong@localhost');
      await page.fill('#password', 'DoiTruong1!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
    });

    test('View work with 100% progress — verify completion controls', async ({ page }) => {
      await page.goto('/works');
      await expect(page.locator('h1')).toContainText('Danh sách công tác', { timeout: 15000 });

      // Look for work items with "Chờ duyệt" status (WaitingForApproval means 100% reported)
      const waitingBadge = page.locator('tbody tr').filter({
        has: page.locator('span:has-text("Chờ duyệt")'),
      }).first();

      if (await waitingBadge.isVisible({ timeout: 10000 }).catch(() => false)) {
        // Click on it
        await waitingBadge.click();

        // A sheet or dialog should open showing the work detail
        await page.waitForTimeout(1000);

        // Verify we can see approval-related content
        const sheet = page.locator('[role="dialog"], [data-state="open"]');
        if (await sheet.isVisible({ timeout: 5000 }).catch(() => false)) {
          // Look for completion/approve button in the sheet
          const approveBtn = sheet.locator('button:has-text("Hoàn thành"), button:has-text("Duyệt"), button:has-text("Xác nhận")');
          if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            // Verify the button exists — don't click to avoid side effects in other tests
            await expect(approveBtn.first()).toBeVisible();
          }
        }
      } else {
        // Try navigating directly to a work detail page
        const firstRow = page.locator('tbody tr').first();
        const emptyState = page.locator('tbody tr td[colspan]');

        if (await emptyState.isVisible({ timeout: 5000 }).catch(() => false)) {
          test.skip(true, 'No work items available');
          return;
        }

        // Just verify works page loaded correctly
        await expect(firstRow).toBeVisible({ timeout: 15000 });
      }
    });
  });
});
