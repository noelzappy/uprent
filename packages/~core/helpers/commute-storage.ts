import type { Address, MaxDurations } from '~core/types'
import {
  DefaultMaxDurations,
  STORAGE_KEYS,
} from '~core/constants/commute-constants'

export const commuteStorage = {
  getAddresses(): Address[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ADDRESSES)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  saveAddresses(addresses: Address[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses))
    } catch (error) {
      console.error('Failed to save addresses:', error)
    }
  },

  getMaxDurations(): MaxDurations {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MAX_DURATIONS)
      return stored ? JSON.parse(stored) : DefaultMaxDurations
    } catch {
      return DefaultMaxDurations
    }
  },

  saveMaxDurations(maxDurations: MaxDurations): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.MAX_DURATIONS,
        JSON.stringify(maxDurations),
      )
    } catch (error) {
      console.error('Failed to save max durations:', error)
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ADDRESSES)
      localStorage.removeItem(STORAGE_KEYS.MAX_DURATIONS)
    } catch (error) {
      console.error('Failed to clear commute storage:', error)
    }
  },
}
