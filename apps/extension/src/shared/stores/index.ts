import type { Address, MaxDurations } from '~core/types'
import {
  DefaultMaxDurations,
  STORAGE_KEYS,
} from '~core/constants/commute-constants'

import api from '~api'

export const extensionCommuteStorage = {
  async getSessionId(): Promise<string> {
    return await new Promise(resolve => {
      chrome.storage.local.get(['userSessionId'], result => {
        if (result.userSessionId) {
          resolve(result.userSessionId)
        } else {
          const newId = crypto.randomUUID()
          chrome.storage.local.set({ userSessionId: newId }, () => {
            resolve(newId)
          })
        }
      })
    })
  },

  async syncFromServer(): Promise<void> {
    const userSessionId = await this.getSessionId()
    const { data } = await api.commute.preferences.get({
      $query: { userSessionId },
    })

    if (data && 'status' in data && data.status === 'success') {
      const { addresses, maxDurations } = data.payload.preferences
      await new Promise<void>(resolve => {
        chrome.storage.local.set(
          {
            [STORAGE_KEYS.ADDRESSES]: addresses,
            [STORAGE_KEYS.MAX_DURATIONS]: maxDurations,
          },
          () => resolve(),
        )
      })
    }
  },

  async syncToServer(
    addresses: Address[],
    maxDurations: MaxDurations,
  ): Promise<void> {
    const userSessionId = await this.getSessionId()
    await api.commute.preferences.post({
      userSessionId,
      preferences: {
        addresses,
        maxDurations,
      },
    })
  },

  async getData(): Promise<{
    addresses: Address[]
    maxDurations: MaxDurations
  }> {
    return await new Promise(resolve => {
      this.syncFromServer().then(() => {
        chrome.storage.local.get(
          [STORAGE_KEYS.ADDRESSES, STORAGE_KEYS.MAX_DURATIONS],
          result => {
            resolve({
              addresses: result[STORAGE_KEYS.ADDRESSES] || [],
              maxDurations:
                result[STORAGE_KEYS.MAX_DURATIONS] || DefaultMaxDurations,
            })
          },
        )
      })
    })
  },

  clear(): void {
    chrome.storage.local.remove([
      STORAGE_KEYS.ADDRESSES,
      STORAGE_KEYS.MAX_DURATIONS,
    ])
  },
}
