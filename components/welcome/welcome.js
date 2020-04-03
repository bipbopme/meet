import Settings from '../settings/settings'
import { matopush } from '../../lib/matomo'
import React from 'react'

export default class Welcome extends React.Component {
  constructor (props) {
    super(props)

    this.onJoin = this.props.onJoin
    this.onClickJoin = this.onClickJoin.bind(this)
  }

  // TODO: This requires it to know too much about the settings state
  async onClickJoin (settingsState) {
    matopush(['trackEvent', 'welcome', 'join', 'click'])

    this.onJoin(settingsState.name, settingsState.localStream)
  }

  render () {
    return (
      <div className='welcome'>
        <div className='inner'>
          <h2>Ready to join?</h2>
          <Settings buttonText='Join' onButtonClick={this.onClickJoin} />
        </div>
      </div>
    )
  }
}
