import React from 'react'
import SettingsButton from './controls/settingsButton'
import SuperView from './superView'
import VideoChatControls from './controls/videoChatControls'
import ViewButton from './controls/viewButton'
import _chunk from 'lodash/chunk'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.handleViewChange = this.handleViewChange.bind(this)
    this.handleCropChange = this.handleCropChange.bind(this)

    this.state = {
      view: 'single',
      crop: true
    }
  }

  handleViewChange (view) {
    this.setState({ view: view })
  }

  handleCropChange (crop) {
    console.warn('CROP CHANGE', crop)
    this.setState({ crop: crop })
  }

  render () {
    const { localParticipant, status } = this.props.conference

    return status === 'joined' ? (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
          <div className='controls'>
            <div className='right'>
              <ViewButton onToggle={this.handleViewChange} />
              <SettingsButton localParticipant={localParticipant} />
            </div>
          </div>
        </header>
        <SuperView conference={this.props.conference} view={this.state.view} crop={this.state.crop} />
        <VideoChatControls conference={this.props.conference} localParticipant={localParticipant} onLeave={this.props.onLeave} onToggleChat={this.props.onToggleChat} onViewChange={this.handleViewChange} onCropChange={this.handleCropChange} />
      </div>
    ) : null
  }
}
