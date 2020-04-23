import DetectRTC from 'detectrtc'
import MicButton from './micButton'
import React from 'react'
import ScreenShareButton from './screenShareButton'
import VideoButton from './videoButton'

export default class VideoChatControls extends React.Component {
  constructor (props) {
    super(props)

    // TODO: Safari should work but it's failing right now so disable it
    this.canScreenCapture = DetectRTC.isScreenCapturingSupported && !DetectRTC.isMobileDevice && !DetectRTC.browser.isSafari
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
