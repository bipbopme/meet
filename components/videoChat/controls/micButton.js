import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { matopush } from '../../../lib/matomo'

export default class MicButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      muted: this.props.localParticipant.isAudioMuted
    }
  }

  handleClick () {
    // Toggle muted
    const muted = !this.state.muted

    // Flip the state
    this.setState({ muted })

    if (muted) {
      this.props.localParticipant.muteAudio()
    } else {
      this.props.localParticipant.unmuteAudio()
    }

    matopush(['trackEvent', 'videoChat', 'micButton', 'toggle'])
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
