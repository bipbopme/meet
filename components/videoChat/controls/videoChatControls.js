import MicButton from './micButton'
import React from 'react'
import VideoButton from './videoButton'

export default class VideoChatControls extends React.Component {
  render () {
    return (
      <footer className='controls'>
        <MicButton localParticipant={this.props.localParticipant} />
        <VideoButton localParticipant={this.props.localParticipant} />
      </footer>
    )
  }
}
