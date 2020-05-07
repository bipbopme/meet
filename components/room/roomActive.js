import Head from 'next/head'
import React from 'react'
import TextChat from '../textChat/textChat'
import VideoChat from '../videoChat/videoChat'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

export default class RoomActive extends React.Component {
  static HIDE_CONTROLS_DELAY = 3500
  static MOUSE_MOVE_THROTTLE_WAIT = 250

  constructor (props) {
    super(props)

    this.handleToggleChat = this.handleToggleChat.bind(this)
    this.handleMouseMoveThrottled = throttle(this.handleMouseMove.bind(this), RoomActive.MOUSE_MOVE_THROTTLE_WAIT)
    this.handleMouseOutDebounced = debounce(this.handleMouseOut.bind(this), RoomActive.MOUSE_MOVE_THROTTLE_WAIT)
    this.handleClick = this.handleClick.bind(this)
    this.hideControls = this.hideControls.bind(this)

    window.addEventListener('mousemove', this.handleMouseMoveThrottled)
    window.addEventListener('mouseout', this.handleMouseOutDebounced)
    window.addEventListener('click', this.handleClick, true)

    this.state = {
      showChat: false,
      showControls: true
    }
  }

  componentDidMount () {
    // Kick off initial timer
    this.startAutoHideControlsTimer()
  }

  handleToggleChat () {
    this.setState({ showChat: !this.state.showChat })
  }

  startAutoHideControlsTimer (delay = RoomActive.HIDE_CONTROLS_DELAY) {
    this.clearAutoHideControlsTimer()
    this.hideControlsTimer = setTimeout(this.hideControls, delay)
  }

  clearAutoHideControlsTimer () {
    clearTimeout(this.hideControlsTimer)
  }

  hideControls () {
    this.setState({ showControls: false })
  }

  showControls () {
    this.setState({ showControls: true })
  }

  handleMouseMove (event) {
    this.startAutoHideControlsTimer()

    if (!this.state.showControls) {
      this.showControls()
    }
  }

  handleMouseOut (event) {
    if (!event.relatedTarget) {
      this.startAutoHideControlsTimer(0)
    }
  }

  // TODO: There's likely something more elegant and bulletproof
  handleClick (event) {
    // Ignore clicks that seem like they're for something else
    const clickableElements = event.path.filter(element => {
        return (element.classList && element.classList.contains('button')) ||
          element.tagName === 'A' ||
          element.tagName === 'BUTTON'
      })

    if (clickableElements.length === 0) {
      this.startAutoHideControlsTimer(0)
    }
  }

  render () {
    return (
      <div className={`roomPage roomActive ${this.state.showChat ? 'showChat' : 'hideChat'} ${this.state.showControls ? 'showControls' : 'hideControls'}`}>
        <Head>
          <title>Video Chat | bipbop</title>
          <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        </Head>
        <VideoChat conference={this.props.conference} onLeave={this.props.onLeave} onToggleChat={this.handleToggleChat} />
        <TextChat conference={this.props.conference} />
      </div>
    )
  }
}
