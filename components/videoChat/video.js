import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophoneSlash, faVideoSlash } from '@fortawesome/free-solid-svg-icons'

export default class Video extends React.Component {
  constructor (props) {
    super(props)

    this.videoRef = React.createRef()
    this.audioRef = React.createRef()
    this.handleClick = this.handleClick.bind(this)

    this.state = {
      cover: true
    }
  }

  componentDidMount () {
    this.updateTrackAttachments()
  }

  componentDidUpdate (prevProps) {
    this.updateTrackAttachments(prevProps)
  }

  // TODO: This finally feels stable but needs to be simplified
  updateTrackAttachments (prevProps = {}) {
    // Add audio track
    if (!prevProps.audioTrack && this.props.audioTrack) {
      this.props.audioTrack.attach(this.audioRef.current)
    }

    // Update audio track
    if (prevProps.audioTrack && this.props.audioTrack) {
      if (prevProps.audioTrack.getId() !== this.props.audioTrack.getId()) {
        prevProps.audioTrack.detach(this.audioRef.current)
        this.props.audioTrack.attach(this.audioRef.current)
      } else {
        // They're the same so do nothing
      }
    }

    // Remove audio track
    if (prevProps.audioTrack && !this.props.audioTrack) {
      prevProps.audioTrack.detach(this.audioRef.current)
    }

    // Add video track
    if (!prevProps.videoTrack && this.props.videoTrack) {
      this.props.videoTrack.attach(this.videoRef.current)
    }

    // Update video track
    if (prevProps.videoTrack && this.props.videoTrack) {
      if (prevProps.videoTrack.getId() !== this.props.videoTrack.getId()) {
        prevProps.videoTrack.detach(this.videoRef.current)
        this.props.videoTrack.attach(this.videoRef.current)
      } else {
        // They're the same so do nothing
      }
    }

    // Remove video track
    if (prevProps.videoTrack && !this.props.videoTrack) {
      prevProps.videoTrack.detach(this.videoRef.current)
    }
  }

  handleClick () {
    this.setState({ cover: !this.state.cover })
  }

  getClassNames () {
    let classNames = ['video']

    classNames.push(this.props.isLocal ? 'local' : 'remote')

    if (this.props.isAudioMuted) {
      classNames.push('audioMuted')
    }

    if (this.props.isVideoMuted) {
      classNames.push('videoMuted')
    }

    return classNames.join(' ')
  }

  render () {
    return (
      <div className={this.getClassNames()} onClick={this.handleClick}>
        <video ref={this.videoRef} autoPlay playsInline style={{ objectFit: this.state.cover ? 'cover' : 'contain' }} />
        <audio ref={this.audioRef} autoPlay muted={this.props.isLocal} />
        {this.props.isAudioMuted &&
          <FontAwesomeIcon icon={faMicrophoneSlash} />
        }
        {this.props.isVideoMuted &&
          <FontAwesomeIcon icon={faVideoSlash} />
        }
      </div>
    )
  }
}
