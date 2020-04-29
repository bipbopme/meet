import JitsiManager from '../../lib/jitsiManager'
import React from 'react'
import RoomActive from '../../components/room/roomActive'
import RoomLeft from '../../components/room/roomLeft'
import RoomSetup from '../../components/room/roomSetup'
import RoomStatus from '../../components/room/roomStatus'
import { observer } from 'mobx-react'

const JITSI_CONFIG = JSON.parse(process.env.JITSI_CONFIG)

@observer
export default class RoomPage extends React.Component {
  constructor (props) {
    super(props)

    this.handleSetupComplete = this.handleSetupComplete.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
    this.handleJitsiConnected = this.handleJitsiConnected.bind(this)

    this.state = {
      setupComplete: false,
      conferenceInitialized: false,
      left: false
    }
  }

  componentDidMount () {
    this.id = window.location.pathname.split('/').pop()
    this.jitsi = new JitsiManager(JITSI_CONFIG.host)
    this.jitsi.once('CONNECTION_ESTABLISHED', this.handleJitsiConnected)
    this.jitsi.connect()
  }

  handleJitsiConnected () {
    // If setup is already complete, init the conference
    if (this.state.setupComplete) {
      this.initConference(this.state.name, this.state.audioTrack, this.state.videoTrack)
    }
  }

  handleSetupComplete (result) {
    const { name, audioTrack, videoTrack } = result

    this.setState({ setupComplete: true })

    // If we're already connected then init conference
    if (this.jitsi.status === 'connected') {
      this.initConference(name, audioTrack, videoTrack)
    } else {
      this.setState({
        name: name,
        audioTrack: audioTrack,
        videoTrack: videoTrack
      })
    }
  }

  handleLeave () {
    this.conference.leave()
    this.jitsi.disconnect()

    this.setState({ left: true })
  }

  handleRejoin () {
    window.location.reload()
  }

  initConference (name, audioTrack, videoTrack) {
    this.conference = this.jitsi.initConferenceManager(this.id, [audioTrack, videoTrack], name)
    this.conference.join()

    this.setState({ conferenceInitialized: true })
  }

  render () {
    if (this.state.setupComplete) {
      if (this.state.conferenceInitialized) {
        if (this.state.left) {
          return <RoomLeft onRejoin={this.handleRejoin} />
        } else {
          return <RoomActive conference={this.conference} onLeave={this.handleLeave} />
        }
      } else {
        if (this.jitsi.status === 'connecting') {
          return <RoomStatus><h2>Connecting...</h2></RoomStatus>
        } else {
          return <RoomStatus><h2>Sorry something went wrong.</h2></RoomStatus>
        }
      }
    } else {
      return <RoomSetup onComplete={this.handleSetupComplete} />
    }
  }
}
