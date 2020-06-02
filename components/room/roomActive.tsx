import { Flip, ToastContainer } from "react-toastify";
import { bind, debounce, throttle } from "lodash-decorators";
import { getElementPath, isTouchEnabled } from "../../lib/utils";
import Head from "next/head";
import JitsiConferenceManager from "../../lib/jitsiManager/jitsiConferenceManager";
import React from "react";
import VideoChat from "../videoChat/videoChat";

const HIDE_CONTROLS_DELAY = 3500;
const MOUSE_EVENT_DELAY = 150;

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
  hideControlsTimer: number | undefined = undefined;

  constructor(props: RoomActiveProps) {
    super(props);

    // These events are usually emulated correctly but they conflict with the click events on touch devices
    if (!isTouchEnabled()) {
      window.addEventListener("mousemove", this.handleMouseMove);
      window.addEventListener("mouseout", this.handleMouseOut);
    }

    window.addEventListener("click", this.handleClick);
    window.addEventListener("dblclick", this.handleDoubleClick);

    this.state = {
      showChat: false,
      showControls: true,
      isFullscreen: false
    };
  }

  componentDidMount(): void {
    // Kick off initial timer
    this.startAutoHideControlsTimer();
  }

  componentWillUnmount(): void {
    if (!isTouchEnabled()) {
      window.removeEventListener("mousemove", this.handleMouseMove);
      window.removeEventListener("mouseout", this.handleMouseOut);
    }

    window.removeEventListener("click", this.handleClick);
    window.removeEventListener("dblclick", this.handleDoubleClick);

    this.clearAutoHideControlsTimer();
  }

  startAutoHideControlsTimer(delay = HIDE_CONTROLS_DELAY): void {
    this.clearAutoHideControlsTimer();
    this.hideControlsTimer = window.setTimeout(this.hideControls, delay);
  }

  clearAutoHideControlsTimer(): void {
    clearTimeout(this.hideControlsTimer);
  }

  @bind()
  hideControls(): void {
    this.setState({ showControls: false });
  }

  showControls(): void {
    this.setState({ showControls: true });
  }

  @bind()
  @throttle(MOUSE_EVENT_DELAY)
  handleMouseMove(): void {
    this.startAutoHideControlsTimer();

    if (!this.state.showControls) {
      this.showControls();
    }
  }

  @bind()
  @debounce(MOUSE_EVENT_DELAY)
  handleMouseOut(event: MouseEvent): void {
    if (!event.relatedTarget) {
      this.startAutoHideControlsTimer(0);
    }
  }

  @bind()
  @debounce(MOUSE_EVENT_DELAY)
  handleClick(event: MouseEvent): void {
    if (!this.hasClickableElements(event)) {
      if (this.state.showControls) {
        this.startAutoHideControlsTimer(0);
      } else {
        this.showControls();
      }
    }
  }

  @bind()
  handleDoubleClick(event: MouseEvent): void {
    if (!this.hasClickableElements(event)) {
      // Invert fullscreen
      const newIsFullscreen = !this.state.isFullscreen;

      if (newIsFullscreen) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            this.setState({ isFullscreen: newIsFullscreen });
          })
          .catch((e) => console.error(e));
      } else {
        document.exitFullscreen();

        // Fix scroll position on mobile
        window.scrollTo(0, 1);

        this.setState({ isFullscreen: newIsFullscreen });
      }

      this.clearAutoHideControlsTimer();
    }
  }

  hasClickableElements(event: MouseEvent): boolean {
    const target = event.target as Element;
    const elements = getElementPath(target);
    const clickableElements = elements.filter((element) => {
      return (
        (element.classList && element.classList.contains("button")) ||
        element.tagName === "A" ||
        element.tagName === "BUTTON"
      );
    });

    return clickableElements.length > 0;
  }

  render(): JSX.Element {
    return (
      <div
        className={`roomPage roomActive ${this.state.showChat ? "showChat" : "hideChat"} ${
          this.state.showControls ? "showControls" : "hideControls"
        }`}
      >
        <Head>
          <title>Video Chat | bipbop</title>
          <meta
            key="viewport"
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
        </Head>
        <VideoChat conference={this.props.conference} onLeave={this.props.onLeave} />
        <ToastContainer
          position="bottom-right"
          hideProgressBar
          transition={Flip}
          closeButton={false}
        />
      </div>
    );
  }
}
