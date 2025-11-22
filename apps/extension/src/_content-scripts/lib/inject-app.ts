import { App } from '@widgets'

export const injectApp = () => {
  const containerId = 'uprent-app-container-root'
  const classScope = 'uprent-scope'
  const uprentAppAttribute = 'data-uprent-app'
  const uprentStylesAttribute = 'data-uprent-styles'
  let container = document.getElementById(containerId)
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.classList.add(classScope)
    container.setAttribute(uprentAppAttribute, 'true')
    document.body.appendChild(container)
  }

  let app = new App({ target: container })

  const styles = Array.from(document.head.querySelectorAll('style'))
  const uprentStyleElement = styles.find(
    style =>
      style.textContent?.includes('svelte') &&
      style.textContent.includes('uprent'),
  )
  uprentStyleElement?.setAttribute(uprentStylesAttribute, 'true')
  const styleBackup = uprentStyleElement?.cloneNode(true)

  const obs = new MutationObserver(() => {
    if (document.getElementById(containerId)) return

    if (styleBackup && !document.querySelector(`[${uprentStylesAttribute}]`)) {
      document.head.append(styleBackup)
    }

    app.$destroy()

    const newContainer = document.createElement('div')
    newContainer.id = containerId
    newContainer.classList.add(classScope)
    newContainer.setAttribute(uprentAppAttribute, 'true')
    document.body.appendChild(newContainer)
    app = new App({ target: newContainer })
  })

  obs.observe(document.body, { childList: true, subtree: false })

  return () => {
    obs.disconnect()
    app.$destroy()
  }
}
