# TeamZoneVN

> Nền tảng kết nối game thủ: tìm đồng đội, tạo Zone, lập nhóm, chat thời gian thực và xây dựng cộng đồng chơi game.

## Tổng quan kiến trúc

TeamZoneVN gồm bốn ứng dụng độc lập dùng chung Backend:

| Thành phần | Công nghệ chính | Vai trò |
| --- | --- | --- |
| `Backend` | NestJS 11, Prisma 6, PostgreSQL, Redis, Socket.IO | REST API, xác thực, dữ liệu và realtime |
| `Frontend` | Expo 54, React Native 0.81, React 19 | Ứng dụng mobile Android/iOS |
| `Dashboard` | React 19, Vite 7, Tailwind CSS 4 | Trang quản trị |
| `LandingPage` | React 19, Vite 8, Tailwind CSS 4 | Trang giới thiệu và chính sách riêng tư |

PostgreSQL hiện được cấu hình qua `DATABASE_URL`/`DIRECT_URL` (thường là Supabase). Docker Compose local của Backend cung cấp Redis và có profile để chạy ứng dụng; nó không khởi tạo PostgreSQL local.

## Chức năng hiện có

- Đăng ký, đăng nhập, refresh token, quên mật khẩu và Google OAuth.
- Hồ sơ người dùng, hồ sơ theo game, upload avatar và tài nguyên game.
- Tạo, tìm kiếm, gợi ý và quản lý Zone; tag, yêu cầu tham gia và lời mời Zone.
- Tự động tạo Group từ Zone, quản lý thành viên và vai trò trong nhóm.
- Chat nhóm bằng Socket.IO, lịch sử tin nhắn và thông báo.
- Bạn bè, chặn người dùng, lượt thích và bảng xếp hạng.
- Report, moderation và Dashboard quản trị người dùng, game, Zone, Group.
- Redis cho cache, rate limiting, presence, leaderboard và Socket.IO adapter.

Quick Match có model dữ liệu trong Prisma nhưng chưa có module/controller được đăng ký trong Backend, vì vậy chưa được xem là tính năng API hoàn chỉnh.

## Yêu cầu

- Node.js 20+
- npm
- PostgreSQL có thể truy cập từ máy phát triển
- Redis 7 (có thể chạy bằng Docker)
- Android/iOS emulator hoặc thiết bị có Expo development build cho mobile

## Khởi động nhanh

### Backend

```bash
cd Backend
npm install
copy .env.example .env
npm run docker:up
npm run db:generate
npm run db:push
npm run db:seed
npm run start:dev
```

Backend mặc định chạy tại `http://localhost:3000`; Swagger UI tại `http://localhost:3000/api/docs`.

### Mobile

```bash
cd Frontend
npm install
npm start
```

Tạo `Frontend/.env` khi cần trỏ tới Backend trên máy khác:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

### Dashboard

```bash
cd Dashboard
npm install
npm run dev
```

Biến môi trường tùy chọn: `VITE_API_URL=http://localhost:3000`.

### Landing Page

```bash
cd LandingPage
npm install
npm run dev
```

## Cấu trúc repository

```text
TeamZoneVN/
├── Backend/           NestJS API, Socket.IO, Prisma và Docker
├── Frontend/          Ứng dụng Expo/React Native
├── Dashboard/         React SPA dành cho quản trị viên
├── LandingPage/       Website giới thiệu
└── .github/workflows/ CI/CD
```

## Tài liệu

- [Backend README](Backend/README.md)
- [API endpoints](Backend/docs/API_ENDPOINTS.md)
- [Development plan](Backend/docs/DEVELOPMENT_PLAN.md) — lịch sử triển khai và backlog
- [Command reference](Backend/docs/COMMANDS.md)
- [Zone cleanup proposal](Backend/docs/CRONJOB_ZONE_CLEANUP.md) — thiết kế chưa được triển khai

## Kiểm tra trước khi gửi thay đổi

Chạy lệnh tương ứng trong từng thư mục đã sửa:

```bash
npm run lint
npm run build
```

Mobile không có script `build`; dùng `npm test` và `npm run lint`.

## License

MIT © TeamZoneVN
