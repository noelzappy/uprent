import { get, writable } from 'svelte/store'
import type { Address, MaxDurations } from '~core/types'
import {
  DefaultMaxDurations,
  HAND_SHAKE_KEY,
  WEB_APP_READY_EVENT_NAME,
} from '~core/constants/commute-constants'
import api from '~api'

function createPreferencesStore() {
  const { subscribe, set, update } = writable<{
    addresses: Address[]
    maxDurations: MaxDurations
    isLoading: boolean
    lastInitAt?: number
  }>({
    addresses: [],
    maxDurations: DefaultMaxDurations,
    isLoading: false,
    lastInitAt: undefined,
  })

  const getSessionId = () => {
    let id = localStorage.getItem('userSessionId')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('userSessionId', id)
    }
    return id
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('message', event => {
      if (event.data.type === HAND_SHAKE_KEY && event.data.userSessionId) {
        console.log(
          'Received session ID from extension:',
          event.data.userSessionId,
        )
        localStorage.setItem('userSessionId', event.data.userSessionId)

        preferences.init()
      }
    })
  }

  return {
    subscribe,
    get: () => get({ subscribe }),
    init: async () => {
      const { lastInitAt } = get({ subscribe })

      // Only proceed if not initialized in the last hour
      const ONE_HOUR_MS = 60 * 60 * 1000
      if (lastInitAt && Date.now() - lastInitAt < ONE_HOUR_MS) {
        return
      }

      // if (typeof window !== 'undefined') {
      //   window.postMessage({ type: WEB_APP_READY_EVENT_NAME }, '*')
      // }

      update(s => ({ ...s, isLoading: true }))
      try {
        const userSessionId = getSessionId()
        const { data } = await api.commute.preferences.get({
          $query: { userSessionId },
        })

        if (data && 'status' in data && data.status === 'success') {
          set({
            addresses: data.payload.preferences.addresses,
            maxDurations: data.payload.preferences.maxDurations,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Failed to fetch preferences', error)
      } finally {
        update(s => ({ ...s, isLoading: false, lastInitAt: Date.now() }))
      }
    },
    save: async (addresses: Address[], maxDurations: MaxDurations) => {
      update(s => ({ ...s, addresses, maxDurations }))
      try {
        const userSessionId = getSessionId()
        await api.commute.preferences.post({
          userSessionId,
          preferences: {
            addresses,
            maxDurations,
          },
        })
      } catch (error) {
        console.error('Failed to save preferences', error)
      }
    },
  }
}

export const preferences = createPreferencesStore()
