import { parariusManager } from './pararius/manager'
import { webAppManager } from './web-app/manager'
import { initializeExtension } from './init'

const { host } = window.location

const main = () => {
  if (/pararius\./.test(host)) {
    initializeExtension(parariusManager)
    return
  }

  if (host.includes('localhost:5005')) {
    webAppManager.init()
    return
  }
}

main()
