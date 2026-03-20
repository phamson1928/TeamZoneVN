# Admin Dashboard Frontend - Implementation Plan

Tài liệu này tổng hợp toàn bộ các trang, module và danh sách API cần thiết để xây dựng Frontend cho ứng dụng **Admin Dashboard** dựa trên hệ thống Backend hiện có của TeamZoneVN.

> **Note:** 
> -  Kiểm tra lại API endpoint trước khi triển khai để đảm bảo tính chính xác.

> 💡 **Thiết kế & Giao diện (Quan trọng):** 
> - Tuân thủ chặt chẽ các quy tắc từ `DASHBOARD_STYLE_GUIDE.md` (Sáng sủa, Hiện đại, Clean, Glassmorphism gradients ở các thẻ summary).
> - **Nguyên tắc Flex Database:** Bố cục màn hình sẽ linh hoạt thay đổi dựa trên các Endpoints Backend đã định nghĩa dưới đây, thay vì sao chép 1:1 từ ảnh bản vẽ tay.

---

## 1. Initialization & Core Setup
- [x] Khởi tạo dự án Frontend (React / Vite hoặc Next.js) riêng cho Dashboard.
- [x] Cài đặt các thư viện thiết yếu: UI Library (ví dụ shadcn/ui, mantine), Routing, Axios, Chart Library (Recharts / Chart.js cho biểu đồ), Toast Notifications.
- [x] Cấu hình **Axios Instance**: Tự động lấy `access_token` từ storage và đính kèm vào header `Authorization: Bearer <token>`. Handle lỗi 401/403 để redirect về Login.
- [x] Xây dựng **Main Layout**:
  - [x] **Sidebar (Left):** Chứa các Menu: Overview, User Management, Zones, Groups, Moderation/Reports. Thiết kế Sidebar sáng màu, state active nổi bật.
  - [x] **Top Header:** Hiển thị breadcrumbs/title, Admin Avatar và nút Logout.
  - [x] Các thành phần dùng chung: Pagination Component, Modal Confirm Delete, Loading Spinners.

---

## 2. Authentication Module
- [x] **Màn hình Login:** Gọi API `POST /auth/login` (Chỉ cho phép tài khoản có role `ADMIN` đăng nhập).
- [x] Logic lưu trữ token và điều hướng bảo vệ (Protected Route).

---

## 3. Trang chủ Overview (Dashboard Analytics)
Trang hiển thị cái nhìn tổng quan đầu tiên, dùng lưới Grid với các thẻ Holographic Gradient nổi bật.

- [x] **Summary Cards (Card thống kê nhanh):** 
  - [x] Tích hợp API: `GET /dashboard/stats`
  - [x] Hiển thị: Tổng số Users (Active/Banned).
  - [x] Hiển thị: Tổng số Zones (Open/Closed).
  - [x] Hiển thị: Tổng số Groups (Active/Dissolved).
  - [x] Hiển thị: Chỉ số tăng trưởng (New users today/this week).
  - [x] Hiển thị: Social Stats (Total Friendships, Total UserLikes, Queue size).
- [x] **Khu vực Biểu đồ (Charts):**
  - [x] Biểu đồ Users mới: API `GET /dashboard/charts/users?period=7d|30d` (Dạng cột/đường).
  - [x] Biểu đồ tương tác chat theo giờ (Peak hours): API `GET /dashboard/charts/activity` (Dạng Bar/Line).
- [x] **Widget Nổi Bật:**
  - [x] Thống kê tăng trưởng nhanh: Hiển thị % thay đổi của New Users so với kỳ trước.

---

## 4. User Management (Quản lý Người dùng)
Giao diện danh sách dạng bảng (Table Component) kèm các nút Action tiện lợi.

- [x] **Danh sách người dùng:**
  - [x] Tích hợp API: `GET /users` (Kèm Pagination).
  - [x] Hiển thị: Avatar, Username, Email, Thời gian tạo, Trạng thái (Active/Banned badges).
- [x] **Bộ lọc và Tìm kiếm:**
  - [x] Tích hợp API: `GET /users/search?query=...&role=...&status=...`
  - [x] Ô tìm kiếm (Search bar) và Dropdown lọc theo Status / Role.
- [x] **Hành động (Actions):**
  - [x] Ban user: Gọi API `PATCH /users/:id/ban`. (Cần popup xác nhận lý do - optional).
  - [x] Unban user: Gọi API `PATCH /users/:id/unban`.
  - [x] Xóa user (Soft delete): Gọi API `DELETE /users/:id`.
  - [x] Xem chi tiết / Lịch sử hoạt động: Gọi API `GET /users/:id/activities` mở trong Modal hoặc sang Page chi tiết.
- [x] **Thống kê bổ trợ (Charts):**
  - [x] Biểu đồ Tăng trưởng Users: (Dùng lại Chart từ Overview nhưng chi tiết hơn về Status).

---

## 5. Zone Management (Quản lý Bài đăng tìm bạn)
- [x] **Danh sách Zone:** 
  - [x] Tích hợp API: `GET /zones/admin` (Pagination).
  - [x] Hiển thị thông tin: Tiêu đề, Game, Người tạo đăng (Owner), Trạng thái (Open/Full/Closed badges).
- [x] **Thống kê & Phân tích (Analytics):**
  - [x] Biểu đồ phân bố Zones theo Game: API `GET /dashboard/charts/zones` (Dạng Pie/Donut).
  - [x] Biểu đồ Mức độ tương tác (Zones/Groups): API `GET /dashboard/charts/engagement` (Phase 10).
  - [x] Biểu đồ Top Games thịnh hành: API `GET /dashboard/charts/top-games` (Phase 10).
- [x] **Hành động (Actions):**
  - [x] Force Close Zone: Gọi API `PATCH /zones/admin/:id/close`.
  - [x] Force Delete Zone: Gọi API `DELETE /zones/admin/:id`. (Cần Modal cảnh báo vì không thể hoàn tác).

---

## 6. Group Management (Quản lý Nhóm)
- [x] **Danh sách Group:**
  - [x] Tích hợp API: `GET /groups/admin` (Pagination).
  - [x] Hiển thị: Group ID, Zone/Bài đăng gốc, Leader, Tình trạng (Số lượng members, số messages).
- [x] **Hành động (Actions):**
  - [x] Force Dissolve Group: Gọi API `DELETE /groups/admin/:id` (Cần Modal cảnh báo đỏ cực kỳ nghiêm trọng).
  - [x] Xem tin nhắn nhóm: Nút "Inspect Chat". (UI Ready, link logic pending page).

---

## 7. Social & Engagement Analytics (Trang mới - Leaderboard/Social)
- [x] **Thống kê tương tác:**
  - [x] Biểu đồ Social Engagement (Likes & Friendships): API `GET /dashboard/charts/social-engagement`.
  - [x] Biểu đồ Hiệu quả Quick Match: API `GET /dashboard/charts/quick-match`.
- [x] **Bảng xếp hạng (Leaderboard):**
  - [x] Widget Top 10 Users theo số likes: API `GET /dashboard/charts/leaderboard-top`.
  - [x] Danh sách Leaderboard đầy đủ: `GET /leaderboard/users`. (Widget integrated in Overview).

---

## 8. Moderation (Quản lý Tin nhắn & Báo cáo)

### 8.1. Message Moderation (Kiểm duyệt Chat)
- [x] **Danh sách Tin nhắn:** 
  - [x] Tích hợp API `GET /messages/admin` (Xem tất cả tin nhắn).
  - [x] Tích hợp API `GET /groups/admin/:id/messages` (Xem theo nhóm).
- [x] **Bộ lọc tin nhắn (Filters):**
  - [x] Lọc theo Keyword (Search nội dung tin nhắn).
- [x] **Hành động (Actions):**
  - [x] Force Delete Tin nhắn: Gọi API `DELETE /messages/admin/:id`.

### 8.2. Report Handling (Xử lý Vi phạm)
- [x] **Danh sách Báo cáo:**
  - [x] Tích hợp API `GET /reports?status=OPEN|RESOLVED` (Kèm Pagination).
  - [x] Hiển thị: Đối tượng bị tố cáo (User/Zone/Group), Nội dung tố cáo, Người tố cáo, Thời gian.
- [x] **Hành động (Actions):**
  - [x] Xem chi tiết Report: Gọi API `GET /reports/:id`.
  - [x] Resolve Report: Gọi API `PATCH /reports/:id` (Kèm form nhỏ điền `resolutionNote` - ghi chú xử lý). Tự động cập nhật trạng thái UI thành đã giải quyết.
- [x] **Thống kê & Xu hướng (Analytics):**
  - [x] Biểu đồ Xu hướng Báo cáo: API `GET /dashboard/charts/reports`.
  - [x] Biểu đồ Tổng quan xử lý vi phạm: API `GET /dashboard/charts/moderation`. (Integrated in Moderation Page logic).

