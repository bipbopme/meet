import { faMicrophoneSlash, faVideoSlash } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { action } from 'mobx'
import { observer } from 'mobx-react'

@observer
export default class Video extends React.Component {
  constructor (props) {
    super(props)

    this.participant = this.props.participant
    this.videoContainerRef = React.createRef()
    this.videoRef = React.createRef()
    this.audioRef = React.createRef()
    this.handleVideoCanPlay = this.handleVideoCanPlay.bind(this)
    this.handleVideoEmptied = this.handleVideoEmptied.bind(this)
  }

  componentDidMount () {
    this.updateTrackAttachments()

    this.videoRef.current.addEventListener('canplay', this.handleVideoCanPlay)
    this.videoRef.current.addEventListener('emptied', this.handleVideoEmptied)
  }

  componentDidUpdate (prevProps) {
    this.updateTrackAttachments(prevProps)
  }

  componentWillUnmount () {
    const { audioTrack, videoTrack } = this.props

    if (audioTrack) {
      audioTrack.detach()
    }

    if (videoTrack) {
      audioTrack.detach()
    }
  }

  // TODO: This finally feels stable but needs to be simplified
  updateTrackAttachments (prevProps = {}) {
    // Add audio track
    if (!prevProps.audioTrack && this.props.audioTrack) {
      console.info('Add audio track', prevProps, this.props)
      this.props.audioTrack.attach(this.audioRef.current)
    }

    // Update audio track
    if (prevProps.audioTrack && this.props.audioTrack) {
      if (prevProps.audioTrack.getId() !== this.props.audioTrack.getId()) {
        console.info('Replace audio track', prevProps, this.props)
        prevProps.audioTrack.detach()
        this.props.audioTrack.attach(this.audioRef.current)
      } else {
        // They're the same so do nothing
      }
    }

    // Remove audio track
    if (prevProps.audioTrack && !this.props.audioTrack) {
      console.info('Remove audio track', prevProps, this.props)
      prevProps.audioTrack.detach()
    }

    // Add video track
    if (!prevProps.videoTrack && this.props.videoTrack) {
      console.info('Add video track', prevProps, this.props)
      this.props.videoTrack.attach(this.videoRef.current)

      this.watchTrackForDisconnect(this.props.videoTrack)
    }

    // Update video track
    if (prevProps.videoTrack && this.props.videoTrack) {
      if (prevProps.videoTrack.getId() !== this.props.videoTrack.getId()) {
        console.info('Replace video track', prevProps, this.props)
        prevProps.videoTrack.detach()
        this.props.videoTrack.attach(this.videoRef.current)
      } else {
        // They're the same so do nothing
      }
    }

    // Remove video track
    if (prevProps.videoTrack && !this.props.videoTrack) {
      console.info('Remove video track', prevProps, this.props)
      prevProps.videoTrack.detach()
    }

    this.updateAspectRatio()
  }

  // TODO: This is a hack to catch video disconnects faster.
  //       The right solution here is to switch to websockets.
  watchTrackForDisconnect (track) {
    if (track.rtc) {
      track.rtc.on('rtc.endpoint_conn_status_changed', (id, active) => {
        if (!active) {
          this.updateVideoTagStaus(false)
        }
      })
    }
  }

  handleVideoCanPlay () {
    this.updateVideoTagStaus(true)
    this.updateAspectRatio()
  }

  handleVideoEmptied () {
    this.updateVideoTagStaus(false)
  }

  @action
  updateVideoTagStaus (active) {
    if (this.participant) {
      this.participant.isVideoTagActive = active
    }
  }

  updateAspectRatio () {
    let containerEl = this.videoContainerRef.current
    let videoEl = this.videoRef.current

    if (containerEl && videoEl) {
      let className = (videoEl.videoWidth / videoEl.videoHeight) < (16 / 9) ?
        'narrowAspect' : 'wideAspect'

        containerEl.classList.remove('narrowAspect', 'wideAspect')
        containerEl.classList.add(className)
    }
  }

  getClassNames () {
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

  render () {
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
