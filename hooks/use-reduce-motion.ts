"use client"

import { useEffect, useState } from "react"

// Define NetworkInformation interface
interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export function useReduceMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    // Check for user preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setShouldReduceMotion(mediaQuery.matches)

    // Also reduce motion on slow connections
    if ('connection' in navigator) {
      const conn = (navigator as NavigatorWithConnection).connection
      if (conn && (conn.saveData || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g')) {
        setShouldReduceMotion(true)
      }
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return shouldReduceMotion
}
