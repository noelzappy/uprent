import type { Address, MaxDurations } from '~core/types'
import {
  DefaultMaxDurations,
  STORAGE_KEYS,
} from '~core/constants/commute-constants'

export const extensionCommuteStorage = {
  getAddresses(): Promise<Address[]> {
    return new Promise(resolve => {
      chrome.storage.local.get([STORAGE_KEYS.ADDRESSES], result => {
        resolve(result[STORAGE_KEYS.ADDRESSES] || [])
      })
    })
  },

  saveAddresses(addresses: Address[]): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.set(
        {
          [STORAGE_KEYS.ADDRESSES]: addresses,
        },
        () => {
          resolve()
        },
      )
    })
  },

  getMaxDurations(): Promise<MaxDurations> {
    return new Promise(resolve => {
      chrome.storage.local.get([STORAGE_KEYS.MAX_DURATIONS], result => {
        resolve(result[STORAGE_KEYS.MAX_DURATIONS] || DefaultMaxDurations)
      })
    })
  },

  saveMaxDurations(maxDurations: MaxDurations): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.set(
        {
          [STORAGE_KEYS.MAX_DURATIONS]: maxDurations,
        },
        () => {
          resolve()
        },
      )
    })
  },

  clear(): void {
    chrome.storage.local.remove([
      STORAGE_KEYS.ADDRESSES,
      STORAGE_KEYS.MAX_DURATIONS,
    ])
  },
}
