import Router from 'next/router'
import sha256 from 'js-sha256'

// From: https://github.com/SocialGouv/sample-next-app/commit/a4b5e59d50361b6349af5d4641af8d6d1ed99996
export function initMatomo ({
  siteId,
  matomoUrl,
  cookieDomain = undefined,
  jsTrackerFile = 'matomo.js',
  phpTrackerFile = 'matomo.php'
}) {
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
  const scriptElement = document.createElement('script')
  const refElement = document.getElementsByTagName('script')[0]
  scriptElement.type = 'text/javascript'
  scriptElement.async = true
  scriptElement.defer = true
  scriptElement.src = `${matomoUrl}/${jsTrackerFile}`
  refElement.parentNode.insertBefore(scriptElement, refElement)
  previousPath = window.location.pathname

  Router.events.on('routeChangeComplete', path => {
    // We use only the part of the url without the querystring to ensure matomo is happy
    // It seems that matomo doesn't track well page with querystring
    const [pathname] = path.split('?')
    if (previousPath === pathname) {
      return
    }

    // In order to ensure that the page title had been updated,
    // we delayed pushing the tracking to the next tick.
    setTimeout(() => {
      if (previousPath) {
        matopush(['setReferrerUrl', `${previousPath}`])
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

function obfuscateRoomID (url) {
  return url.replace(/\/r\/(.+)/, (match, id) => {
    const hashedID = sha256(id).slice(0, 20)
    return `/r/{${hashedID}}`
  })
}

export function matopush (args) {
  window._paq.push(args)
}
