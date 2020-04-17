/* global JitsiMeetJS */
import { action, observable } from 'mobx'
import { bind } from 'decko'
import JitsiConferenceManager from './jitsiManager/jitsiConferenceManager'

const CONNECTION_OPTIONS = {
  hosts: {
    domain: 'jitsi.bipbop.me',
    muc: 'conference.jitsi.bipbop.me'
  },
  serviceUrl: 'https://jitsi.bipbop.me/http-bind',
  clientNode: 'http://bipbop.me/JitsiMeetJS'
}

export default class JitsiManager {
  conferenceManagers = []
  connection = undefined
  @observable status = 'disconnected'

  constructor (autoConnect = true) {
    this._initJitsiMeetJS()
    this.connection = new JitsiMeetJS.JitsiConnection(null, null, CONNECTION_OPTIONS)
    this._addEventListeners()

    if (autoConnect) {
      this.connect()
    }
  }

  connect () {
    this.status = 'connecting'
    this.connection.connect()
  }

  disconnect () {
    this.conferenceManagers.forEach(c => c.leave())
    this.connection.disconnect()
  }

  initConferenceManager (id, localTracks) {
    const conferenceManager = new JitsiConferenceManager(this, id, localTracks)
    this.conferenceManagers.push(conferenceManager)

    return conferenceManager
  }

  _initJitsiMeetJS () {
    JitsiMeetJS.init({ disableAudioLevels: true, disableThirdPartyRequests: true })
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO)
  }

  _addEventListeners () {
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, this._handleConnectionFailed)
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this._handleConnectionEstablished)
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, this._handleConnectionDisconnected)
    this.connection.addEventListener(JitsiMeetJS.events.connection.WRONG_STATE, this._handleWrongState)
  }

  @bind
  _handleConnectionFailed () {
    this.status = 'failed'
  }

  @bind
  _handleConnectionEstablished () {
    this.status = 'established'
  }

  @bind
  _handleConnectionDisconnected () {
    this.status = 'disconnected'
  }

  @bind
  _handleWrongState () {
    console.warn("Action can't be executed because the connection is in wrong state")
  }
}
