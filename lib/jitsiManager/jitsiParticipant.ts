import { action, observable } from 'mobx'

import events from 'events'
import { bind } from 'decko'

export default class JitsiParticipant extends events.EventEmitter {
  static events = {
    DISPLAY_NAME_CHANGED: 'DISPLAY_NAME_CHANGED',
    DOMINANT_SPEAKER_CHANGED: 'DOMINANT_SPEAKER_CHANGED',
    ROLE_CHANGED: 'ROLE_CHANGED',
    STATUS_CHANGED: 'STATUS_CHANGED',
    TRACK_ADDED: 'TRACK_ADDED',
    TRACK_MUTE_CHANGED: 'TRACK_MUTE_CHANGED',
    TRACK_REMOVED: 'TRACK_REMOVED'
  }

  id: string = undefined
  conference: JitsiMeetJS.JitsiConference = undefined
  isLocal = false

  @observable displayName: string = undefined
  @observable audioTrack: JitsiMeetJS.JitsiTrack = undefined
  @observable videoTrack: JitsiMeetJS.JitsiTrack = undefined
  @observable isDominantSpeaker = false
  @observable lastDominantSpeakerAt = new Date(0)
  @observable role: string = undefined
  @observable status: string = undefined
  @observable isAudioMuted = false
  @observable isVideoMuted = false
  @observable isVideoTagActive = false

  constructor (id: string, conference: JitsiMeetJS.JitsiConference, displayName: string = undefined, isLocal = false) {
    super()

    this.id = id
    this.conference = conference
    this.isLocal = isLocal
    this.displayName = displayName

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

  async replaceAudioTrack (track: JitsiMeetJS.JitsiTrack) {
    if (track.getId() !== this.audioTrack.getId()) {
      await this.conference.removeTrack(this.audioTrack)
      this.audioTrack.dispose()

      await this.conference.addTrack(track)
      this.addTrack(track)
    }
  }

  async replaceVideoTrack (track: JitsiMeetJS.JitsiTrack) {
    if (track.getId() !== this.videoTrack.getId()) {
      await this.conference.removeTrack(this.videoTrack)
      this.videoTrack.dispose()

      await this.conference.addTrack(track)
      this.addTrack(track)
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
    const trackType = track.getType()
    const isMuted = track.isMuted()

    if (trackType === 'audio') {
      // Update the audio track if it's not set or if the IDs don't match
      if (!this.audioTrack || this.audioTrack.getId() !== track.getId()) {
        if (this.audioTrack) {
          this.audioTrack.dispose()
        }

        this.audioTrack = track
        this.isAudioMuted = isMuted
      }
    }

    if (trackType === 'video') {
      // Update the video track if it's not set or if the IDs don't match
      if (!this.videoTrack || this.videoTrack.getId() !== track.getId()) {
        if (this.videoTrack) {
          this.videoTrack.dispose()
        }

        this.videoTrack = track
        this.isVideoMuted = isMuted
      }
    }
  }

  @action
  removeTrack (track: JitsiMeetJS.JitsiTrack) {
    const trackType = track.getType()
    const isMuted = false

    if (trackType === 'audio') {
      if (this.audioTrack) {
        this.audioTrack.dispose()
      }

      this.audioTrack = null
      this.isAudioMuted = isMuted
    }

    if (trackType === 'video') {
      if (this.videoTrack) {
        this.videoTrack.dispose()
      }

      this.videoTrack = null
      this.isVideoMuted = isMuted
    }
  }

  @action
  _updateTrackMute (track: JitsiMeetJS.JitsiTrack) {
    const trackType = track.getType()

    if (trackType === 'audio') {
      this.isAudioMuted = track.isMuted()
    }

    if (trackType === 'video') {
      this.isVideoMuted = track.isMuted()
    }
  }

  @action
  _updateIsDominantSpeaker (isDominantSpeaker: boolean) {
    this.isDominantSpeaker = isDominantSpeaker

    if (isDominantSpeaker) {
      this.lastDominantSpeakerAt = new Date()
    }
  }

  @action
  _updateDisplayName (displayName: string) {
    this.displayName = displayName
  }

  @action
  _updateRole (role: string) {
    this.role = role
  }

  @action
  _updateStatus (status: string) {
    this.status = status
  }

  @bind
  _handleTrackAdded (track: JitsiMeetJS.JitsiTrack) {
    if (this.id === track.getParticipantId() && !this.isLocal) {
      this.addTrack(track)
      this.emit(JitsiParticipant.events.TRACK_ADDED, track)

      console.debug('Implemented: TrackAdded', track, this)
    }
  }

  @bind
  _handleTrackRemoved (track: JitsiMeetJS.JitsiTrack) {
    if (this.id === track.getParticipantId() && !this.isLocal) {
      this.removeTrack(track)
      this.emit(JitsiParticipant.events.TRACK_REMOVED, track)

      console.debug('Implemented: TrackRemoved', track, this)
    }
  }

  @bind
  _handleTrackMuteChanged (track: JitsiMeetJS.JitsiTrack) {
    if (this.id === track.getParticipantId()) {
      this._updateTrackMute(track)
      this.emit(JitsiParticipant.events.TRACK_MUTE_CHANGED, track)

      console.warn('Implemented: TrackMuteChanged', track, this)
    }
  }

  @bind
  _handleTrackAudioLevelChanged (track: JitsiMeetJS.JitsiTrack) {
    console.warn('Not implemented: _handleTrackAudioLevelChanged', track)
  }

  @bind
  _handleDominantSpeakerChanged (id: string) {
    this._updateIsDominantSpeaker(id === this.id)
    this.emit(JitsiParticipant.events.DOMINANT_SPEAKER_CHANGED)

    console.debug('Implemented: DominantSpeakerChanged', id, this)
  }

  @bind
  _handleDisplayNameChanged (id: string, displayName: string) {
    if (this.id === id) {
      this._updateDisplayName(displayName)
      this.emit(JitsiParticipant.events.DISPLAY_NAME_CHANGED, displayName)

      console.debug('Implemented: DisplayNameChanged', id, displayName, this)
    }
  }

  @bind
  _handleUserRoleChanged (id: string, role: string) {
    if (this.id === id) {
      this._updateRole(role)
      this.emit(JitsiParticipant.events.ROLE_CHANGED, role)

      console.debug('Implemented: UserRoleChanged', id, role, this)
    }


  }

  @bind
  _handleUserStatusChanged (id: string, status: string) {
    if (this.id === id) {
      this._updateStatus(status)
      this.emit(JitsiParticipant.events.STATUS_CHANGED, status)

      console.debug('Implemented: UserStatusChanged', id, status, this)
    }
  }
}
