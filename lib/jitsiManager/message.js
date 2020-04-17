import { action, observable } from 'mobx'

export default class Message {
  @observable participant = undefined
  @observable text = undefined
  @observable createdAt = undefined

  constructor (participant, text, createdAt) {
    this.participant = participant
    this.text = text
    this.createdAt = createdAt
  }
}
