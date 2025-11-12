# React & Next.js Fundamentals Guide

This comprehensive guide covers all the fundamental concepts, terms, and patterns used in the IPL Auction Game codebase. Each concept includes detailed descriptions, explanations, and real-world examples from the project.

---

## 📚 What You'll Learn

This guide explains:

- **React Hooks** - What they are, why they exist, and how to use them
- **Next.js Framework** - File-based routing, server components, and API routes
- **State Management** - Managing and sharing data across your application
- **Side Effects** - Handling external operations like API calls and timers
- **TypeScript** - Type safety and better development experience
- **Best Practices** - Patterns used by professional developers

---

## Table of Contents

1. [React Hooks](#react-hooks)
2. [Next.js Routing & Navigation](#nextjs-routing--navigation)
3. [Server vs Client Components](#server-vs-client-components)
4. [API Routes](#api-routes)
5. [State Management](#state-management)
6. [Side Effects & Data Fetching](#side-effects--data-fetching)
7. [Framer Motion Animations](#framer-motion-animations)
8. [TypeScript Basics](#typescript-basics)
9. [Common Patterns](#common-patterns)

---

## React Hooks

**📘 What are Hooks?**

Hooks are special functions that let you "hook into" React features from function components. Before hooks (introduced in React 16.8, 2019), you needed class components to use state and lifecycle methods. Hooks revolutionized React development.

**🎯 Why use Hooks?**

- ✅ **Simpler code** - No classes, just functions
- ✅ **Reusable logic** - Create custom hooks to share logic
- ✅ **Better organization** - Group related code together
- ✅ **Easier to test** - Pure functions are easier to test
- ✅ **Modern standard** - Industry best practice

**⚠️ Rules of Hooks:**

1. Only call hooks at the **top level** (not inside loops, conditions, or nested functions)
2. Only call hooks from **React function components** or **custom hooks**
3. Hook names must start with **"use"** (e.g., useState, useEffect, useMyCustomHook)

---

### 1. useState - Managing Component State

**📘 What is State?**

State is **data that can change over time** in your component. When state changes, React automatically re-renders the component to show the updated data on screen.

Think of state as the component's memory - it remembers values between renders.

**📘 What is useState?**

`useState` is a React Hook that adds a state variable to your component. It's like creating a special variable that React watches and updates the UI whenever it changes.

**Syntax:**

```tsx
const [stateValue, setStateValue] = useState(initialValue);
```

- `stateValue` - The current value of the state
- `setStateValue` - Function to update the state
- `initialValue` - The starting value (only used on first render)

**🔍 Detailed Examples:**

```tsx
import { useState } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 1: Simple Counter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const [count, setCount] = useState(0);
// count = 0 (current value)
// setCount = function to update count
// 0 = initial value

// Updating state:
setCount(5); // ❌ Direct value - can miss updates in rapid changes
setCount(count + 1); // ❌ Uses stale value - not recommended
setCount((prev) => prev + 1); // ✅ BEST - uses previous value, always correct

// Why functional update is better:
// If state changes rapidly (like multiple clicks), functional update ensures
// you always work with the latest value

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 2: Object State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 2: Object State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const [user, setUser] = useState({ name: "", age: 0 });

// ❌ WRONG - Mutating state directly
user.name = "Virat"; // Don't do this!

// ✅ CORRECT - Create new object with spread operator
setUser({ ...user, name: "Virat" }); // Keeps age, updates name
setUser({ name: "Virat", age: 35 }); // Sets both values

// Why? React compares object references, not values
// Mutating directly won't trigger re-render
// Creating new object tells React something changed

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 3: Array State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const [players, setPlayers] = useState<Player[]>([]);

// Adding item
setPlayers([...players, newPlayer]); // ✅ Spread + new item
setPlayers((prev) => [...prev, newPlayer]); // ✅ Better - functional update

// Removing item
setPlayers(players.filter((p) => p.id !== removeId)); // ✅ Filter creates new array

// Updating item
setPlayers(players.map((p) => (p.id === updateId ? { ...p, sold: true } : p))); // ✅ Map creates new array, spread updates specific item

// ❌ WRONG - Mutating methods
players.push(newPlayer); // Don't!
players.splice(0, 1); // Don't!
players[0] = newPlayer; // Don't!

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 4: Lazy Initialization
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// If initial state is expensive to compute, use function:

// ❌ Runs on every render (slow!)
const [data, setData] = useState(expensiveComputation());

// ✅ Runs only once on mount (fast!)
const [data, setData] = useState(() => {
  return expensiveComputation(); // Function runs only on first render
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Real Examples from IPL Auction Game:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
// Stores the player being auctioned (or null if no auction)

const [timeRemaining, setTimeRemaining] = useState(30);
// Auction timer countdown in seconds

const [isAuctionActive, setIsAuctionActive] = useState(false);
// Boolean flag - is auction currently running?

const [teams, setTeams] = useState<Team[]>([]);
// Array of all teams in the auction
```

**💡 When to use useState:**

- Component needs to remember something between renders
- Value changes based on user interaction
- Updating the value should trigger re-render
- Data is local to this component

**🚫 When NOT to use useState:**

- Value never changes (use regular const instead)
- Value can be calculated from other state (derive it instead)
- Value is needed across many components (use Context or props instead)

**Key Points:**

- State persists between re-renders
- Updating state triggers a re-render
- State updates are asynchronous
- Use functional updates when new state depends on old state:
  ```tsx
  setCount((prevCount) => prevCount + 1);
  ```

---

### 2. useEffect - Side Effects & Lifecycle

**📘 What are Side Effects?**

A "side effect" is any operation that affects something outside the component function, such as:

- 🌐 **Fetching data** from an API
- ⏰ **Setting up timers** or intervals
- 🔌 **Subscribing to external services** (WebSocket, event listeners)
- 💾 **Reading/writing to localStorage**
- 📄 **Updating the document title**
- 🖨️ **Logging to console**
- 🎨 **Manually changing the DOM**

**📘 What is useEffect?**

`useEffect` is a React Hook that lets you **perform side effects** in function components. It serves three purposes:

1. **Component Mount** - Run code when component first appears
2. **Component Update** - Run code when specific values change
3. **Component Unmount** - Clean up when component disappears

Think of it as the **lifecycle manager** for function components.

**🎯 Why useEffect exists:**

React components should be "pure" functions - they take props/state and return JSX. But real apps need to do "impure" things like fetch data or set timers. `useEffect` is where you put those operations.

**Syntax:**

```tsx
useEffect(() => {
  // Side effect code here

  return () => {
    // Cleanup code here (optional)
  };
}, [dependencies]);
```

**Three parts:**

1. **Effect function** - Your side effect code
2. **Cleanup function** - Runs before next effect and on unmount (optional)
3. **Dependency array** - Controls when effect runs

**🔍 Detailed Examples:**

````tsx
import { useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 1: Run Once on Mount (Empty Dependency Array)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
  console.log("Component mounted - runs ONCE");

  // Cleanup runs when component unmounts
  return () => {
    console.log("Component unmounted - cleanup");
  };
}, []); // ✅ Empty array = run once on mount

// Common uses:
// - Initial data fetching
// - Setting up WebSocket connections
// - Subscribing to external services
// - One-time setup code

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 2: Run When Dependencies Change
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
  console.log("Count changed:", count);
  document.title = `Count: ${count}`; // Update page title
}, [count]); // ✅ Runs when 'count' changes

// How it works:
// 1. Component renders with count = 0
// 2. Effect runs, sets title to "Count: 0"
// 3. User clicks button, count becomes 1
// 4. Component re-renders
// 5. Effect runs again, sets title to "Count: 1"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 3: Run on Every Render (NO Dependency Array)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
  console.log("Runs on every render");
}); // ⚠️ No array = runs every render (usually avoid this!)

// Dangerous! Can cause:
// - Performance issues
// - Infinite loops
// - Unnecessary API calls

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 4: Timer/Interval (from IPL Auction Game)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
  // Don't start timer if auction isn't active
  if (!isAuctionActive) return;

  // Start countdown timer
  const timer = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(timer); // Stop timer
        handleTimeout(); // Handle auction end
        return 0;
      }
      return prev - 1; // Decrease by 1 second
    });
  }, 1000); // Run every 1000ms (1 second)

  // ✅ CLEANUP - Very important!
  // Runs when:
  // 1. Component unmounts
  // 2. Before next effect runs (if isAuctionActive changes)
**💡 When to use useEffect:**
- Fetching data from APIs
- Setting up subscriptions (WebSocket, events)
- Timers and intervals
- Syncing with external systems (localStorage, browser APIs)
- Responding to prop/state changes

**🚫 When NOT to use useEffect:**
- Transforming data for rendering (do it during render)
- Handling user events (use event handlers instead)
- Updating state based on other state (use derived state or setter functions)

**Common Use Cases:**
- 🌐 Data fetching on mount
- ⏰ Timers and intervals
- 🔌 WebSocket connections
- 👂 Event listeners
- 💾 localStorage sync
- 📄 Document title updates

**Important Rules:**
1. ✅ Always cleanup side effects (return a cleanup function)
2. ✅ Be careful with dependencies to avoid infinite loops
3. ✅ Don't call hooks conditionally
4. ✅ Include all used variables in dependency array (or ESLint will warn you!)

---

### 3. useRef - Persisting Values Without Re-renders

**📘 What is a Ref?**

A "ref" (reference) is a special object that:
1. Persists across renders (like state)
2. **Does NOT trigger re-renders** when changed (unlike state)
3. Can hold any mutable value

**📘 What is useRef?**

`useRef` is a React Hook that returns a mutable ref object. The returned object will persist for the entire lifetime of the component.

**Syntax:**
```tsx
const refObject = useRef(initialValue)
````

- Returns an object with a `.current` property
- `.current` is mutable - you can change it
- Changing `.current` does NOT cause re-render

**🎯 Two Main Uses:**

1. **Accessing DOM elements** (most common)
2. **Storing mutable values** that don't need to trigger renders

**🔍 Detailed Examples:**

```tsx
import { useRef } from "react"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 1: Accessing DOM Elements
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const inputRef = useRef<HTMLInputElement>(null)

const focusInput = () => {
  // Access the actual DOM element
  inputRef.current?.focus()  // Focus the input
}

const getInputValue = () => {
  return inputRef.current?.value  // Read current value
}

// In JSX - attach ref to element
<input ref={inputRef} type="text" />
<button onClick={focusInput}>Focus Input</button>

// Common DOM operations with refs:
// - inputRef.current.focus()
// - inputRef.current.blur()
// - inputRef.current.scrollIntoView()
// - inputRef.current.select()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 2: Storing Mutable Values (from IPL Auction Game)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ws = useRef<WebSocket | null>(null)

useEffect(() => {
  // Create and store WebSocket
  ws.current = new WebSocket('ws://localhost:8080')

  ws.current.onmessage = (event) => {
    // WebSocket is still accessible
    handleMessage(event.data)
  }

  return () => {
    // Cleanup - close WebSocket
    ws.current?.close()
  }
}, [])

// Use ref value anywhere in component
const sendMessage = (data: any) => {
  // Check if WebSocket is connected
  if (ws.current?.readyState === WebSocket.OPEN) {
    ws.current.send(JSON.stringify(data))
  }
}

// Why use ref for WebSocket?
// - Need to access same instance across renders
// - Don't want to trigger re-render when WebSocket changes
// - Need to close it in cleanup

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 3: Storing Previous Value
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const previousValueRef = useRef<number>(0)

useEffect(() => {
  // After render, update previous value
  previousValueRef.current = count
}, [count])

// Now you can compare current vs previous
const delta = count - previousValueRef.current

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 4: Instance Variables (like class properties)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const renderCount = useRef(0)

useEffect(() => {
  // Track how many times component rendered
  renderCount.current += 1
  console.log(`Rendered ${renderCount.current} times`)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 5: Timer Reference
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const timerRef = useRef<NodeJS.Timeout | null>(null)

const startTimer = () => {
  // Clear existing timer
  if (timerRef.current) {
    clearInterval(timerRef.current)
  }

  // Start new timer
  timerRef.current = setInterval(() => {
    console.log('Tick')
  }, 1000)
}

const stopTimer = () => {
  if (timerRef.current) {
    clearInterval(timerRef.current)
    timerRef.current = null
  }
}

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }
}, [])
```

**📊 useState vs useRef Comparison:**

```tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useState - Triggers re-render
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const [count, setCount] = useState(0);

setCount(5); // ✅ Component re-renders, UI updates

// Use when:
// - Value needs to be displayed in UI
// - Changing value should update the screen

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useRef - Does NOT trigger re-render
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const countRef = useRef(0);

countRef.current = 5; // ❌ Component does NOT re-render, UI unchanged

// Use when:
// - Just need to store a value
// - Don't need UI to update when value changes
// - Want to access same instance across renders
```

**💡 When to use useRef:**

- Accessing DOM elements (focus, scroll, select, etc.)
- Storing timer/interval IDs
- Storing WebSocket/subscription instances
- Keeping track of previous values
- Storing any value that shouldn't trigger renders
- Implementing custom hooks that need instance variables

**🚫 When NOT to use useRef:**

- Value needs to be displayed in UI (use useState)
- Changing value should re-render component (use useState)
- Initial value is expensive to compute (use useMemo instead); // Run when auction starts/stops

// Why cleanup is critical:
// - Prevents memory leaks
// - Stops timers when component gone
// - Avoids updating unmounted components

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 5: WebSocket Connection (from IPL Auction Game)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
// Create WebSocket connection
const ws = new WebSocket("ws://localhost:8080");

// Set up event handlers
ws.onopen = () => {
console.log("Connected to server");
setConnected(true);
};

ws.onmessage = (event) => {
const data = JSON.parse(event.data);
handleMessage(data); // Process incoming messages
};

ws.onerror = (error) => {
console.error("WebSocket error:", error);
};

ws.onclose = () => {
console.log("Disconnected from server");
setConnected(false);
};

// ✅ CLEANUP - Close connection when component unmounts
return () => {
ws.close();
};
}, []); // Empty array = connect once on mount

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 6: Data Fetching
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
// Async function inside useEffect
const fetchPlayers = async () => {
try {
const response = await fetch("/api/players");
const data = await response.json();
setPlayers(data);
} catch (error) {
console.error("Failed to fetch:", error);
setError(error.message);
} finally {
setLoading(false);
}
};

fetchPlayers();
}, []); // Fetch once on mount

// Why not async useEffect directly?
// ❌ useEffect(() => async () => {}, []) // Wrong!
// useEffect expects either nothing or a cleanup function
// Async functions return promises, not cleanup functions

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 7: Multiple Dependencies
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
// Runs when EITHER playerId OR teamId changes
console.log(`Player ${playerId} in team ${teamId}`);
}, [playerId, teamId]); // Multiple dependencies

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Example 8: Conditional Effect
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useEffect(() => {
// Guard clause - exit early if condition not met
if (!roomCode) return;

// Only runs if roomCode exists
const fetchRoom = async () => {
const response = await fetch(`/api/rooms/${roomCode}`);
const data = await response.json();
setRoom(data);
};

fetchRoom();
}, [roomCode]); // Re-fetch when roomCode changes

```

**📊 useEffect Execution Timeline:**

```

Component Lifecycle:
┌─────────────┐
│ Mount │ → useEffect(() => {...}, []) runs
│ (First │
│ Render) │
└─────────────┘
│
↓
┌─────────────┐
│ Update │ → useEffect(() => {...}, [dep]) runs
│ (Dep │ (only if dependency changed)
│ Changed) │
└─────────────┘
│
↓
┌─────────────┐
│ Unmount │ → Cleanup function runs
│ (Remove │ return () => {...}
│ from DOM) │
└─────────────┘

````

**⚠️ Common Pitfalls:**

```tsx
// ❌ INFINITE LOOP - Missing dependency
useEffect(() => {
  setCount(count + 1); // count changes, triggers re-render
}, []); // But count not in dependencies - stale value!

// ❌ INFINITE LOOP - Object/array in dependencies
useEffect(() => {
  console.log(config);
}, [config]); // If config is new object each render = infinite loop!

// ✅ FIX - Use primitive values or useMemo
useEffect(() => {
  console.log(config.id);
}, [config.id]); // Only track specific primitive value

// ❌ Missing cleanup
useEffect(() => {
  window.addEventListener("resize", handleResize);
  // Forgot to remove listener!
}, []);

// ✅ With cleanup
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
````

**💡 When to use useEffect:**

return () => clearInterval(timer); // Cleanup!
}, [isAuctionActive]);

// WebSocket connection
useEffect(() => {
const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (event) => {
const data = JSON.parse(event.data);
handleMessage(data);
};

return () => ws.close(); // Cleanup!
}, []);

// Data fetching
useEffect(() => {
const fetchPlayers = async () => {
const response = await fetch("/api/players");
const data = await response.json();
setPlayers(data);
};

fetchPlayers();
}, []);

````

**Common Use Cases:**

- Fetching data from APIs
- Setting up subscriptions (WebSocket, event listeners)
- Timers and intervals
- Updating document title
- Syncing with external systems

**Important Rules:**

1. Always cleanup side effects (return a cleanup function)
2. Be careful with dependencies to avoid infinite loops
3. Don't call hooks conditionally

---

### 3. useRef - Persisting Values Without Re-renders

```tsx
import { useRef } from "react";

// DOM reference
const inputRef = useRef<HTMLInputElement>(null);

// Access DOM element
const focusInput = () => {
  inputRef.current?.focus();
};

// In JSX
<input ref={inputRef} type="text" />;

// Persisting values between renders (without triggering re-render)
const wsRef = useRef<WebSocket | null>(null);
const previousValueRef = useRef<number>(0);

// Examples from our codebase:

// WebSocket reference
const ws = useRef<WebSocket | null>(null);

useEffect(() => {
  ws.current = new WebSocket("ws://localhost:8080");

  return () => ws.current?.close();
}, []);

const sendMessage = (data: any) => {
  if (ws.current?.readyState === WebSocket.OPEN) {
    ws.current.send(JSON.stringify(data));
  }
};
````

**useState vs useRef:**

- `useState`: Triggers re-render when updated
- `useRef`: Does NOT trigger re-render when updated

---

### 4. useMemo - Memoizing Expensive Computations

```tsx
import { useMemo } from "react";

// Expensive computation
const expensiveValue = useMemo(() => {
  return players
    .filter((p) => p.role === "Batsman")
    .sort((a, b) => b.basePrice - a.basePrice);
}, [players]); // Only recompute when players change

// Examples from our codebase:

// Particle generation (hydration fix)
const particles = useMemo(() => {
  return [...Array(20)].map(() => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    xOffset: (Math.random() - 0.5) * 100,
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 5,
  }));
}, []); // Empty array = compute once

// Filtered/sorted data
const availablePlayers = useMemo(() => {
  return players.filter((p) => !p.sold);
}, [players]);

// Team calculations
const teamBudget = useMemo(() => {
  return (
    teams[currentTeam].budget -
    teams[currentTeam].players.reduce((sum, p) => sum + p.soldPrice, 0)
  );
}, [teams, currentTeam]);
```

**When to use:**

- Heavy computations (filtering, sorting large arrays)
- Preventing unnecessary re-calculations
- Fixing hydration issues (server/client mismatch)

---

### 5. useCallback - Memoizing Functions

```tsx
import { useCallback } from "react"

// Without useCallback - new function on every render
const handleClick = () => {
  console.log(count)
}

// With useCallback - same function reference
const handleClick = useCallback(() => {
  console.log(count)
}, [count])

// Examples from our codebase:

const handleBid = useCallback((amount: number) => {
  if (ws.current?.readyState === WebSocket.OPEN) {
    ws.current.send(JSON.stringify({
      type: 'bid',
      teamId: currentTeam,
      amount: amount
    }))
  }
}, [currentTeam])

// Prevent child component re-renders
const handlePlayerSelect = useCallback((player: Player) => {
  setSelectedPlayer(player)
}, [])

<PlayerCard onSelect={handlePlayerSelect} /> // Won't re-render unnecessarily
```

**When to use:**

- Passing callbacks to child components (prevents unnecessary re-renders)
- Dependencies in other hooks
- Event handlers that depend on state/props

---

### 6. useContext - Sharing Data Across Components

```tsx
import { createContext, useContext } from "react";

// Create context
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Usage in components
function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme}</button>;
}
```

---

## Next.js Routing & Navigation

### 1. File-Based Routing (App Router)

```
app/
  page.tsx              → / (home page)
  layout.tsx            → Root layout (wraps all pages)

  rooms/
    page.tsx            → /rooms

  room/
    [roomCode]/
      page.tsx          → /room/:roomCode (dynamic route)

  leaderboard/
    page.tsx            → /leaderboard

  api/
    players/
      route.ts          → /api/players (API endpoint)
```

**Route Types:**

- **Static Routes:** `app/about/page.tsx` → `/about`
- **Dynamic Routes:** `app/room/[roomCode]/page.tsx` → `/room/ABC123`
- **Catch-all Routes:** `app/blog/[...slug]/page.tsx` → `/blog/a/b/c`

---

### 2. Navigation Methods

#### a) Link Component (Prefetching)

```tsx
import Link from "next/link"

// Basic navigation
<Link href="/rooms">View Rooms</Link>

// Dynamic routes
<Link href={`/room/${roomCode}`}>Join Room</Link>

// With styling
<Link
  href="/leaderboard"
  className="text-blue-500 hover:underline"
>
  Leaderboard
</Link>

// Examples from our codebase:
<Link href="/">
  <Button variant="outline">Back to Home</Button>
</Link>

<Link href={`/room/${room.code}`}>
  <Button>Join Room</Button>
</Link>
```

**Benefits:**

- Automatic prefetching (loads page in background)
- Client-side navigation (no page reload)
- Better performance

---

#### b) useRouter Hook (Programmatic Navigation)

```tsx
import { useRouter } from "next/navigation";

function MyComponent() {
  const router = useRouter();

  // Navigate to page
  const goToRooms = () => {
    router.push("/rooms");
  };

  // Navigate with replace (no history entry)
  const replaceRoute = () => {
    router.replace("/leaderboard");
  };

  // Go back
  const goBack = () => {
    router.back();
  };

  // Refresh current route
  const refresh = () => {
    router.refresh();
  };

  // Navigate with state/params
  const joinRoom = (code: string) => {
    router.push(`/room/${code}`);
  };

  return <button onClick={goToRooms}>Navigate</button>;
}
```

**Methods:**

- `push(href)` - Navigate (adds to history)
- `replace(href)` - Navigate (replaces history)
- `back()` - Go to previous page
- `forward()` - Go to next page
- `refresh()` - Refresh current route

---

#### c) useParams - Getting Route Parameters

```tsx
import { useParams } from "next/navigation";

// In app/room/[roomCode]/page.tsx
function RoomPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;

  return <div>Room Code: {roomCode}</div>;
}

// Multiple dynamic segments
// app/blog/[category]/[slug]/page.tsx
function BlogPost() {
  const params = useParams();
  const category = params.category as string;
  const slug = params.slug as string;

  return (
    <div>
      {category} - {slug}
    </div>
  );
}
```

---

#### d) useSearchParams - Query Parameters

```tsx
import { useSearchParams } from "next/navigation";

function SearchPage() {
  const searchParams = useSearchParams();

  // Get query param: /search?q=cricket&filter=players
  const query = searchParams.get("q"); // "cricket"
  const filter = searchParams.get("filter"); // "players"

  return <div>Searching for: {query}</div>;
}

// Setting query params
import { useRouter } from "next/navigation";

function Filter() {
  const router = useRouter();

  const setFilter = (filter: string) => {
    router.push(`/search?filter=${filter}`);
  };

  return <button onClick={() => setFilter("players")}>Filter</button>;
}
```

---

### 3. Navigation Examples from Codebase

```tsx
// Joining a room
const router = useRouter()

const joinRoom = (roomCode: string) => {
  router.push(`/room/${roomCode}`)
}

// Creating and joining a new room
const createRoom = async () => {
  const response = await fetch('/api/rooms/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName })
  })

  const data = await response.json()
  router.push(`/room/${data.roomCode}`)
}

// Conditional navigation after auction
useEffect(() => {
  if (auctionComplete) {
    setTimeout(() => {
      router.push('/leaderboard')
    }, 3000)
  }
}, [auctionComplete])

// Back to home
<Link href="/">
  <Button variant="ghost">
    <ArrowLeft className="mr-2" /> Back
  </Button>
</Link>
```

---

## Server vs Client Components

### Server Components (Default in Next.js 13+)

```tsx
// app/page.tsx - Server Component by default

// Can fetch data directly
async function HomePage() {
  const players = await fetch("http://localhost:3000/api/players").then((res) =>
    res.json()
  );

  return (
    <div>
      <h1>Players</h1>
      {players.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}

export default HomePage;
```

**Benefits:**

- Runs on server only
- No JavaScript sent to client
- Can directly access database
- Better performance
- SEO friendly

**Limitations:**

- No hooks (useState, useEffect, etc.)
- No event listeners (onClick, onChange, etc.)
- No browser APIs

---

### Client Components

```tsx
"use client"; // This directive makes it a client component

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**When to use "use client":**

- Using React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, WebSocket, etc.)
- Third-party libraries that use hooks

**All our components are client components because we use:**

- `useState` for auction state
- `useEffect` for WebSocket connections
- Event handlers for bidding

---

## API Routes

### 1. Creating API Endpoints

```typescript
// app/api/players/route.ts

import { NextRequest, NextResponse } from "next/server";

// GET request
export async function GET(request: NextRequest) {
  try {
    const players = await fetchPlayersFromDB();

    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

// POST request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, basePrice } = body;

    const player = await createPlayer({ name, role, basePrice });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
```

---

### 2. Dynamic API Routes

```typescript
// app/api/players/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const player = await getPlayerById(id);

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(player);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await deletePlayer(id);

  return NextResponse.json({ success: true });
}
```

---

### 3. Examples from Our Codebase

```typescript
// app/api/players/route.ts
export async function GET() {
  try {
    const players = await prisma.player.findMany();
    return NextResponse.json(players);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}

// app/api/rooms/create/route.ts
export async function POST(request: NextRequest) {
  const { userName } = await request.json();

  const roomCode = generateRoomCode();

  const room = await prisma.room.create({
    data: { code: roomCode, host: userName },
  });

  return NextResponse.json({ roomCode: room.code });
}

// Calling API from client
const fetchPlayers = async () => {
  const response = await fetch("/api/players");
  const data = await response.json();
  setPlayers(data);
};
```

---

## State Management

### 1. Local State (useState)

```tsx
// Single component state
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

**Use when:**

- State only needed in one component
- Simple data

---

### 2. Lifting State Up

```tsx
// Parent component
function AuctionApp() {
  const [currentBid, setCurrentBid] = useState(0);

  return (
    <>
      <BidDisplay bid={currentBid} />
      <BidControls onBid={setCurrentBid} />
    </>
  );
}

// Child 1
function BidDisplay({ bid }: { bid: number }) {
  return <div>Current Bid: ${bid}</div>;
}

// Child 2
function BidControls({ onBid }: { onBid: (bid: number) => void }) {
  return <button onClick={() => onBid(100)}>Bid $100</button>;
}
```

**Use when:**

- Multiple components need same state
- Sibling components need to communicate

---

### 3. WebSocket State Sync (Our Approach)

```tsx
function AuctionRoom() {
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: null,
    teams: [],
    currentBid: 0,
  });

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      // Server sends full game state
      setGameState(update.gameState);
    };

    return () => ws.close();
  }, []);

  const placeBid = (amount: number) => {
    ws.send(
      JSON.stringify({
        type: "bid",
        amount,
      })
    );
    // Don't update state here!
    // Wait for server to broadcast the update
  };
}
```

**Key Pattern:**

- Single source of truth (server)
- Clients send actions
- Server broadcasts state updates
- All clients stay in sync

---

## Side Effects & Data Fetching

### 1. Fetching on Component Mount

```tsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch("/api/players");
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

---

### 2. Fetching with Dependencies

```tsx
// Fetch when roomCode changes
useEffect(() => {
  if (!roomCode) return;

  const fetchRoom = async () => {
    const response = await fetch(`/api/rooms/${roomCode}`);
    const data = await response.json();
    setRoom(data);
  };

  fetchRoom();
}, [roomCode]);
```

---

### 3. Debounced Fetching

```tsx
// Search with debounce
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery) {
      searchPlayers(searchQuery);
    }
  }, 500); // Wait 500ms after user stops typing

  return () => clearTimeout(timer);
}, [searchQuery]);
```

---

### 4. Polling (Periodic Fetching)

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchLeaderboard();
  }, 5000); // Every 5 seconds

  return () => clearInterval(interval);
}, []);
```

---

## Framer Motion Animations

### 1. Basic Animations

```tsx
import { motion } from "framer-motion"

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// Slide in from left
<motion.div
  initial={{ x: -100 }}
  animate={{ x: 0 }}
  transition={{ type: "spring" }}
>
  Content
</motion.div>

// Scale up
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 260, damping: 20 }}
>
  Content
</motion.div>
```

---

### 2. AnimatePresence (Exit Animations)

```tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      Modal Content
    </motion.div>
  )}
</AnimatePresence>;
```

**Key:** Component must have a unique `key` prop for AnimatePresence to track it.

---

### 3. Examples from Our Codebase

```tsx
// Player card entrance
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  className="player-card"
>
  {player.name}
</motion.div>

// Bid button pulse
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  animate={{
    boxShadow: [
      "0 0 0 0 rgba(34, 197, 94, 0)",
      "0 0 0 10px rgba(34, 197, 94, 0.4)",
      "0 0 0 0 rgba(34, 197, 94, 0)"
    ]
  }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  Place Bid
</motion.button>

// Timer countdown
<motion.div
  animate={{
    scale: timeRemaining < 5 ? [1, 1.2, 1] : 1,
    color: timeRemaining < 5 ? "#ef4444" : "#ffffff"
  }}
  transition={{ duration: 0.5 }}
>
  {timeRemaining}s
</motion.div>

// Floating particles
<motion.div
  animate={{
    y: [0, -20, 0],
    x: [0, 10, 0]
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }}
  className="particle"
/>
```

---

### 4. Variants (Reusable Animations)

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: { duration: 0.3 }
  }
}

<motion.div
  variants={cardVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  Content
</motion.div>

// Staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

---

## TypeScript Basics

### 1. Type Annotations

```typescript
// Variables
const name: string = "Virat Kohli";
const age: number = 35;
const isActive: boolean = true;

// Arrays
const numbers: number[] = [1, 2, 3];
const names: string[] = ["Virat", "Rohit"];
const mixed: (string | number)[] = ["Virat", 35];

// Objects
const player: {
  name: string;
  age: number;
  role: string;
} = {
  name: "Virat Kohli",
  age: 35,
  role: "Batsman",
};
```

---

### 2. Interfaces

```typescript
// Player interface
interface Player {
  id: string;
  name: string;
  role: "Batsman" | "Bowler" | "All-rounder" | "Keeper";
  basePrice: number;
  sold: boolean;
  soldPrice?: number; // Optional
  team?: string; // Optional
}

// Team interface
interface Team {
  id: string;
  name: string;
  color: string;
  budget: number;
  players: Player[];
}

// Function with interface
function addPlayerToTeam(player: Player, team: Team): Team {
  return {
    ...team,
    players: [...team.players, player],
    budget: team.budget - player.soldPrice!,
  };
}
```

---

### 3. Type Aliases

```typescript
// Similar to interfaces, but more flexible
type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Keeper";

type BidAction = {
  type: "bid";
  teamId: string;
  amount: number;
};

type PassAction = {
  type: "pass";
  teamId: string;
};

type AuctionAction = BidAction | PassAction;

// Using union types
function handleAction(action: AuctionAction) {
  if (action.type === "bid") {
    console.log(`Bid: $${action.amount}`);
  } else {
    console.log("Pass");
  }
}
```

---

### 4. Generics

```typescript
// Generic function
function getFirstItem<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNumber = getFirstItem<number>([1, 2, 3]); // number
const firstString = getFirstItem<string>(["a", "b"]); // string

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type PlayerResponse = ApiResponse<Player>;
type PlayersResponse = ApiResponse<Player[]>;

// React component with generics
interface SelectProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

function Select<T>({ items, onSelect, renderItem }: SelectProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} onClick={() => onSelect(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
```

---

### 5. React TypeScript Patterns

```typescript
// Component props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

function Button({
  label,
  onClick,
  variant = "primary",
  disabled,
}: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// Children prop
interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Event handlers
interface FormProps {
  onSubmit: (data: { name: string; email: string }) => void;
}

function Form({ onSubmit }: FormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ...
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Clicked");
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// Ref types
const inputRef = useRef<HTMLInputElement>(null);
const divRef = useRef<HTMLDivElement>(null);
const wsRef = useRef<WebSocket | null>(null);
```

---

## Common Patterns

### 1. Loading States

```tsx
function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/players");
        const data = await response.json();
        setPlayers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {players.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

---

### 2. Conditional Rendering

```tsx
// If-else
{
  isLoggedIn ? <Dashboard /> : <Login />;
}

// Logical AND
{
  error && <ErrorMessage error={error} />;
}

// Logical OR (fallback)
{
  username || "Guest";
}

// Multiple conditions
{
  loading ? (
    <Spinner />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <DataDisplay data={data} />
  );
}

// Early return
function PlayerCard({ player }: { player: Player | null }) {
  if (!player) return null;

  return <div>{player.name}</div>;
}
```

---

### 3. List Rendering

```tsx
// Basic list
{
  players.map((player) => <PlayerCard key={player.id} player={player} />);
}

// With index (avoid if possible)
{
  players.map((player, index) => <PlayerCard key={index} player={player} />);
}

// Filtered list
{
  players
    .filter((p) => p.role === "Batsman")
    .map((player) => <PlayerCard key={player.id} player={player} />);
}

// Sorted list
{
  players
    .sort((a, b) => b.basePrice - a.basePrice)
    .map((player) => <PlayerCard key={player.id} player={player} />);
}
```

---

### 4. Form Handling

```tsx
function AuctionForm() {
  const [formData, setFormData] = useState({
    teamName: "",
    budget: 1000000,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="teamName"
        value={formData.teamName}
        onChange={handleChange}
      />
      <input
        name="budget"
        type="number"
        value={formData.budget}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### 5. WebSocket Pattern

```tsx
function AuctionRoom() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Connected");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Disconnected");
      setConnected(false);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (data: any) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  return <div>{connected ? "Connected" : "Connecting..."}</div>;
}
```

---

### 6. Timer Pattern

```tsx
function AuctionTimer() {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const start = () => {
    setTimeRemaining(30);
    setIsActive(true);
  };

  const stop = () => {
    setIsActive(false);
  };

  return (
    <div>
      <div>{timeRemaining}s</div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

---

### 7. Modal Pattern

```tsx
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="bg-white p-6 rounded-lg">
                <h2>Modal Title</h2>
                <button onClick={() => setIsOpen(false)}>Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## Best Practices

### 1. Component Organization

```tsx
// ✅ Good: Single responsibility
function PlayerCard({ player }: { player: Player }) {
  return <div>{player.name}</div>;
}

function PlayerList({ players }: { players: Player[] }) {
  return (
    <div>
      {players.map((p) => (
        <PlayerCard key={p.id} player={p} />
      ))}
    </div>
  );
}

// ❌ Bad: Too much in one component
function PlayerListAndCardAndEverything() {
  // Hundreds of lines...
}
```

---

### 2. Props vs State

```tsx
// ✅ Use props for data from parent
function PlayerCard({ player }: { player: Player }) {
  return <div>{player.name}</div>;
}

// ✅ Use state for component-specific data
function ExpandableCard({ player }: { player: Player }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      {player.name}
      {isExpanded && <PlayerDetails player={player} />}
    </div>
  );
}
```

---

### 3. useEffect Dependencies

```tsx
// ✅ Include all dependencies
useEffect(() => {
  fetchPlayer(playerId);
}, [playerId]);

// ❌ Missing dependencies
useEffect(() => {
  fetchPlayer(playerId); // Warning!
}, []);

// ✅ If function is needed, use useCallback
const fetchPlayer = useCallback((id: string) => {
  // fetch logic
}, []);

useEffect(() => {
  fetchPlayer(playerId);
}, [playerId, fetchPlayer]);
```

---

### 4. Avoid Prop Drilling

```tsx
// ❌ Bad: Props passed through many levels
<App>
  <Header user={user} />
  <Content user={user} />
  <Footer user={user} />
</App>

// ✅ Good: Use Context
const UserContext = createContext<User | null>(null)

<UserContext.Provider value={user}>
  <App>
    <Header />
    <Content />
    <Footer />
  </App>
</UserContext.Provider>

// In child components
const user = useContext(UserContext)
```

---

### 5. Error Boundaries

```tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <AuctionArena />
</ErrorBoundary>;
```

---

## Quick Reference

### Common Hooks

- `useState` - Component state
- `useEffect` - Side effects
- `useRef` - Persisting values
- `useMemo` - Memoize values
- `useCallback` - Memoize functions
- `useContext` - Access context

### Navigation

- `<Link href="/path">` - Client-side navigation
- `useRouter()` - Programmatic navigation
- `useParams()` - Route parameters
- `useSearchParams()` - Query parameters

### TypeScript

- `interface` - Object types
- `type` - Type aliases
- `<T>` - Generics
- `?` - Optional properties
- `|` - Union types
- `&` - Intersection types

### Patterns

- Lifting state up
- Conditional rendering
- List rendering with `map()`
- Form handling
- Loading states
- Error handling
- Modal/Dialog patterns
- WebSocket connections

---

## Resources

- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

**Happy Coding! 🚀**
