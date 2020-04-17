/* global JitsiMeetJS */
import React from 'react'
import Video from './video'
import VideoChatControls from './controls/videoChatControls'
import { bind } from 'decko'
import { debounce } from 'lodash'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.conference = props.conference
    this.debouncedCalculateVideoContraint = debounce(this.calculateVideoConstraint, 1000)

    window.addEventListener('resize', this.debouncedCalculateVideoContraint)
  }

  @bind
  calculateVideoConstraint () {
    console.log('calculating video constraint')
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

      console.log('calculateVideoConstraint', sampleVideoContainer, elementHeight, videoConstraint)

      this.conference.setReceiverVideoConstraint(videoConstraint)
    }
  }

  render () {
    const { participants, localParticipant, status } = this.props.conference

    return (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
        </header>
        {status === 'joined' &&
          <>
            <section className={`videos videos-count-${participants.length + 1}`}>
              {participants.map(participant => (
                <Video key={participant.id} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} />
              ))}
              <Video key={localParticipant.id} isLocal audioTrack={localParticipant.audioTrack} videoTrack={localParticipant.videoTrack} isAudioMuted={localParticipant.isAudioMuted} isVideoMuted={localParticipant.isVideoMuted}  />
            </section>
            <VideoChatControls localParticipant={localParticipant} />
          </>
        }

      </div>
    )
  }
}
