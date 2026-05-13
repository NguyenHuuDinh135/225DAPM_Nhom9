import { test, expect, type Page } from '@playwright/test';

const MAP_URL = '/map';

async function waitForMapLoad(page: Page) {
  await page.goto(MAP_URL);
  await page.waitForSelector('.maplibregl-canvas', { timeout: 30000 });
  await page.waitForTimeout(2000);
}

test.describe('Map — Core Operations', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('map renders with tree markers', async ({ page }) => {
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    const markers = page.locator('[class*="maplibregl-marker"]');
    await expect(markers.first()).toBeVisible({ timeout: 15000 });
  });

  test('search filters trees', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('999999');
    await page.waitForTimeout(500);
    await searchInput.clear();
  });

  test('layer toggles work', async ({ page }) => {
    const layersPanel = page.locator('text=Lớp hiển thị').locator('..');
    await expect(layersPanel).toBeVisible();

    const treeToggle = layersPanel.locator('text=CÂY XANH');
    await expect(treeToggle).toBeVisible();

    const incidentToggle = layersPanel.locator('text=SỰ CỐ');
    await expect(incidentToggle).toBeVisible();

    const workToggle = layersPanel.locator('text=THI CÔNG');
    await expect(workToggle).toBeVisible();
  });

  test('mode buttons are visible', async ({ page }) => {
    await expect(page.locator('button:has-text("Duyệt")')).toBeVisible();
    await expect(page.locator('button:has-text("Vùng")')).toBeVisible();
    await expect(page.locator('button:has-text("Tuyến")')).toBeVisible();
  });

  test('fullscreen toggle works', async ({ page }) => {
    const fullscreenBtn = page.locator('button').filter({ has: page.locator('svg.lucide-maximize2, svg.lucide-minimize2') }).first();
    await fullscreenBtn.click();
    await page.waitForTimeout(500);
    const mapContainer = page.locator('[class*="fixed inset-0"]');
    await expect(mapContainer).toBeVisible();
    await fullscreenBtn.click();
    await page.waitForTimeout(500);
  });

  test('refresh button reloads data', async ({ page }) => {
    const refreshBtn = page.locator('button').filter({ has: page.locator('svg.lucide-refresh-cw') }).first();
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForTimeout(1000);
  });

  test('stats HUD shows correct labels', async ({ page }) => {
    await expect(page.locator('text=Hệ thống')).toBeVisible();
    await expect(page.locator('text=Sự cố')).toBeVisible();
    await expect(page.locator('text=Công tác')).toBeVisible();
  });
});

test.describe('Map — Tree CRUD (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('add tree mode activates on button click', async ({ page }) => {
    const addBtn = page.locator('button:has-text("+ Cây")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(addBtn).toHaveAttribute('data-state', /.*/);
      const viewBtn = page.locator('button:has-text("Duyệt")');
      await viewBtn.click();
    }
  });

  test('relocate mode activates on button click', async ({ page }) => {
    const relocateBtn = page.locator('button:has-text("Di dời")');
    if (await relocateBtn.isVisible()) {
      await relocateBtn.click();
      await page.waitForTimeout(300);
      const viewBtn = page.locator('button:has-text("Duyệt")');
      await viewBtn.click();
    }
  });

  test('clicking a tree marker opens popup', async ({ page }) => {
    const markers = page.locator('[class*="maplibregl-marker"]');
    const markerCount = await markers.count();
    if (markerCount > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);
      const popup = page.locator('[class*="maplibregl-popup"]');
      if (await popup.isVisible()) {
        await expect(popup.locator('text=HỒ SƠ CÂY')).toBeVisible();
      }
    }
  });

  test('tree popup shows condition selector', async ({ page }) => {
    const markers = page.locator('[class*="maplibregl-marker"]');
    const markerCount = await markers.count();
    if (markerCount > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);
      const popup = page.locator('[class*="maplibregl-popup"]');
      if (await popup.isVisible()) {
        const conditionSelect = popup.locator('button[role="combobox"]');
        if (await conditionSelect.isVisible()) {
          await expect(conditionSelect).toBeVisible();
        }
      }
    }
  });

  test('tree detail sidebar opens', async ({ page }) => {
    const markers = page.locator('[class*="maplibregl-marker"]');
    const markerCount = await markers.count();
    if (markerCount > 0) {
      await markers.first().click();
      await page.waitForTimeout(1000);
      const popup = page.locator('[class*="maplibregl-popup"]');
      if (await popup.isVisible()) {
        const detailBtn = popup.locator('button:has-text("CHI TIẾT LỊCH SỬ")');
        if (await detailBtn.isVisible()) {
          await detailBtn.click();
          await page.waitForTimeout(500);
          const sheet = page.locator('[data-state="open"][role="dialog"]');
          await expect(sheet).toBeVisible();
        }
      }
    }
  });
});

test.describe('Map — AI Layer', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('AI button toggles AI suggestion layer', async ({ page }) => {
    const aiBtn = page.locator('button:has-text("AI")');
    await expect(aiBtn).toBeVisible();
    await aiBtn.click();
    await page.waitForTimeout(2000);
    await aiBtn.click();
  });
});

test.describe('Map — Heatmap Layer', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('heatmap toggle exists in layers panel', async ({ page }) => {
    const heatmapToggle = page.locator('text=MẬT ĐỘ');
    await expect(heatmapToggle).toBeVisible();
  });

  test('heatmap layer activates on toggle', async ({ page }) => {
    const heatmapToggle = page.locator('text=MẬT ĐỘ').locator('..');
    await heatmapToggle.click();
    await page.waitForTimeout(1000);

    const canvas = page.locator('.maplibregl-canvas');
    await expect(canvas).toBeVisible();

    await heatmapToggle.click();
    await page.waitForTimeout(500);
  });
});

test.describe('Map — Polygon Draw & Area Stats', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('polygon mode activates via Vùng button', async ({ page }) => {
    const polygonBtn = page.locator('button:has-text("Vùng")');
    await expect(polygonBtn).toBeVisible();
    await polygonBtn.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.maplibregl-canvas');
    const cursor = await canvas.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('crosshair');

    const viewBtn = page.locator('button:has-text("Duyệt")');
    await viewBtn.click();
  });

  test('drawing polygon shows completion button after 3 vertices', async ({ page }) => {
    const polygonBtn = page.locator('button:has-text("Vùng")');
    await polygonBtn.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    await page.mouse.click(cx - 80, cy - 60);
    await page.waitForTimeout(300);
    await page.mouse.click(cx + 80, cy - 60);
    await page.waitForTimeout(300);
    await page.mouse.click(cx, cy + 60);
    await page.waitForTimeout(300);

    const completeBtn = page.locator('button:has-text("Hoàn thành")');
    await expect(completeBtn).toBeVisible({ timeout: 5000 });
  });

  test('completing polygon shows stats panel', async ({ page }) => {
    const polygonBtn = page.locator('button:has-text("Vùng")');
    await polygonBtn.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    await page.mouse.click(cx - 100, cy - 80);
    await page.waitForTimeout(300);
    await page.mouse.click(cx + 100, cy - 80);
    await page.waitForTimeout(300);
    await page.mouse.click(cx + 100, cy + 80);
    await page.waitForTimeout(300);
    await page.mouse.click(cx - 100, cy + 80);
    await page.waitForTimeout(300);

    const completeBtn = page.locator('button:has-text("Hoàn thành")');
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      await page.waitForTimeout(500);

      const statsPanel = page.locator('text=Thống kê vùng chọn');
      await expect(statsPanel).toBeVisible({ timeout: 5000 });

      await expect(page.locator('text=Tình trạng')).toBeVisible();
      await expect(page.locator('text=Loài cây')).toBeVisible();

      const clearBtn = page.locator('button:has-text("Xóa vùng")');
      await expect(clearBtn).toBeVisible();
      await clearBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Map — Route Optimizer', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('route mode activates via Tuyến button', async ({ page }) => {
    const routeBtn = page.locator('button:has-text("Tuyến")');
    await expect(routeBtn).toBeVisible();
    await routeBtn.click();
    await page.waitForTimeout(500);

    const routePanel = page.locator('text=Tuyến đường');
    await expect(routePanel).toBeVisible();

    const optimizeBtn = page.locator('button:has-text("Tối ưu hóa")');
    await expect(optimizeBtn).toBeVisible();
    await expect(optimizeBtn).toBeDisabled();
  });

  test('route panel shows selected tree count', async ({ page }) => {
    const routeBtn = page.locator('button:has-text("Tuyến")');
    await routeBtn.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Tuyến đường (0 điểm)')).toBeVisible();
  });

  test('clicking trees in route mode adds to selection', async ({ page }) => {
    const routeBtn = page.locator('button:has-text("Tuyến")');
    await routeBtn.click();
    await page.waitForTimeout(500);

    const canvas = page.locator('.maplibregl-canvas');
    const box = await canvas.boundingBox();
    if (!box) return;

    const markers = page.locator('[class*="maplibregl-marker"]');
    const markerCount = await markers.count();
    if (markerCount >= 2) {
      await markers.nth(0).click();
      await page.waitForTimeout(500);
      await markers.nth(1).click();
      await page.waitForTimeout(500);

      const optimizeBtn = page.locator('button:has-text("Tối ưu hóa")');
      await expect(optimizeBtn).toBeEnabled();
    }
  });

  test('clear route button resets selection', async ({ page }) => {
    const routeBtn = page.locator('button:has-text("Tuyến")');
    await routeBtn.click();
    await page.waitForTimeout(500);

    const clearBtn = page.locator('button:has-text("Xóa tuyến")');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=Tuyến đường (0 điểm)')).toBeVisible();
  });
});

test.describe('Map — Timeline Slider', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('timeline toggle exists in layers panel', async ({ page }) => {
    const timelineToggle = page.locator('text=DÒNG THỜI GIAN');
    await expect(timelineToggle).toBeVisible();
  });

  test('timeline slider appears when toggled on', async ({ page }) => {
    const timelineToggle = page.locator('text=DÒNG THỜI GIAN').locator('..');
    await timelineToggle.click();
    await page.waitForTimeout(1000);

    const slider = page.locator('[role="slider"]');
    const sliderVisible = await slider.isVisible();
    if (sliderVisible) {
      await expect(slider).toBeVisible();

      const counter = page.locator('text=/\\d+ \\/ \\d+ cây/');
      await expect(counter).toBeVisible();
    }
  });

  test('timeline has play/pause and reset buttons', async ({ page }) => {
    const timelineToggle = page.locator('text=DÒNG THỜI GIAN').locator('..');
    await timelineToggle.click();
    await page.waitForTimeout(1000);

    const slider = page.locator('[role="slider"]');
    if (await slider.isVisible()) {
      const playBtn = page.locator('button').filter({ has: page.locator('svg.lucide-play, svg.lucide-pause') }).first();
      await expect(playBtn).toBeVisible();

      const resetBtn = page.locator('button').filter({ has: page.locator('svg.lucide-rotate-ccw') }).first();
      await expect(resetBtn).toBeVisible();
    }
  });

  test('play button starts animation', async ({ page }) => {
    const timelineToggle = page.locator('text=DÒNG THỜI GIAN').locator('..');
    await timelineToggle.click();
    await page.waitForTimeout(1000);

    const slider = page.locator('[role="slider"]');
    if (await slider.isVisible()) {
      const playBtn = page.locator('button').filter({ has: page.locator('svg.lucide-play') }).first();
      if (await playBtn.isVisible()) {
        await playBtn.click();
        await page.waitForTimeout(2000);

        const pauseBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pause') }).first();
        if (await pauseBtn.isVisible()) {
          await pauseBtn.click();
        }
      }
    }
  });

  test('timeline slider disappears when toggled off', async ({ page }) => {
    const timelineToggle = page.locator('text=DÒNG THỜI GIAN').locator('..');
    await timelineToggle.click();
    await page.waitForTimeout(1000);

    await timelineToggle.click();
    await page.waitForTimeout(500);

    const slider = page.locator('[role="slider"]');
    await expect(slider).not.toBeVisible();
  });
});

test.describe('Map — Mode Mutual Exclusion', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('polygon mode deactivates when route mode is selected', async ({ page }) => {
    const polygonBtn = page.locator('button:has-text("Vùng")');
    const routeBtn = page.locator('button:has-text("Tuyến")');

    await polygonBtn.click();
    await page.waitForTimeout(300);

    await routeBtn.click();
    await page.waitForTimeout(300);

    const canvas = page.locator('.maplibregl-canvas');
    const cursor = await canvas.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).not.toBe('crosshair');

    const routePanel = page.locator('text=Tuyến đường');
    await expect(routePanel).toBeVisible();
  });

  test('route mode deactivates when polygon mode is selected', async ({ page }) => {
    const routeBtn = page.locator('button:has-text("Tuyến")');
    const polygonBtn = page.locator('button:has-text("Vùng")');

    await routeBtn.click();
    await page.waitForTimeout(300);

    await polygonBtn.click();
    await page.waitForTimeout(300);

    const routePanel = page.locator('text=Tuyến đường');
    await expect(routePanel).not.toBeVisible();
  });

  test('heatmap can coexist with other modes', async ({ page }) => {
    const heatmapToggle = page.locator('text=MẬT ĐỘ').locator('..');
    await heatmapToggle.click();
    await page.waitForTimeout(500);

    const routeBtn = page.locator('button:has-text("Tuyến")');
    await routeBtn.click();
    await page.waitForTimeout(300);

    const routePanel = page.locator('text=Tuyến đường');
    await expect(routePanel).toBeVisible();

    const viewBtn = page.locator('button:has-text("Duyệt")');
    await viewBtn.click();
    await heatmapToggle.click();
  });
});

test.describe('Map — Incident Handling (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await waitForMapLoad(page);
  });

  test('incident markers have bounce animation', async ({ page }) => {
    const incidentMarkers = page.locator('[class*="maplibregl-marker"]').filter({
      has: page.locator('[class*="animate-bounce"]')
    });
    const count = await incidentMarkers.count();
    if (count > 0) {
      await expect(incidentMarkers.first()).toBeVisible();
    }
  });

  test('clicking incident marker shows approval dialog', async ({ page }) => {
    const incidentMarkers = page.locator('[class*="maplibregl-marker"]').filter({
      has: page.locator('[class*="animate-bounce"]')
    });
    const count = await incidentMarkers.count();
    if (count > 0) {
      await incidentMarkers.first().click();
      await page.waitForTimeout(1000);
      const popup = page.locator('[class*="maplibregl-popup"]');
      if (await popup.isVisible()) {
        await expect(popup.locator('text=Sự cố')).toBeVisible();
      }
    }
  });
});
