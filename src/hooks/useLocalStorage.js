import { useEffect, useState } from 'react'

/**
 * Small generic hook for lightweight UI preferences (sidebar collapsed,
 * chosen soundscape, volume, etc.) that don't need the structured
 * `src/lib/storage.js` adapter used for core game state.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage unavailable (e.g. private mode quota) - fail silently
    }
  }, [key, value])

  return [value, setValue]
}
