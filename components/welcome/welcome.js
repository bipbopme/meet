import React from 'react'
import Settings from '../settings/settings'
import { matopush } from '../../lib/matomo'

export default class Welcome extends React.Component {
  constructor (props) {
    super(props)

    this.onJoin = this.props.onJoin
    this.handleJoinClick = this.handleJoinClick.bind(this)
  }

  // TODO: This requires it to know too much about the settings state
  async handleJoinClick (settingsState) {
    matopush(['trackEvent', 'welcome', 'join', 'click'])

    this.onJoin(settingsState.name, settingsState.localTracks)
  }

  render () {
    return (
      <div className='welcome'>
        <div className='inner'>
          <h2>Ready to join?</h2>
          <Settings buttonText='Join' onButtonClick={this.handleJoinClick} />
        </div>
      </div>
    )
  }
}
