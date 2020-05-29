import DetectRTC from "detectrtc";
import JitsiParticipant from "../../../lib/jitsiManager/jitsiParticipant";
import LeaveButton from "./leaveButton";
import MicButton from "./micButton";
import React from "react";
import ScreenShareButton from "./screenShareButton";
import SettingsButton from "./settingsButton";
import VideoButton from "./videoButton";
import ViewButton from "./viewButton";

interface VideoChatControlsProps {
  localParticipant: JitsiParticipant;
  onLeave(): void;
  onViewChange(view: string): void;
  view: string;
}

export default class VideoChatControls extends React.Component<VideoChatControlsProps> {
  private canScreenCapture: boolean;

  constructor(props: VideoChatControlsProps) {
    super(props);

    // TODO: Safari should work but it's failing right now so disable it
    this.canScreenCapture = JitsiMeetJS.isDesktopSharingEnabled() && !DetectRTC.isMobileDevice;
  }

  render(): JSX.Element {
    return (
      <footer className="controls">
        <div className="left">
          {this.canScreenCapture && (
            <ScreenShareButton localParticipant={this.props.localParticipant} />
          )}
        </div>
        <div className="center">
          <MicButton localParticipant={this.props.localParticipant} />
          <LeaveButton onLeave={this.props.onLeave} />
          <VideoButton localParticipant={this.props.localParticipant} />
        </div>
        <div className="right">
          <ViewButton view={this.props.view} onToggle={this.props.onViewChange} />
          <SettingsButton localParticipant={this.props.localParticipant} />
        </div>
      </footer>
    );
  }
}
