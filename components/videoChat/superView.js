import React from 'react'
import Video from './video'
import _chunk from 'lodash/chunk'
import { debounce } from 'lodash'
import { observer } from 'mobx-react'

@observer
export default class SuperView extends React.Component {
  constructor (props) {
    super(props)

    this.videosRef = React.createRef()
    this.conference = props.conference
    this.handleViewResizeDebounced = debounce(this.handleViewResize.bind(this), 250)
    this.updateGridVideoConstraintsDebounced = debounce(this.updateGridVideoConstraints.bind(this), 1000)

    window.addEventListener('resize', this.handleViewResizeDebounced)
  }

  isGridView () {
    return this.props.view === 'grid'
  }

  componentDidMount () {
    this.handleViewResize()
  }

  componentDidUpdate () {
    this.handleViewResize()
  }

  handleViewResize () {
    if (this.isGridView()) {
      if (this.videosRef.current && this.gridDimensions) {
        this.updateGridVideoDimensions({ gridDimensions: this.gridDimensions, crop: this.props.crop })
        this.updateGridVideoConstraintsDebounced()
      }
    } else {
      this.updateSingleVideoConstraints()
    }
  }

  updateGridVideoConstraints () {
    if (this.videosRef.current) {
      const sampleVideoContainer = this.videosRef.current.getElementsByClassName('video')[0]

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

        console.log('updateGridVideoConstraints', elementHeight, videoConstraint)

        this.conference.selectAllParticipants()
        this.conference.setReceiverVideoConstraint(videoConstraint)
      }
    }
  }

  updateSingleVideoConstraints () {
    if (this.speakingParticipant) {
      this.conference.selectParticipants([this.speakingParticipant.id])
      this.conference.setReceiverVideoConstraint(720)
    }
  }

  getGridDimensions (count) {
    let sqrt = Math.sqrt(count)
    let rows = Math.ceil(sqrt)
    let columns = sqrt === rows || (sqrt - Math.floor(sqrt)) >= 0.5 ?  rows : rows - 1

    return { columns, rows }
  }

  updateGridVideoDimensions ({ gridDimensions, crop = false, aspectRatio = 16/9, videoMargin = 5 }) {
    let containerHeight = this.videosRef.current.offsetHeight
    let containerWidth = this.videosRef.current.offsetWidth
    let combinedMargin = videoMargin * 2

    // Remove margin from the container calculation
    containerHeight = containerHeight - combinedMargin
    containerWidth = containerWidth - combinedMargin

    let height, width

    // Fill all the available space
    if (crop) {
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

    this.videosRef.current.style.setProperty('--video-height', `${height}px`)
    this.videosRef.current.style.setProperty('--video-width', `${width}px`)
    this.videosRef.current.style.setProperty('--video-margin', `${videoMargin}px`)
  }

  getCssClassNames (view) {
    let classNames = [`${view}View`]

    classNames.push(this.props.crop ? 'cropped' : 'uncropped')

    return classNames.join(' ')
  }

  renderGrid () {
    const { participants, localParticipant, status } = this.props.conference
    const allParticipants = [...participants, localParticipant]

    // Save dimensions so we can calulate video dimensions after render
    this.gridDimensions = this.getGridDimensions(allParticipants.length)

    const participantChunks = _chunk(allParticipants, this.gridDimensions.columns)

    return (
      <section className='videos' ref={this.videosRef}>
        <div className={this.getCssClassNames('grid')}>
          {participantChunks.map((participants, chunkIndex) => (
            <div key={`row-${chunkIndex}`}className='row'>
              {participants.map(participant => (
                <Video key={participant.id} participant={participant} isLocal={participant.isLocal} audioTrack={participant.audioTrack} videoTrack={participant.videoTrack} isVideoActive={participant.isVideoTagActive} isAudioMuted={participant.isAudioMuted} isVideoMuted={participant.isVideoMuted} isDominantSpeaker={participant.isDominantSpeaker} />
              ))}
            </div>
          ))}
        </div>
      </section>
    )
  }

  renderSingle () {
    const { participants, localParticipant } = this.props.conference

    const sortedParticipants = participants.slice().sort((a, b) => b.lastDominantSpeakerAt - a.lastDominantSpeakerAt)
    const speakingParticipant = sortedParticipants.filter(p => p.isDominantSpeaker)[0] || sortedParticipants[0] || localParticipant
    const nonSpeakingParticipants = [localParticipant, ...sortedParticipants].filter(p => p !== speakingParticipant)

    // Save the speaking participant in order to update video contraints
    this.speakingParticipant = speakingParticipant

    return (
      <section className='videos' ref={this.videosRef}>
        <div className={this.getCssClassNames('single')}>
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

  render () {
    return this.props.view === 'grid' ? this.renderGrid() : this.renderSingle()
  }
}
