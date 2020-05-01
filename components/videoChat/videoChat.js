import { Portal } from 'react-portal'
import React from 'react'
import SettingsButton from './controls/settingsButton'
import Video from './video'
import VideoChatControls from './controls/videoChatControls'
import _chunk from 'lodash/chunk'
import { debounce } from 'lodash'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.videoChatRef = React.createRef()

    this.conference = props.conference
    this.handleResizeDebounced = debounce(this.handleResize.bind(this), 25)
    this.calculateVideoContraintDebounced = debounce(this.calculateVideoConstraint.bind(this), 1000)

    window.addEventListener('resize', this.handleResizeDebounced, 100)
  }

  componentDidUpdate () {
    this.handleResize()
  }

  handleResize () {
    if (this.videoChatRef.current && this.gridDimensions) {
      this.updateVideoDimensions(this.gridDimensions)
      this.calculateVideoContraintDebounced()
    }
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

  getGridDimensions (count) {
    let sqrt = Math.sqrt(count)
    let columns = Math.ceil(sqrt)
    console.warn({ sqrt })
    let rows = sqrt === columns || (sqrt - Math.floor(sqrt)) >= 0.5 ?  columns : columns - 1

    return { columns, rows }
  }

  updateVideoDimensions (gridDimensions) {
    const videoContainerAspectRatio = 16 / 9
    const containerHeight = this.videoChatRef.current.offsetHeight
    const containerWidth = this.videoChatRef.current.offsetWidth

    console.warn({ videoContainerAspectRatio, containerHeight, containerWidth, gridDimensions, ref: this.videoChatRef.current })

    // Try landscape first
    let videoWidth = containerWidth / gridDimensions.columns
    let videoHeight = videoWidth / videoContainerAspectRatio

    // If it's too tall then use portrait orientation
    if ((videoHeight * gridDimensions.rows) > containerHeight) {
      videoHeight = containerHeight / gridDimensions.rows
      videoWidth = videoHeight * videoContainerAspectRatio
    }

    console.warn('Update video dimensions', videoWidth, videoHeight)

    document.documentElement.style.setProperty('--video-height', `${videoHeight}px`)
    document.documentElement.style.setProperty('--video-width', `${videoWidth}px`)
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
    const activeParticipants = [...participants.filter(p => p.isVideoTagActive), localParticipant]
    const disabledParticipants = participants.filter(p => !p.isVideoTagActive)

    // Save dimensions so we can calulate video dimensions after render
    this.gridDimensions = this.getGridDimensions(activeParticipants.length)

    const participantChunks = _chunk(activeParticipants, this.gridDimensions.columns)

    return status === 'joined' ? (
      <div className='videoChat' ref={this.videoChatRef}>
        <header>
          <h1>bipbop</h1>
          <div className='controls'>
            <div className='right'>
              <SettingsButton localParticipant={localParticipant} />
            </div>
          </div>
        </header>
        <section className={this.getCssClasses(activeParticipants)}>
          <div className='grid'>
            {participantChunks.map(participants => (
              <div className='row'>
                {participants.map(participant => (
                  <Video key={participant.id} isLocal={participant.isLocal} participant={participant} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} isDominantSpeaker={participant.isDominantSpeaker} />
                ))}
              </div>
            ))}
          </div>
        </section>
        <Portal>
          <div className='disabledVideos'>
            {disabledParticipants.map(participant => (
              <Video key={participant.id} participant={participant} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} isDominantSpeaker={participant.isDominantSpeaker} />
            ))}
          </div>
        </Portal>
        <VideoChatControls conference={this.conference} localParticipant={localParticipant} onLeave={this.props.onLeave} onToggleChat={this.props.onToggleChat} />
      </div>
    ) : null
  }
}
