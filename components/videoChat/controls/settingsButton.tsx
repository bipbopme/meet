import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Modal from '../../modal'
import React from 'react'
import Settings from '../../settings/settings'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'
import { bind } from 'lodash-decorators'
import JitsiParticipant from '../../../lib/jitsiManager/jitsiParticipant'

interface SettingsButtonProps {
  localParticipant: JitsiParticipant;
}

interface SettingsButtonState {
  showSettings: boolean;
}

export default class SettingsButton extends React.Component<SettingsButtonProps, SettingsButtonState> {
  constructor (props: SettingsButtonProps) {
    super(props)

    this.state = {
      showSettings: false
    }
  }

  @bind()
  handleClick () {
    this.setState({ showSettings: true })

    matopush(['trackEvent', 'videoChat', 'settingsButton', 'click'])
  }

  @bind()
  async handleDone (result) {
    await this.props.localParticipant.replaceAudioTrack(result.audioTrack)
    await this.props.localParticipant.replaceVideoTrack(result.videoTrack)

    this.setState({ showSettings: false })
  }

  @bind()
  handleModalCancel () {
    this.setState({ showSettings: false })
  }

  render () {
    return (
      <>
        <div className='button settingsButton' title='Settings for camera and microphone' onClick={this.handleClick}>
          <FontAwesomeIcon icon={faCog} /> <span className='label'>Settings</span>
        </div>
        {this.state.showSettings &&
          <Modal onCancel={this.handleModalCancel}>
            <h2>Settings</h2>
            <Settings buttonText='Done' onButtonClick={this.handleDone} />
          </Modal>
        }
      </>
    )
  }
}
