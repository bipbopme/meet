import { action, observable } from 'mobx'

import events from 'events'
import JitsiMessage from './jitsiMessage'
import JitsiParticipant from './jitsiParticipant'
import { bind } from 'decko'
import JitsiManager from '../jitsiManager'

export default class JitsiConferenceManager extends events.EventEmitter {
  static events = {
    CONFERENCE_JOINED: 'CONFERENCE_JOINED',
    MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
    PARTICIPANT_JOINED: 'PARTICIPANT_JOINED',
    PARTICIPANT_LEFT: 'PARTICIPANT_LEFT'
  }

  id: string = undefined
  jitsiManager: JitsiManager = undefined
  localTracks: MediaStreamTrack[] = undefined
  conference = undefined
  displayName: string = undefined

  @observable status: string = undefined
  @observable localParticipant: JitsiParticipant = undefined
  @observable subject: string = undefined
  @observable participants: JitsiParticipant[] = []
  @observable messages: JitsiMessage[] = []

  constructor (jitsiManager: JitsiManager, id: string, localTracks: MediaStreamTrack[], displayName: string) {
    super()

    this.id = id
    this.jitsiManager = jitsiManager
    this.localTracks = localTracks
    this.displayName = displayName

    this.conference = jitsiManager.connection.initJitsiConference(this.id, {
      deploymentInfo: {
        userRegion: jitsiManager.region
      },
      testing: {
        octo: {
            probability: 1
        }
      }
    })

    this._addEventListeners()
  }

  join () {
    this.conference.join()
  }

  leave () {
    this.conference.leave()

    // TODO: this should probably be handled somewhere else
    this._disposeLocalTracks()
  }

  sendTextMessage (text: string) {
    this.conference.sendTextMessage(text)
  }

  selectParticipants(ids: string[]) {
    this.conference.selectParticipants(ids)
  }

  selectAllParticipants() {
    this.selectParticipants(this.participants.map(p => p.id))
  }

  setReceiverVideoConstraint(resolution: number) {
    this.conference.setReceiverVideoConstraint(resolution)
  }

  _addEventListeners () {
    // Events from https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/API.md
    this.conference.addEventListener(JitsiMeetJS.events.conference.USER_JOINED, this._handleUserJoined)
    this.conference.addEventListener(JitsiMeetJS.events.conference.USER_LEFT, this._handleUserLeft)
    this.conference.addEventListener(JitsiMeetJS.events.conference.MESSAGE_RECEIVED, this._handleMessageReceived)
    this.conference.addEventListener(JitsiMeetJS.events.conference.SUBJECT_CHANGED, this._handleSubjectChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.LAST_N_ENDPOINTS_CHANGED, this._handleLastNEndpointsChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_JOINED, this._handleConferenceJoined)
    this.conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_LEFT, this._handleConferenceLeft)
    this.conference.addEventListener(JitsiMeetJS.events.conference.DTMF_SUPPORT_CHANGED, this._handleDtmfSupportChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_FAILED, this._handleConferenceFailed)
    this.conference.addEventListener(JitsiMeetJS.events.conference.CONFERENCE_ERROR, this._handleConferenceError)
    this.conference.addEventListener(JitsiMeetJS.events.conference.KICKED, this._handleKicked)
    this.conference.addEventListener(JitsiMeetJS.events.conference.START_MUTED_POLICY_CHANGED, this._handleStartMutedPolicyChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.STARTED_MUTED, this._handleStartedMuted)
    this.conference.addEventListener(JitsiMeetJS.events.conference.BEFORE_STATISTICS_DISPOSED, this._handleBeforeStatisticsDisposed)
    this.conference.addEventListener(JitsiMeetJS.events.conference.AUTH_STATUS_CHANGED, this._handleAuthStatusChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED, this._handleEndpointMessageReceived)
    this.conference.addEventListener(JitsiMeetJS.events.conference.TALK_WHILE_MUTED, this._handleTalkWhileMuted)
    this.conference.addEventListener(JitsiMeetJS.events.conference.NO_AUDIO_INPUT, this._handleNoAudioInput)
    this.conference.addEventListener(JitsiMeetJS.events.conference.AUDIO_INPUT_STATE_CHANGE, this._handleAudioInputStateChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.NOISY_MIC, this._handleNoisyMic)
  }

  _disposeLocalTracks () {
    if (this.localParticipant) {
      if (this.localParticipant.audioTrack) {
        this.localParticipant.audioTrack.dispose()
      }

      if (this.localParticipant.videoTrack) {
        this.localParticipant.videoTrack.dispose()
      }
    }
  }

  @action
  _updateStatus (status: string) {
    this.status = status
  }

  @action
  _updateSubject (subject: string) {
    this.subject = subject
  }

  @action
  _addParticipant (id: string, displayName: string) {
    const participant = new JitsiParticipant(id, this.conference, displayName)

    this.participants.push(participant)

    return participant
  }

  @action
  _removeParticipant (id: string) {
    this.participants.remove(this._getParticipant(id))
  }

  _getParticipant(id: string) {
    return [...this.participants, this.localParticipant].find(p => p.id === id)
  }

  @action
  _addMessage(participant: JitsiParticipant, text: string, createdAt: Date) {
    const message = new JitsiMessage(participant, text, createdAt)

    this.messages.push(message)

    return message
  }

  @action
  _addLocalParticipant (id: string , displayName: string) {
    this.localParticipant = new JitsiParticipant(id, this.conference, displayName, true)

    // Setup local tracks
    this.localTracks.forEach(t => {
      this.conference.addTrack(t) // TODO: error handling
      this.localParticipant.addTrack(t) // TODO: how to update these if they change?
    })

    return this.localParticipant
  }

  @bind
  _handleUserJoined (id: string, jitsiInternalParticipant: { _displayName: string }) {
    console.debug('Implemented: UserJoined', id, jitsiInternalParticipant, this)

    const participant = this._addParticipant(id, jitsiInternalParticipant._displayName)

    this.emit(JitsiConferenceManager.events.PARTICIPANT_JOINED, participant)
  }

  @bind
  _handleUserLeft (id: string, jitsiInternalParticipant) {
    const participant = this._removeParticipant(id)

    this.emit(JitsiConferenceManager.events.PARTICIPANT_LEFT, participant)

    console.debug('Implemented: UserLeft', id, jitsiInternalParticipant, this)
  }

  @bind
  _handleMessageReceived (id: string, text: string, ts: Date) {
    const participant = this._getParticipant(id)

    if (participant) {
      const message = this._addMessage(participant, text, ts)

      this.emit(JitsiConferenceManager.events.MESSAGE_RECEIVED, message)

      console.debug('Implemented: MessageReceived', id, text, ts, message)
    }
  }

  @bind
  _handleSubjectChanged (subject: string) {
    console.warn('Not implemented: _handleSubjectChanged')

    this._updateSubject(subject)
  }

  @bind
  _handleLastNEndpointsChanged (leavingEndpointIds: string[], enteringEndpointIds: string[]) {
    console.warn('Not implemented: _handleLastNEndpointsChanged', leavingEndpointIds, enteringEndpointIds)
  }

  @bind
  _handleConferenceJoined () {
    this._addLocalParticipant(this.conference.myUserId(), this.displayName)
    this._updateStatus('joined')

    if (this.displayName) {
      this.conference.setDisplayName(this.displayName)
    }

    this.emit(JitsiConferenceManager.events.CONFERENCE_JOINED)

    console.debug('Implemented: ConferenceJoined', this)
  }

  @bind
  _handleConferenceLeft () {
    console.warn('Not implemented: _handleConferenceLeft')
  }

  @bind
  _handleDtmfSupportChanged (supports) {
    console.warn('Not implemented: _handleDtmfSupportChanged', supports)
  }

  @bind
  _handleConferenceFailed (errorCode) {
    console.warn('Not implemented: _handleConferenceFailed', errorCode)
  }

  @bind
  _handleConferenceError (errorCode) {
    console.warn('Not implemented: _handleConferenceError', errorCode)
  }

  @bind
  _handleKicked () {
    console.warn('Not implemented: _handleKicked')
  }

  @bind
  _handleStartMutedPolicyChanged () {
    console.warn('Not implemented: _handleStartMutedPolicyChanged')
  }

  @bind
  _handleStartedMuted () {
    console.warn('Not implemented: _handleStartedMuted')
  }

  @bind
  _handleBeforeStatisticsDisposed () {
    console.warn('Not implemented: _handleBeforeStatisticsDisposed')
  }

  @bind
  _handleAuthStatusChanged (isAuthEnabled, authIdentity) {
    console.warn('Not implemented: _handleAuthStatusChanged', isAuthEnabled, authIdentity)
  }

  @bind
  _handleEndpointMessageReceived () {
    console.warn('Not implemented: _handleEndpointMessageReceived')
  }

  @bind
  _handleTalkWhileMuted () {
    console.warn('Not implemented: _handleTalkWhileMuted')
  }

  @bind
  _handleNoAudioInput () {
    console.warn('Not implemented: _handleNoAudioInput')
  }

  @bind
  _handleAudioInputStateChanged () {
    console.warn('Not implemented: _handleAudioInputStateChanged')
  }

  @bind
  _handleNoisyMic () {
    console.warn('Not implemented: _handleNoisyMic')
  }
}
