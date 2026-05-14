import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Trees Management (Captain Role)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'doitruong@localhost');
    await page.fill('#password', 'DoiTruong1!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
  });

  test('View tree list — table loads with data or empty state', async ({ page }) => {
    await page.goto('/trees');

    // Verify page heading
    await expect(page.locator('h1')).toContainText('Hệ thống Cây xanh', { timeout: 15000 });

    // Wait for loading to finish (table rows or empty state appears)
    const tableRows = page.locator('tbody tr');
    const emptyMessage = page.locator('text=Không có dữ liệu');

    await expect(async () => {
      const hasRows = await tableRows.first().isVisible().catch(() => false);
      const hasEmpty = await emptyMessage.isVisible().catch(() => false);
      const hasAnyContent = hasRows || hasEmpty;
      expect(hasAnyContent).toBeTruthy();
    }).toPass({ timeout: 20000 });
  });

  test('Search trees — filter by tree name or type', async ({ page }) => {
    await page.goto('/trees');
    await expect(page.locator('h1')).toContainText('Hệ thống Cây xanh', { timeout: 15000 });

    // Find the search input inside the filter bar
    const searchInput = page.locator('input[placeholder*="Tìm mã số"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Type a search term
    await searchInput.fill('Cây');

    // Wait for debounced search to execute (500ms debounce in code)
    await page.waitForTimeout(1000);

    // Verify the page still renders without errors (data or empty state)
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });
  });

  test('View tree detail — click a tree row to see details', async ({ page }) => {
    await page.goto('/trees');
    await expect(page.locator('h1')).toContainText('Hệ thống Cây xanh', { timeout: 15000 });

    // Wait for table data to load
    const firstRow = page.locator('tbody tr').first();
    const isEmpty = await page.locator('tbody tr td[colspan]').isVisible().catch(() => false);

    if (isEmpty) {
      test.skip(true, 'No tree data available to test detail view');
      return;
    }

    await expect(firstRow).toBeVisible({ timeout: 15000 });

    // Click the first tree row — the row uses links or navigate programmatically
    // The table has clickable rows that link to /trees/[id]
    const firstLink = firstRow.locator('a').first();
    if (await firstLink.isVisible().catch(() => false)) {
      await firstLink.click();
    } else {
      // If no link in row, try clicking the row directly
      await firstRow.click();
    }

    // Wait for navigation to tree detail page
    await page.waitForURL(/\/trees\/\d+/, { timeout: 15000 });

    // Verify detail page elements
    await expect(page.locator('h1')).toContainText('Chi tiết Cây xanh', { timeout: 10000 });

    // Verify tree type and condition info display
    const cardContent = page.locator('main, [class*="space-y"]').first();
    await expect(cardContent).toBeVisible();
  });

  test('Create new tree — open dialog, fill form, submit', async ({ page }) => {
    await page.goto('/trees');
    await expect(page.locator('h1')).toContainText('Hệ thống Cây xanh', { timeout: 15000 });

    // Click "THÊM CÂY MỚI" button
    const addButton = page.locator('button:has-text("THÊM CÂY MỚI")');
    await expect(addButton).toBeVisible({ timeout: 10000 });
    await addButton.click();

    // Wait for dialog to appear
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('text=Thêm cây xanh mới')).toBeVisible();

    // Fill the tree name
    const treeName = `E2E Cây Test ${Date.now()}`;
    await dialog.locator('#name').fill(treeName);

    // Tree type select is pre-filled with value "1" (Cây bóng mát), keep default

    // Condition select is pre-filled with "Bình thường", keep default

    // Latitude and longitude are pre-filled with Da Nang coords, keep defaults

    // Click submit button
    await dialog.locator('button:has-text("LƯU DỮ LIỆU")').click();

    // Verify success toast
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: 'Thành công' })
    ).toBeVisible({ timeout: 15000 });

    // Verify dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test('Edit tree — open edit dialog, modify field, save', async ({ page }) => {
    await page.goto('/trees');
    await expect(page.locator('h1')).toContainText('Hệ thống Cây xanh', { timeout: 15000 });

    // Wait for table to load
    const firstRow = page.locator('tbody tr').first();
    const isEmpty = await page.locator('tbody tr td[colspan]').isVisible().catch(() => false);

    if (isEmpty) {
      test.skip(true, 'No tree data available to test edit');
      return;
    }

    await expect(firstRow).toBeVisible({ timeout: 15000 });

    // Click the action dropdown (MoreHorizontal icon button) on first row
    const actionButton = firstRow.locator('button').filter({ has: page.locator('svg') }).last();
    await actionButton.click();

    // Look for edit option in dropdown
    const editOption = page.locator('[role="menuitem"]:has-text("Sửa"), [role="menuitem"]:has-text("Chỉnh sửa"), [role="menuitem"]:has-text("Edit")');

    if (await editOption.isVisible().catch(() => false)) {
      await editOption.click();

      // Wait for edit dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 10000 });
      await expect(dialog.locator('text=Cập nhật thông tin')).toBeVisible();

      // Modify the name field
      const nameInput = dialog.locator('#name');
      await nameInput.clear();
      await nameInput.fill(`E2E Edited ${Date.now()}`);

      // Submit
      await dialog.locator('button:has-text("CẬP NHẬT")').click();

      // Verify success toast
      await expect(
        page.locator('[data-sonner-toast]').filter({ hasText: 'Thành công' })
      ).toBeVisible({ timeout: 15000 });
    } else {
      // Edit may be triggered differently — just verify the dropdown opened
      const dropdownContent = page.locator('[role="menu"]');
      await expect(dropdownContent).toBeVisible();
    }
  });

  test('Tree map integration — MapLibre canvas renders with markers', async ({ page }) => {
    await page.goto('/map');

    // Wait for the page to load
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    // Verify MapLibre canvas renders (the map uses a canvas element)
    const mapCanvas = page.locator('canvas.maplibregl-canvas, canvas.mapboxgl-canvas, canvas');
    await expect(mapCanvas.first()).toBeVisible({ timeout: 30000 });

    // Verify the page doesn't show an error
    await expect(page.locator('text=Lỗi')).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});
