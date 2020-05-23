/* global JitsiMeetJS */
import { observable } from 'mobx'

import events from 'events'
import JitsiConferenceManager from './jitsiManager/jitsiConferenceManager'
import { bind } from 'decko'

export default class JitsiManager extends events.EventEmitter {
  static events = {
    CONNECTION_DISCONNECTED: 'CONNECTION_DISCONNECTED',
    CONNECTION_ESTABLISHED: 'CONNECTION_ESTABLISHED',
    CONNECTION_FAILED: 'CONNECTION_FAILED'
  }

  domain: string = undefined
  region: string = undefined
  conferenceManagers = []
  connection: JitsiMeetJS.JitsiConnection = undefined
  @observable status = 'disconnected'

  constructor(domain: string, region: string) {
    super()

    this.domain = domain
    this.region = region

    this._initJitsiMeetJS()

    this.connection = new JitsiMeetJS.JitsiConnection(null, null, {
      hosts: {
        domain: domain,
        muc: `conference.${domain}`
      },
      serviceUrl: `https://${domain}/http-bind`,
      clientNode: 'https://bipbop.me/JitsiMeetJS'
    })

    this._addEventListeners()
  }

  connect(): void {
    this.status = 'connecting'
    this.connection.connect()
  }

  disconnect() {
    this.status = 'disconnecting'
    this.connection.disconnect()
  }

  initConferenceManager(id: string, localTracks: JitsiMeetJS.JitsiTrack[], displayName: string) {
    const conferenceManager = new JitsiConferenceManager(this, id, localTracks, displayName)
    this.conferenceManagers.push(conferenceManager)

    return conferenceManager
  }

  _initJitsiMeetJS() {
    JitsiMeetJS.init({ useIPv6: true, disableAudioLevels: true, disableThirdPartyRequests: true })
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO)
  }

  _addEventListeners() {
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, this._handleConnectionFailed)
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this._handleConnectionEstablished)
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this._handleConnectionDisconnected)
    this.connection.addEventListener(JitsiMeetJS.events.connection.WRONG_STATE, this._handleWrongState)
  }

  @bind
  _handleConnectionFailed() {
    this.status = 'failed'
    this.emit(JitsiManager.events.CONNECTION_FAILED)
  }

  @bind
  _handleConnectionEstablished() {
    this.status = 'connected'
    this.emit(JitsiManager.events.CONNECTION_ESTABLISHED)
  }

  @bind
  _handleConnectionDisconnected() {
    this.status = 'disconnected'
    this.emit(JitsiManager.events.CONNECTION_DISCONNECTED)
  }

  @bind
  _handleWrongState() {
    console.warn("Action can't be executed because the connection is in wrong state.")
  }
}
