# 🛠️ Technology Stack - IPL Auction Game

## 📚 Complete Tech Stack Breakdown

---

## 🎨 Frontend Technologies

### Core Framework

- **Next.js 16.0.0**
  - **Why**: React framework with server-side rendering, app router, and Turbopack
  - **Features Used**:
    - App Router (file-based routing)
    - API Routes (backend endpoints)
    - Server Components
    - Turbopack (faster than Webpack)
    - Image optimization
  - **Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

### UI Library

- **React 19.2.0**
  - **Why**: Latest React with improved rendering and hooks
  - **Features Used**:
    - Function components
    - Hooks (useState, useEffect, useCallback, useMemo)
    - Context API
    - Suspense boundaries
  - **Documentation**: [react.dev](https://react.dev)

### Language

- **TypeScript 5.x**
  - **Why**: Type safety, better IDE support, fewer runtime errors
  - **Features Used**:
    - Interface definitions
    - Type inference
    - Generic types
    - Strict mode enabled
  - **Configuration**: `tsconfig.json`

### Styling

- **Tailwind CSS 3.4.1**

  - **Why**: Utility-first CSS, fast development, small bundle size
  - **Features Used**:
    - Responsive utilities
    - Dark mode support
    - Custom color schemes
    - JIT compiler
  - **Config**: `tailwind.config.ts`

- **PostCSS**
  - **Plugins**:
    - `tailwindcss`
    - `autoprefixer`
  - **Config**: `postcss.config.mjs`

### Component Library

- **shadcn/ui**
  - **Why**: Accessible, customizable, copy-paste components
  - **Components Used**:
    - Button, Card, Badge
    - Dialog, Sheet, Drawer
    - Input, Select, Checkbox
    - Table, Tabs, Accordion
    - Alert, Toast (Sonner)
    - Progress, Slider, Spinner
  - **Style**: Configured via `components.json`

### Animation Library

- **Framer Motion 11.x**
  - **Why**: Production-ready animations, gesture support
  - **Features Used**:
    - `motion` components
    - `AnimatePresence` for enter/exit animations
    - Spring physics
    - Layout animations
    - Scroll-triggered animations
  - **Examples**:
    ```tsx
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    />
    ```

### Icons

- **Lucide React**
  - **Why**: Beautiful, consistent icon set
  - **Icons Used**:
    - Trophy, Users, Clock, DollarSign
    - Home, Settings, ChevronRight
    - Play, Pause, Check, X
  - **Usage**: `import { Trophy } from 'lucide-react'`

---

## ⚙️ Backend Technologies

### Runtime

- **Node.js 18+**
  - **Why**: JavaScript runtime for server-side code
  - **Features Used**:
    - ES Modules
    - Async/await
    - File system operations
    - Child processes

### WebSocket Library

- **ws (WebSocket) 8.x**
  - **Why**: Fast, reliable WebSocket implementation
  - **Features Used**:
    - WebSocket server creation
    - Connection management
    - Message broadcasting
    - Ping/pong heartbeats
  - **Server**: `server/auction-room-server.js`
  - **Port**: 8080

### API Framework

- **Next.js API Routes**
  - **Why**: Integrated with Next.js, serverless-ready
  - **Features Used**:
    - REST endpoints
    - Request/response handling
    - Middleware support
  - **Location**: `app/api/`

---

## 🗄️ Database Technologies

### Database

- **PostgreSQL 12+**
  - **Why**: Robust, ACID-compliant relational database
  - **Provider**: Supabase (managed PostgreSQL)
  - **Features Used**:
    - Relational tables
    - JSON fields
    - Indexes
    - Foreign keys
    - Timestamps

### ORM (Object-Relational Mapping)

- **Prisma 6.19.0**
  - **Why**: Type-safe database access, migrations, introspection
  - **Features Used**:
    - Schema definition (`prisma/schema.prisma`)
    - Prisma Client (type-safe queries)
    - Migrations
    - Database push
  - **Commands**:
    ```bash
    npx prisma generate  # Generate client
    npx prisma db push   # Sync schema
    npx prisma studio    # GUI interface
    ```

### Schema Overview

```prisma
model AuctionResult {
  id          String   @id @default(cuid())
  userName    String
  teamName    String
  players     Json
  totalSpent  Float
  createdAt   DateTime @default(now())
}

model Player {
  id          String   @id @default(cuid())
  name        String   @unique
  role        String
  country     String
  stats       Json?
  createdAt   DateTime @default(now())
}

model Room {
  id          String   @id @default(cuid())
  roomCode    String   @unique
  hostId      String
  players     Json
  status      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🌐 External APIs

### Cricket Data API

- **Cricbuzz Unofficial API**
  - **Why**: Real cricket player data and statistics
  - **Endpoints Used**:
    - `/api/player/{id}` - Player information
    - `/api/player/{id}/stats` - Player statistics
    - `/search?query={name}` - Player search
  - **Data**: Player names, roles, countries, stats
  - **Integration**: `lib/fetch-players.js`

---

## 🔧 Development Tools

### Build Tool

- **Turbopack**
  - **Why**: Next.js 15+ default, faster than Webpack
  - **Features**:
    - Incremental bundling
    - Hot Module Replacement (HMR)
    - Fast refresh
  - **Usage**: `npm run dev --turbopack`

### Package Manager

- **npm / pnpm**
  - **npm**: Default Node package manager
  - **pnpm**: Faster, disk-efficient alternative
  - **Files**: `package.json`, `pnpm-lock.yaml`

### Version Control

- **Git**
  - **Repository**: GitHub
  - **Branch Strategy**: main branch
  - **Files**: `.gitignore`, `.git/`

### Code Quality

- **ESLint** (Next.js integrated)

  - **Config**: `next.config.mjs`
  - **Rules**: Next.js recommended + React rules

- **TypeScript Compiler**
  - **Config**: `tsconfig.json`
  - **Strict Mode**: Enabled
  - **Target**: ES2022

---

## 📦 Key Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    // Core Framework
    "next": "^16.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",

    // Database
    "@prisma/client": "^6.19.0",

    // UI Components
    "@radix-ui/react-*": "^1.x.x", // shadcn/ui base
    "lucide-react": "^0.462.0",
    "framer-motion": "^11.x.x",

    // Styling
    "tailwindcss": "^3.4.1",
    "tailwind-merge": "^2.x.x",
    "clsx": "^2.x.x",

    // WebSocket
    "ws": "^8.x.x",

    // Utilities
    "class-variance-authority": "^0.7.x",
    "sonner": "^1.x.x" // Toast notifications
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    // TypeScript
    "typescript": "^5.x.x",
    "@types/node": "^20.x.x",
    "@types/react": "^19.x.x",
    "@types/react-dom": "^19.x.x",
    "@types/ws": "^8.x.x",

    // Build Tools
    "prisma": "^6.19.0",
    "postcss": "^8.x.x",
    "autoprefixer": "^10.x.x",

    // Linting
    "eslint": "^8.x.x",
    "eslint-config-next": "^16.0.0"
  }
}
```

---

## 🏗️ Architecture Patterns

### Frontend Architecture

#### 1. **Component-Based Design**

```
components/
├── ui/              # Reusable UI components (shadcn/ui)
├── auction-arena.tsx           # Solo auction container
├── auction-arena-room.tsx      # Multiplayer auction container
├── room-lobby.tsx              # Room creation/joining
├── header.tsx                  # Navigation
└── player-analysis.tsx         # Player details modal
```

#### 2. **Page Routing** (App Router)

```
app/
├── page.tsx                    # Home/Lobby
├── layout.tsx                  # Root layout
├── room/[roomCode]/page.tsx   # Dynamic room pages
├── rooms/page.tsx              # Room listing
└── leaderboard/page.tsx        # Global leaderboard
```

#### 3. **State Management**

- **Local State**: `useState` for component-specific state
- **Session Persistence**: `sessionStorage` for auction data
- **WebSocket State**: Real-time synchronization
- **Database State**: Prisma queries via API routes

### Backend Architecture

#### 1. **WebSocket Server** (Real-time)

```javascript
// server/auction-room-server.js
class AuctionRoom {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.players = [];
    this.teams = {};
    this.auctionActive = false;
    this.currentPlayer = null;
  }

  handleBid(ws, message) {
    /* ... */
  }
  broadcastState() {
    /* ... */
  }
  nextPlayer() {
    /* ... */
  }
}
```

#### 2. **API Routes** (REST)

```
app/api/
├── auction/route.ts      # Save auction results
├── leaderboard/route.ts  # Get top auctions
├── players/route.ts      # CRUD operations
├── rooms/
│   ├── create/route.ts   # Create room
│   ├── join/route.ts     # Join room
│   └── list/route.ts     # List active rooms
└── user-stats/route.ts   # User statistics
```

#### 3. **Database Layer** (Prisma ORM)

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 🔐 Security Considerations

### Environment Variables

- Database credentials in `.env`
- Not committed to version control
- `.gitignore` includes `.env`

### Input Validation

- Bid amount validation (server-side)
- Budget checks before processing
- Room code validation
- SQL injection protection (Prisma ORM)

### WebSocket Security

- Message type validation
- Connection authentication
- Rate limiting (potential enhancement)

---

## 📊 Performance Optimizations

### Frontend

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: React.lazy for heavy components
- **Memoization**: useMemo, useCallback for expensive operations
- **Bundle Size**: Tree-shaking with ES modules

### Backend

- **Connection Pooling**: Prisma connection management
- **Efficient Queries**: Prisma optimized SQL
- **WebSocket Broadcasting**: Batch updates every 100ms
- **Session Storage**: Client-side data caching

### Database

- **Indexes**: On frequently queried fields (roomCode, userName)
- **JSON Fields**: For flexible player/team data
- **Timestamps**: For sorting and filtering

---

## 🔄 Data Flow Summary

```
User Action (Browser)
    ↓
React Component (State Update)
    ↓
WebSocket Send / API Call
    ↓
Backend Server (Node.js)
    ↓
Database (PostgreSQL via Prisma)
    ↓
Response / Broadcast
    ↓
React Component (UI Update)
    ↓
User Sees Result
```

---

## 📚 Learning Resources

### Next.js

- Official Docs: https://nextjs.org/docs
- Learn Tutorial: https://nextjs.org/learn

### React

- Official Docs: https://react.dev
- React Hooks: https://react.dev/reference/react

### TypeScript

- Handbook: https://www.typescriptlang.org/docs/handbook/
- TypeScript + React: https://react-typescript-cheatsheet.netlify.app

### Prisma

- Getting Started: https://www.prisma.io/docs/getting-started
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

### Tailwind CSS

- Documentation: https://tailwindcss.com/docs
- Cheat Sheet: https://nerdcave.com/tailwind-cheat-sheet

### Framer Motion

- Documentation: https://www.framer.com/motion/
- Examples: https://www.framer.com/motion/examples/

---

## 🚀 Future Tech Enhancements

### Potential Additions

- **Redis**: For session management and caching
- **Socket.io**: Advanced WebSocket features
- **GraphQL**: Alternative to REST API
- **Docker**: Containerization for deployment
- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing
- **Sentry**: Error tracking and monitoring
- **Analytics**: User behavior tracking

---

**Technology stack optimized for performance, scalability, and developer experience!** 🚀
