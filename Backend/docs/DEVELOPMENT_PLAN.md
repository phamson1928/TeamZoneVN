# TeamZoneVN Backend - Development Plan

## Overview

TeamZoneVN là nền tảng tìm bạn chơi game, cho phép người dùng tạo Zone để tìm đồng đội, ghép nhóm và chat với nhau.

---

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Framework        | NestJS 11                           |
| Database         | PostgreSQL 16 (Supabase)            |
| ORM              | Prisma 6                            |
| Auth             | JWT (Access + Refresh) + Google OAuth2 |
| Real-time        | WebSocket (Socket.IO)               |
| File Storage     | Supabase Storage                    |
| Containerization | Docker (Multi-stage Alpine Build)   |
| CI/CD            | GitHub Actions (Auto-deploy)        |
| Frontend Hosting | Vercel                              |
| Backend Hosting  | VPS (Docker + Nginx Reverse Proxy)  |

### Architecture

```
Client (Mobile/Web)
    │
    ├── Vercel ─── Frontend (Landing Page)
    │
    └── Backend (VPS) ─── Docker ─── NestJS API + WebSocket
                                        │
                                        └── Supabase ─── PostgreSQL + File Storage
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup

- [x] Khởi tạo NestJS project
- [x] Setup Docker cho local development (PostgreSQL container)
- [x] Setup Prisma schema
- [x] Cấu hình environment variables
- [x] Setup validation (class-validator)
- [x] Setup Swagger documentation
- [x] Setup error handling global

### 1.2 Prisma Module

- [x] Tạo `PrismaModule` + `PrismaService`
- [x] Config connection pooling
- [ ] Tạo base repository pattern (optional)

### 1.3 Common Utilities

- [x] Response DTO chuẩn (success/error)
- [x] Pagination DTO
- [x] Custom decorators (@CurrentUser, @Public)
- [x] Guards (AuthGuard, RolesGuard)

---

## Phase 2: Authentication (Week 2-3) ✅ COMPLETED

### 2.1 Auth Module

- [x] `POST /auth/register` - Đăng ký
- [x] `POST /auth/login` - Đăng nhập (trả về access + refresh token)
- [x] `POST /auth/refresh` - Refresh token
- [x] `POST /auth/logout` - Đăng xuất (revoke refresh token)
- [x] `POST /auth/logout-all` - Đăng xuất tất cả thiết bị

### 2.2 Google Auth ✅ COMPLETED

- [x] `POST /auth/google` - Đăng nhập bằng Google (Mobile — verify idToken)
- [x] `GET /auth/google/redirect` - Redirect đến Google OAuth2 (Web)
- [x] `GET /auth/google/callback` - Google OAuth2 callback (Web)
- [x] Schema: AuthProvider enum (LOCAL/GOOGLE), googleId field
- [x] Auto-link Google account nếu email đã tồn tại
- [x] Auto-generate username cho Google users mới

### 2.3 Password & Security

- [x] Hash password với bcrypt (12 salt rounds)
- [x] JWT strategy (Passport.js)
- [x] Rate limiting cho auth endpoints (5-10 req/min)
- [x] `POST /auth/forgot-password` - Quên mật khẩu (gửi email reset link, hiệu lực 15 phút)
- [x] `POST /auth/reset-password` - Đặt lại mật khẩu bằng token
- [ ] Token blacklist (optional)

### 2.3 User Module

- [x] `GET /users/me` - Lấy thông tin user hiện tại
- [x] `PATCH /users/me` - Cập nhật profile
- [x] `GET /users/:id` - Xem profile user khác (public info)
- [x] `PATCH /users/me/avatar` - Upload avatar URL

### 2.4 User Management (Admin) ✅ COMPLETED

- [x] `GET /users` - Danh sách tất cả users (Admin, pagination)
- [x] `GET /users/search` - Tìm kiếm users theo email/username (Admin)
- [x] `PATCH /users/:id/ban` - Ban user (Admin)
- [x] `PATCH /users/:id/unban` - Unban user (Admin)
- [x] `GET /users/:id/activities` - Xem lịch sử hoạt động user (Admin)
- [x] `DELETE /users/:id` - Xóa user (Admin, soft delete)

---

## Phase 3: Game & User Game Profile (Week 3-4)

### 3.1 Game Module (Admin) ✅ COMPLETED

- [x] `GET /games/mobile` - Danh sách game cho user
- [x] `GET /games/admin` - Danh sách game cho admin
- [x] `GET /games/:id` - Chi tiết game
- [x] `POST /games` - Thêm game (Admin)
- [x] `PATCH /games/:id` - Cập nhật game (Admin)
- [x] `DELETE /games/:id` - Xóa game (Admin)

### 3.2 User Game Profile ✅ COMPLETED

- [x] `GET /user-game-profiles/me` - Danh sách game của user hiện tại
- [x] `GET /user-game-profiles/:id` - Chi tiết game profile
- [x] `POST /user-game-profiles` - Thêm game profile mới
- [x] `PATCH /user-game-profiles/:id` - Cập nhật rank level
- [x] `DELETE /user-game-profiles/:id` - Xóa game profile

---

## Phase 4: Zone - Tìm Bạn (Week 4-6) ✅ COMPLETED

### 4.1 Zone CRUD ✅ COMPLETED

- [x] `POST /zones` - Tạo zone mới (tối đa 4 zone)
- [x] `GET /zones` - Danh sách zone công khai (pagination)
- [x] `GET /zones/search` - Tìm kiếm zone với filters và sorting
- [x] `GET /zones/my` - Danh sách zone của chính mình
- [x] `GET /zones/:id/public` - Chi tiết zone (công khai)
- [x] `GET /zones/:id/owner` - Chi tiết zone (cho chủ sở hữu, xem requests)
- [x] `PATCH /zones/:id` - Cập nhật zone (owner only)
- [x] `DELETE /zones/:id` - Xóa zone (owner only)

### 4.2 Zone Filters ✅ COMPLETED

- [x] Filter theo game (tên, ID)
- [x] Filter theo rank level (min-max logic validation)
- [x] Filter theo tags
- [x] Filter theo status (OPEN/FULL)
- [x] Search theo title/description/username (Search API)
- [x] Sort theo newest, oldest, players count

### 4.3 Zone Tags ✅ COMPLETED

> **Note:** Route sử dụng `/tags` thay vì `/zone-tags` như plan ban đầu.

- [x] `GET /tags` - Danh sách tags (Public)
- [x] `POST /tags` - Tạo tag (Admin)
- [x] `PATCH /tags/:id` - Cập nhật tag (Admin)
- [x] `DELETE /tags/:id` - Xóa tag (Admin)

### 4.4 Zone Contact Methods ✅ COMPLETED

- [x] Thêm contact methods khi tạo zone (POST /zones - field `contacts`)
- [x] Cập nhật contact methods (PATCH /zones/:id - field `contacts`, delete-recreate strategy)

### 4.5 Zone Management (Admin) ✅ COMPLETED

> **Note:** List endpoint sử dụng `GET /zones/admin` thay vì `GET /admin/zones`.

- [x] `GET /zones/admin` - Danh sách tất cả zones (Admin, bypass ownership, pagination)
- [x] `DELETE /zones/admin/:id` - Force delete zone (Admin)


---

## Phase 5: Matching & Group (Week 6-8) ✅ COMPLETED

### 5.1 Join Requests ✅ COMPLETED

- [x] `POST /zones/:id/join` - Gửi yêu cầu tham gia
- [x] `GET /zones/:id/requests` - Danh sách requests (owner)
- [x] `PATCH /zones/:id/requests/:requestId` - Approve/Reject
- [x] `DELETE /zones/:id/join` - Hủy request (user)
- [x] `GET /users/me/join-requests` - Requests của user (Incoming/Outgoing)

### 5.2 Group Formation ✅ COMPLETED

- [x] Tự động tạo Group khi Zone đủ người
- [x] `GET /groups` - Danh sách groups của user
- [x] `GET /groups/:id` - Chi tiết group
- [x] `POST /groups/:id/leave` - Rời group
- [x] `DELETE /groups/:id` - Giải tán group (leader)

### 5.3 Group Members ✅ COMPLETED

- [x] `GET /groups/:id/members` - Danh sách members
- [x] `DELETE /groups/:id/members/:userId` - Kick member (leader)
- [x] `PATCH /groups/:id/members/:userId` - Đổi role

### 5.4 Group Management (Admin) ✅ COMPLETED

> **Note:** Route sử dụng `/groups/admin` thay vì `/admin/groups` như plan ban đầu, giống pattern của Zone Admin.

- [x] `GET /groups/admin` - Danh sách tất cả groups (Admin)
- [x] `DELETE /groups/admin/:id` - Force delete/dissolve group (Admin)
- [x] `GET /groups/admin/:id/messages` - Xem messages của group (Admin)

---

## Phase 6: Real-time Chat (Week 8-10)

### 6.1 WebSocket Setup

- [x] Setup Socket.io với NestJS Gateway
- [x] JWT authentication cho WebSocket
- [x] Room management (mỗi group = 1 room)

### 6.2 Chat Features

- [x] `event: sendMessage` - Gửi tin nhắn
- [x] `event: newMessage` - Nhận tin nhắn real-time
- [x] `event: typing` - Đang nhập
- [x] `event: joinRoom` - Join group room
- [x] `event: leaveRoom` - Leave group room

### 6.3 Message History

- [x] `GET /groups/:id/messages` - Lịch sử chat (pagination)
- [x] `DELETE /messages/:id` - Xóa tin nhắn (sender only)

### 6.4 Message Moderation (Admin)

- [x] `GET /messages/admin` - Danh sách tất cả messages (Admin)
- [x] `DELETE /messages/admin/:id` - Force delete message (Admin)
- [ ] `GET /admin/messages/flagged` - Messages vi phạm (Auto-flagged, Admin) — *đã xoá, không cần thiết*

### 6.5 Storage Optimization ✅ COMPLETED

- [x] `onDelete: Cascade` cho `GroupMember` → `Group` (xóa group → tự xóa members)
- [x] `onDelete: Cascade` cho `Message` → `Group` (xóa group → tự xóa messages)
- [x] `dissolveGroup()` và `adminForceDissolve()` → chuyển sang **hard delete** group
- [x] `deleteMessage()` và `adminDeleteMessage()` → chuyển sang **hard delete** message
- [x] Giới hạn content 2000 ký tự (`@db.VarChar(2000)` + gateway validation)
- [x] `MessagesCleanupService` — Cron job tự động xóa messages cũ hơn 30 ngày (mỗi ngày 3:00 AM)
- [x] `MessagesCleanupService` — Cron job xóa messages của group dissolved (mỗi ngày 3:05 AM)

---

## Phase 7: Notifications (Week 10-11) ✅ COMPLETED

### 7.1 Notification System

- [x] `GET /notifications` - Danh sách notifications (pagination: page, limit, response: items, total, unreadCount)
- [x] `PATCH /notifications/:id/read` - Đánh dấu 1 thông báo đã đọc
- [x] `PATCH /notifications/read-all` - Đánh dấu tất cả đã đọc
- [x] `DELETE /notifications/:id` - Xóa 1 notification (chỉ của chính user)

### 7.2 Notification Types

- [x] `JOIN_REQUEST` - Có người muốn join zone → gửi cho chủ zone
- [x] `REQUEST_APPROVED` - Request được chấp nhận → gửi cho người gửi request
- [x] `REQUEST_REJECTED` - Request bị từ chối → gửi cho người gửi request
- [x] `GROUP_FORMED` - Group được tạo → gửi cho tất cả members
- [ ] `NEW_MESSAGE` - Tin nhắn mới (bỏ qua Phase 7 — dễ spam, làm sau)
- [x] `MEMBER_LEFT` - Thành viên rời group / bị kick → gửi cho leader

### 7.3 Real-time Notifications

- [x] Push notification qua WebSocket — event `notification:new` tới room `user:${userId}`
- [x] Badge count unread — payload `{ notification, unreadCount }` khi emit
- [x] Client join `user:${userId}` khi gửi `joinRoom` với `groupId` (dùng chung handler)

### 7.4 Notification Storage Optimization

- [x] `NotificationsCleanupService` — Cron job tự động xóa notifications đã đọc & cũ hơn 90 ngày (mỗi ngày 3:10 AM)

---

## Phase 8: Report & Moderation (Week 11-12)

### 8.1 Report System ✅ COMPLETED

- [x] `POST /reports` - Tạo report
- [x] `GET /reports` - Danh sách reports (Admin)
- [x] `PATCH /reports/:id` - Resolve report (Admin)
- [x] Gửi thông báo real-time (`REPORT_RESOLVED`) cho người báo cáo khi report được resolve.

### 8.2 Moderation Actions

> **Note:** Các action đã có sẵn trong các phase trước.

- [x] Ban user — `PATCH /users/:id/ban` (Phase 2.4)

- [x] Delete group — `DELETE /groups/admin/:id` (Phase 5.4)
- [x] View report history — `GET /reports` (Admin list)

### 8.3 Dashboard Module (Admin Statistics) ✅ COMPLETED

> **Note:** Module `dashboard` riêng cho thống kê trang Admin. Route prefix: `/dashboard`. Query `?period=7d|30d` cho charts.

**Stats (Phase 8):**
- [x] `GET /dashboard/stats` - Tổng quan dashboard (Admin)
  - Total users (active/banned)
  - Total zones (open/closed)
  - Total groups (active/dissolved)
  - Total reports (open/resolved)
  - New users today/this week
  - Active users today/this week

**Charts MVP (Phase 8):**
- [x] `GET /dashboard/charts/users` - Tăng trưởng users theo ngày
- [x] `GET /dashboard/charts/zones` - Zones theo game (phân bố)
- [x] `GET /dashboard/charts/activity` - Hoạt động theo giờ

### 8.4 Advanced Violation Handling ✅ COMPLETED

**Moderation Actions (Phase A):**
- [x] Schema: Thêm `ModerationAction` enum & `ModerationLog` model
- [x] Backend: Cập nhật `PATCH /reports/:id` với logic chọn action (Warn/Ban/Dismiss)
- [x] Notification: Gửi `ACCOUNT_WARNED` cho người vi phạm khi bị cảnh cáo
- [x] Dashboard: UI tích hợp Action Picker vào Modal xử lý báo cáo
- [x] Fix: Tự động xác định targetUser chịu trách nhiệm khi báo cáo Zone/Group (vượt qua lỗi 500)

**Auto-Escalation & Temp Ban (Phase B):**
- [x] Schema: Thêm `warnCount` và `tempBannedUntil` cho User
- [x] Logic: Tự động khóa tài khoản tạm thời/vĩnh viễn theo số lần cảnh cáo (1-7-30-Permanent)
- [x] Auth: Cập nhật Guard kiểm tra thời hạn ban tạm (Trả lỗi tiếng Việt + Countdown)
- [x] Dashboard: Hiển thị Warn count & Ban status trong trang User Management
- [x] Refactor: Di chuyển quản lý Tags sang Zone Management cho đúng UX 


---

## Phase 9: Social & Discovery (Week 12-14)

> **Mục đích:** Mở rộng trải nghiệm multi-user — Friend List, Zone Invite, Quick Match, Suggested Zones, Top User theo Like.

### 9.1 Friend List ✅ COMPLETED

- [x] Schema: `Friendship` (senderId, receiverId, status: PENDING | ACCEPTED)
- [x] `POST /friends/request` - Gửi lời mời kết bạn (Body: `receiverId`)
- [x] `PATCH /friends/request/:senderId` - Chấp nhận / Từ chối (Body: `status`)
- [x] `GET /friends` - Danh sách bạn bè (pagination: page, limit)
- [x] `GET /friends/requests/incoming` - Danh sách lời mời đang chờ (incoming)
- [x] `GET /friends/requests/sent` - Danh sách lời mời đã gửi (outgoing)
- [x] `DELETE /friends/:friendId` - Hủy kết bạn / Hủy lời mời
- [x] Notification types: `FRIEND_REQUEST`, `FRIEND_ACCEPTED`

### 9.2 Zone Invite (Mời bạn vào Zone) ✅ COMPLETED

- [x] Schema: `ZoneInvite` (zoneId, inviterId, inviteeId, status: PENDING | ACCEPTED | DECLINED)
- [x] `POST /zones/:zoneId/invite` - Mời bạn bè vào zone (owner only, chỉ được mời friends)
- [x] `PATCH /zones/:zoneId/invites/:inviteId` - Chấp nhận / Từ chối lời mời (invitee)
- [x] `DELETE /zones/:zoneId/invites/:inviteId` - Hủy lời mời (owner)
- [x] `GET /users/me/zone-invites` - Danh sách lời mời zone đang chờ
- [x] Notification type: `ZONE_INVITE` — gửi khi owner mời bạn vào zone
- [x] Logic: Invitee chấp nhận → auto-create ZoneJoinRequest với status APPROVED

### 9.3 Quick Match (Ghép nhanh) ✅ COMPLETED

> **Note:** Dùng PostgreSQL (`QuickMatchQueue` table) thay vì Redis để phù hợp với stack hiện tại.

- [x] Schema: `QuickMatchQueue` (userId, gameId, rankLevel, requiredPlayers, createdAt)
- [x] `POST /quick-match` - Vào hàng đợi (gameId, rankLevel, requiredPlayers)
- [x] `DELETE /quick-match` - Rời hàng đợi
- [x] `GET /quick-match/status` - Xem trạng thái hàng đợi của mình
- [x] Logic match: Ghép users cùng game, rank tương thích (±1 bậc), đủ requiredPlayers (FIFO)
- [x] Khi match: Tự động tạo Zone + Group, gửi notification `QUICK_MATCH_FOUND` cho tất cả

### 9.4 Suggested Zones (Gợi ý Zone) ✅ COMPLETED

- [x] `GET /zones/suggested` - Danh sách zone gợi ý cho user hiện tại
- [x] Logic gợi ý: Dựa trên UserGameProfile (game + rank ±1 bậc), zone mới nhất
- [x] Loại trừ: Zone user đã join/có request, zone của chính mình
- [x] Fallback: Nếu chưa có game profile → trả về zones OPEN mới nhất

### 9.5 Top User (User Like / Leaderboard) ✅ COMPLETED

- [x] Schema: `UserLike` (userId, likerId) — userId = người được like, likerId = người like (unique)
- [x] `POST /users/:id/like` - Like user (1 user chỉ like 1 user 1 lần)
- [x] `DELETE /users/:id/like` - Bỏ like
- [x] `GET /users/:id/likes` - Xem số like + trạng thái `isLikedByMe`
- [x] `GET /leaderboard/users` - Top user theo số like (query: ?period=week|month|all, ?gameId=)
- [x] `GET /users/:id` - Bổ sung field `likeCount`, `isLikedByMe` vào public profile

### 9.6 Dashboard Additions (Phase 9 — Admin) ✅ COMPLETED

- [x] Stats (bổ sung vào `GET /dashboard/stats`):
  - Total Friendships (ACCEPTED count)
  - Total UserLikes
  - Quick Match current queue size
- [x] `GET /dashboard/charts/social-engagement` - Xu hướng tương tác (Likes & Friendships theo ngày)
- [x] `GET /dashboard/charts/quick-match` - Thống kê Quick Match (ghép thành công theo game)
- [x] `GET /dashboard/charts/leaderboard-top` - Top 10 users widget (theo likes)

---

## Phase 10: Testing & Optimization (Week 14-16)

### 10.0 Dashboard Charts Production (bổ sung Phase 8)

- [x] `GET /dashboard/charts/reports` - Xu hướng reports
- [x] `GET /dashboard/charts/engagement` - Engagement (zones, groups theo ngày)
- [x] `GET /dashboard/charts/top-games` - Top games
- [x] `GET /dashboard/charts/peak-hours` - Peak hours (Đã có: getActivityByHourChart)
- [x] `GET /dashboard/charts/moderation` - Moderation workload

### 10.1 Testing (Completed)

- [x] Unit tests cho services quan trọng (Dashboard, Friends, Reports, Chat)
- [x] E2E tests cho API endpoints (Dashboard, Friends)
- [x] WebSocket logic testing

### 10.2 Performance

- [x] Database indexing (Zone: title, ownerId, gameId, status, createdAt)
- [x] Query optimization ($transaction cho create/update, total count cho pagination)
- [x] **Message retention policy**: Auto-purge messages > 30 ngày (Cron 3:00 AM)
- [x] **Notification cleanup**: Auto-purge notifications đã đọc > 90 ngày (Cron 3:10 AM)
- [x] **Hard delete**: messages và groups xóa thật, không soft delete → tiết kiệm storage
- [x] **Cascade delete**: Zone → Group → GroupMember + Message (tự dọn khi giải tán)
- [x] **Content limit**: Message giới hạn 2000 ký tự (VarChar + gateway validation)
- [ ] Caching với Redis (Đã dời sang Phase 11)
- [x] Rate limiting (Global: 100 req/min, Auth: 5-10 req/min)

### 10.3 Security

- [x] Input validation (class-validator)
- [x] SQL injection prevention (Prisma handles)
- [x] XSS prevention
- [x] CORS configuration

### 10.4 Professional UI & Animations (Aesthetics Pro Max) ✅ COMPLETED

> [!IMPORTANT]
> Mục tiêu: Nâng tầm UX/UI của ứng dụng Mobile lên mức "Premium" bằng cách áp dụng các micro-animations, layout transitions và hiệu ứng mượt mà (60FPS).

- [x] **Library Setup**: Cài đặt `react-native-reanimated`, `moti`, `react-native-gesture-handler`.
- [x] **Entrance Animations**: Áp dụng hiệu ứng Staggered Fade-in cho các form đăng nhập, đăng ký và danh sách Game.
- [x] **Layout Transitions**: Sử dụng `Layout Animations` của Reanimated để các phần tử di chuyển mượt mà khi lọc (Filter) hoặc xóa item.
- [x] **Micro-interactions**: 
  - [x] Hiệu ứng "Like" (Heart burst) sinh động.
  - [x] Hiệu ứng bấm nút (Haptic-like scaling) — dùng `react-native-reanimated` `withSpring`.
  - [x] Shimmer Loading thay thế cho ActivityIndicator truyền thống.
- [x] **Chat Animations**: Tin nhắn mới bay vào mượt mà, bong bóng chat co giãn nhẹ.
- [x] **Lottie Integration**: Thêm các animation vector cho màn hình thành công (Success checkmark) hoặc khi không có dữ liệu (Empty states).

---

## Phase 11: Production Deployment & DevOps (Week 16-17)

> Mục tiêu: Đưa backend lên VPS bằng Docker, kết nối Supabase (PostgreSQL + Storage), phục vụ frontend trên Vercel. Toàn bộ kiến trúc containerized để dễ dàng scale và maintain.

### 11.1 Docker Production Build

> Docker là công nghệ containerization cốt lõi, được dùng để đóng gói NestJS backend thành image độc lập. Image được build theo multi-stage, tối ưu để chỉ chứa đúng những gì cần để chạy production.

**Multi-stage Dockerfile (Node Alpine):**

```
Stage 1 (deps)     → npm ci (cài đúng dependencies)
Stage 2 (build)    → npx prisma generate + nest build
Stage 3 (runtime)  → Copy dist/, node_modules/, package.json → image ~150MB
```

- [ ] **Tối ưu Dockerfile**: Sử dụng multi-stage build với Node Alpine image, tận dụng Docker layer caching cho `npm ci`.
- [ ] **.dockerignore**: Loại bỏ `node_modules`, `dist`, `.git`, `.env` khỏi build context.
- [ ] **Prisma Client**: Generate Prisma Client trong build stage — không cần runtime dependencies.
- [ ] **Healthcheck**: Thêm `HEALTHCHECK` instruction để Docker kiểm tra backend còn sống.

**docker-compose.prod.yml:**

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: teamzonevn-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}       # Supabase PostgreSQL
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}         # Vercel domain
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

> Vì database và storage đã dùng Supabase (managed service), Docker chỉ cần chạy NestJS. Không cần PostgreSQL container, giúp giảm tài nguyên VPS và đơn giản hóa operation.

### 11.2 VPS Setup & Deployment

- [ ] **Server Init**: Cài đặt Docker Engine + Docker Compose V2 trên VPS.
- [ ] **Clone & Build**: Clone source code, tạo `.env` từ mẫu, chạy `docker compose up -d --build`.
- [ ] **Nginx Reverse Proxy**:
      - Reverse proxy từ domain/subdomain đến `localhost:3000`
      - WebSocket support: `proxy_set_header Upgrade $http_upgrade` + `Connection "upgrade"`
      - Rate limiting, request body size limits (phòng spam)
      - Proxy timeout phù hợp cho WebSocket long-polling
- [ ] **SSL (Certbot + Let's Encrypt)**: HTTPS tự động gia hạn — bắt buộc cho Google OAuth và mobile app.
- [ ] **Firewall**: Chỉ mở port 80 (HTTP), 443 (HTTPS), 22 (SSH). Port 3000 không expose ra ngoài.

### 11.3 CI/CD Pipeline (GitHub Actions)

> Xây dựng pipeline tự động hoá — push code → build image → push registry → deploy lên VPS. Dùng GitHub Container Registry (ghcr.io) để lưu trữ image.

- [ ] **CI — Build & Test**: Workflow chạy trên mỗi pull request:
      - `npm ci` + `npx prisma generate`
      - `npm run lint` (ESLint + Prettier)
      - `npm run test` (Jest unit tests)
      - `docker build` (kiểm tra Dockerfile không lỗi)
- [ ] **CD — Build & Push Image**: Khi merge vào `main`:
      - Build Docker image với tag `ghcr.io/teamzonevn/backend:latest` và `git-sha`
      - Push lên GitHub Container Registry
- [ ] **CD — Deploy to VPS**: Sau khi push image thành công:
      - SSH vào VPS bằng deploy key
      - Pull image mới: `docker compose pull`
      - Graceful restart: `docker compose up -d --force-recreate`
      - Rollback script: giữ 3 versions gần nhất, deploy có flag `--rollback`
- [ ] **Environment Secrets**: Lưu `.env` và SSH private key trong GitHub Secrets.
- [ ] **Slack/Telegram Notification**: Gửi thông báo khi deploy thành công/thất bại (optional).

### 11.4 Monitoring & Database Connection

- [ ] **Container Restart Policy**: `unless-stopped` + Docker tự động restart nếu crash.
- [ ] **Log Rotation**: `json-file` driver với max-size 10m, max-file 3 — tránh đầy disk.
- [ ] **Prisma Connection Pool**: Cấu hình pool size phù hợp với Supabase free tier (15 connections).
- [ ] **Uptime Monitoring**: Dùng uptimerobot.com hoặc checklyhq.com để ping healthcheck mỗi 5 phút.
- [ ] **Supabase Keep-Alive**: Script cron nhẹ ping database mỗi giờ — tránh Supabase free tier suspend (optional).

---

## Phase 12: Landing Page & Public Launch (Week 17-18)

### 12.1 Project Setup
- [ ] Khởi tạo `LandingPage` project (Vite + React + Tailwind v4).
- [ ] Thiết kế **Hero Section** ấn tượng với hiệu ứng Framer Motion.
- [ ] Tích hợp App Mockups (Showcase giao diện Mobile App).

### 12.2 Deployment & SEO
- [ ] **Vercel Deployment**: Cấu hình auto-deploy tới Vercel cho Landing Page.
- [ ] **Domain Mapping**: Trỏ `gamezone.vn` về Vercel (Landing Page), trỏ `api.gamezone.vn` về VPS (Backend API).
- [ ] **SEO Optimization**: Meta tags, OpenGraph images, and Sitemap.

### 12.3 App Store Readiness & Final Polish
- [ ] **Data Deletion**: Implement `DELETE /users/me` cho user tự xóa account (Apple requirement).
- [ ] **Blocking System**: Thêm tính năng Block User để đáp ứng chính sách Safety của Store.
- [ ] **Privacy & Terms**: Soạn thảo và host trang Chính sách bảo mật trên Landing Page.
- [ ] **App Store Assets**: Chuẩn bị Screenshots chuyên nghiệp từ Landing Page Mockups.
- [ ] **Monitoring**: Tích hợp Sentry/Checkly để theo dõi lỗi và Uptime (nếu cần).

---

## Phase 13: Redis Integration — Performance & Real-time Optimization

> *Phase này triển khai ngay để làm nền tảng cho việc scale và tối ưu hiệu năng. Redis được dùng ở 4 mảng: cache dữ liệu, real-time presence, rate limiting phân tán, và WebSocket scaling.*

### 13.1 Redis Module & Infrastructure

- [ ] **Cấu trúc RedisModule**: Tạo `common/redis/` riêng:
      ```
      common/redis/
      ├── redis.module.ts        # Global module, exports RedisService
      ├── redis.service.ts       # Wrapper ioredis, quản lý connection pool
      └── redis.constant.ts      # Cache key prefixes, TTL constants
      ```
- [ ] **Setup Redis**: Thêm service vào `docker-compose.prod.yml` (Docker Redis 7-Alpine, port 6379, persistence AOF).
- [ ] **Tích hợp packages**: `ioredis` (Redis client), `@nestjs/cache-manager` + `cache-manager-ioredis-yet` (abstraction cho caching), `@socket.io/redis-adapter` (cho WebSocket).
- [ ] **Config & env**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` trong `.env`, load qua `ConfigModule`.

### 13.2 Performance Caching (Cache-Aside Pattern)

> Chiến lược: Cache-aside — đọc từ cache trước, miss thì query DB rồi ghi vào cache với TTL. Khi data thay đổi, chủ động xoá cache key tương ứng.

| Cache Target | Key Pattern | TTL | Invalidation Trigger |
|---|---|---|---|
| Games list | `cache:games` | 1 hour | Admin tạo/sửa/xoá game |
| Tags list | `cache:tags` | 1 hour | Admin tạo/sửa/xoá tag |
| Public Profile | `cache:profile:{userId}` | 5 minutes | User update profile |
| Zone list (public) | `cache:zones:page:{page}` | 2 minutes | Zone mới được tạo |
| Zone detail | `cache:zone:{zoneId}` | 5 minutes | Zone bị update/delete |
| Leaderboard | `cache:leaderboard` | 5 minutes | Có lượt like mới |

- [ ] **Cache Games + Tags**: danh sách ít thay đổi, cache 1 giờ. Invalidate khi admin CRUD.
- [ ] **Cache Public Profile**: cache 5 phút theo `userId`. Invalidate khi user gọi `PATCH /users/me`.
- [ ] **Cache Zone list (public + search)**: query thường xuyên, cache ngắn 2 phút. Invalidate khi zone được tạo.
- [ ] **Cache Leaderboard dùng Redis Sorted Sets**: `ZADD cache:leaderboard {likeCount} {userId}`, `ZREVRANGE` lấy top N — O(log N), thể hiện kỹ thuật sử dụng đúng cấu trúc dữ liệu Redis.
- [ ] **Cache Invalidation cụ thể**: Sau mỗi mutation (create/update/delete), gọi `this.cacheManager.del(key)` tương ứng — không dùng TTL chờ hết hạn.

### 13.3 Real-time & WebSocket Optimization

- [ ] **Socket.IO Redis Adapter**: Cài `@socket.io/redis-adapter`, cấu hình trong `ChatGateway`:
      ```typescript
      const pubClient = new Redis(redisConfig);
      const subClient = pubClient.duplicate();
      createAdapter(pubClient, subClient);
      ```
      Cho phép scale nhiều server — tất cả instance nhận được sự kiện qua Redis Pub/Sub.
- [ ] **Online/Offline Presence**: Dùng Redis key với TTL 60s:
      - Key: `presence:{userId}` → value: `socketId`
      - Refresh mỗi 30s từ client (heartbeat)
      - Khi disconnect → key tự hết hạn (hoặc xoá thủ công)
      - API `GET /users/presence?userIds=...` để check ai đang online
- [ ] **User online status broadcast**: Khi user online/offline, emit sự kiện qua WebSocket để các client khác cập nhật real-time.

### 13.4 Distributed Rate Limiting

- [ ] **Redis-based Throttler**: Cấu hình `@nestjs/throttler` dùng Redis store thay vì in-memory:
      ```typescript
      ThrottlerModule.forRoot({
        throttlers: [{ name: 'default', ttl: 60000, limit: 100 }],
        storage: new ThrottlerStorageRedisService(new Redis(redisConfig)),
      });
      ```
      Hữu ích khi scale lên nhiều instance — rate limit được tính chung, không bị reset theo từng server.
- [ ] **Preserve cấu hình rate limit hiện tại**: Auth (5-10 req/min), Global (100 req/min) — chỉ chuyển storage từ memory → Redis, không thay đổi logic.


---

## API Endpoints Summary

| Module                 | Endpoints         |
| ---------------------- | ----------------- |
| Auth                   | 10 (incl. Google + forgot/reset password) |
| Users                  | 4                 |
| **Admin - Users**      | **6**             |
| Games                  | 5                 |
| User Game Profile      | 4                 |
| Zones                  | 5                 |
| Zone Tags (`/tags`)    | 4                 |
| **Admin - Zones**      | **3**             |
| Join Requests          | 5                 |
| Groups                 | 5                 |
| **Admin - Groups**     | **3**             |
| Group Members          | 3                 |
| Messages               | 2                 |
| **Admin - Messages**   | **3**             |
| Notifications          | 4                 |
| Reports                | 3                 |
| Dashboard                | **12** (1 stats + 11 charts, Admin) |
| **Friends (Phase 9)**  | **6**             |
| **Zone Invites (Phase 9)** | **4**         |
| **Quick Match (Phase 9)** | **3**          |
| **Suggested Zones (Phase 9)** | **1**      |
| **Leaderboard (Phase 9)** | **4**          |
| **Total**              | **~98 endpoints** |

---

## Folder Structure

```
src/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   └── dto/
├── prisma/
│   └── prisma.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   └── dto/
├── users/
├── games/
├── zones/
├── groups/
├── messages/
├── notifications/
├── reports/
├── dashboard/          ← Module riêng cho thống kê Admin
├── friends/            ← Phase 9: Friend List
├── zone-invites/       ← Phase 9: Zone Invite (có thể gộp vào zones/)
├── quick-match/        ← Phase 9: Quick Match
└── gateways/
    └── chat.gateway.ts
```

---

## Priority Matrix

| Priority          | Features                                                        |
| ----------------- | --------------------------------------------------------------- |
| P0 (Must have)    | Auth, Users, Games, Zones, Join Requests, Groups                |
| P1 (Should have)  | Chat, Notifications, **Admin User Management, Admin Dashboard**, **Advanced Moderation (Warn/Escalation)** |
| P2 (Nice to have) | Reports, Advanced filters, Caching                             |
| P3 (Phase 9)      | **Friend List**, **Zone Invite**, **Quick Match**, **Suggested Zones**, **Top User (Like)** |
| P4 (Phase 11-12)  | **Dockerization**, **CI/CD**, **Landing Page**, **Production Launch** |


---

## Admin Endpoints Summary

### User Management (Phase 2.4)

- List/Search all users
- Ban/Unban users
- View user activities
- Soft delete users

### Zone Management (Phase 4.5)

- ✅ View all zones (bypass ownership) — `GET /zones/admin`
- ✅ Force delete zones — `DELETE /zones/admin/:id`


### Group Management (Phase 5.4)

- ✅ View all groups — `GET /groups/admin`
- ✅ Force dissolve groups — `DELETE /groups/admin/:id`
- ✅ View group messages — `GET /groups/admin/:id/messages`

### Message Moderation (Phase 6.4)

- View reported messages
- Force delete messages
- View auto-flagged content

### Violation Handling (Phase 8.4)

- Warn users via Report Resolve
- View violation logs (`ModerationLog`)
- Auto temp-ban based on warn count
- Auto permanent-ban after 5 warns


### Dashboard (Phase 8.3 + 10.0)

- Module riêng: `dashboard/`
- `GET /dashboard/stats` — Tổng quan (users, zones, groups, reports)
- **Charts MVP:** users, zones, activity
- **Charts Production:** reports, engagement, top-games, peak-hours, moderation
- **Charts Social (Phase 9):** quick-match, social-engagement, leaderboard-top

---

## Notes

- Mỗi Phase nên có PR riêng để dễ review
- Viết tests song song với code
- Document API với Swagger
- Commit thường xuyên, message rõ ràng

---

## Known Issues & Performance TODOs

| #   | Vấn đề                                                                                                     | File                | Mức độ      | Trạng thái      |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------- | ----------- | --------------- |
| 1   | `create` và `update` zone không dùng `$transaction` — partial data nếu tag/contact creation fail           | `zones.service.ts`  | 🔴 Critical | ✅ Đã sửa       |
| 2   | `findAllByUser` thiếu `total` count — frontend pagination không có `totalPages`                            | `zones.service.ts`  | 🟡 Medium   | ✅ Đã sửa       |
| 3   | Không có DB indexes trên `title`, `ownerId`, `gameId`, `status`, `createdAt`                               | `schema.prisma`     | 🟡 Medium   | ✅ Đã sửa       |
| 4   | Không có `onDelete: Cascade` trên relations — zone delete sẽ fail nếu có tag/contact/joinRequest liên quan | `schema.prisma`     | 🔴 Critical | ✅ Đã sửa       |
| 5   | `CreateTagDto` thiếu validation (`@IsString`, `@IsNotEmpty`)                                               | `create-tag.dto.ts` | 🟡 Medium   | ✅ Đã sửa       |
| 6   | `TagsService.getAllTags` throw Error khi không có tags — nên return `[]`                                   | `tags.service.ts`   | 🟠 Low      | ✅ Đã sửa       |
| 7   | Duplicate methods: `findAllByAdmin` và `findAllForAdmin` gần giống nhau                                    | `zones.service.ts`  | 🟠 Low      | ✅ Đã xóa trùng |

## Lịch sử thay đổi (12/05/2026)

### Backend

| Thay đổi | Mô tả |
|----------|-------|
| **Xoá CLOSED status** | Xoá `CLOSED` khỏi enum `ZoneStatus`. Migration xoá toàn bộ zone CLOSED trong DB. Xoá endpoint `PATCH /zones/admin/:id/close` và method `adminCloseZone`. |
| **Fix `syncGroupFromZone`** | Group được tạo **ngay khi có người thứ 2** (chỉ cần ≥ 1 approved request). Dù chưa đủ người, zone vẫn OPEN (phòng chờ) nhưng đã có group để chat. Khi đủ `requiredPlayers + 1` → tự động set FULL. |
| **Auto-calc status khi edit** | Khi update `requiredPlayers`, backend tự tính lại status: so sánh `currentMembers` (group hoặc approved requests + owner) với `requiredPlayers + 1`. |
| **Thêm group vào API response** | `findOneByPublic`: include `group.members` để detail page hiển thị thành viên. `findAllByOwner`: include `group._count.members`. `getSuggestedZones`: bỏ filter `status: OPEN`, thêm include `group`. |
| **Dashboard stats** | Xoá `closedZones` khỏi dashboard overview. Xoá `AND status != 'CLOSED'` khỏi raw SQL chart. |
| **Seed data** | Set status `FULL` cho zone "Leo Rank Ascendant/Immortal" sau khi tạo group (đủ 3/3 thành viên). |

### Frontend

| Thay đổi | Mô tả |
|----------|-------|
| **HomeScreen** | Luôn gọi `/zones/search` thay vì `/zones/suggested` → hiện tất cả zones. `currentPlayers` ưu tiên `group._count.members`. "Cần thêm" hiển thị `remainingSlots` thay vì `requiredPlayers`. |
| **ZoneDetailsScreen** | Hiển thị đúng số thành viên hiện tại (từ group members). Avatar stack: owner + members + slot trống. Stats: `currentPlayers/maxPlayers`, "Cần thêm X" hoặc "Đã đầy". |
| **MyZonesScreen** | "Phòng chờ" (embedded) filter `status !== 'FULL'`. `currentPlayers` ưu tiên `group._count.members`. |
| **TeamZoneVNsScreen** | `currentPlayers` ưu tiên `group._count.members`. |
| **types/index.ts** | Xoá `CLOSED` khỏi `ZoneStatus`. Thêm `members` vào `group` field trong `Zone` interface. |


