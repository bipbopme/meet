/* global JitsiMeetJS */
import { faDesktop, faStopCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import localforage from 'localforage'
import { matopush } from '../../../lib/matomo'
import JitsiParticipant from '../../../lib/jitsiManager/jitsiParticipant'
import { bind } from 'lodash-decorators'

interface ScreenShareButtonProps {
  localParticipant: JitsiParticipant;
}

interface ScreenShareButtonState {
  shared: boolean;
}

export default class ScreenShareButton extends React.Component<ScreenShareButtonProps, ScreenShareButtonState> {
  constructor (props: ScreenShareButtonProps) {
    super(props)

    this.state = {
      shared: false
    }
  }

  @bind()
  async handleClick (): Promise<void> {
    // Toggle muted
    const shared = !this.state.shared
    const { localParticipant } = this.props

    // Flip the state
    this.setState({ shared })

    // TODO: Update this after settings refactor
    const selectedVideoInputID: string | undefined = await localforage.getItem('selectedVideoInputID')
    const options: JitsiMeetJS.CreateLocalTracksOptions = { devices: [] }

    if (shared) {
      options.devices = ['desktop']
    } else {
      options.devices = ['video']
      options.cameraDeviceId = selectedVideoInputID
    }

    try {
      const tracks = await JitsiMeetJS.createLocalTracks(options)

      localParticipant.replaceVideoTrack(tracks[0])
    }
    catch(error) {
      console.warn(error)

      // Flip the state back
      this.setState({ shared: !shared })
    }

    matopush(['trackEvent', 'videoChat', 'screenShareButton', 'toggle'])
  }

  render (): JSX.Element {
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
