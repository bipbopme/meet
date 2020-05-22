import { faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { matopush } from '../../../lib/matomo'
import { bind } from 'lodash-decorators'
import JitsiParticipant from '../../../lib/jitsiManager/jitsiParticipant'

interface VideoButtonProps {
  localParticipant: JitsiParticipant;
}

interface VideoButtonState {
  muted: boolean;
}

export default class VideoButton extends React.Component<VideoButtonProps, VideoButtonState> {
  constructor (props: VideoButtonProps) {
    super(props)

    this.state = {
      muted: this.props.localParticipant.isVideoMuted
    }
  }

  @bind()
  handleClick () {
    // Toggle muted
    const muted = !this.state.muted

    // Flip the state
    this.setState({ muted })

    if (muted) {
      this.props.localParticipant.muteVideo()
    } else {
      this.props.localParticipant.unmuteVideo()
    }

    matopush(['trackEvent', 'videoChat', 'videoButton', 'toggle'])
  }

  render () {
    return (
      <div className='button videoButton' onClick={this.handleClick}>
        {this.state.muted &&
          <FontAwesomeIcon title="Turn On Camera" icon={faVideoSlash} />}
        {!this.state.muted &&
          <FontAwesomeIcon title="Turn Off Camera" icon={faVideo} />}
      </div>
    )
  }
}
