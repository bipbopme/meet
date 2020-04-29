import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Modal from '../../modal'
import React from 'react'
import Settings from '../../settings/settings'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class SettingsButton extends React.Component {
  constructor (props) {
    super(props)

    this.localParticipant = this.props.localParticipant
    this.handleClick = this.handleClick.bind(this)
    this.handleDone = this.handleDone.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)

    this.state = {
      showSettings: false
    }
  }

  handleClick () {
    this.setState({ showSettings: true })

    matopush(['trackEvent', 'videoChat', 'settingsButton', 'click'])
  }

  async handleDone (result) {
    await this.localParticipant.replaceAudioTrack(result.audioTrack)
    await this.localParticipant.replaceVideoTrack(result.videoTrack)

    this.setState({ showSettings: false })
  }

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
