import type { MaxDurations } from '~core/types'

export const STORAGE_KEYS = {
  ADDRESSES: 'uprent_commute_addresses',
  MAX_DURATIONS: 'uprent_commute_max_durations',
} as const

export const DefaultMaxDurations: MaxDurations = {
  walking: null,
  driving: null,
  transit: null,
  biking: null,
}

export const MockAddresses = [
  '123 Main St, New York, NY 10001',
  '456 Broadway, New York, NY 10013',
  '789 Park Ave, New York, NY 10021',
  '321 Fifth Ave, New York, NY 10016',
  '654 Madison Ave, New York, NY 10065',
  '987 Lexington Ave, New York, NY 10021',
  '147 Wall Street, New York, NY 10005',
  '258 Columbus Ave, New York, NY 10023',
  '369 Amsterdam Ave, New York, NY 10024',
  '741 West End Ave, New York, NY 10025',
] as const
