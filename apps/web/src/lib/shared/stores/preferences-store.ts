import { writable } from 'svelte/store'
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
  }>({
    addresses: [],
    maxDurations: DefaultMaxDurations,
    isLoading: false,
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
        preferences.fetch()
      }
    })
  }

  const fetchPreferences = async () => {
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
      update(s => ({ ...s, isLoading: false }))
    }
  }

  return {
    fetch: fetchPreferences,
    subscribe,
    init: async () => {
      const userSessionId = getSessionId()
      await fetchPreferences()
      if (typeof window !== 'undefined') {
        window.postMessage(
          { type: WEB_APP_READY_EVENT_NAME, userSessionId },
          '*',
        )
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
