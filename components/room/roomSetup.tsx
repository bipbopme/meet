import React from "react";
import Settings from "../settings/settings";

interface RoomSetupProps {
  onComplete(
    name: string | undefined,
    audioTrack: JitsiMeetJS.JitsiTrack,
    videoTrack: JitsiMeetJS.JitsiTrack
  ): void;
}

export default class RoomSetup extends React.Component<RoomSetupProps> {
  render(): JSX.Element {
    return (
      <div className="room roomSetup">
        <Settings
          titleText="Ready to join?"
          buttonText="Join"
          onButtonClick={this.props.onComplete}
          collapseAudioVideoSettings={true}
        />
      </div>
    );
  }
}
