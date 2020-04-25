import Head from 'next/head'
import React from 'react'
import TextChat from '../textChat/textChat'
import VideoChat from '../videoChat/videoChat'
import throttle from 'lodash/throttle'

export default class RoomActive extends React.Component {
  static HIDE_CONTROLS_DELAY = 3500

  constructor (props) {
    super(props)

    this.handleToggleChat = this.handleToggleChat.bind(this)
    this.handleMouseMove = throttle(this.handleMouseMove.bind(this), 250)
    this.hideControls = this.hideControls.bind(this)

    window.addEventListener('mousemove', this.handleMouseMove)

    this.state = {
      showChat: false,
      showControls: true
    }
  }

  componentDidMount () {
    // Kick off initial timer
    this.startHideControlsTimer()
  }

  handleToggleChat () {
    this.setState({ showChat: !this.state.showChat })
  }

  startHideControlsTimer () {
    this.controlsTimer = setTimeout(this.hideControls, RoomActive.HIDE_CONTROLS_DELAY)
  }

  clearHideControlsTimer () {
    clearTimeout(this.controlsTimer)
  }

  hideControls () {
    this.setState({ showControls: false })
  }

  handleMouseMove () {
    this.clearHideControlsTimer()

    if (!this.state.showControls) {
      this.setState({ showControls: true })
    }

    this.startHideControlsTimer()
  }

  render () {
    return (
      <div className={`roomPage ${this.state.showChat ? 'chatShown' : 'chatHidden'} ${this.state.showControls ? 'showControls' : 'hideControls'}`}>
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
