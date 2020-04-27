import Head from 'next/head'
import React from 'react'
import TextChat from '../textChat/textChat'
import VideoChat from '../videoChat/videoChat'
import throttle from 'lodash/throttle'

export default class RoomActive extends React.Component {
  static HIDE_CONTROLS_DELAY = 3500
  static MOUSE_MOVE_THROTTLE_WAIT = 250

  constructor (props) {
    super(props)

    this.handleToggleChat = this.handleToggleChat.bind(this)
    this.handleMouseMoveThrottled = throttle(this.handleMouseMove.bind(this), RoomActive.MOUSE_MOVE_THROTTLE_WAIT)
    this.hideControls = this.hideControls.bind(this)

    window.addEventListener('mousemove', this.handleMouseMoveThrottled)

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

  startAutoHideControlsTimer () {
    this.hideControlsTimer = setTimeout(this.hideControls, RoomActive.HIDE_CONTROLS_DELAY)
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

  handleMouseMove () {
    this.clearAutoHideControlsTimer()

    if (!this.state.showControls) {
      this.showControls()
    }

    this.startAutoHideControlsTimer()
  }

  render () {
    return (
      <div className={`roomPage ${this.state.showChat ? 'showChat' : 'hideChat'} ${this.state.showControls ? 'showControls' : 'hideControls'}`}>
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
