import DetectRTC from 'detectrtc'
import LeaveButton from './leaveButton'
import MicButton from './micButton'
import React from 'react'
import ScreenShareButton from './screenShareButton'
import TextChatButton from './textChatButton'
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
        <div className='left'>
          {this.canScreenCapture &&
            <ScreenShareButton localParticipant={this.props.localParticipant} />
          }
        </div>
        <div className='center'>
          <MicButton localParticipant={this.props.localParticipant} />
          <LeaveButton localParticipant={this.props.localParticipant} />
          <VideoButton localParticipant={this.props.localParticipant} />
        </div>
        <div className='right'>
        <TextChatButton />
        </div>
      </footer>
    )
  }
}
