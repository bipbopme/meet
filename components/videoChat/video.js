import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophoneSlash, faVideoSlash } from '@fortawesome/free-solid-svg-icons'

export default class Video extends React.Component {
  constructor (props) {
    super(props)

    this.conference = this.props.conference
    this.videoRef = React.createRef()
    this.audioRef = React.createRef()
    this.handleClick = this.handleClick.bind(this)

    if (this.conference) {
      this.conference.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, this.handleTrackMuteChanged.bind(this))
    }

    this.state = {
      cover: true,
      audioMuted: false,
      videoMuted: false
    }

    this.ensureMuteStates(this.props.tracks)
  }

  componentDidMount () {
    this.attachTracks(this.props.tracks)
  }

  componentWillUpdate () {
    this.ensureMuteStates(this.props.tracks)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.tracks) {
      this.detachTracks(prevProps.tracks)
    }

    this.attachTracks(this.props.tracks)
  }

  componentWillUnmount () {
    this.detachTracks(this.props.tracks)
  }

  handleTrackMuteChanged (track) {
    if (this.props.tracks && this.props.tracks.find(t => t === track)) {
      if (track.getType() === 'video') {
        this.setState({ videoMuted: track.isMuted() })
      } else {
        this.setState({ audioMuted: track.isMuted() })
      }
    }
  }

  ensureMuteStates (tracks) {
    if (tracks) {
      tracks.forEach(track => {
        if (track.getType() === 'video') {
          this.state.videoMuted = track.isMuted()
        } else {
          this.state.audioMuted = track.isMuted()
        }
      })
    }
  }

  attachTracks (tracks) {
    if (tracks) {
      tracks.forEach(track => {
        if (track.getType() === 'video') {
          track.attach(this.videoRef.current)
        } else {
          track.attach(this.audioRef.current)
        }
      })
    }
  }

  detachTracks (tracks) {
    if (tracks) {
      tracks.forEach(track => {
        if (track.getType() === 'video') {
          track.detach(this.videoRef.current)
        } else {
          track.detach(this.audioRef.current)
        }
      })
    }
  }

  handleClick () {
    this.setState({ cover: !this.state.cover })
  }

  getClassNames () {
    let classNames = ['video']

    classNames.push(this.props.local ? 'local' : 'remote')

    if (this.state.audioMuted) {
      classNames.push('audioMuted')
    }

    if (this.state.videoMuted) {
      classNames.push('videoMuted')
    }

    return classNames.join(' ')
  }

  render () {
    return (
      <div className={this.getClassNames()} onClick={this.handleClick}>
        <video ref={this.videoRef} autoPlay playsInline style={{ objectFit: this.state.cover ? 'cover' : 'contain' }} />
        <audio ref={this.audioRef} autoPlay muted={this.props.local} />
        {this.state.audioMuted &&
          <FontAwesomeIcon icon={faMicrophoneSlash} />
        }
        {this.state.videoMuted &&
          <FontAwesomeIcon icon={faVideoSlash} />
        }
      </div>
    )
  }
}
