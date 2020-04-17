import { faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { matopush } from '../../../lib/matomo'

export default class VideoButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      muted: this.props.localParticipant.isVideoMuted
    }
  }

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
      <div className='button micButton' onClick={this.handleClick}>
        {this.state.muted &&
          <span><FontAwesomeIcon icon={faVideoSlash} /> On</span>}
        {!this.state.muted &&
          <span><FontAwesomeIcon icon={faVideo} /> Off</span>}
      </div>
    )
  }
}
