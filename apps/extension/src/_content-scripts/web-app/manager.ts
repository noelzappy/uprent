import { extensionCommuteStorage } from '@shared/stores'
import {
  HAND_SHAKE_KEY,
  WEB_APP_READY_EVENT_NAME,
} from '~core/constants/commute-constants'

export class WebAppManager {
  init() {
    window.addEventListener('message', async event => {
      if (event.data.type === WEB_APP_READY_EVENT_NAME) {
        const userSessionId = await extensionCommuteStorage.getSessionId()
        window.postMessage(
          {
            type: HAND_SHAKE_KEY,
            userSessionId,
          },
          '*',
        )
      }
    })
  }
}

export const webAppManager = new WebAppManager()
