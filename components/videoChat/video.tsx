import { faMicrophoneSlash, faVideoSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { RefObject } from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import { bind } from 'lodash-decorators'
import JitsiParticipant from '../../lib/jitsiManager/jitsiParticipant'

interface VideoProps {
  participant?: JitsiParticipant;
  isLocal: boolean;
  audioTrack: JitsiMeetJS.JitsiTrack | undefined;
  videoTrack: JitsiMeetJS.JitsiTrack | undefined;
  isVideoActive?: boolean;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
  isDominantSpeaker?: boolean;
}

@observer
export default class Video extends React.Component<VideoProps> {
  private videoContainerRef: RefObject<HTMLDivElement>
  private videoRef: RefObject<HTMLVideoElement>
  private audioRef: RefObject<HTMLAudioElement>
  
  constructor (props: VideoProps) {
    super(props)

    this.videoContainerRef = React.createRef()
    this.videoRef = React.createRef()
    this.audioRef = React.createRef()
  }

  componentDidMount (): void {
    this.updateTrackAttachments()

    if (this.videoRef.current) {
      this.videoRef.current.addEventListener('canplay', this.handleVideoCanPlay)
      this.videoRef.current.addEventListener('emptied', this.handleVideoEmptied)
    }
  }

  componentDidUpdate (prevProps: VideoProps): void {
    this.updateTrackAttachments(prevProps)
  }

  componentWillUnmount (): void {
    const { audioTrack, videoTrack } = this.props

    if (audioTrack) {
      audioTrack.detach()
    }

    if (videoTrack) {
      videoTrack.detach()
    }

    if (this.videoRef.current) {
      this.videoRef.current.removeEventListener('canplay', this.handleVideoCanPlay)
      this.videoRef.current.removeEventListener('emptied', this.handleVideoEmptied)
    }
  }

  // TODO: This finally feels stable but needs to be simplified
  // TS: MAKE SURE THIS WORKS
  updateTrackAttachments (prevProps?: VideoProps): void {
    if (this.audioRef.current) {
      // Add audio track
      if (!(prevProps && prevProps.audioTrack) && this.props.audioTrack) {
        console.info('Add audio track', prevProps, this.props)
        this.props.audioTrack.attach(this.audioRef.current)
      }

      // Update audio track
      if ((prevProps && prevProps.audioTrack) && this.props.audioTrack) {
        if (prevProps.audioTrack.getId() !== this.props.audioTrack.getId()) {
          console.info('Replace audio track', prevProps, this.props)
          prevProps.audioTrack.detach()
          this.props.audioTrack.attach(this.audioRef.current)
        } else {
          // They're the same so do nothing
        }
      }

      // Remove audio track
      if ((prevProps && prevProps.audioTrack) && !this.props.audioTrack) {
        console.info('Remove audio track', prevProps, this.props)
        prevProps.audioTrack.detach()
      }
    } else {
      console.warn("Can't update audio track. Audio ref undefined.")
    }

    if (this.videoRef.current) {
      // Add video track
      if (!(prevProps && prevProps.videoTrack) && this.props.videoTrack) {
        console.info('Add video track', prevProps, this.props)
        this.props.videoTrack.attach(this.videoRef.current)
      }

      // Update video track
      if ((prevProps && prevProps.videoTrack) && this.props.videoTrack) {
        if (prevProps.videoTrack.getId() !== this.props.videoTrack.getId()) {
          console.info('Replace video track', prevProps, this.props)
          prevProps.videoTrack.detach()
          this.props.videoTrack.attach(this.videoRef.current)
        } else {
          // They're the same so do nothing
        }
      }

      // Remove video track
      if ((prevProps && prevProps.videoTrack) && !this.props.videoTrack) {
        console.info('Remove video track', prevProps, this.props)
        prevProps.videoTrack.detach()
      }

      this.updateAspectRatio()
    } else {
      console.warn("Can't update video track. Video ref undefined.")
    }
  }

  @bind()
  handleVideoCanPlay (): void {
    this.updateVideoTagStaus(true)
    this.updateAspectRatio()
  }

  @bind()
  handleVideoEmptied (): void {
    this.updateVideoTagStaus(false)
  }

  @action
  updateVideoTagStaus (active: boolean): void {
    if (this.props.participant) {
      this.props.participant.isVideoTagActive = active
    }
  }

  updateAspectRatio (): void {
    const containerEl = this.videoContainerRef.current
    const videoEl = this.videoRef.current

    if (containerEl && videoEl) {
      const className = (videoEl.videoWidth / videoEl.videoHeight) < (16 / 9) ?
        'narrowAspect' : 'wideAspect'

        containerEl.classList.remove('narrowAspect', 'wideAspect')
        containerEl.classList.add(className)
    }
  }

  getClassNames (): string {
    const { isLocal, isAudioMuted, isVideoMuted, isDominantSpeaker, videoTrack, isVideoActive } = this.props
    const classNames = ['video']

    classNames.push(isLocal ? 'local' : 'remote')

    if (isAudioMuted) {
      classNames.push('audioMuted')
    }

    if (isVideoMuted) {
      classNames.push('videoMuted')
    }

    if (isDominantSpeaker) {
      classNames.push('dominantSpeaker')
    }

    if (videoTrack) {
      classNames.push(`${videoTrack.videoType}VideoType`)
    }

    classNames.push(isVideoActive ? 'active' : 'inactive')

    return classNames.join(' ')
  }

  render (): JSX.Element {
    return (
      <div className={this.getClassNames()} ref={this.videoContainerRef}>
        <video ref={this.videoRef} autoPlay playsInline />
        <audio ref={this.audioRef} autoPlay muted={this.props.isLocal} />
        {this.props.isAudioMuted &&
          <FontAwesomeIcon icon={faMicrophoneSlash} />}
        {this.props.isVideoMuted &&
          <FontAwesomeIcon icon={faVideoSlash} />}
      </div>
    )
  }
}
