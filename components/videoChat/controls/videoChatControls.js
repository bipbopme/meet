import MicButton from './micButton'
import VideoButton from './videoButton'
import React from 'react'

export default class VideoChatControls extends React.Component {
  render () {
    return (
      <footer className='controls'>
        <MicButton localStream={this.props.localStream} />
        <VideoButton localStream={this.props.localStream} />
      </footer>
    )
  }
}
