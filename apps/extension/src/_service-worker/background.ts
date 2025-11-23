import api from '~api'
import type { WorkerResponse, Address, MaxDurations } from '~core/types'
import { STORAGE_KEYS } from '~core/constants/commute-constants'
import type { DurationsResponse } from '~core/database/data-types/durations'

chrome.runtime.onMessage.addListener(
  (
    request,
    _sender,
    sendResponse: (response: WorkerResponse<DurationsResponse>) => void,
  ) => {
    switch (request.action) {
      case 'fetchCommutes': {
        const userSessionId: string =
          request?.payload?.userSessionId || crypto.randomUUID()

        if (!userSessionId) {
          sendResponse({
            success: false,
            error: 'User session ID is required',
          })
          return
        }

        api.commute.durations
          .get({ $query: { userSessionId } })
          .then(({ data }) => {
            if (data?.status === 'error' || !data?.payload) {
              sendResponse({
                success: false,
                error: 'Error fetching commute durations',
              })
              return
            }

            sendResponse({
              success: true,
              data: data.payload,
            })
          })
          .catch(error => {
            sendResponse({
              success: false,
              error: error.message || 'Unknown error',
            })
          })

        return true
      }

      case 'syncFromServer': {
        const userSessionId: string =
          request?.payload?.userSessionId || crypto.randomUUID()

        api.commute.preferences
          .get({
            $query: { userSessionId },
          })
          .then(({ data }) => {
            if (data && data.status === 'success') {
              const { addresses, maxDurations } = data.payload.preferences
              chrome.storage.local.set(
                {
                  [STORAGE_KEYS.USER_SESSION_ID]: userSessionId,
                  [STORAGE_KEYS.ADDRESSES]: addresses,
                  [STORAGE_KEYS.MAX_DURATIONS]: maxDurations,
                },
                () => {
                  sendResponse({
                    success: true,
                  })
                },
              )
            } else {
              sendResponse({
                success: false,
                error: 'Error syncing preferences from server',
              })
            }
          })
          .catch(error => {
            sendResponse({
              success: false,
              error: error.message || 'Unknown error',
            })
          })

        return true
      }

      case 'syncToServer': {
        const { addresses, maxDurations, userSessionId } =
          (request.payload as {
            addresses: Address[]
            maxDurations: MaxDurations
            userSessionId?: string
          }) || {}
        if (!addresses || !maxDurations) {
          sendResponse({
            success: false,
            error: 'Invalid payload for syncToServer',
          })
          return
        }

        const _userSessionId: string = userSessionId || crypto.randomUUID()

        api.commute.preferences
          .post({
            userSessionId: _userSessionId,
            preferences: {
              addresses,
              maxDurations,
            },
          })
          .then(resp => {
            const { data } = resp
            if (data && data.status === 'error') {
              sendResponse({
                success: false,
                error: 'Error syncing preferences to server',
              })
              return
            }

            chrome.storage.local.set(
              {
                [STORAGE_KEYS.USER_SESSION_ID]: _userSessionId,
                [STORAGE_KEYS.ADDRESSES]: data?.payload.preferences.addresses,
                [STORAGE_KEYS.MAX_DURATIONS]:
                  data?.payload.preferences.maxDurations,
              },
              () => {
                sendResponse({
                  success: true,
                })
              },
            )
          })
          .catch(error => {
            sendResponse({
              success: false,
              error: error.message || 'Unknown error',
            })
          })

        return true
      }
    }
  },
)
