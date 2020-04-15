import React from 'react'

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
    this.attachTracks(this.props.tracks)
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

  render () {
    return (
      <div className={`video ${this.props.local ? 'local' : 'remote'}`} onClick={this.handleClick}>
        <video ref={this.videoRef} autoPlay playsInline style={{ objectFit: this.state.cover ? 'cover' : 'contain' }} />
        <audio ref={this.audioRef} autoPlay muted={this.props.local} />
      </div>
    )
  }
}
