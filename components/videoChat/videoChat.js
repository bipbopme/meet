import React from 'react'
import SettingsButton from './controls/settingsButton'
import Video from './video'
import VideoChatControls from './controls/videoChatControls'
import { debounce } from 'lodash'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.conference = props.conference
    this.debouncedCalculateVideoContraint = debounce(this.calculateVideoConstraint.bind(this), 1000)

    this.conference.on('CONFERENCE_JOINED', this.debouncedCalculateVideoContraint)
    this.conference.on('PARTICIPANT_JOINED', this.debouncedCalculateVideoContraint)
    this.conference.on('PARTICIPANT_LEFT', this.debouncedCalculateVideoContraint)

    window.addEventListener('resize', this.debouncedCalculateVideoContraint)
  }

  calculateVideoConstraint () {
    const sampleVideoContainer = document.getElementsByClassName('video')[0]

    if (sampleVideoContainer) {
      let elementHeight = sampleVideoContainer.offsetHeight
      let videoConstraint;

      // TODO: these are okay values for wide video but not for cropped vertical video
      if (elementHeight < 180) {
        videoConstraint = 180
      } else if (elementHeight < 500) {
        videoConstraint = 360
      } else if (elementHeight < 1000) {
        videoConstraint = 720
      } else {
        videoConstraint = 1080
      }

      console.log('calculateVideoConstraint', elementHeight, videoConstraint)

      this.conference.selectAllParticipants()
      this.conference.setReceiverVideoConstraint(videoConstraint)
    }
  }

  getCssClasses (participants) {
    const cssClasses = ['videos']
    const videosCount = participants.length + 1

    cssClasses.push(`videos-count-${videosCount}`)

    if (videosCount > 2) {
      cssClasses.push('videos-count-3-or-more')
    } else {
      cssClasses.push('videos-count-2-or-less')
    }

    return cssClasses.join(' ')
  }

  render () {
    const { participants, localParticipant, status } = this.props.conference

    return status === 'joined' ? (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
          <div className='controls'>
            <div className='right'>
              <SettingsButton localParticipant={localParticipant} />
            </div>
          </div>
        </header>
        <section className={this.getCssClasses(participants)}>
          {participants.map(participant => (
            <Video key={participant.id} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} isDominantSpeaker={participant.isDominantSpeaker} />
          ))}
          <Video key={localParticipant.id} isLocal audioTrack={localParticipant.audioTrack} videoTrack={localParticipant.videoTrack} isAudioMuted={localParticipant.isAudioMuted} isVideoMuted={localParticipant.isVideoMuted} isDominantSpeaker={localParticipant.isDominantSpeaker} />
        </section>
        <VideoChatControls conference={this.conference} localParticipant={localParticipant} onLeave={this.props.onLeave} onToggleChat={this.props.onToggleChat} />
      </div>
    ) : null
  }
}
