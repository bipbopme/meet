import React from 'react'
import SettingsButton from './controls/settingsButton'
import VideoChatControls from './controls/videoChatControls'
import VideoGrid from './videoGrid'
import ViewButton from './controls/viewButton'
import _chunk from 'lodash/chunk'
import { debounce } from 'lodash'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.handleToggleVideoZoom = this.handleToggleVideoZoom.bind(this)

    this.state = {
      videoZoomed: false
    }
  }

  handleToggleVideoZoom (zoomed) {
    this.setState({ videoZoomed: zoomed })
  }

  render () {
    const { localParticipant, status } = this.props.conference

    return status === 'joined' ? (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
          <div className='controls'>
            <div className='right'>
              <ViewButton onToggle={this.handleToggleVideoZoom} />
              <SettingsButton localParticipant={localParticipant} />
            </div>
          </div>
        </header>
        <VideoGrid conference={this.props.conference} videoZoomed={this.state.videoZoomed} />
        <VideoChatControls conference={this.props.conference} localParticipant={localParticipant} onLeave={this.props.onLeave} onToggleChat={this.props.onToggleChat} />
      </div>
    ) : null
  }
}
