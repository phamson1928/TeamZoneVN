# TeamZoneVN — Mobile App

> Ứng dụng mobile React Native cho nền tảng kết nối game thủ TeamZoneVN.

![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-52-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React Native 0.83** | Cross-platform mobile framework |
| **Expo** | Build toolchain & dev server |
| **React Navigation 7** | Bottom tabs & stack navigation |
| **Socket.IO Client** | Real-time chat |
| **AsyncStorage** | Local token storage |
| **Google Sign-In** | OAuth2 social login |

---

## Setup

### Prerequisites
- Node.js 20+
- Expo Go app on your phone (or Android/iOS emulator)
- Backend server running (see [Backend README](../Backend/README.md))

### Quick Start

```bash
# Install dependencies
npm install

# Configure API URL (edit .env)
# EXPO_PUBLIC_API_URL=https://your-backend-url

# Start development server
npm start

# Scan the QR code with Expo Go (Android/iOS)
```

### Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Build & run on Android |
| `npm run ios` | Build & run on iOS |
| `npm test` | Run tests |
| `npm run lint` | ESLint |

---

## Features

- **Zone Browser** — Browse, search & filter gaming zones
- **Real-time Chat** — Group chat with Socket.IO integration
- **User Profile** — Avatar, stats, game preferences
- **Friend System** — Add friends, view online status
- **Authentication** — Email/password login + Google OAuth2
- **Leaderboard** — View top-ranked users
- **Notifications** — In-app notifications for zone invites & messages

## Project Structure

```
Frontend/
├── src/
│   ├── screens/        # App screens (Zone, Chat, Profile, Auth...)
│   ├── components/     # Reusable UI components
│   ├── services/       # API & WebSocket clients
│   ├── hooks/          # Custom React hooks
│   ├── navigation/     # Tab & stack navigation config
│   └── utils/          # Helpers & constants
├── App.tsx             # Root component
├── app.json            # Expo config
└── assets/             # Images, fonts
```
