import GridView from './gridView'
import React from 'react'
import SettingsButton from './controls/settingsButton'
import SingleView from './singleView'
import VideoChatControls from './controls/videoChatControls'
import ViewButton from './controls/viewButton'
import _chunk from 'lodash/chunk'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.handleViewChange = this.handleViewChange.bind(this)

    this.state = {
      view: 'single'
    }
  }

  handleViewChange (view) {
    this.setState({ view: view })
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
        {this.state.view === 'single' &&
          <SingleView conference={this.props.conference} videoZoomed={this.state.videoZoomed} />
        }

        {this.state.view === 'grid' &&
          <GridView conference={this.props.conference} videoZoomed={this.state.videoZoomed} />
        }

        <VideoChatControls conference={this.props.conference} localParticipant={localParticipant} onLeave={this.props.onLeave} onToggleChat={this.props.onToggleChat} />
      </div>
    ) : null
  }
}
