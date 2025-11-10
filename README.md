# Cricket Auction Game (LOCAL DEV)

This project is an interactive auction simulator inspired by franchise cricket auctions. It runs a WebSocket auction server that manages AI bidding for 10 teams and a Next.js front-end with animated UI components.

What I implemented

- A standalone auction WebSocket server: `server/auction-server.js` (port 8080 by default).
- Server-side AI bidding using heuristics ported from `lib/auctioneer-logic.ts` (in `server/auction-logic.js`).
- Team rating engine ported from `lib/team-rating.ts` to `server/team-rating.js`; the server computes ratings when the auction completes and broadcasts results.
- Front-end wiring in `components/auction-arena.tsx` to connect to the WS server, select a team, place bids, and view live state.
- Client-side fallback: if no WS server is available the original local auction simulation still runs.

Quick start (Windows / PowerShell)

1. Install dependencies:

```powershell
pnpm install
# or
npm install
```

2. Install `ws` if your package manager didn't add optional dependencies automatically:

```powershell
pnpm add ws --workspace-root --save-optional
# or
npm install ws --save-optional
```

3. Start the auction server (separate terminal):

```powershell
pnpm start-server
# or
npm run start-server
```

4. Start the Next.js dev server:

```powershell
pnpm dev
# or
npm run dev
```

5. Open http://localhost:3000 and go to the Auction screen. Open multiple browser windows to simulate multiple clients. Select your team from the dropdown and place bids.

Notes & next steps

- Persistence: The server is in-memory; add a DB (SQLite/Postgres) if you need persistent auctions.
- Auth: Currently anyone can pick any team via dropdown. Add authentication and proper team claiming for real multiplayer.
- Tests: Minimal unit tests and CI are not yet added.
- UI polish: More animation, graphics and cricket theming can be improved further.

If you want, I can now:

- Add unit tests for auction logic and AI (recommended).
- Improve UI visuals and fix TypeScript strictness issues.
- Add persistence or convert server to TypeScript.
