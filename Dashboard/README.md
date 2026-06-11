# TeamZoneVN — Admin Dashboard

> Giao diện quản trị web cho nền tảng kết nối game thủ TeamZoneVN.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-latest-000000?logo=shadcnui)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **TypeScript 5.7** | Strict type safety |
| **TanStack Query** | Server state & caching |
| **TanStack Table** | Data tables with sorting/filtering |
| **Shadcn UI** | Component library |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Analytics charts |
| **Axios** | HTTP client |
| **React Hook Form** | Form management |
| **Lucide React** | Icons |

---

## Setup

### Prerequisites
- Node.js 20+
- Backend server running (see [Backend README](../Backend/README.md))

### Quick Start

```bash
# Install dependencies
npm install

# Configure API URL (edit .env)
# VITE_API_URL=https://your-backend-url

# Start development server
npm run dev    # http://localhost:5173
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

---

## Features

- **User Management** — View, search, filter, ban/unban users
- **Zone Moderation** — Monitor & manage gaming zones
- **Game Management** — CRUD for supported games
- **Analytics Dashboard** — Charts for user growth, active zones, engagement
- **Admin Role Management** — Role-based access control
- **System Settings** — Configure platform parameters

## Project Structure

```
Dashboard/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route pages (Users, Zones, Games, Analytics...)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities & API client
│   └── styles/         # Global styles
├── index.html
└── vite.config.ts
```
