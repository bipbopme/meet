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
    const options = {}

    if (shared) {
      options.devices = ['desktop']
    } else {
      options.devices = ['video']
      options.cameraDeviceId = selectedVideoInputID
    }

    try {
      const tracks = await JitsiMeetJS.createLocalTracks(options)

      localParticipant.switchConferenceVideoTrack(tracks[0])
    }
    catch(error) {
      console.warn(error)

      // Flip the state back
      this.setState({ shared: !shared })
    }

    matopush(['trackEvent', 'videoChat', 'screenShareButton', 'toggle'])
  }

  render () {
    return (
      <div className={`button screenShareButton ${this.state.shared ? 'shared' : ''}`} onClick={this.handleClick}>
        {!this.state.shared &&
          <><FontAwesomeIcon icon={faDesktop} /> <span className='label'>Share screen</span></>}
        {this.state.shared &&
          <><FontAwesomeIcon icon={faStopCircle} /> <span className='label'>Stop sharing</span></>}
      </div>
    )
  }
}
