import { bind, debounce } from "lodash-decorators";

import { observer } from "mobx-react";
import DetectRTC from "detectrtc";
import JitsiConferenceManager from "../../lib/jitsiManager/jitsiConferenceManager";
import JitsiManager from "../../lib/jitsiManager";
import React from "react";
import RoomActive from "../../components/room/roomActive";
import RoomLeft from "../../components/room/roomLeft";
import RoomSetup from "../../components/room/roomSetup";
import RoomStatus from "../../components/room/roomStatus";

interface RoomProps {
  id: string;
  region: string;
  host: string;
}

interface RoomState {
  setupComplete: boolean;
  conferenceInitialized: boolean;
  left: boolean;
  name?: string;
  audioTrack?: JitsiMeetJS.JitsiTrack;
  videoTrack?: JitsiMeetJS.JitsiTrack;
}

@observer
export default class Room extends React.Component<RoomProps, RoomState> {
  jitsi: JitsiManager;
  conference: JitsiConferenceManager | undefined;

  constructor(props: RoomProps) {
    super(props);

    this.jitsi = new JitsiManager(this.props.host, this.props.region);
    this.jitsi.once("CONNECTION_ESTABLISHED", this.handleJitsiConnected);
    this.jitsi.connect();

    this.state = {
      setupComplete: false,
      conferenceInitialized: false,
      left: false
    };
  }

  componentDidMount(): void {
    // Override mobile viewport height behavior
    // Also apply to Safari since iPad pretends to be desktop
    if (DetectRTC.isMobileDevice || DetectRTC.browser.isSafari) {
      this.updateMobileViewportHeight();
      window.addEventListener("resize", this.updateMobileViewportHeight);
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener("resize", this.updateMobileViewportHeight);
    this.jitsi.disconnect();
  }

  @bind()
  handleJitsiConnected(): void {
    // If setup is already complete, init the conference
    if (this.state.setupComplete && this.state.audioTrack && this.state.videoTrack) {
      this.initConference(this.state.name, this.state.audioTrack, this.state.videoTrack);
    }
  }

  @bind()
  handleSetupComplete(
    name: string | undefined,
    audioTrack: JitsiMeetJS.JitsiTrack,
    videoTrack: JitsiMeetJS.JitsiTrack
  ): void {
    this.setState({ setupComplete: true });

    // If we're already connected then init conference
    if (this.jitsi.status === "connected") {
      this.initConference(name, audioTrack, videoTrack);
    } else {
      this.setState({
        name: name,
        audioTrack: audioTrack,
        videoTrack: videoTrack
      });
    }
  }

  @bind()
  handleLeave(): void {
    if (this.conference) {
      this.conference.leave();
      this.jitsi.disconnect();

      this.setState({ left: true });
    }
  }

  handleRejoin(): void {
    window.location.reload();
  }

  initConference(
    name: string | undefined,
    audioTrack: JitsiMeetJS.JitsiTrack,
    videoTrack: JitsiMeetJS.JitsiTrack
  ): void {
    this.conference = this.jitsi.initConferenceManager(
      this.props.id,
      [audioTrack, videoTrack],
      name
    );
    this.conference.join();

    this.setState({ conferenceInitialized: true });
  }

  // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  @bind()
  @debounce(50)
  updateMobileViewportHeight(): void {
    // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
    const mvh = window.innerHeight * 0.01;

    // Then we set the value in the --mvh custom property to the root of the document
    try {
      document.documentElement.style.setProperty("--mvh", `${mvh}px`);
    } catch (e) {
      console.warn(e);
    }
  }

  render(): JSX.Element {
    if (this.state.setupComplete) {
      if (this.state.conferenceInitialized && this.conference) {
        if (this.state.left) {
          return <RoomLeft onRejoin={this.handleRejoin} />;
        } else {
          return <RoomActive conference={this.conference} onLeave={this.handleLeave} />;
        }
      } else {
        if (this.jitsi.status === "connecting") {
          return (
            <RoomStatus>
              <h2>Connecting...</h2>
            </RoomStatus>
          );
        } else {
          return (
            <RoomStatus>
              <h2>Sorry something went wrong.</h2>
            </RoomStatus>
          );
        }
      }
    } else {
      return <RoomSetup onComplete={this.handleSetupComplete} />;
    }
  }
}
