# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: plan-creation.spec.ts >> Plan Creation and Submission Flow >> Should create a new plan and submit it for approval
- Location: tests/e2e/plan-creation.spec.ts:15:3

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
                    - generic [ref=e197]: "KẾ HOẠCH #21"
                    - generic [ref=e198]: ĐANG CHỜ
                  - paragraph [ref=e199]: Kế hoạch E2E 1777649868194
                  - generic [ref=e200]:
                    - button "DUYỆT" [ref=e201]:
                      - img
                      - text: DUYỆT
                    - button [ref=e202]:
                      - img
                - generic [ref=e203]:
                  - generic [ref=e204]:
                    - generic [ref=e205]: "KẾ HOẠCH #20"
                    - generic [ref=e206]: ĐANG CHỜ
                  - paragraph [ref=e207]: Kế hoạch E2E 1777649774904
                  - generic [ref=e208]:
                    - button "DUYỆT" [ref=e209]:
                      - img
                      - text: DUYỆT
                    - button [ref=e210]:
                      - img
                - generic [ref=e211]:
                  - generic [ref=e212]:
                    - generic [ref=e213]: "KẾ HOẠCH #19"
                    - generic [ref=e214]: ĐANG CHỜ
                  - paragraph [ref=e215]: Kế hoạch E2E 1777649720534
                  - generic [ref=e216]:
                    - button "DUYỆT" [ref=e217]:
                      - img
                      - text: DUYỆT
                    - button [ref=e218]:
                      - img
              - generic [ref=e219]:
                - heading "Cảnh báo Khẩn cấp (2)" [level=4] [ref=e220]
                - generic [ref=e221] [cursor=pointer]:
                  - generic [ref=e223]: "#103 - Bàng đài loan #72"
                  - paragraph [ref=e225]: Cây bị va chạm phương tiện
                  - generic [ref=e226]:
                    - generic [ref=e227]: CẦN XEM NGAY
                    - button "XEM HIỆN TRƯỜNG" [ref=e228]:
                      - text: XEM HIỆN TRƯỜNG
                      - img
                - generic [ref=e229] [cursor=pointer]:
                  - generic [ref=e231]: "#122 - Xà cừ #4"
                  - paragraph [ref=e233]: Rễ cây trồi lên mặt đường, gây nguy hiểm
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
  3  | test.describe('Plan Creation and Submission Flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Đăng nhập với quyền Đội trưởng
  6  |     await page.goto('/login');
> 7  |     await page.fill('#email', 'doitruong@localhost');
     |                ^ TimeoutError: page.fill: Timeout 15000ms exceeded.
  8  |     await page.fill('#password', 'DoiTruong1!');
  9  |     await page.click('button[type="submit"]');
  10 |     
  11 |     // Đợi vào dashboard đội trưởng
  12 |     await expect(page).toHaveURL(/\/doitruong/, { timeout: 15000 });
  13 |   });
  14 | 
  15 |   test('Should create a new plan and submit it for approval', async ({ page }) => {
  16 |     // Bắt lỗi console
  17 |     page.on('console', msg => {
  18 |       if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
  19 |     });
  20 | 
  21 |     await page.goto('/plans');
  22 |     
  23 |     // 1. Nhấn nút Tạo mới
  24 |     await page.click('button:has-text("TẠO MỚI")');
  25 |     
  26 |     // 2. Điền thông tin cơ bản
  27 |     const planName = `E2E PLAN ${new Date().getTime()}`;
  28 |     await page.fill('input[placeholder*="Bảo trì"]', planName);
  29 |     
  30 |     // Chọn ngày
  31 |     const today = new Date();
  32 |     const startDate = today.toISOString().split('T')[0];
  33 |     const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().split('T')[0];
  34 |     
  35 |     await page.locator('input[type="date"]').first().fill(startDate as string);
  36 |     await page.locator('input[type="date"]').last().fill(endDate as string);
  37 |     
  38 |     // 3. Nhấn Kích hoạt để tạo
  39 |     await page.click('button:has-text("KÍCH HOẠT CHIẾN LƯỢC")');
  40 |     
  41 |     // Đợi Dialog đóng lại (nó không còn visible nữa)
  42 |     await expect(page.locator('role=dialog')).not.toBeVisible({ timeout: 15000 });
  43 |     
  44 |     // 4. Tìm và mở kế hoạch vừa tạo
  45 |     // Thử reload lại trang để chắc chắn dữ liệu mới được load từ server
  46 |     await page.reload();
  47 |     await page.fill('input[placeholder*="Tìm kiếm"]', planName);
  48 |     
  49 |     // Chờ 2 giây để API trả về kết quả lọc
  50 |     await page.waitForTimeout(2000);
  51 |     
  52 |     const newPlanCard = page.locator(`h4:has-text("${planName}")`).first();
  53 |     await expect(newPlanCard).toBeVisible({ timeout: 15000 });
  54 |     await newPlanCard.click();
  55 |     
  56 |     // 5. Kiểm tra Sheet chi tiết và Gửi duyệt
  57 |     await expect(page.locator('h4').filter({ hasText: 'Danh sách công việc' })).toBeVisible({ timeout: 10000 });
  58 |     
  59 |     const submitButton = page.locator('button:has-text("GỬI DUYỆT CHIẾN LƯỢC")');
  60 |     if (await submitButton.isVisible()) {
  61 |         await submitButton.click();
  62 |         await expect(page.locator('text=Thành công')).toBeVisible();
  63 |     }
  64 |   });
  65 | });
  66 | 
```