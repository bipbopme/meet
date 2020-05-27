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

  domain: string
  region: string
  conferenceManagers: JitsiConferenceManager[] = []
  connection: JitsiMeetJS.JitsiConnection
  @observable status = 'disconnected'

  constructor(domain: string, region: string) {
    super()

    this.domain = domain
    this.region = region

    this.initJitsiMeetJS()

    this.connection = new JitsiMeetJS.JitsiConnection(undefined, undefined, {
      hosts: {
        domain: domain,
        muc: `conference.${domain}`
      },
      serviceUrl: `https://${domain}/http-bind`,
      clientNode: 'https://bipbop.me/JitsiMeetJS'
    })
  }

  connect(): void {
    this.addEventListeners()

    this.status = 'connecting'
    this.connection.connect()
  }

  disconnect() {
    this.status = 'disconnecting'
    // Helps with cleanup
    this.connection.disconnect()

    // Handlers are disposed of in handleConnectionDisconnected
  }

  initConferenceManager(id: string, localTracks: JitsiMeetJS.JitsiTrack[], displayName: string | undefined) {
    const conferenceManager = new JitsiConferenceManager(this, id, localTracks, displayName)
    this.conferenceManagers.push(conferenceManager)

    return conferenceManager
  }

  private initJitsiMeetJS() {
    JitsiMeetJS.init({ useIPv6: true, disableAudioLevels: true, disableThirdPartyRequests: true })
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO)
  }

  private addEventListeners() {
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, this.handleConnectionFailed)
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this.handleConnectionEstablished)
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this.handleConnectionDisconnected)
    this.connection.addEventListener(JitsiMeetJS.events.connection.WRONG_STATE, this.handleWrongState)
  }

  private removeEventListeners () {
    this.connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, this.handleConnectionFailed)
    this.connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this.handleConnectionEstablished)
    this.connection.removeEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this.handleConnectionDisconnected)
    this.connection.removeEventListener(JitsiMeetJS.events.connection.WRONG_STATE, this.handleWrongState)
  }

  @bind
  private handleConnectionFailed() {
    this.status = 'failed'
    this.emit(JitsiManager.events.CONNECTION_FAILED)
  }

  @bind
  private handleConnectionEstablished() {
    this.status = 'connected'
    this.emit(JitsiManager.events.CONNECTION_ESTABLISHED)
  }

  @bind
  private handleConnectionDisconnected() {
    this.status = 'disconnected'
    this.emit(JitsiManager.events.CONNECTION_DISCONNECTED)

    this.removeEventListeners()
  }

  @bind
  private handleWrongState() {
    console.warn("Action can't be executed because the connection is in wrong state.")
  }
}
