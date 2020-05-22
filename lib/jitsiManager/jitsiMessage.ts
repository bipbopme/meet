import { observable } from 'mobx'
import { uuid } from '../utils'

export default class JitsiMessage {
  id = undefined
  @observable participant = undefined
  @observable text = undefined
  @observable createdAt = undefined

  constructor (participant, text, createdAt) {
    this.id = uuid()
    this.participant = participant
    this.text = text
    this.createdAt = createdAt
  }
}
