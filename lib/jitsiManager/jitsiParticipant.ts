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

  id: string
  isLocal = false
  private conference: JitsiMeetJS.JitsiConference

  @observable displayName: string | undefined
  @observable audioTrack: JitsiMeetJS.JitsiTrack | undefined = undefined
  @observable videoTrack: JitsiMeetJS.JitsiTrack | undefined = undefined
  @observable isDominantSpeaker = false
  @observable lastDominantSpeakerAt = new Date(0)
  @observable role: string | undefined = undefined
  @observable status: string | undefined = undefined
  @observable isAudioMuted = false
  @observable isVideoMuted = false
  @observable isVideoTagActive = false

  constructor (id: string, conference: JitsiMeetJS.JitsiConference, displayName: string | undefined = undefined, isLocal = false) {
    super()

    this.id = id
    this.conference = conference
    this.isLocal = isLocal
    this.displayName = displayName

    this.addEventListeners()
  }

  muteAudio (): void {
    if (this.isLocal && this.audioTrack) {
      this.audioTrack.mute()
    }
  }

  unmuteAudio (): void {
    if (this.isLocal && this.audioTrack) {
      this.audioTrack.unmute()
    }
  }

  muteVideo (): void {
    if (this.isLocal && this.videoTrack) {
      this.videoTrack.mute()
    }
  }

  unmuteVideo (): void {
    if (this.isLocal && this.videoTrack) {
      this.videoTrack.unmute()
    }
  }

  async replaceAudioTrack (track: JitsiMeetJS.JitsiTrack): Promise<void> {
    if (this.audioTrack && track.getId() !== this.audioTrack.getId()) {
      await this.conference.removeTrack(this.audioTrack)
      this.audioTrack.dispose()

      await this.conference.addTrack(track)
      this.addTrack(track)
    }
  }

  async replaceVideoTrack (track: JitsiMeetJS.JitsiTrack): Promise<void> {
    if (this.videoTrack && track.getId() !== this.videoTrack.getId()) {
      await this.conference.removeTrack(this.videoTrack)
      this.videoTrack.dispose()

      await this.conference.addTrack(track)
      this.addTrack(track)
    }
  }

  dispose (): void {
    this.removeEventListeners()
  }

  private addEventListeners (): void {
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_ADDED, this.handleTrackAdded)
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_REMOVED, this.handleTrackRemoved)
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this.handleTrackMuteChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, this.handleTrackAudioLevelChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED, this.handleDominantSpeakerChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, this.handleDisplayNameChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.USER_ROLE_CHANGED, this.handleUserRoleChanged)
    this.conference.addEventListener(JitsiMeetJS.events.conference.USER_STATUS_CHANGED, this.handleUserStatusChanged)
  }

  private removeEventListeners (): void {
    this.conference.removeEventListener(JitsiMeetJS.events.conference.TRACK_ADDED, this.handleTrackAdded)
    this.conference.removeEventListener(JitsiMeetJS.events.conference.TRACK_REMOVED, this.handleTrackRemoved)
    this.conference.removeEventListener(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this.handleTrackMuteChanged)
    this.conference.removeEventListener(JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED, this.handleTrackAudioLevelChanged)
    this.conference.removeEventListener(JitsiMeetJS.events.conference.DOMINANT_SPEAKER_CHANGED, this.handleDominantSpeakerChanged)
    this.conference.removeEventListener(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, this.handleDisplayNameChanged)
    this.conference.removeEventListener(JitsiMeetJS.events.conference.USER_ROLE_CHANGED, this.handleUserRoleChanged)
    this.conference.removeEventListener(JitsiMeetJS.events.conference.USER_STATUS_CHANGED, this.handleUserStatusChanged)
  }

  @action
  addTrack (track: JitsiMeetJS.JitsiTrack): void {
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
  removeTrack (track: JitsiMeetJS.JitsiTrack): void {
    const trackType = track.getType()
    const isMuted = false

    if (trackType === 'audio') {
      if (this.audioTrack) {
        this.audioTrack.dispose()
      }

      this.audioTrack = undefined
      this.isAudioMuted = isMuted
    }

    if (trackType === 'video') {
      if (this.videoTrack) {
        this.videoTrack.dispose()
      }

      this.videoTrack = undefined
      this.isVideoMuted = isMuted
    }
  }

  @action
  private updateTrackMute (track: JitsiMeetJS.JitsiTrack): void {
    const trackType = track.getType()

    if (trackType === 'audio') {
      this.isAudioMuted = track.isMuted()
    }

    if (trackType === 'video') {
      this.isVideoMuted = track.isMuted()
    }
  }

  @action
  private updateIsDominantSpeaker (isDominantSpeaker: boolean): void {
    this.isDominantSpeaker = isDominantSpeaker

    if (isDominantSpeaker) {
      this.lastDominantSpeakerAt = new Date()
    }
  }

  @action
  private updateDisplayName (displayName: string): void {
    this.displayName = displayName
  }

  @action
  private updateRole (role: string): void {
    this.role = role
  }

  @action
  private updateStatus (status: string): void {
    this.status = status
  }

  @bind
  private handleTrackAdded (track: JitsiMeetJS.JitsiTrack): void {
    if (this.id === track.getParticipantId() && !this.isLocal) {
      this.addTrack(track)
      this.emit(JitsiParticipant.events.TRACK_ADDED, track)

      console.debug('Implemented: TrackAdded', track, this)
    }
  }

  @bind
  private handleTrackRemoved (track: JitsiMeetJS.JitsiTrack): void {
    if (this.id === track.getParticipantId() && !this.isLocal) {
      this.removeTrack(track)
      this.emit(JitsiParticipant.events.TRACK_REMOVED, track)

      console.debug('Implemented: TrackRemoved', track, this)
    }
  }

  @bind
  private handleTrackMuteChanged (track: JitsiMeetJS.JitsiTrack): void {
    if (this.id === track.getParticipantId()) {
      this.updateTrackMute(track)
      this.emit(JitsiParticipant.events.TRACK_MUTE_CHANGED, track)

      console.warn('Implemented: TrackMuteChanged', track, this)
    }
  }

  @bind
  private handleTrackAudioLevelChanged (track: JitsiMeetJS.JitsiTrack): void {
    console.warn('Not implemented: _handleTrackAudioLevelChanged', track)
  }

  @bind
  private handleDominantSpeakerChanged (id: string): void {
    this.updateIsDominantSpeaker(id === this.id)
    this.emit(JitsiParticipant.events.DOMINANT_SPEAKER_CHANGED)

    console.debug('Implemented: DominantSpeakerChanged', id, this)
  }

  @bind
  private handleDisplayNameChanged (id: string, displayName: string): void {
    if (this.id === id) {
      this.updateDisplayName(displayName)
      this.emit(JitsiParticipant.events.DISPLAY_NAME_CHANGED, displayName)

      console.debug('Implemented: DisplayNameChanged', id, displayName, this)
    }
  }

  @bind
  private handleUserRoleChanged (id: string, role: string): void {
    if (this.id === id) {
      this.updateRole(role)
      this.emit(JitsiParticipant.events.ROLE_CHANGED, role)

      console.debug('Implemented: UserRoleChanged', id, role, this)
    }
  }

  @bind
  private handleUserStatusChanged (id: string, status: string): void {
    if (this.id === id) {
      this.updateStatus(status)
      this.emit(JitsiParticipant.events.STATUS_CHANGED, status)

      console.debug('Implemented: UserStatusChanged', id, status, this)
    }
  }
}
