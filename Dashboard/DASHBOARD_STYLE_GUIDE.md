# Dashboard Design Style Guide

Tài liệu này ghi lại chi tiết ngôn ngữ thiết kế (Design System) và phong cách UI/UX cho trang Dashboard dựa trên mẫu reference đã cung cấp.

> [!IMPORTANT]
> **Nguyên tắc triển khai quan trọng:** 
> Chúng ta **KHÔNG** copy cứng nhắc layout 1:1 từ ảnh mẫu. Thay vào đó, hãy lấy **Style & Vibe** (màu sắc, spacing, bo góc, component style) từ mẫu này để áp dụng linh hoạt (Flexible) vào cấu trúc dữ liệu và các module mà chúng ta đã xây dựng ở **Backend** (như User Management, Social Trends, Reports, Zones, v.v.).

## 1. Tổng quan thiết kế (Vibe & Aesthetic)
- **Phong cách:** Hiện đại, tối giản (Minimalist), sáng sủa (Clean), đem lại cảm giác cao cấp (Premium).
- **Đặc trưng:** Sử dụng nền trắng/xám siêu nhạt, các khối thẻ (card) bo góc mềm mại, kết hợp điểm nhấn là các dải màu gradient dạng lưới (mesh/holographic gradient) rất tinh tế.

## 2. Bảng màu (Color Palette)
- **Background chính (Main Background):** Xám siêu nhạt (gần như trắng) - ví dụ: `#F8F9FA` hoặc `#F3F4F6`.
- **Background Sidebar & Cards:** Trắng tinh (`#FFFFFF`).
- **Màu chữ (Typography):**
  - Tiêu đề & Chữ chính: Đen nhạt / Xám đậm (Dark Charcoal, ví dụ `$gray-900` hoặc `#111827`).
  - Chữ phụ (Subtext, Placeholder, Header Bảng): Xám nhạt (`$gray-500` hoặc `#6B7280`).
- **Màu Sidebar Active:** Nền xanh dương siêu nhạt (Light blue - `#EEF2FF` hoặc khoảng đó), chữ và icon màu xanh dương đậm (`#4F46E5` hoặc `$blue-600`).
- **Gradients (Dành cho Summary Cards):**
  - Card 1: Xanh nhạt (Cyan/Light Blue) phối với Hồng (Pink) và Tím nhạt dạng holographic/mesh. Chữ trên card màu đen.
  - Card 2: Xanh lục/Xanh lơ (Teal/Cyan) phối với Cam đào (Peach/Orange).
  - Card 3: Hồng phối với Cam và Tím nhạt. 
  - *Lưu ý:* Gradient chỉ xuất hiện ở một vạt/một mảng của thẻ, phần còn lại của thẻ là màu trắng/sáng mờ, tạo sự tương phản nhẹ nhàng mà không quá chói.

## 3. Typography (Kiểu chữ)
- **Font chữ:** Sans-serif hiện đại, hình học (Geometrical) như **Inter**, **Roboto**, **Outfit** hoặc **SF Pro**.
- **Độ đậm (Font Weight):** 
  - Tiêu đề trang / Số liệu ($2,844.00): `SemiBold` (600) hoặc `Bold` (700) với kích thước lớn.
  - Header của bảng / Label nhỏ: `Medium` (500) hoặc `Regular` (400), size nhỏ (khoảng 12px - 13px).

## 4. Components & Shapes
- **Bo góc (Border Radius):**
  - Card lớn: Bo góc tương đối lớn (khoảng `12px` - `16px`).
  - Nút bấm (Button) / Input / Trạng thái badge: Bo góc vừa (`8px` hoặc viên thuốc `pill` cho badge).
- **Shadows (Đổ bóng):**
  - Bóng cực kỳ nhẹ, mờ (soft drop shadow) để tách biệt phần Sidebar và nội dung, hoặc làm nổi bật các Card. Ví dụ: `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05)`.
  - Có hiệu ứng nổi bật (浮 động) nhẹ cho promo widget ở góc dưới chéo trái.
- **Borders:**
  - Viền mỏng 1px màu xám siêu nhạt (`#E5E7EB`) áp dụng cho các hàng trong bảng (Table rows) và các nút Filter.

## 5. Layout & Spacing
- **Sidebar (Menu trái):** Chiếm khoảng 240px - 260px. Có logo ở trên, danh sách menu phân nhỏ theo nhóm (Ví dụ: Workflows), icon nét mảnh (stroke icons, outline). Góc dưới có một Promo Card.
- **Header Top:** Gắn liền với vùng nội dung chính. Thanh tìm kiếm nhỏ gọn có bo góc viền nhẹ, icon thông báo/settings/avatar bên góc phải.
- **Khu vực thống kê (Metrics Cards):** Bố cục dạng Grid (3 cột), có padding rộng rãi bên trong thẻ.
- **Data Table (Bảng dữ liệu):**
  - Top action bar: Các nút Dropdown Filters (Data Views, Filters, Date, Keywords, Amount) có viền tròn, xếp hàng ngang.
  - Khoảng cách (Padding) trong các hàng của bảng rất thoáng, dòng kể (divider) mờ.

## 6. UI Elements đặc thù
- **Badges trạng thái (Status Tags):**
  - **Completed:** Nền xanh ngọc nhạt (Light Mint/Emerald), chữ màu xanh ngọc chìm.
  - **Canceled:** Nền màu đỏ/hồng siêu nhạt, chữ đỏ.
  - **Pending Review:** Nền màu cam/vàng nhát, chữ màu cam sẫm.
- **Nút bấm chính (Primary Button - ví dụ: Set up now):** Nền màu xám đậm gần như đen, chữ màu trắng, bo góc 8px.
- **Nút Outline / Filter:** Nền trắng, có viền mảnh, chữ xám và icon mũi tên chĩa xuống (`chevron-down`).

## 7. Yêu cầu triển khai code (Lưu ý cho Agent)
- Sử dụng Vanilla CSS / SCSS (hoặc TailwindCSS nếu dự án có setup sẵn nhưng cần custom theme khớp màu).
- Đảm bảo thiết kế responsive nhưng vẫn giữ nét padding/margin thoáng đãng của bản desktop.
- Khi tạo các bảng dashboard trong hệ thống **TeamZoneVN**, hãy mở file này ra xem lại để code giao diện giống 100% với vibe này (glassmorphism/holographic gradient, clean borders, airy spacing).
