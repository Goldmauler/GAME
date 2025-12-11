# Detailed Terms Reference - Complete Glossary

This document provides in-depth explanations of all programming terms, concepts, and patterns used in the IPL Auction Game.

---

## 🎯 Core React Concepts

### Component

**What it is:** A reusable piece of UI that combines HTML structure, styling, and logic.

**Think of it like:** A LEGO brick - small, reusable, can be combined to build bigger things.

**Types:**

- **Function Components** - Modern approach, uses functions
- **Class Components** - Old approach, uses classes (we don't use these)

**Example:**

```tsx
// A simple component
function PlayerCard({ player }) {
  return <div>{player.name}</div>;
}

// Components can use other components
function TeamRoster({ team }) {
  return (
    <div>
      {team.players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
```

---

### Props (Properties)

**What it is:** Data passed from parent component to child component. Think of it as function arguments.

**Rules:**

- ✅ Read-only (child can't modify props)
- ✅ Flow down (parent → child only)
- ✅ Can be any type (string, number, object, function, etc.)

**Example:**

```tsx
// Parent passes props
<PlayerCard
  name="Virat Kohli"
  role="Batsman"
  price={15000000}
  onSelect={() => handleSelect()}
/>;

// Child receives props
function PlayerCard({ name, role, price, onSelect }) {
  return (
    <div onClick={onSelect}>
      <h3>{name}</h3>
      <p>{role}</p>
      <span>${price}</span>
    </div>
  );
}
```

---

### State

**What it is:** Data that can change over time within a component. Component's memory.

**Characteristics:**

- ✅ Can be changed
- ✅ Triggers re-render when updated
- ✅ Local to the component (unless shared)
- ✅ Persists between renders

**State vs Props:**
| State | Props |
|-------|-------|
| Owned by component | Passed from parent |
| Can be changed | Read-only |
| Private | Public |
| Triggers re-render | Doesn't trigger re-render in child |

---

### JSX (JavaScript XML)

**What it is:** Syntax that looks like HTML but is actually JavaScript. Gets converted to regular JavaScript.

**Examples:**

```tsx
// JSX
const element = <h1>Hello World</h1>

// Gets converted to:
const element = React.createElement('h1', null, 'Hello World')

// JSX with expressions
const name = "Virat"
const element = <h1>Hello {name}</h1>  // {} for JavaScript

// JSX with attributes
<img src={player.image} alt={player.name} />

// JSX with conditionals
{isActive && <Badge>Active</Badge>}
{isWinner ? <Trophy /> : <Medal />}

// JSX with loops
{players.map(p => <PlayerCard key={p.id} player={p} />)}
```

**Important Rules:**

- Use `className` instead of `class`
- Use `onClick` instead of `onclick`
- Self-closing tags need `/`: `<img />`, `<input />`
- One root element (or use Fragment `<>...</>`)

---

## 🪝 Advanced Hooks Explained

### useMemo

**What it is:** Caches (memoizes) the result of an expensive calculation.

**Why it exists:**

- React re-runs all code on every render
- Sometimes calculations are expensive (sorting 10,000 items)
- useMemo remembers the result and only recalculates when dependencies change

**Syntax:**

```tsx
const memoizedValue = useMemo(() => expensiveFunction(), [dependencies]);
```

**Detailed Example:**

```tsx
// ❌ Without useMemo - SLOW
function PlayerList({ players }) {
  // This runs on EVERY render, even if players haven't changed!
  const sortedPlayers = players.sort((a, b) => b.price - a.price);

  return <div>{/* render players */}</div>;
}

// ✅ With useMemo - FAST
function PlayerList({ players }) {
  // Only sorts when players array changes
  const sortedPlayers = useMemo(() => {
    console.log("Sorting..."); // Only logs when players change
    return players.sort((a, b) => b.price - a.price);
  }, [players]); // Dependency: players

  return <div>{/* render players */}</div>;
}

// Real example from IPL Auction:
const particles = useMemo(() => {
  // Generate random particles ONCE
  return [...Array(20)].map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 10 + Math.random() * 20,
  }));
}, []); // Empty array = calculate once, never again
```

**When to use:**

- Expensive calculations (filtering/sorting large arrays)
- Creating objects/arrays used in dependencies
- Performance optimization
- Preventing hydration errors (server vs client mismatch)

**When NOT to use:**

- Simple calculations (just do them normally)
- Premature optimization (profile first!)
- Every single calculation (adds overhead)

---

### useCallback

**What it is:** Caches (memoizes) a function definition between renders.

**Why it exists:**
In JavaScript, functions are recreated on every render:

```tsx
function Component() {
  const handleClick = () => {}; // New function every render!
  return <ChildComponent onClick={handleClick} />;
}
```

This causes child components to re-render unnecessarily. `useCallback` solves this.

**Syntax:**

```tsx
const memoizedFunction = useCallback(() => {
  // function code
}, [dependencies]);
```

**Detailed Example:**

```tsx
// ❌ Without useCallback
function AuctionArena({ onBid }) {
  const [amount, setAmount] = useState(0);

  // New function created every render
  const handleBid = (playerId) => {
    onBid(playerId, amount);
  };

  // PlayerCard re-renders even if nothing changed!
  return <PlayerCard onBid={handleBid} />;
}

// ✅ With useCallback
function AuctionArena({ onBid }) {
  const [amount, setAmount] = useState(0);

  // Same function reference unless dependencies change
  const handleBid = useCallback(
    (playerId) => {
      onBid(playerId, amount);
    },
    [onBid, amount]
  ); // Re-create only when these change

  // PlayerCard only re-renders when handleBid actually changes
  return <PlayerCard onBid={handleBid} />;
}

// Real example from IPL Auction:
const handlePlayerSelect = useCallback((player: Player) => {
  setSelectedPlayer(player);
}, []); // No dependencies = same function forever

const sendMessage = useCallback((data: any) => {
  if (ws.current?.readyState === WebSocket.OPEN) {
    ws.current.send(JSON.stringify(data));
  }
}, []); // WebSocket is a ref, doesn't need to be in dependencies
```

**useCallback vs useMemo:**

```tsx
// useCallback - Memoizes the FUNCTION
const fn = useCallback(() => 42, []);
// fn is the function itself

// useMemo - Memoizes the RETURN VALUE
const value = useMemo(() => 42, []);
// value is 42, not the function

// They're related:
useCallback(fn, deps) === useMemo(() => fn, deps);
```

---

### useContext

**What it is:** Way to pass data through component tree without passing props manually at every level.

**The Problem it Solves:**

```tsx
// ❌ Prop Drilling - passing props through many levels
<App>
  <Header user={user} />
  <Sidebar user={user} />
  <Main>
    <Content>
      <DeepComponent user={user} /> {/* user passed through 4 levels! */}
    </Content>
  </Main>
</App>
```

**Solution with Context:**

```tsx
// Create context
const UserContext = createContext<User | null>(null);

// ✅ Provider at top
function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={user}>
      <Header />
      <Sidebar />
      <Main />
    </UserContext.Provider>
  );
}

// ✅ Consumer anywhere deep
function DeepComponent() {
  const user = useContext(UserContext); // Access directly!
  return <div>{user?.name}</div>;
}
```

**Complete Example:**

```tsx
// 1. Create context with type
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 2. Create provider component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// 3. Create custom hook for convenience
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// 4. Use in any component
function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className={theme}>
      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "dark" : "light"}
      </button>
    </div>
  );
}

// 5. Wrap app with provider
function App() {
  return (
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  );
}
```

**When to use Context:**

- Global state (user, theme, language)
- Avoid prop drilling
- Share data across many components
- Configuration/settings

**When NOT to use:**

- Frequent updates (can cause performance issues)
- Local component state
- Simple prop passing (2-3 levels is fine)

---

## 🔄 Rendering Concepts

### Re-render

**What it is:** When React updates the UI by calling your component function again.

**What triggers re-render:**

1. ✅ State changes (`setState`)
2. ✅ Props change (parent re-rendered with new props)
3. ✅ Context value changes
4. ✅ Parent component re-renders (child also re-renders)

**What happens during re-render:**

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  console.log("Rendering!"); // Logs on every render

  // This whole function runs again
  // Variables recreated
  // JSX returned
  // React compares with previous JSX
  // Updates only what changed in real DOM

  return <div>{count}</div>;
}
```

**Optimization:**

- `React.memo` - Skip re-render if props haven't changed
- `useMemo` - Cache expensive calculations
- `useCallback` - Cache function references

---

### Hydration

**What it is:** Process of attaching React to server-rendered HTML.

**The Flow:**

1. Server generates HTML → sends to browser
2. Browser displays HTML (fast, user sees content)
3. React JavaScript loads
4. React "hydrates" the HTML (adds interactivity)

**Hydration Error:**

```tsx
// ❌ Causes hydration error
function Component() {
  return <div>{Math.random()}</div>;
  // Server renders: <div>0.543</div>
  // Client renders: <div>0.891</div>
  // React: "These don't match!" ⚠️
}

// ✅ Fix with client-side only rendering
function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <div>{Math.random()}</div>;
  // Server: null (nothing)
  // Client: random number
  // No mismatch!
}
```

---

## 🌐 Next.js Specific Terms

### App Router

**What it is:** Next.js 13+ file-based routing system.

**How it works:**

```
app/
  page.tsx        → /
  about/
    page.tsx      → /about
  blog/
    [slug]/
      page.tsx    → /blog/:slug (dynamic)
  api/
    route.ts      → /api (API endpoint)
```

**Special Files:**

- `page.tsx` - Defines a route's UI
- `layout.tsx` - Shared UI for multiple pages
- `loading.tsx` - Loading state
- `error.tsx` - Error boundary
- `route.ts` - API endpoint

---

### Server Components (RSC)

**What it is:** Components that run ONLY on the server, never sent to browser.

**Benefits:**

- ✅ Zero JavaScript to client (faster)
- ✅ Can directly access database
- ✅ Better SEO
- ✅ Server-side data fetching

**Default in Next.js 13+:**

```tsx
// This is a Server Component (default)
async function Page() {
  // Can directly fetch on server!
  const players = await fetch("http://localhost:3000/api/players").then((res) =>
    res.json()
  );

  return <div>{players.map((p) => p.name)}</div>;
}
```

**Limitations:**

- ❌ No hooks (useState, useEffect, etc.)
- ❌ No event handlers (onClick, onChange)
- ❌ No browser APIs

---

### Client Components

**What it is:** Interactive components that run in the browser.

**When to use:**
Use "use client" when you need:

- React hooks (useState, useEffect, etc.)
- Event listeners (onClick, etc.)
- Browser APIs (localStorage, WebSocket, etc.)
- Third-party libraries using hooks

**Example:**

```tsx
"use client"; // ← This directive makes it a client component

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

---

## 🎨 Animation Terms (Framer Motion)

### Variants

**What it is:** Reusable animation configurations.

**Example:**

```tsx
const variants = {
  hidden: {
    opacity: 0,
    y: 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

### Stagger

**What it is:** Animating children one after another with delay.

```tsx
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1  // 100ms delay between each child
    }
  }
}

<motion.div variants={containerVariants} animate="visible">
  {items.map(item => (
    <motion.div variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### AnimatePresence

**What it is:** Enables exit animations when components are removed.

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} // ← Plays when removed!
    >
      Modal Content
    </motion.div>
  )}
</AnimatePresence>
```

---

## 📡 Network Terms

### WebSocket

**What it is:** Two-way communication channel between browser and server.

**HTTP vs WebSocket:**

```
HTTP (Traditional):
Client → Request → Server
Client ← Response ← Server
(Connection closes)

WebSocket:
Client ↔ Persistent Connection ↔ Server
(Both can send messages anytime)
```

**Example:**

```tsx
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  console.log("Connected");
  ws.send("Hello"); // Send message
};

ws.onmessage = (event) => {
  console.log("Received:", event.data); // Receive message
};

ws.onclose = () => {
  console.log("Disconnected");
};

ws.onerror = (error) => {
  console.error("Error:", error);
};
```

---

### API (Application Programming Interface)

**What it is:** Way for different software to talk to each other.

**REST API:**

```tsx
// GET - Fetch data
fetch("/api/players")
  .then((res) => res.json())
  .then((data) => console.log(data));

// POST - Send data
fetch("/api/rooms/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userName: "Virat" }),
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

### JSON (JavaScript Object Notation)

**What it is:** Text format for storing and transporting data.

```tsx
// JavaScript Object
const player = {
  name: "Virat Kohli",
  role: "Batsman",
  price: 15000000,
};

// Convert to JSON string
const json = JSON.stringify(player);
// '{"name":"Virat Kohli","role":"Batsman","price":15000000}'

// Convert back to object
const obj = JSON.parse(json);
```

---

## 🔧 TypeScript Terms

### Interface

**What it is:** Contract that defines the shape of an object.

```tsx
interface Player {
  id: string;
  name: string;
  role: "Batsman" | "Bowler" | "All-rounder" | "Keeper";
  basePrice: number;
  sold: boolean;
  soldPrice?: number; // ← Optional (may or may not exist)
}

// Use it
const player: Player = {
  id: "1",
  name: "Virat Kohli",
  role: "Batsman",
  basePrice: 15000000,
  sold: true,
  soldPrice: 17000000,
};
```

### Type

**What it is:** Defines a type alias (similar to interface but more flexible).

```tsx
// Union type
type Role = "Batsman" | "Bowler" | "All-rounder" | "Keeper";

// Type alias for function
type BidHandler = (playerId: string, amount: number) => void;

// Union of objects
type BidAction = { type: "bid"; amount: number };
type PassAction = { type: "pass" };
type Action = BidAction | PassAction; // Can be either!
```

### Generics

**What it is:** Types that work with any type (like a template).

```tsx
// Generic function
function getFirst<T>(array: T[]): T {
  return array[0];
}

const firstNumber = getFirst<number>([1, 2, 3]); // number
const firstString = getFirst<string>(["a", "b"]); // string

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
}

type PlayerResponse = ApiResponse<Player>;
// { data: Player, status: number }

type PlayersResponse = ApiResponse<Player[]>;
// { data: Player[], status: number }
```

---

## 🎯 Common Patterns Explained

### Controlled Components

**What it is:** Form inputs controlled by React state.

```tsx
function Form() {
  const [name, setName] = useState("");

  return (
    <input
      value={name} // React controls value
      onChange={(e) => setName(e.target.value)} // Update state
    />
  );
}
```

### Lifting State Up

**What it is:** Moving state to parent to share between children.

```tsx
// ❌ Separate states - can't communicate
function SiblingA() {
  const [data, setData] = useState("");
}
function SiblingB() {
  const [data, setData] = useState("");
}

// ✅ Shared state - both can access
function Parent() {
  const [data, setData] = useState("");

  return (
    <>
      <ChildA data={data} setData={setData} />
      <ChildB data={data} setData={setData} />
    </>
  );
}
```

### Composition

**What it is:** Building complex UIs from simple components.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Player Info</CardTitle>
  </CardHeader>
  <CardContent>
    <PlayerDetails player={player} />
  </CardContent>
  <CardFooter>
    <Button>Bid Now</Button>
  </CardFooter>
</Card>
```

---

## 📚 More Resources

### Official Docs

- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Framer Motion](https://www.framer.com/motion)

### Learn More

- React hooks in depth
- Next.js App Router guide
- TypeScript for beginners
- WebSocket communication
- State management patterns

---

**This reference covers all major terms! Use it alongside the main fundamentals guide.** 🚀
