import GridView from './gridView'
import JitsiConferenceManager from '../../lib/jitsiManager/jitsiConferenceManager'
import React from 'react'
import SettingsButton from './controls/settingsButton'
import SpotlightView from './spotlightView'
import VideoChatControls from './controls/videoChatControls'
import ViewButton from './controls/viewButton'
import _chunk from 'lodash/chunk'
import debounce from 'lodash/debounce'
import { observer } from 'mobx-react'

@observer
export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.conference = this.props.conference
    this.handleViewChange = this.handleViewChange.bind(this)
    this.handleCropChange = this.handleCropChange.bind(this)
    this.autoSwitchView = this.autoSwitchView.bind(this)

    // these are dangerous because they trigger double renders
    this.conference.on(JitsiConferenceManager.events.PARTICIPANT_JOINED, this.autoSwitchView)
    this.conference.on(JitsiConferenceManager.events.PARTICIPANT_LEFT, this.autoSwitchView)

    window.addEventListener('resize', debounce(this.autoSwitchView, 250))

    this.state = {
      view: 'spotlight',
      crop: true,
      autoSwitchView: true
    }
  }

  autoSwitchView () {
    if (this.state.autoSwitchView) {
      let { conference } = this.props
      let { view, crop } = this.state
      let width = document.documentElement.offsetWidth

      if (conference.participants.length >= 2) {
        view = 'grid'
        crop = width < 960
      } else {
        view = 'spotlight'
        crop = true
      }

      this.setState({ view, crop })
    }
  }

  handleViewChange (view) {
    this.setState({ view: view, autoSwitchView: false })
  }

  handleCropChange (crop) {
    this.setState({ crop: crop, autoSwitchView: false })
  }

  render () {
    const { localParticipant, status } = this.props.conference

    return status === 'joined' ? (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
        </header>
        {this.state.view === 'spotlight' &&
          <SpotlightView conference={this.props.conference} crop={this.state.crop} />
        }
        {this.state.view === 'grid' &&
          <GridView conference={this.props.conference} crop={this.state.crop} />
        }
        <VideoChatControls
          conference={this.props.conference}
          localParticipant={localParticipant}
          view={this.state.view}
          crop={this.state.crop}
          onLeave={this.props.onLeave}
          onToggleChat={this.props.onToggleChat}
          onViewChange={this.handleViewChange}
          onCropChange={this.handleCropChange}
          />
      </div>
    ) : null
  }
}
