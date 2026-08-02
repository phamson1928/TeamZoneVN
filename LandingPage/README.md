# TeamZoneVN Landing Page

Website giới thiệu TeamZoneVN, sử dụng React 19.2, Vite 8, TypeScript 6 và Tailwind CSS 4.

## Nội dung hiện có

- Navbar và Hero.
- Thống kê, giới thiệu tính năng và ảnh giao diện ứng dụng.
- FAQ và call-to-action.
- Footer và trang chính sách riêng tư tại `/privacy` hoặc `#privacy`.

## Cài đặt

```bash
npm install
npm run dev
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
LandingPage/src/
├── assets/          Logo và ảnh minh họa
├── components/      Hero, Stats, Features, Showcase, FAQ, CTA
├── pages/           PrivacyPolicy
├── App.tsx          Bố cục và xử lý route privacy
├── index.css        Tailwind và global styles
└── main.tsx         Entry point
```
