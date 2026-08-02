# TeamZoneVN Backend

REST API và WebSocket server cho nền tảng TeamZoneVN.

## Công nghệ

| Công nghệ | Phiên bản/vai trò |
| --- | --- |
| NestJS | 11, module/controller/service và dependency injection |
| TypeScript | 5.7, target ES2023 |
| Prisma | 6, truy cập PostgreSQL và quản lý schema |
| PostgreSQL | Database chính; cấu hình qua `DATABASE_URL` và `DIRECT_URL` |
| Redis | Cache, rate limiting, presence, leaderboard và Socket.IO adapter |
| Socket.IO | Chat nhóm realtime |
| Passport + JWT | Access token, refresh token và phân quyền |
| Supabase SDK | Storage cho avatar và tài nguyên game |
| Swagger | Tài liệu tương tác tại `/api/docs` |

Schema hiện có 23 model và 18 enum. Quick Match mới có model `QuickMatchQueue`; chưa có module/controller API được đăng ký.

## Module hiện có

Các feature nằm trực tiếp dưới `src/`:

- `auth`, `users`, `user-game-profiles`, `games`
- `zones`, `tags`, `join-requests`, `zone-invites`
- `groups`, `chat`, `messages`, `notifications`
- `friends`, `blocks`, `leaderboard`
- `reports`, `dashboard`, `files`
- `common`, `prisma`

Backend dùng JWT guard và throttler guard ở phạm vi global. Route public phải dùng decorator `@Public()`.

## Cấu hình

```bash
npm install
copy .env.example .env
```

Các biến bắt buộc phụ thuộc chức năng sử dụng:

- Database: `DATABASE_URL`, `DIRECT_URL`
- JWT: `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Supabase Storage: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Email reset mật khẩu: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
- Server: `NODE_ENV`, `PORT`, `CORS_ORIGIN`

Không commit file `.env` hoặc secret thật vào repository.

## Chạy local

Docker Compose local chỉ khởi tạo Redis. PostgreSQL phải được cung cấp qua URL trong `.env`.

```bash
npm run docker:up
npm run db:generate
npm run db:push
npm run db:seed
npm run start:dev
```

- API: `http://localhost:3000`
- Health check: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/api/docs`

## Lệnh thường dùng

| Lệnh | Mục đích |
| --- | --- |
| `npm run start:dev` | Chạy NestJS với hot reload |
| `npm run build` | Generate Prisma Client và build production |
| `npm run start:prod` | Chạy `dist/main` |
| `npm run test` | Unit test |
| `npm run test:e2e` | E2E test |
| `npm run lint` | ESLint và tự sửa lỗi có thể sửa |
| `npm run format` | Prettier cho `src` và `test` |
| `npm run db:migrate` | Tạo/chạy migration ở môi trường phát triển |
| `npm run db:push` | Đồng bộ schema không tạo migration |
| `npm run db:seed` | Seed dữ liệu mẫu |
| `npm run docker:up` | Khởi tạo Redis local |
| `npm run docker:dev` | Chạy Redis và profile app development |
| `npm run docker:prod` | Chạy Redis và profile app production |

## Docker production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

File production chạy service `backend` và `redis`; database vẫn là PostgreSQL bên ngoài được cấu hình bằng biến môi trường.

## Cấu trúc

```text
Backend/
├── src/                    Feature modules và common infrastructure
├── prisma/schema.prisma    23 models, 18 enums
├── prisma/migrations/      Lịch sử migration
├── prisma/seed.ts          Seeder
├── docs/                   API, kế hoạch và hướng dẫn lệnh
├── test/                   E2E tests
├── Dockerfile
├── docker-compose.yml      Redis + app profiles cho local
└── docker-compose.prod.yml Backend + Redis cho production
```

## Tài liệu liên quan

- [API endpoints](docs/API_ENDPOINTS.md)
- [Development plan](docs/DEVELOPMENT_PLAN.md) — tài liệu lịch sử/backlog, không phải trạng thái runtime tuyệt đối
- [Command reference](docs/COMMANDS.md)
- [Zone cleanup proposal](docs/CRONJOB_ZONE_CLEANUP.md) — chưa được triển khai trong `src/zones`
