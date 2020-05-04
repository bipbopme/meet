import { Portal } from 'react-portal'
import React from 'react'
import Video from './video'
import _chunk from 'lodash/chunk'
import { observer } from 'mobx-react'

@observer
export default class SingleView extends React.Component {
  constructor (props) {
    super(props)

    this.videosRef = React.createRef()
    this.conference = props.conference
  }

  componentDidMount () {
    this.updateVideoConstraints()
  }

  componentDidUpdate () {
    this.updateVideoConstraints()
  }

  updateVideoConstraints () {
    console.warn('trying to update constraints')
    if (this.speakingParticipant) {
      console.warn('Did update constraints',[this.speakingParticipant.id] )
      this.conference.selectParticipants([this.speakingParticipant.id])
      this.conference.setReceiverVideoConstraint(720)
    }
  }

  getCssClassNames () {
    let classNames = ['singleView']

    classNames.push(this.props.videoZoomed ? 'videoCropped' : 'videoOriginal')

    return classNames.join(' ')
  }

  render () {
    const { participants, localParticipant } = this.props.conference

    const speakingParticipant = participants.filter(p => p.isDominantSpeaker)[0] || participants[0] || localParticipant
    const nonSpeakingParticipants = [...participants.filter(p => p.isVideoTagActive), localParticipant].filter(p => p !== speakingParticipant)
    const disabledParticipants = participants.filter(p => !p.isVideoTagActive)

    console.warn('PARTICIPANTS', speakingParticipant, nonSpeakingParticipants, disabledParticipants)

    // Save the speaking participant in order to update video contraints
    this.speakingParticipant = speakingParticipant

    return (
      <section className='videos' ref={this.videosRef}>
        <div className={this.getCssClassNames()}>
          <div className='nonSpeakingParticipants'>
            {nonSpeakingParticipants.map(participant => (
              <Video key={participant.id} isLocal={participant.isLocal} participant={participant} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} isDominantSpeaker={participant.isDominantSpeaker} />
            ))}
          </div>
          <div className='speakingParticipant'>
            {speakingParticipant &&
              <Video key={speakingParticipant.id} isLocal={speakingParticipant.isLocal} speakingParticipant={speakingParticipant} audioTrack={speakingParticipant.audioTrack} videoTrack={speakingParticipant.videoTrack} isAudioMuted={speakingParticipant.isAudioMuted} isVideoMuted={speakingParticipant.isVideoMuted} isDominantSpeaker={speakingParticipant.isDominantSpeaker} />
            }
          </div>
        </div>
        <Portal>
          <div className='disabledVideos'>
            {disabledParticipants.map(participant => (
              <Video key={participant.id} participant={participant} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} isDominantSpeaker={participant.isDominantSpeaker} />
            ))}
          </div>
        </Portal>
      </section>
    )
  }
}
