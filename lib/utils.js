// TODO: utils.js -- :facepalm: are you kidding me?
import shortuuid from 'short-uuid'

export function uuid () {
  return shortuuid('123456789abcdefghijkmnopqrstuvwxyz').generate()
}
