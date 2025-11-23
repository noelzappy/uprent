import type { Address, MaxDurations, WorkerResponse } from '~core/types'
import {
  DefaultMaxDurations,
  STORAGE_KEYS,
} from '~core/constants/commute-constants'
import type { DurationsResponse } from '~core/database/data-types/durations'

export const extensionCommuteStorage = {
  async getSessionId(): Promise<string> {
    return await new Promise(resolve => {
      chrome.storage.local.get([STORAGE_KEYS.USER_SESSION_ID], result => {
        if (result[STORAGE_KEYS.USER_SESSION_ID]) {
          resolve(result[STORAGE_KEYS.USER_SESSION_ID])
        } else {
          const newId = crypto.randomUUID()
          chrome.storage.local.set(
            { [STORAGE_KEYS.USER_SESSION_ID]: newId },
            () => {
              resolve(newId)
            },
          )
        }
      })
    })
  },

  async syncFromServer(): Promise<void> {
    const userSessionId = await this.getSessionId()
    return new Promise(resolve => {
      chrome.runtime.sendMessage(
        {
          action: 'syncFromServer',
          payload: { userSessionId },
        },
        () => {
          resolve()
        },
      )
    })
  },

  async save(addresses: Address[], maxDurations: MaxDurations): Promise<void> {
    const userSessionId = await this.getSessionId()

    return new Promise(resolve => {
      chrome.runtime.sendMessage(
        {
          action: 'syncToServer',
          payload: { addresses, maxDurations, userSessionId },
        },
        () => {
          resolve()
        },
      )
    })
  },

  async fetchCommutes(): Promise<WorkerResponse<DurationsResponse>> {
    const userSessionId = await this.getSessionId()
    return new Promise<WorkerResponse<DurationsResponse>>(
      (resolve, _reject) => {
        chrome.runtime.sendMessage(
          {
            action: 'fetchCommutes',
            payload: { userSessionId },
          },
          (response: WorkerResponse<DurationsResponse>) => {
            resolve(response)
          },
        )
      },
    )
  },

  async getPrefs(): Promise<{
    addresses: Address[]
    maxDurations: MaxDurations
  }> {
    const data = await new Promise(resolve => {
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
    return data as {
      addresses: Address[]
      maxDurations: MaxDurations
    }
  },

  clear(): void {
    chrome.storage.local.remove([
      STORAGE_KEYS.ADDRESSES,
      STORAGE_KEYS.MAX_DURATIONS,
    ])
  },
}
