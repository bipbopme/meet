import React from 'react'
import Video from './video'
import _chunk from 'lodash/chunk'
import { observer } from 'mobx-react'

@observer
export default class SpotlightView extends React.Component {
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
    if (this.speakingParticipant) {
      this.conference.selectParticipants([this.speakingParticipant.id])
      this.conference.setReceiverVideoConstraint(720)
    }
  }

  getCssClassNames () {
    let classNames = ['spotlightView']

    classNames.push(this.props.crop ? 'cropped' : 'uncropped')

    return classNames.join(' ')
  }

  render () {
    const { participants, localParticipant } = this.props.conference

    const sortedParticipants = participants.slice().sort((a, b) => b.lastDominantSpeakerAt - a.lastDominantSpeakerAt)
    const speakingParticipant = sortedParticipants.filter(p => p.isDominantSpeaker)[0] || sortedParticipants[0] || localParticipant
    const nonSpeakingParticipants = [localParticipant, ...sortedParticipants].filter(p => p !== speakingParticipant)

    // Save the speaking participant in order to update video contraints
    this.speakingParticipant = speakingParticipant

    return (
      <section className='videos' ref={this.videosRef}>
        <div className={this.getCssClassNames()}>
          <div className='nonSpeakingParticipants'>
            {nonSpeakingParticipants.map(participant => (
              <Video key={participant.id} participant={participant} isLocal={participant.isLocal} isVideoActive={participant.isVideoTagActive} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} isDominantSpeaker={participant.isDominantSpeaker} />
            ))}
          </div>
          <div className='speakingParticipant'>
            {speakingParticipant &&
              <Video key={speakingParticipant.id} participant={speakingParticipant} isLocal={speakingParticipant.isLocal} isVideoActive={speakingParticipant.isVideoTagActive} audioTrack={speakingParticipant.audioTrack} videoTrack={speakingParticipant.videoTrack} isAudioMuted={speakingParticipant.isAudioMuted} isVideoMuted={speakingParticipant.isVideoMuted} isDominantSpeaker={speakingParticipant.isDominantSpeaker} />
            }
          </div>
        </div>
      </section>
    )
  }
}
