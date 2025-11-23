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
        const resp = {
          addresses: data.payload.preferences.addresses,
          maxDurations: data.payload.preferences.maxDurations,
        }

        set({
          ...resp,
          isLoading: false,
        })

        return {
          data: resp,
          error: null,
        }
      }
    } catch (error) {
      console.error('Failed to fetch preferences', error)
      return { data: null, error }
    } finally {
      update(s => ({ ...s, isLoading: false }))
    }
  }

  const getCommuteData = async () => {
    const userSessionId = getSessionId()

    const { data } = await api.commute.durations.get({
      $query: {
        userSessionId,
      },
    })

    if (data && data.status === 'success') {
      return {
        data: data.payload,
        error: null,
      }
    }

    return {
      data: null,
      error: new Error('Failed to fetch commute durations'),
    }
  }

  return {
    fetch: fetchPreferences,
    getCommuteData,
    subscribe,
    init: () => {
      if (typeof window !== 'undefined') {
        window.postMessage({ type: WEB_APP_READY_EVENT_NAME }, '*')
      }
      fetchPreferences()
    },
    save: async (addresses: Address[], maxDurations: MaxDurations) => {
      update(s => ({ ...s, isLoading: true }))
      try {
        const userSessionId = getSessionId()
        const { data } = await api.commute.durations.post({
          userSessionId,
          preferences: {
            addresses,
            maxDurations,
          },
        })
        if (data && data.status === 'success') {
          set({
            addresses: data.payload.preferences.addresses,
            maxDurations: data.payload.preferences.maxDurations,
            isLoading: false,
          })
          return data.payload
        } else {
          console.error('Failed to save preferences', data)
          return null
        }
      } catch (error) {
        console.error('Failed to save preferences', error)
        return null
      } finally {
        update(s => ({ ...s, isLoading: false }))
      }
    },
  }
}

export const preferences = createPreferencesStore()
