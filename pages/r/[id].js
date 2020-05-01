import DetectRTC from 'detectrtc'
import JitsiManager from '../../lib/jitsiManager'
import React from 'react'
import RoomActive from '../../components/room/roomActive'
import RoomLeft from '../../components/room/roomLeft'
import RoomSetup from '../../components/room/roomSetup'
import RoomStatus from '../../components/room/roomStatus'
import _debounce from 'lodash/debounce'
import { nowTraceToRegion } from '../../lib/utils'
import { observer } from 'mobx-react'

const JITSI_CONFIG = JSON.parse(process.env.JITSI_CONFIG)

export async function getServerSideProps({ req, query }) {
  return {
    props: {
      // Allows override from the query string
      region: query.region || nowTraceToRegion(req.headers['x-now-trace'])
    }
  }
}

@observer
export default class RoomPage extends React.Component {
  constructor (props) {
    super(props)

    this.region = this.props.region
    this.handleSetupComplete = this.handleSetupComplete.bind(this)
    this.handleLeave = this.handleLeave.bind(this)
    this.handleJitsiConnected = this.handleJitsiConnected.bind(this)
    this.updateMobileViewportHeightDebounced = _debounce(this.updateMobileViewportHeight, 50)

    this.state = {
      setupComplete: false,
      conferenceInitialized: false,
      left: false
    }
  }

  componentDidMount () {
    this.id = window.location.pathname.split('/').pop()

    this.jitsi = new JitsiManager(JITSI_CONFIG.host, this.region)
    this.jitsi.once('CONNECTION_ESTABLISHED', this.handleJitsiConnected)
    this.jitsi.connect()

    // Override mobile viewport height behavior
    // Also apply to Safari since iPad pretends to be desktop
    if (DetectRTC.isMobileDevice || DetectRTC.browser.isSafari) {
      this.updateMobileViewportHeightDebounced()
      window.addEventListener('resize', this.updateMobileViewportHeightDebounced)
    }
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

  // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  updateMobileViewportHeight () {
    // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
    const mvh = window.innerHeight * 0.01

    // Then we set the value in the --mvh custom property to the root of the document
    try {
      document.documentElement.style.setProperty('--mvh', `${mvh}px`)
    }
    catch (e) {
      console.warn(e)
    }
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
