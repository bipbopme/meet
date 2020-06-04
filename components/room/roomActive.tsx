import Head from "next/head";
import JitsiConferenceManager from "../../lib/jitsiManager/jitsiConferenceManager";
import React from "react";
import VideoChat from "../videoChat/videoChat";

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
  state = {
    showChat: false,
    showControls: true,
    isFullscreen: false
  };

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
      </div>
    );
  }
}
