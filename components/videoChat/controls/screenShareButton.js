/* global JitsiMeetJS */
import { faDesktop, faStopCircle } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import localforage from 'localforage'
import { matopush } from '../../../lib/matomo'

export default class ScreenShareButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      shared: false
    }
  }

  async handleClick () {
    // Toggle muted
    const shared = !this.state.shared
    const { localParticipant } = this.props

    // Flip the state
    this.setState({ shared })

    // TODO: Update this after settings refactor
    const selectedVideoInputID = await localforage.getItem('selectedVideoInputID')
    const device = shared ? 'desktop' : 'video'

    try {
      const tracks = await JitsiMeetJS.createLocalTracks({
        devices: [device],
        cameraDeviceId: selectedVideoInputID
      })

      localParticipant.switchConferenceVideoTrack(tracks[0])
    }
    catch(error) {
      // Flip the state back
      this.setState({ shared: !shared })
    }

    matopush(['trackEvent', 'videoChat', 'screenShareButton', 'toggle'])
  }

  render () {
    return (
      <div className='button screenShareButton' onClick={this.handleClick}>
        {!this.state.shared &&
          <span><FontAwesomeIcon icon={faDesktop} /> Share</span>}
        {this.state.shared &&
          <span><FontAwesomeIcon icon={faStopCircle} /> Stop</span>}
      </div>
    )
  }
}
