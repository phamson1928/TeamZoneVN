# TeamZoneVN Admin Dashboard

Ứng dụng quản trị web cho TeamZoneVN, sử dụng React 19.2, Vite 7, TypeScript 5.9 và Tailwind CSS 4.

## Chức năng hiện có

- Đăng nhập và bảo vệ route quản trị.
- Tổng quan số liệu và biểu đồ.
- Quản lý người dùng, game, Zone và Group.
- Report/moderation.

Các route chính: `/`, `/users`, `/zones`, `/groups`, `/games`, `/moderation` và `/login`.

## Cài đặt

```bash
npm install
npm run dev
```

Dashboard mặc định gọi Backend tại `http://localhost:3000`. Có thể ghi đè bằng file `.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Lệnh

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy Vite dev server |
| `npm run build` | Type-check và build production |
| `npm run preview` | Xem bản build local |
| `npm run lint` | Chạy ESLint |

## Cấu trúc

```text
Dashboard/src/
├── components/auth/    Bảo vệ route
├── components/common/  Thành phần UI dùng lại
├── components/layout/  Sidebar, header và layout
├── lib/                Axios client, API và utility
├── pages/              Các trang quản trị
├── App.tsx             Route configuration
└── main.tsx            Entry point
```
