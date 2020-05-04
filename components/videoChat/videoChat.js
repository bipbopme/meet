import { Portal } from 'react-portal'
import React from 'react'
import SettingsButton from './controls/settingsButton'
import Video from './video'
import VideoChatControls from './controls/videoChatControls'
import ViewButton from './controls/viewButton'
import _chunk from 'lodash/chunk'
import { debounce } from 'lodash'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.videosRef = React.createRef()

    this.conference = props.conference
    this.handleResizeDebounced = debounce(this.handleResize.bind(this), 20)
    this.calculateVideoContraintDebounced = debounce(this.calculateVideoConstraint.bind(this), 1000)
    this.handleToggleVideoZoom = this.handleToggleVideoZoom.bind(this)

    window.addEventListener('resize', this.handleResizeDebounced)

    this.state = {
      videoZoomed: false
    }
  }

  handleToggleVideoZoom (zoomed) {
    this.setState({ videoZoomed: zoomed })
  }

  componentDidUpdate () {
    this.handleResize()
  }

  handleResize () {
    if (this.videosRef.current && this.gridDimensions) {
      this.updateVideoDimensions({ gridDimensions: this.gridDimensions, zoom: this.state.videoZoomed })
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
    let rows = Math.ceil(sqrt)
    let columns = sqrt === rows || (sqrt - Math.floor(sqrt)) >= 0.5 ?  rows : rows - 1

    return { columns, rows }
  }

  updateVideoDimensions ({ gridDimensions, zoom = false, aspectRatio = 16/9, minContainerWidth = 900, videoMargin = 5 }) {
    let containerHeight = this.videosRef.current.offsetHeight
    let containerWidth = this.videosRef.current.offsetWidth
    let combinedMargin = videoMargin * 2

    // Remove margin from the container calculation
    containerHeight = containerHeight - combinedMargin
    containerWidth = containerWidth - combinedMargin

    let cover = zoom || containerWidth <= minContainerWidth
    let height, width

    // Fill all the available space
    if (cover) {
      height = containerHeight / gridDimensions.rows
      width = containerWidth / gridDimensions.columns
    // Keep aspect ratio
    } else {
      // Try landscape first
      width = containerWidth / gridDimensions.columns
      height = width / aspectRatio

      // If it's too tall then use portrait orientation
      if ((height * gridDimensions.rows) > containerHeight) {
        height = containerHeight / gridDimensions.rows
        width = height * aspectRatio
      }
    }

    // Adjust video size to account for margin
    height = height - combinedMargin
    width = width - combinedMargin

    document.documentElement.style.setProperty('--video-height', `${height}px`)
    document.documentElement.style.setProperty('--video-width', `${width}px`)
    document.documentElement.style.setProperty('--video-margin', `${videoMargin}px`)
    document.documentElement.style.setProperty('--video-cover', cover ? 'cover' : 'contain')
  }

  render () {
    const { participants, localParticipant, status } = this.props.conference
    const activeParticipants = [...participants.filter(p => p.isVideoTagActive), localParticipant]
    const disabledParticipants = participants.filter(p => !p.isVideoTagActive)

    // Save dimensions so we can calulate video dimensions after render
    this.gridDimensions = this.getGridDimensions(activeParticipants.length)

    const participantChunks = _chunk(activeParticipants, this.gridDimensions.columns)

    return status === 'joined' ? (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
          <div className='controls'>
            <div className='right'>
              <ViewButton onToggle={this.handleToggleVideoZoom} />
              <SettingsButton localParticipant={localParticipant} />
            </div>
          </div>
        </header>
        <section className='videos' ref={this.videosRef}>
          <div className={`grid ${this.state.videoZoomed ? 'videoCropped' : 'videoOriginal'}`}>
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
