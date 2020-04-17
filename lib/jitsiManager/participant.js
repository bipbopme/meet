import { action, observable } from 'mobx'
import { bind } from 'decko'

export default class Participant {
  id = undefined
  conference = undefined
  isLocal = false

  @observable displayName = undefined
  @observable tracks = []
  @observable audioTrack = undefined
  @observable videoTrack = undefined
  @observable isDominantSpeaker = false
  @observable role = undefined
  @observable status = undefined
  @observable isAudioMuted = false
  @observable isVideoMuted = false

  constructor (id, conference, isLocal = false) {
    this.id = id
    this.conference = conference
    this.isLocal = isLocal

    this.addEventListeners()
  }

  muteAudio () {
    if (this.isLocal && this.audioTrack) {
      this.audioTrack.mute()
    }
  }

  unmuteAudio () {
    if (this.isLocal && this.audioTrack) {
      this.audioTrack.unmute()
    }
  }

  muteVideo () {
    if (this.isLocal && this.videoTrack) {
      this.videoTrack.mute()
    }
  }

  unmuteVideo () {
    if (this.isLocal && this.videoTrack) {
      this.videoTrack.unmute()
    }
  }

  addEventListeners () {
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_ADDED, this._handleTrackAdded)
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_REMOVED, this._handleTrackRemoved)
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this._handleTrackMuteChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, this._handleTrackAudioLevelChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED, this._handleDominantSpeakerChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, this._handleDisplayNameChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.USER_ROLE_CHANGED, this._handleUserRoleChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.USER_STATUS_CHANGED, this._handleUserStatusChanged)
  }

  @action
  addTrack (track) {
    console.warn()
    if (track.getType() === 'audio') {
      if (!this.audioTrack || this.audioTrack.getId() !== track.getId()) {
        this.audioTrack = track
        this.isAudioMuted = track.isMuted()
      }
    }

    if (track.getType() === 'video') {
      if (!this.videoTrack || this.videoTrack.getId() !== track.getId()) {
        this.videoTrack = track
        this.isVideoMuted = track.isMuted()
      }
    }
  }

  @action
  removeTrack (track) {
    if (track.getType() === 'audio') {
      this.audioTrack = null
      this.isAudioMuted = false
    }

    if (track.getType() === 'video') {
      this.videoTrack = null
      this.isVideoMuted = false
    }
  }

  @action
  _updateTrackMute (track) {
    if (track.getType() === 'audio') {
      this.isAudioMuted = track.isMuted()
    }

    if (track.getType() === 'video') {
      this.isVideoMuted = track.isMuted()
    }
  }

  @action
  _updateIsDominantSpeaker (isDominantSpeaker) {
    this.isDominantSpeaker = isDominantSpeaker
  }

  @action
  _updateDisplayName (displayName) {
    this.displayName = displayName
  }

  @action
  _updateRole (role) {
    this.role = role
  }

  @action
  _updateStatus (status) {
    this.status = status
  }

  @bind
  _handleTrackAdded (track) {
    if (this.id === track.getParticipantId() && !this.isLocal) {
      this.addTrack(track)

      console.debug('Implemented: TrackAdded', track, this)
    }
  }

  @bind
  _handleTrackRemoved (track) {
    if (this.id === track.getParticipantId() && !this.isLocal) {
      this.removeTrack(track)

      console.debug('Implemented: TrackRemoved', track, this)
    }
  }

  @bind
  _handleTrackMuteChanged (track) {
    if (this.id === track.getParticipantId()) {
      this._updateTrackMute(track)

      console.warn('Maybe implemented: _handleTrackMuteChanged', track, this)
    }
  }

  @bind
  _handleTrackAudioLevelChanged (track) {
    console.warn('Not implemented: _handleTrackAudioLevelChanged', track)
  }

  @bind
  _handleDominantSpeakerChanged (id) {
    this._updateIsDominantSpeaker(id === this.id)

    console.debug('Implemented: DominantSpeakerChanged', id, this)
  }

  @bind
  _handleDisplayNameChanged (id, displayName) {
    if (this.id === id) {
      this._updateDisplayName(displayName)

      console.debug('Implemented: DisplayNameChanged', id, displayName, this)
    }
  }

  @bind
  _handleUserRoleChanged (id, role) {
    if (this.id === id) {
      this._updateRole(role)

      console.debug('Implemented: UserRoleChanged', id, role, this)
    }
  }

  @bind
  _handleUserStatusChanged (id, status) {
    if (this.id === id) {
      this._updateStatus(status)
    }

    console.debug('Implemented: UserStatusChanged', id, status, this)
  }
}
