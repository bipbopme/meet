import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { matopush } from '../../../lib/matomo'

export default class MicButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      muted: false
    }
  }

  handleClick () {
    if (this.props.localStream) {
      const audioTrack = this.props.localStream.getAudioTracks()[0]

      // Toggle muted
      const muted = !this.state.muted

      // Flip the state
      this.setState({ muted })

      // These two are inverted so muted == disabled
      audioTrack.enabled = !muted;

      matopush(['trackEvent', 'videoChat', 'videoButton', 'toggle'])
    }
  }

  render () {
    return (
      <div className='button micButton' onClick={this.handleClick}>
        {this.state.muted &&
          <span><FontAwesomeIcon icon={faMicrophoneSlash} /> Unmute</span>}
        {!this.state.muted &&
          <span><FontAwesomeIcon icon={faMicrophone} /> Mute</span>}
      </div>
    )
  }
}
