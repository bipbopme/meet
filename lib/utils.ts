import _shuffle from 'lodash/shuffle'
import shortuuid from 'short-uuid'

export function uuid () {
  // Get a UUID encoded with an unambiguous character set
  let uuid = shortuuid('123456789abcdefghijkmnopqrstuvwxyz').generate()

  // We only want 11 characters to improve usability.
  // Select them randomly (may not be necessary).
  uuid = _shuffle(uuid.split()).join().slice(0, 11)

  // Format the final UUID: xxxx-xxx-xxxx
  uuid = uuid.replace(/(.{4})(.{3})(.{4})/, '$1-$2-$3')

  return uuid
}

export function nowTraceToRegion(trace) {
  const defaultRegion = 'nyc'
  const regionMap = {
    arn1: 'ams',
    bom1: 'ams',
    bru1: 'ams',
    cdg1: 'ams',
    chs1: 'nyc',
    cle1: 'nyc',
    dub1: 'ams',
    gru1: 'nyc',
    hel1: 'ams',
    hkg1: 'sfo',
    hnd1: 'sfo',
    iad1: 'nyc',
    icn1: 'sfo',
    lax1: 'sfo',
    lhr1: 'ams',
    oma1: 'nyc',
    pdx1: 'sfo',
    sfo1: 'sfo',
    sin1: 'sfo',
    syd1: 'sfo',
    tpe1: 'sfo',
    yul1: 'nyc',
    zrh1: 'ams'
  }

  return regionMap[trace] || defaultRegion
}

export function eventPath(evt: MouseEvent) {
  // This should check composedPath but it wasn't working in Firefox
  // (evt.composedPath && evt.composedPath()) || evt.path
  let path = evt['path']
  const target = evt.target

  if (path != null) {
    // Safari doesn't include Window, and it should.
    path = (path.indexOf(window) < 0) ? path.concat([window]) : path
    return path
  }

  if (target === window) {
    return [window]
  }

  function getParents(node: Node, memo?: Node[]) {
    memo = memo || []
    const parentNode = node.parentNode

    if (!parentNode) {
      return memo
    }
    else {
      return getParents(parentNode, memo.concat([parentNode]))
    }
  }

  return [target].concat(getParents(target)).concat([window])
}

export function isTouchEnabled () {
  return 'ontouchstart' in window || navigator.msMaxTouchPoints > 0
}
