/**
 * Safe storage utilities with error handling and type validation
 */

export const safeSessionStorage = {
  /**
   * Safely get item from sessionStorage with error handling
   */
  getItem<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null
    
    try {
      const item = sessionStorage.getItem(key)
      if (!item) return null
      
      // Try to parse JSON, return as-is if not valid JSON
      try {
        return JSON.parse(item) as T
      } catch {
        return item as T
      }
    } catch (error) {
      console.error(`Error reading from sessionStorage (${key}):`, error)
      return null
    }
  },

  /**
   * Safely set item in sessionStorage with error handling
   */
  setItem(key: string, value: unknown): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)
      sessionStorage.setItem(key, serialized)
      return true
    } catch (error) {
      console.error(`Error writing to sessionStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Safely remove item from sessionStorage
   */
  removeItem(key: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from sessionStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Clear all sessionStorage with error handling
   */
  clear(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      sessionStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
      return false
    }
  }
}

export const safeLocalStorage = {
  /**
   * Safely get item from localStorage with error handling
   */
  getItem<T = string>(key: string): T | null {
    if (typeof window === 'undefined') return null
    
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      
      // Try to parse JSON, return as-is if not valid JSON
      try {
        return JSON.parse(item) as T
      } catch {
        return item as T
      }
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return null
    }
  },

  /**
   * Safely set item in localStorage with error handling
   */
  setItem(key: string, value: unknown): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)
      localStorage.setItem(key, serialized)
      return true
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Safely remove item from localStorage
   */
  removeItem(key: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
      return false
    }
  },

  /**
   * Clear all localStorage with error handling
   */
  clear(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}
