import { App } from '@widgets'

export const injectApp = () => {
  const containerId = 'uprent-app-container-root'
  let container = document.getElementById(containerId)
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.setAttribute('data-uprent-app', 'true')
    document.body.appendChild(container)
  }

  let app = new App({ target: container })

  const styles = Array.from(document.head.querySelectorAll('style'))
  const uprentStyleElement = styles.find(
    style =>
      style.textContent?.includes('svelte') &&
      style.textContent.includes('uprent'),
  )
  uprentStyleElement?.setAttribute('data-uprent-styles', 'true')
  const styleBackup = uprentStyleElement?.cloneNode(true)

  const obs = new MutationObserver(() => {
    if (document.getElementById(containerId)) return

    if (styleBackup && !document.querySelector('[data-uprent-styles]')) {
      document.head.append(styleBackup)
    }

    app.$destroy()

    const newContainer = document.createElement('div')
    newContainer.id = containerId
    newContainer.setAttribute('data-uprent-app', 'true')
    document.body.appendChild(newContainer)
    app = new App({ target: newContainer })
  })

  obs.observe(document.body, { childList: true, subtree: false })

  return () => {
    obs.disconnect()
    app.$destroy()
  }
}
