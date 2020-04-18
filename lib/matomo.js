import Router from 'next/router'
import sha256 from 'js-sha256'

const CONFIG = JSON.parse(process.env.MATOMO_CONFIG)

// From: https://github.com/SocialGouv/sample-next-app/commit/a4b5e59d50361b6349af5d4641af8d6d1ed99996
export function initMatomo () {
  const { siteId, matomoUrl, cookieDomain, jsTrackerFile, phpTrackerFile } = CONFIG

  window._paq = window._paq || []
  let previousPath = ''
  matopush(['setSiteId', siteId])
  matopush(['setTrackerUrl', `${matomoUrl}/${phpTrackerFile}`])
  matopush(['enableLinkTracking'])

  if (cookieDomain) {
    matopush(['setCookieDomain', cookieDomain])
  }

  /**
   * for intial loading we use the location.pathname
   * as the first url visited.
   * Once user navigate accross the site,
   * we rely on Router.pathname
   */
  matopush(['setCustomUrl', obfuscateRoomID(window.location.pathname)])
  matopush(['trackPageView'])

  // Only insert the script if enabled
  if (CONFIG.enabled) {
    const scriptElement = document.createElement('script')
    const refElement = document.getElementsByTagName('script')[0]
    scriptElement.type = 'text/javascript'
    scriptElement.async = true
    scriptElement.defer = true
    scriptElement.src = `${matomoUrl}/${jsTrackerFile}`
    refElement.parentNode.insertBefore(scriptElement, refElement)
  }

  previousPath = window.location.pathname

  Router.events.on('routeChangeComplete', path => {
    // We use only the part of the url without the querystring to ensure matomo is happy
    // It seems that matomo doesn't track well page with querystring
    const [pathname] = path.split(/[?#]/)
    if (previousPath === pathname) {
      return
    }

    // In order to ensure that the page title had been updated,
    // we delayed pushing the tracking to the next tick.
    setTimeout(() => {
      if (previousPath) {
        matopush(['setReferrerUrl', obfuscateRoomID(previousPath)])
      }
      matopush(['setCustomUrl', obfuscateRoomID(pathname)])
      matopush(['setDocumentTitle', document.title])
      matopush(['deleteCustomVariables', 'page'])
      matopush(['setGenerationTimeMs', 0])
      matopush(['trackPageView'])
      matopush(['enableLinkTracking'])

      if (cookieDomain) {
        matopush(['setCookieDomain', cookieDomain])
      }

      previousPath = pathname
    }, 0)
  })
}

// TODO: this shouldn't be doing anything now since we're splitting off the hash and querystring above.
//       Leaving for now just to be safe and since the approach here might change when refactoring this.
function obfuscateRoomID (url) {
  return url.replace(/\/r(\#|\/)(.+)/, (match, char, id) => {
    return `/r/{${sha256(id).slice(20)}}`
  })
}

export function matopush (args) {
  if (CONFIG.enabled) {
    window._paq.push(args)
  } else {
    console.debug('matopush', args)
  }
}
