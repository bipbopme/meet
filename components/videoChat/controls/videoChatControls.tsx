import DetectRTC from "detectrtc";
import JitsiParticipant from "../../../lib/jitsiManager/jitsiParticipant";
import LeaveButton from "./leaveButton";
import MicButton from "./micButton";
import React from "react";
import ScreenShareButton from "./screenShareButton";
import SettingsButton from "./settingsButton";
import ShareButton from "./shareButton";
import VideoButton from "./videoButton";
import ViewButton from "./viewButton";

interface VideoChatControlsProps {
  localParticipant: JitsiParticipant;
  participants: JitsiParticipant[];
  onLeave(): void;
  onViewChange(view: string): void;
  view: string;
}

export default class VideoChatControls extends React.Component<VideoChatControlsProps> {
  private canScreenCapture: boolean;

  constructor(props: VideoChatControlsProps) {
    super(props);

    this.canScreenCapture = JitsiMeetJS.isDesktopSharingEnabled() && !DetectRTC.isMobileDevice;
  }

  getClassNames(): string {
    const classNames = ["controls"];

    if (this.props.participants.length > 0) {
      classNames.push("hidable");
    }

    return classNames.join(" ");
  }

  render(): JSX.Element {
    return (
      <footer className={this.getClassNames()}>
        <div className="left">
          {this.canScreenCapture && (
            <ScreenShareButton localParticipant={this.props.localParticipant} />
          )}
          <ShareButton />
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
