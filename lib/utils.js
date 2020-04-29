// TODO: utils.js -- :facepalm: are you kidding me?
import shortuuid from 'short-uuid'

export function uuid () {
  return shortuuid('123456789abcdefghijkmnopqrstuvwxyz').generate()
}

export function nowTraceToRegion(trace) {
  const defaultRegion = 'nyc'
  const regionMap = {
    arn1: 'nyc',
    bom1: 'sfo',
    bru1: 'nyc',
    cdg1: 'nyc',
    chs1: 'nyc',
    cle1: 'nyc',
    dub1: 'nyc',
    gru1: 'nyc',
    hel1: 'nyc',
    hkg1: 'sfo',
    hnd1: 'sfo',
    iad1: 'nyc',
    icn1: 'sfo',
    lax1: 'sfo',
    lhr1: 'nyc',
    oma1: 'nyc',
    pdx1: 'sfo',
    sfo1: 'sfo',
    sin1: 'sfo',
    syd1: 'sfo',
    tpe1: 'sfo',
    yul1: 'nyc',
    zrh1: 'nyc'
  }

  return regionMap[trace] || defaultRegion
}
