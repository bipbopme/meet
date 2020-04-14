import React from 'react'
import localforage from 'localforage'

export default class Video extends React.Component {
  constructor (props) {
    super(props)

    this.tracks = this.props.tracks;
    this.videoRef = React.createRef()
    this.audioRef = React.createRef()
    this.handleClick = this.handleClick.bind(this)

    this.state = {
      cover: true
    }
  }

  componentDidMount () {
    this.configureVideo()
  }

  componentDidUpdate () {
    this.configureVideo()
  }

  async configureVideo () {
    console.warn('configuring video', this.tracks)
    // if (this.props.stream && !this.videoRef.current.srcObject) {
    //   this.videoRef.current.srcObject = this.props.stream
    // }

    // const selectedAudioOutputID = await localforage.getItem('selectedAudioOutputID')

    // if (selectedAudioOutputID && typeof this.videoRef.current.sinkId !== 'undefined') {
    //   this.videoRef.current.setSinkId(selectedAudioOutputID)
    //     .then(() => {
    //       console.log(`Success, audio output device attached: ${selectedAudioOutputID}`)
    //     })
    //     .catch(error => {
    //       console.error('Error setting audio output', error)
    //     })
    // }

    if (this.tracks) {
      this.tracks.forEach(track => {
        if (track.getType() === 'video') {
          track.attach(this.videoRef.current)
        } else {
          track.attach(this.audioRef.current)
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
