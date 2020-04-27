import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Portal } from 'react-portal'
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

  render () {
    return (
      <>
        <div className='button settingsButton' onClick={this.handleClick}>
          <span title="Settings"><FontAwesomeIcon icon={faCog} /></span>
        </div>
        {this.state.showSettings &&
          <Portal>
            <div className='modal'>
              <div className='modalInner'>
                <h3>Settings</h3>
                <Settings buttonText='Done' onButtonClick={this.handleDone} />
              </div>
            </div>
          </Portal>
        }
      </>
    )
  }
}
