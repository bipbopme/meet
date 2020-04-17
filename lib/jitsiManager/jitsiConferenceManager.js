import { action, observable } from 'mobx'
import { bind } from 'decko'
import Participant from './participant'
import Message from './message'

export default class JitsiConferenceManager {
  id = undefined
  jitsiManager = undefined
  conference = undefined

  @observable status = undefined
  @observable localParticipant = undefined
  @observable subject = undefined
  @observable participants = []
  @observable messages = []

  constructor (jitsiManager, id, localTracks) {
    this.id = id
    this.jitsiManager = jitsiManager
    this.localTracks = localTracks
    this.conference = jitsiManager.connection.initJitsiConference(this.id, {})

    this.addEventListeners()
  }

  join () {
    this.conference.join()
  }

  leave () {
    this.conference.leave()
  }

  setReceiverVideoConstraint (resolution) {
    console.log("HELLO HOW ARE YOU DOING")
    this.conference.setReceiverVideoConstraint(resolution)
  }

  addEventListeners () {
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

  @action
  updateStatus (status) {
    this.status = status
  }

  @action
  updateSubject (subject) {
    this.subject = subject
  }

  @action
  addParticipant (id) {
    this.participants.push(new Participant(id, this.conference))
  }

  @action
  removeParticipant (id) {
    this.participants.remove(this.getParticipant(id))
  }

  getParticipant(id) {
    return this.participants.find(p => p.id === id)
  }

  @action
  addMessage(participant, text, createdAt) {
    this.messages.push(new Message(participant, text, createdAt))
  }

  @action
  addLocalParticipant (id) {
    this.localParticipant = new Participant(id, this.conference, true)

    // Setup local tracks
    this.localTracks.forEach(t => {
      this.conference.addTrack(t) // TODO: error handling
      this.localParticipant.addTrack(t) // TODO: how to update these if they change?
    })
  }

  @bind
  _handleUserJoined (id, jitsiParticipant) {
    console.debug('Implemented: UserJoined', id, jitsiParticipant, this)

    this.addParticipant(id)
  }

  @bind
  _handleUserLeft (id, participant) {
    this.removeParticipant(id)

    console.debug('Implemented: UserLeft', id, participant, this)
  }

  @bind
  _handleMessageReceived (id, text, ts) {
    console.debug('Implemented: MessageReceived', id, text, ts)

    const participant = this.getParticipant(id)

    if (participant) {
      this.addMessage(participant, text, ts)
    }
  }

  @bind
  _handleSubjectChanged (subject) {
    console.warn('Not implemented: _handleSubjectChanged')

    this.updateSubject(subject)
  }

  @bind
  _handleLastNEndpointsChanged (leavingEndpointIds, enteringEndpointIds) {
    console.warn('Not implemented: _handleLastNEndpointsChanged')
  }

  @bind
  _handleConferenceJoined () {
    this.addLocalParticipant(this.conference.myUserId())
    this.updateStatus('joined')

    console.debug('Implemented: ConferenceJoined', this)
  }

  @bind
  _handleConferenceLeft () {
    console.warn('Not implemented: _handleConferenceLeft')
  }

  @bind
  _handleDtmfSupportChanged (supports) {
    console.warn('Not implemented: _handleDtmfSupportChanged')
  }

  @bind
  _handleConferenceFailed (errorCode) {
    console.warn('Not implemented: _handleConferenceFailed')
  }

  @bind
  _handleConferenceError (errorCode) {
    console.warn('Not implemented: _handleConferenceError')
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
    console.warn('Not implemented: _handleAuthStatusChanged')
  }

  // TODO: Seems like the docs are missing parameters
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