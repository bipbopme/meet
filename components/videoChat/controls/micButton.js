import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'
import React from 'react'

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
      const currentlyMuted = this.state.muted

      // These two are inverted so muted == disabled
      audioTrack.enabled = currentlyMuted

      // Flip the state
      this.setState({ muted: !currentlyMuted })

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
