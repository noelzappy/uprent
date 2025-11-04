import api from '~api'
import type { Durations } from '~core/database'
import type { WorkerResponse } from '~core/types'

chrome.runtime.onMessage.addListener(
  (
    request,
    _sender,
    sendResponse: (response: WorkerResponse<Durations>) => void,
  ) => {
    if (request.action === 'fetchCommutes') {
      api.commute.durations
        .get()
        .then(({ data }) => {
          if (data?.status === 'error') {
            sendResponse({
              success: false,
              error: 'Error fetching commute durations',
            })
            return
          }

          sendResponse({ success: true, data: data?.payload.durations })
        })
        .catch(error => {
          sendResponse({
            success: false,
            error: error.message || 'Unknown error',
          })
        })

      return true
    }
  },
)
