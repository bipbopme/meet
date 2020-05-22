import { eventPath, isTouchEnabled } from '../../lib/utils'
import Head from 'next/head'
import React from 'react'
import VideoChat from '../videoChat/videoChat'
import { debounce, throttle, bind } from 'lodash-decorators'
import JitsiConferenceManager from '../../lib/jitsiManager/jitsiConferenceManager'

const HIDE_CONTROLS_DELAY = 3500
const MOUSE_EVENT_DELAY = 150

interface RoomActiveProps {
  conference: JitsiConferenceManager;
  onLeave(): void;
}

interface RoomActiveState {
  showChat: boolean;
  showControls: boolean;
  isFullscreen: boolean;
}

export default class RoomActive extends React.Component<RoomActiveProps, RoomActiveState> {
  // TODO: this doesn't seem right
  hideControlsTimer: NodeJS.Timeout

  constructor (props: RoomActiveProps) {
    super(props)

    // These events are usually emulated correctly but they conflict with the click events on touch devices
    if (!isTouchEnabled()) {
      window.addEventListener('mousemove', this.handleMouseMove)
      window.addEventListener('mouseout', this.handleMouseOut)
    }

    window.addEventListener('click', this.handleClick)
    window.addEventListener('dblclick', this.handleDoubleClick)

    this.state = {
      showChat: false,
      showControls: true,
      isFullscreen: false
    }
  }

  componentDidMount () {
    // Kick off initial timer
    this.startAutoHideControlsTimer()
  }

  @bind()
  handleToggleChat () {
    this.setState({ showChat: !this.state.showChat })
  }

  startAutoHideControlsTimer (delay = HIDE_CONTROLS_DELAY) {
    this.clearAutoHideControlsTimer()
    this.hideControlsTimer = setTimeout(this.hideControls, delay)
  }

  clearAutoHideControlsTimer () {
    clearTimeout(this.hideControlsTimer)
  }

  @bind()
  hideControls () {
    this.setState({ showControls: false })
  }

  showControls () {
    this.setState({ showControls: true })
  }

  @bind() @throttle(MOUSE_EVENT_DELAY)
  handleMouseMove () {
    this.startAutoHideControlsTimer()

    if (!this.state.showControls) {
      this.showControls()
    }
  }

  @bind() @debounce(MOUSE_EVENT_DELAY)
  handleMouseOut (event: MouseEvent) {
    if (!event.relatedTarget) {
      this.startAutoHideControlsTimer(0)
    }
  }

  @bind() @debounce(MOUSE_EVENT_DELAY)
  handleClick (event: MouseEvent) {
    if (!this.hasClickableElements(event)) {
      if (this.state.showControls) {
        this.startAutoHideControlsTimer(0)
      } else {
        this.showControls()
      }
    }
  }

  @bind()
  handleDoubleClick (event: MouseEvent) {
    if (!this.hasClickableElements(event)) {
      // Invert fullscreen
      const newIsFullscreen = !this.state.isFullscreen

      if (newIsFullscreen) {
        document.documentElement.requestFullscreen()
          .then(()=> {
            this.setState({ isFullscreen: newIsFullscreen })
          })
          .catch(e => console.error(e))
      } else {
        document.exitFullscreen()

        // Fix scroll position on mobile
        window.scrollTo(0,1)

        this.setState({ isFullscreen: newIsFullscreen })
      }

      this.clearAutoHideControlsTimer()
    }
  }

  hasClickableElements(event: MouseEvent) {
    const elements = eventPath(event)
    const clickableElements = elements.filter(element => {
      return (element.classList && element.classList.contains('button')) ||
        element.tagName === 'A' ||
        element.tagName === 'BUTTON'
    })

    return clickableElements.length > 0
  }

  render () {
    return (
      <div className={`roomPage roomActive ${this.state.showChat ? 'showChat' : 'hideChat'} ${this.state.showControls ? 'showControls' : 'hideControls'}`}>
        <Head>
          <title>Video Chat | bipbop</title>
          <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        </Head>
        <VideoChat conference={this.props.conference} onLeave={this.props.onLeave} onToggleChat={this.handleToggleChat} />
      </div>
    )
  }
}
