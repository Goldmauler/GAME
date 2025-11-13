"use client"

import { useEffect, useState } from "react"

export function useReduceMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    // Check for user preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setShouldReduceMotion(mediaQuery.matches)

    // Also reduce motion on slow connections
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
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
