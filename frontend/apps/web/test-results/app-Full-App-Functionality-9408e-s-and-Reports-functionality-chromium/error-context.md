# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> Full App Functionality >> Analytics and Reports functionality
- Location: tests/e2e/app.spec.ts:65:3

# Error details

```
TimeoutError: page.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('#email')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e5]:
      - list [ref=e7]:
        - listitem [ref=e8]:
          - link "Cây Xanh ĐN Smart Greenery" [ref=e9] [cursor=pointer]:
            - /url: /giamdoc
            - img [ref=e11]
            - generic [ref=e13]:
              - generic [ref=e14]: Cây Xanh ĐN
              - generic [ref=e15]: Smart Greenery
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: Hệ thống
          - list [ref=e19]:
            - listitem [ref=e20]:
              - link "Bàn làm việc" [ref=e21] [cursor=pointer]:
                - /url: /giamdoc
                - img [ref=e22]
                - generic [ref=e27]: Bàn làm việc
            - listitem [ref=e28]:
              - link "Bản đồ cây xanh" [ref=e29] [cursor=pointer]:
                - /url: /map
                - img [ref=e30]
                - generic [ref=e32]: Bản đồ cây xanh
        - generic [ref=e33]:
          - generic [ref=e34]: Nghiệp vụ
          - list [ref=e35]:
            - listitem [ref=e36]:
              - link "Danh mục cây" [ref=e37] [cursor=pointer]:
                - /url: /trees
                - img [ref=e38]
                - generic [ref=e40]: Danh mục cây
            - listitem [ref=e41]:
              - link "Nhân sự & Đội ngũ" [ref=e42] [cursor=pointer]:
                - /url: /staff
                - img [ref=e43]
                - generic [ref=e48]: Nhân sự & Đội ngũ
            - listitem [ref=e49]:
              - link "Sự cố & Phản hồi" [ref=e50] [cursor=pointer]:
                - /url: /incidents
                - img [ref=e51]
                - generic [ref=e53]: Sự cố & Phản hồi
        - generic [ref=e54]:
          - generic [ref=e55]: Chiến lược
          - list [ref=e56]:
            - listitem [ref=e57]:
              - link "Lập & Duyệt Kế hoạch" [ref=e58] [cursor=pointer]:
                - /url: /plans
                - img [ref=e59]
                - generic [ref=e62]: Lập & Duyệt Kế hoạch
            - listitem [ref=e63]:
              - link "Báo cáo chiến lược" [ref=e64] [cursor=pointer]:
                - /url: /reports
                - img [ref=e65]
                - generic [ref=e68]: Báo cáo chiến lược
        - generic [ref=e69]:
          - generic [ref=e70]: Cá nhân
          - list [ref=e71]:
            - listitem [ref=e72]:
              - link "Cài đặt tài khoản" [ref=e73] [cursor=pointer]:
                - /url: /settings
                - img [ref=e74]
                - generic [ref=e77]: Cài đặt tài khoản
      - list [ref=e79]:
        - listitem [ref=e80]:
          - button "Nguyễn Văn Giám Đốc Nguyễn Văn Giám Đốc giamdoc@localhost" [ref=e81]:
            - img "Nguyễn Văn Giám Đốc" [ref=e83]
            - generic [ref=e84]:
              - generic [ref=e85]: Nguyễn Văn Giám Đốc
              - generic [ref=e86]: giamdoc@localhost
            - img [ref=e87]
    - main [ref=e91]:
      - generic [ref=e93]:
        - button "Mở/Đóng thanh bên" [ref=e94]:
          - img
          - generic [ref=e95]: Mở/Đóng thanh bên
        - generic [ref=e96]:
          - img [ref=e98]
          - generic [ref=e99]:
            - generic [ref=e100]: Nguyễn Văn Giám Đốc
            - generic [ref=e101]: Giám Đốc
        - generic [ref=e102]:
          - button [ref=e103]:
            - img
          - button "Chuyển giao diện" [ref=e106]:
            - img
            - generic [ref=e107]: Chuyển giao diện
          - button "Đăng xuất" [ref=e108]:
            - img
      - generic [ref=e109]:
        - generic [ref=e110]:
          - generic [ref=e111]:
            - heading "Bảng điều khiển Giám đốc" [level=1] [ref=e112]
            - paragraph [ref=e113]: Tối ưu hóa nguồn lực và phê duyệt chiến lược 24/7.
          - generic [ref=e114]:
            - link "LẬP CHIẾN LƯỢC" [ref=e115] [cursor=pointer]:
              - /url: /plans
            - button "PHÊ DUYỆT TỔNG THỂ" [ref=e116]
        - generic [ref=e117]:
          - generic [ref=e118]:
            - generic [ref=e119]:
              - generic [ref=e120]: Tổng số cây xanh
              - generic [ref=e121]: "100"
              - generic [ref=e123]:
                - img
            - generic [ref=e125]:
              - img [ref=e126]
              - text: Toàn bộ cây trong hệ thống
          - generic [ref=e130]:
            - generic [ref=e131]:
              - generic [ref=e132]: Sự cố chờ xử lý
              - generic [ref=e133]: "48"
              - generic [ref=e135]:
                - img
            - generic [ref=e137]:
              - img [ref=e138]
              - text: Cần được xử lý sớm
          - generic [ref=e141]:
            - generic [ref=e142]:
              - generic [ref=e143]: Công việc hoàn thành
              - generic [ref=e144]: "0"
              - generic [ref=e146]:
                - img
            - generic [ref=e148]:
              - img [ref=e149]
              - text: Trong tháng này
          - generic [ref=e152]:
            - generic [ref=e153]:
              - generic [ref=e154]: Công việc đang chờ
              - generic [ref=e155]: "0"
              - generic [ref=e157]:
                - img
            - generic [ref=e159]:
              - img [ref=e160]
              - text: Trong tháng này
        - generic [ref=e163]:
          - generic [ref=e164]:
            - generic [ref=e166]:
              - generic [ref=e167]:
                - generic [ref=e168]: Thống kê Công tác Toàn thành phố
                - generic [ref=e169]: Chu kỳ 30 ngày gần nhất
              - img [ref=e171]
            - generic [ref=e177]:
              - generic [ref=e178]: Thống Kê Công Tác Quản Lý
              - generic [ref=e179]: Công việc hoàn thành và sự cố mới theo tháng
              - combobox [ref=e181]:
                - generic: 6 tháng
                - img
          - generic [ref=e185]:
            - generic [ref=e186]:
              - generic [ref=e187]:
                - generic [ref=e188]: Duyệt nhanh
                - img [ref=e190]
              - generic [ref=e192]: Kế hoạch cần ý kiến lãnh đạo
            - generic [ref=e193]:
              - generic [ref=e194]:
                - generic [ref=e195]:
                  - generic [ref=e196]:
                    - generic [ref=e197]: "KẾ HOẠCH #23"
                    - generic [ref=e198]: ĐANG CHỜ
                  - paragraph [ref=e199]: Kế hoạch E2E 1777651053349
                  - generic [ref=e200]:
                    - button "DUYỆT" [ref=e201]:
                      - img
                      - text: DUYỆT
                    - button [ref=e202]:
                      - img
                - generic [ref=e203]:
                  - generic [ref=e204]:
                    - generic [ref=e205]: "KẾ HOẠCH #21"
                    - generic [ref=e206]: ĐANG CHỜ
                  - paragraph [ref=e207]: Kế hoạch E2E 1777649868194
                  - generic [ref=e208]:
                    - button "DUYỆT" [ref=e209]:
                      - img
                      - text: DUYỆT
                    - button [ref=e210]:
                      - img
                - generic [ref=e211]:
                  - generic [ref=e212]:
                    - generic [ref=e213]: "KẾ HOẠCH #20"
                    - generic [ref=e214]: ĐANG CHỜ
                  - paragraph [ref=e215]: Kế hoạch E2E 1777649774904
                  - generic [ref=e216]:
                    - button "DUYỆT" [ref=e217]:
                      - img
                      - text: DUYỆT
                    - button [ref=e218]:
                      - img
              - generic [ref=e219]:
                - heading "Cảnh báo Khẩn cấp (2)" [level=4] [ref=e220]
                - generic [ref=e221] [cursor=pointer]:
                  - generic [ref=e223]: "#151 - Phượng vĩ #1"
                  - paragraph [ref=e225]: Cây ngã đè lên dây điện cực kỳ nguy hiểm, cần xử lý ngay!
                  - generic [ref=e226]:
                    - generic [ref=e227]: CẦN XEM NGAY
                    - button "XEM HIỆN TRƯỜNG" [ref=e228]:
                      - text: XEM HIỆN TRƯỜNG
                      - img
                - generic [ref=e229] [cursor=pointer]:
                  - generic [ref=e231]: "#103 - Bàng đài loan #72"
                  - paragraph [ref=e233]: Cây bị va chạm phương tiện
                  - generic [ref=e234]:
                    - generic [ref=e235]: CẦN XEM NGAY
                    - button "XEM HIỆN TRƯỜNG" [ref=e236]:
                      - text: XEM HIỆN TRƯỜNG
                      - img
        - generic [ref=e237]:
          - generic [ref=e238]:
            - img [ref=e240]
            - generic [ref=e243]:
              - paragraph [ref=e244]: Mật độ bao phủ
              - paragraph [ref=e245]: 24.5%
          - generic [ref=e246]:
            - img [ref=e248]
            - generic [ref=e251]:
              - paragraph [ref=e252]: KPI Hoàn thành
              - paragraph [ref=e253]: 92%
          - generic [ref=e254]:
            - img [ref=e256]
            - generic [ref=e258]:
              - paragraph [ref=e259]: Rủi ro thiên tai
              - paragraph [ref=e260]: Thấp
          - generic [ref=e261]:
            - img [ref=e263]
            - generic [ref=e265]:
              - paragraph [ref=e266]: Công suất AI
              - paragraph [ref=e267]: Tối ưu
  - region "Notifications alt+T"
  - generic [ref=e269]: xl
  - button "Open Next.js Dev Tools" [ref=e275] [cursor=pointer]:
    - img [ref=e276]
  - alert [ref=e279]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Full App Functionality', () => {
  4  |   test.beforeAll(async () => {
  5  |     // Ép buộc seed lại dữ liệu trước khi chạy bộ test
  6  |     try {
  7  |       await fetch('http://localhost:5000/api/Trees/seed', { method: 'POST' });
  8  |     } catch (e) {
  9  |       console.warn('Cảnh báo: Không thể gọi API seed dữ liệu.');
  10 |     }
  11 |   });
  12 | 
  13 |   test.beforeEach(async ({ page }) => {
  14 |     await page.goto('/login');
> 15 |     await page.fill('#email', 'giamdoc@localhost');
     |                ^ TimeoutError: page.fill: Timeout 15000ms exceeded.
  16 |     await page.fill('#password', 'GiamDoc1!');
  17 |     await page.click('button[type="submit"]');
  18 |     await page.waitForURL(/\/dashboard$/, { timeout: 15000 });
  19 |   });
  20 | 
  21 |   test('Tree Management functionality', async ({ page }) => {
  22 |     await page.goto('/trees');
  23 |     await expect(page.locator('h2').filter({ hasText: 'Quản lý Cây xanh' }).first()).toBeVisible();
  24 |     await expect(page.locator('table').first()).toBeVisible();
  25 |     await expect(page.locator('table').first()).toContainText(/Tên cây|Loại cây/i);
  26 |   });
  27 | 
  28 |   test('Incident Management functionality', async ({ page }) => {
  29 |     await page.goto('/incidents');
  30 |     await expect(page.locator('h2').filter({ hasText: 'Quản lý Sự cố' }).first()).toBeVisible();
  31 |     await expect(page.locator('table').first()).toBeVisible();
  32 |     await expect(page.locator('table').first()).toContainText(/ID Cây|Người báo cáo/i);
  33 |   });
  34 | 
  35 |   test('Work Item Management functionality', async ({ page }) => {
  36 |     await page.goto('/works');
  37 |     // Heading là "Danh sách công tác" hoặc "Quản lý công việc" tùy màn hình
  38 |     const heading = page.locator('h1, h2').filter({ hasText: /Danh sách công tác|Quản lý Công việc/i }).first();
  39 |     await expect(heading).toBeVisible();
  40 |     await expect(page.locator('table').first()).toBeVisible();
  41 |   });
  42 | 
  43 |   test('Staff Management functionality', async ({ page }) => {
  44 |     await page.goto('/staff');
  45 |     await expect(page.locator('h2').filter({ hasText: 'Quản lý Nhân viên' }).first()).toBeVisible();
  46 |     await expect(page.locator('table').first()).toBeVisible();
  47 |     
  48 |     // Kiểm tra xem đã có dữ liệu chưa, nếu "Không có dữ liệu" thì reload lại 1 lần
  49 |     const tableText = await page.locator('table').first().innerText();
  50 |     if (tableText.includes('Không có dữ liệu')) {
  51 |         await page.reload();
  52 |         await page.waitForTimeout(2000);
  53 |     }
  54 |     
  55 |     // Kiểm tra role Giám Đốc (đã được refactor sang tiếng Việt có dấu)
  56 |     await expect(page.locator('table').first()).toContainText('Giám Đốc', { timeout: 15000 });
  57 |   });
  58 | 
  59 |   test('Planning Management functionality', async ({ page }) => {
  60 |     await page.goto('/plans');
  61 |     await expect(page.locator('h2').filter({ hasText: 'Quản lý Kế hoạch' }).first()).toBeVisible();
  62 |     await expect(page.locator('table').first()).toBeVisible();
  63 |   });
  64 | 
  65 |   test('Analytics and Reports functionality', async ({ page }) => {
  66 |     await page.goto('/reports');
  67 |     await expect(page.getByRole('heading', { name: 'Báo cáo', exact: true }).first()).toBeVisible();
  68 |     await expect(page.locator('h2').filter({ hasText: 'Công việc quá hạn' }).first()).toBeVisible();
  69 |     await expect(page.locator('table').first()).toBeVisible();
  70 |   });
  71 | });
  72 | 
```