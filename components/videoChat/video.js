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
    this.videoRef = React.createRef()
    this.audioRef = React.createRef()
    this.handleClick = this.handleClick.bind(this)
    this.handleVideoCanPlay = this.handleVideoCanPlay.bind(this)
    this.handleVideoEmptied = this.handleVideoEmptied.bind(this)

    this.state = {
      cover: true
    }
  }

  componentDidMount () {
    this.updateTrackAttachments()

    this.videoRef.current.addEventListener('canplay', this.handleVideoCanPlay)
    this.videoRef.current.addEventListener('emptied', this.handleVideoEmptied)
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

      this.watchTrackForDisconnect(this.props.videoTrack)
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

  handleClick () {
    this.setState({ cover: !this.state.cover })
  }

  handleVideoCanPlay () {
    this.updateVideoTagStaus(true)
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

  getClassNames () {
    const { isLocal, isAudioMuted, isVideoMuted, isDominantSpeaker, videoTrack } = this.props
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

    classNames.push(this.state.cover ? 'coverVideo' : 'containVideo')

    return classNames.join(' ')
  }

  render () {
    return (
      <div className={this.getClassNames()}>
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
