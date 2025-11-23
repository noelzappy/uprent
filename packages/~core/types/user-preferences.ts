import type { Address } from './address'
import type { MaxDurations } from './max-durations'

export interface DBUserPreferences extends MaxDurations {
  addresses: string
}

export interface UserPreferences {
  addresses: Address[]
  maxDurations: MaxDurations
}
