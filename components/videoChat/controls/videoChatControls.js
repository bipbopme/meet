import MicButton from './micButton'
import React from 'react'
import ScreenShareButton from './screenShareButton'
import VideoButton from './videoButton'

export default class VideoChatControls extends React.Component {
  constructor (props) {
    super(props)

    this.canScreenCapture = !!navigator.mediaDevices.getDisplayMedia
  }

  render () {
    return (
      <footer className='controls'>
        <MicButton localParticipant={this.props.localParticipant} />
        <VideoButton localParticipant={this.props.localParticipant} />
        {this.canScreenCapture &&
          <ScreenShareButton localParticipant={this.props.localParticipant} />
        }
      </footer>
    )
  }
}
