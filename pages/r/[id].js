import JitsiManager from '../../lib/jitsiManager'
import React from 'react'
import RoomActive from '../../components/room/roomActive'
import RoomLeft from '../../components/room/roomLeft'
import RoomPreview from '../../components/room/roomPreview'
import { observer } from 'mobx-react'

const JITSI_CONFIG = JSON.parse(process.env.JITSI_CONFIG)

@observer
export default class RoomPage extends React.Component {
  constructor (props) {
    super(props)

    this.handleJoin = this.handleJoin.bind(this)
    this.handleLeave = this.handleLeave.bind(this)

    this.state = {
      joined: false,
      left: false
    }
  }

  componentDidMount () {
    this.id = window.location.pathname.split('/').pop()
    this.jitsi = new JitsiManager(JITSI_CONFIG.host)
  }

  handleJoin (name, localTracks) {
    this.conference = this.jitsi.initConferenceManager(this.id, localTracks, name)
    this.setState({ joined: true })
    this.conference.join()
  }

  handleLeave () {
    this.conference.leave()
    this.jitsi.disconnect()

    this.setState({ left: true })
  }

  handleRejoin () {
    window.location.reload()
  }

  render () {
    if (this.state.joined) {
      if (this.state.left) {
        return <RoomLeft onRejoin={this.handleRejoin} />
      } else {
        return <RoomActive conference={this.conference} onLeave={this.handleLeave} />
      }
    } else {
      return <RoomPreview onJoin={this.handleJoin} />
    }
  }
}
