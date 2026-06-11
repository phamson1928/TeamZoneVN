# TeamZoneVN

> **Social Gaming Platform** — Kết nối game thủ tìm đồng đội, tạo phòng (Zone), chat realtime và xây dựng cộng đồng game.

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (Mobile)                      │
│          React Native + Expo (iOS/Android)                │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼─────────────────────────────────────┐
│                    Backend (VPS)                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Docker Container                        │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ NestJS  │  │ Socket.IO│  │   Redis 7        │   │  │
│  │  │ REST API│  │ WebSocket│  │ (Cache/RT/Leader)│   │  │
│  │  └────┬────┘  └────┬─────┘  └──────────────────┘   │  │
│  └───────┼────────────┼────────────────────────────────┘  │
│          │            │                                    │
│  ┌───────▼────────────▼────────────────────────────────┐  │
│  │          Supabase (PostgreSQL 16 + Storage)          │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
│
┌────────────────▼─────────────────────────────────────────┐
│                 Web Clients                               │
│  ┌─────────────┐  ┌────────────────────────────────┐    │
│  │ Landing Page│  │  Admin Dashboard                │    │
│  │ (React+Vite)│  │  (React+Vite + Shadcn UI)       │    │
│  └─────────────┘  └────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **NestJS 11** | REST API + WebSocket framework |
| **PostgreSQL 16** (Supabase) | Primary database |
| **Prisma 6** | ORM — schema-first, migrations, type-safe |
| **Redis 7** | Caching, rate limiting, leaderboard, Socket.IO adapter |
| **Socket.IO** | Real-time chat (room-based) |
| **Passport.js + JWT** | Auth — access token (15m) + refresh token (7d) |
| **Google OAuth2** | Social login (mobile + web) |
| **Docker** | Multi-stage Alpine build + Docker Compose |
| **Nginx** | Reverse proxy + SSL termination |
| **GitHub Actions** | CI/CD auto-deploy to VPS |

### Frontend (Mobile)
| Technology | Purpose |
|------------|---------|
| **React Native 0.83** | Cross-platform mobile app |
| **Expo** | Development & build toolchain |
| **React Navigation** | Multi-tab navigation (Zone, Chat, Profile) |
| **Socket.IO Client** | Real-time chat |

### Dashboard (Admin Web)
| Technology | Purpose |
|------------|---------|
| **React 19** + Vite | Admin SPA |
| **TanStack Query** | Server state management |
| **TanStack Table** | Data tables & filtering |
| **Shadcn UI** | Component library |
| **Framer Motion** | Animation |
| **Recharts** | Analytics charts |

### Landing Page
| Technology | Purpose |
|------------|---------|
| **React 19** + Vite | Marketing page |
| **Tailwind CSS** | Styling |

---

## 🎯 Features

- **Zone System** — Create & join gaming rooms by game title
- **Real-time Chat** — WebSocket-based group chat with Socket.IO
- **Matchmaking** — Smart player matching (rank, game, region)
- **Leaderboard** — Redis Sorted Set based interaction ranking
- **Friend System** — Add friends, block users, presence tracking
- **Authentication** — JWT (access+refresh), Google OAuth2, RBAC
- **Admin Dashboard** — User management, zone moderation, analytics
- **Rate Limiting** — Distributed rate limiting via Redis INCR+TTL
- **CI/CD** — Auto-deploy to VPS via GitHub Actions + Docker

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop (PostgreSQL + Redis)
- Expo Go (mobile testing)

### 1. Backend
```bash
cd Backend
npm install
cp .env.example .env    # Configure your database & secrets
npx prisma db push      # Push schema to database
npx prisma db seed      # Seed sample data
npm run start:dev       # http://localhost:3000
```

### 2. Dashboard (Admin)
```bash
cd Dashboard
npm install
npm run dev             # http://localhost:5173
```

### 3. Mobile App
```bash
cd Frontend
npm install
npm start               # Scan QR with Expo Go
```

### 4. Landing Page
```bash
cd LandingPage
npm install
npm run dev
```

---

## 📁 Project Structure

```
TeamZoneVN/
├── Backend/           # NestJS API + WebSocket
│   ├── src/           # Modules, controllers, services
│   ├── prisma/        # Schema, migrations, seed
│   ├── docs/          # API docs & dev plan
│   ├── docker-compose.yml
│   └── Dockerfile
├── Frontend/          # React Native mobile app
│   ├── src/           # Screens, components, navigation
│   └── App.tsx
├── Dashboard/         # React admin SPA
│   ├── src/           # Admin pages & components
│   └── index.html
├── LandingPage/       # React marketing site
│   └── src/
└── .github/workflows/ # CI/CD pipelines
```

---

## 📚 Documentation

- [API Endpoints](Backend/docs/API_ENDPOINTS.md) — Full REST + WebSocket API reference
- [Development Plan](Backend/docs/DEVELOPMENT_PLAN.md) — Technical roadmap & architecture decisions
- [Swagger UI](http://localhost:3000/api/docs) (local) — Interactive API playground

---

## 🐳 Docker Deployment

Production deployment uses Docker multi-stage build with Nginx reverse proxy:

```bash
cd Backend
docker compose -f docker-compose.prod.yml up -d
```

---

## 📄 License

MIT © TeamZoneVN
