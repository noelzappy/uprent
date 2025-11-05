import api from '~api'
import type { Durations } from '~core/database'
import type { WorkerResponse, Address } from '~core/types'
import { STORAGE_KEYS } from '~core/constants/commute-constants'

chrome.runtime.onMessage.addListener(
  (
    request,
    _sender,
    sendResponse: (response: WorkerResponse<Durations>) => void,
  ) => {
    if (request.action === 'fetchCommutes') {
      chrome.storage.local.get([STORAGE_KEYS.ADDRESSES], result => {
        const addresses: Address[] = result[STORAGE_KEYS.ADDRESSES] || []

        if (addresses.length === 0) {
          sendResponse({
            success: false,
            error: 'No addresses configured',
          })
          return
        }

        const addressIds = addresses.map(a => a.id).join(',')

        api.commute.durations
          .get({
            $query: {
              addressIds,
            },
          })
          .then(({ data }) => {
            if (data?.status === 'error') {
              sendResponse({
                success: false,
                error: 'Error fetching commute durations',
              })
              return
            }

            sendResponse({
              success: true,
              data: data?.payload.durations,
            })
          })
          .catch(error => {
            sendResponse({
              success: false,
              error: error.message || 'Unknown error',
            })
          })
      })

      return true
    }
  },
)
