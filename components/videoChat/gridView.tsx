import React, { RefObject } from 'react'
import Video from './video'
import _chunk from 'lodash/chunk'
import { observer } from 'mobx-react'
import JitsiConferenceManager from '../../lib/jitsiManager/jitsiConferenceManager'
import { bind, debounce } from 'lodash-decorators'

interface GridViewProps {
  conference: JitsiConferenceManager;
  crop: boolean;
}

@observer
export default class GridView extends React.Component<GridViewProps> {
  private gridDimensions?: { columns: number; rows: number }
  private videosRef: RefObject<HTMLDivElement>

  constructor (props) {
    super(props)

    this.videosRef = React.createRef()

    window.addEventListener('resize', this.handleGridResize)
  }

  componentDidMount () {
    this.handleGridResize()
  }

  componentDidUpdate () {
    this.handleGridResize()
  }

  @bind() @debounce(250)
  handleGridResize () {
    if (this.videosRef.current && this.gridDimensions) {
      this.updateVideoDimensions({ gridDimensions: this.gridDimensions, crop: this.props.crop })
      this.calculateVideoConstraint()
    }
  }

  @bind() @debounce(1000)
  calculateVideoConstraint () {
    if (this.videosRef.current) {
      const sampleVideoContainer = this.videosRef.current.getElementsByClassName('video')[0]

      if (sampleVideoContainer) {
        const elementHeight = sampleVideoContainer.offsetHeight
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

        this.props.conference.selectAllParticipants()
        this.props.conference.setReceiverVideoConstraint(videoConstraint)
      }
    }
  }

  getGridDimensions (count: number) {
    const sqrt = Math.sqrt(count)
    const rows = Math.ceil(sqrt)
    const columns = sqrt === rows || (sqrt - Math.floor(sqrt)) >= 0.5 ?  rows : rows - 1

    return { columns, rows }
  }

  updateVideoDimensions ({ gridDimensions, crop = false, aspectRatio = 16/9, videoMargin = 5 }) {
    let containerHeight = this.videosRef.current.offsetHeight
    let containerWidth = this.videosRef.current.offsetWidth
    const combinedMargin = videoMargin * 2

    // Remove margin from the container calculation
    containerHeight = containerHeight - combinedMargin
    containerWidth = containerWidth - combinedMargin

    let height: number, width: number

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

  getCssClassNames () {
    const classNames = ['gridView']

    classNames.push(this.props.crop ? 'cropped' : 'uncropped')

    return classNames.join(' ')
  }

  render () {
    const { participants, localParticipant } = this.props.conference
    const allParticipants = [...participants, localParticipant]

    // Save dimensions so we can calulate video dimensions after render
    this.gridDimensions = this.getGridDimensions(allParticipants.length)

    const participantChunks = _chunk(allParticipants, this.gridDimensions.columns)

    return (
      <section className='videos' ref={this.videosRef}>
        <div className={this.getCssClassNames()}>
          {participantChunks.map((participants, chunkIndex) => (
            <div key={`row-${chunkIndex}`}className='row'>
              {participants.map(participant => (
                <Video 
                  key={participant.id} 
                  participant={participant}
                  isLocal={participant.isLocal}
                  audioTrack={participant.audioTrack}
                  videoTrack={participant.videoTrack}
                  isVideoActive={participant.isVideoTagActive}
                  isAudioMuted={participant.isAudioMuted}
                  isVideoMuted={participant.isVideoMuted}
                  isDominantSpeaker={participant.isDominantSpeaker} 
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    )
  }
}
