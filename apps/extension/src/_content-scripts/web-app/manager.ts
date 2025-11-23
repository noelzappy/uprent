import { extensionCommuteStorage } from '@shared/stores'
import {
  HAND_SHAKE_KEY,
  WEB_APP_READY_EVENT_NAME,
} from '~core/constants/commute-constants'

export class WebAppManager {
  init() {
    window.addEventListener('message', async event => {
      console.log('Received message in web app manager:', event)

      if (event.data.type === WEB_APP_READY_EVENT_NAME) {
        const userSessionId =
          event.data.userSessionId ||
          (await extensionCommuteStorage.getSessionId())

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
