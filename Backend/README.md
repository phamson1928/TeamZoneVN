# TeamZoneVN — Backend

> REST API + WebSocket server cho nền tảng kết nối game thủ TeamZoneVN.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![Node](https://img.shields.io/badge/Node-20-339933?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS 11** | Framework (Modules / Controllers / Services / DI) |
| **TypeScript 5.7** | Strict mode, ES2023 |
| **PostgreSQL 16** (Supabase) | Primary database + connection pooling via PgBouncer |
| **Prisma 6** | ORM — schema-first, migrations, type-safe queries, transactions |
| **Redis 7** | Caching, distributed rate limiting, leaderboard, Socket.IO adapter |
| **Socket.IO** | Real-time chat (namespace `/chat`, room-based) |
| **Passport.js + JWT** | Access token (15m) + Refresh token (7d) |
| **Google OAuth2** | Mobile (idToken) + Web (OAuth2 redirect) |
| **Swagger** | API documentation at `/api/docs` |
| **Docker** | Multi-stage Alpine build + Compose |
| **Nginx** | Reverse proxy + SSL |

---

## Features

- **REST API** — Full CRUD for users, zones, games, friendships, reports
- **WebSocket Realtime Chat** — Room-based group chat via Socket.IO
- **Authentication** — Register, login, refresh tokens, Google OAuth2
- **Authorization** — RolesGuard (`@Roles('ADMIN')`), Global JWT guard with `@Public()` exceptions
- **WebSocket Auth** — JWT-verified WebSocket handshake (`WsJwtGuard`)
- **Rate Limiting** — Distributed via Redis INCR + TTL (custom `ThrottlerStorage`)
- **Leaderboard** — Redis Sorted Sets (ZADD, ZREVRANGE, ZREVRANK)
- **Caching** — API response caching via `@nestjs/cache-manager` + ioredis
- **File Upload** — Avatar & game assets via Supabase Storage
- **Zone Cleanup** — Automated cron job for expired/inactive zones
- **Swagger Documentation** — Interactive API docs at `/api/docs`

---

## Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL + Redis)

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: DATABASE_URL, REDIS_HOST, JWT_SECRET, etc.

# Push schema & seed data
npx prisma db push
npx prisma db seed

# Start development server
npm run start:dev   # http://localhost:3000
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Development with hot-reload |
| `npm run build` | Production build |
| `npm run start:prod` | Run production build |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Docker

```bash
# Development (PostgreSQL + Redis)
docker compose up -d

# Production (full stack)
docker compose -f docker-compose.prod.yml up -d
```

## API Documentation

- **Swagger UI** (local): http://localhost:3000/api/docs
- **Full endpoint reference**: [docs/API_ENDPOINTS.md](docs/API_ENDPOINTS.md)
- **Development roadmap**: [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md)

---

## Project Structure

```
Backend/
├── src/
│   ├── modules/         # Feature modules (auth, user, zone, chat, game...)
│   ├── common/          # Guards, decorators, DTOs, filters, interceptors
│   └── main.ts          # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema (25 models, 17 enums)
│   ├── migrations/      # Migration history
│   └── seed.ts          # Sample data seeder
├── docs/
│   ├── API_ENDPOINTS.md # Full API reference
│   └── DEVELOPMENT_PLAN.md
├── scripts/             # Utility scripts
├── test/                # E2E tests
├── Dockerfile           # Multi-stage Alpine build
├── docker-compose.yml   # Local dev services
└── nginx.conf           # Reverse proxy config
```
