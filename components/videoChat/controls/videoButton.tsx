import { Button, Tooltip } from "antd";
import { VideoCameraAddOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
import JitsiParticipant from "../../../lib/jitsiManager/jitsiParticipant";
import React from "react";

interface VideoButtonProps {
  localParticipant: JitsiParticipant;
}

interface VideoButtonState {
  muted: boolean;
}

export default class VideoButton extends React.Component<VideoButtonProps, VideoButtonState> {
  constructor(props: VideoButtonProps) {
    super(props);

    this.state = {
      muted: this.props.localParticipant.isVideoMuted
    };
  }

  @bind()
  handleClick(): void {
    // Toggle muted
    const muted = !this.state.muted;

    // Flip the state
    this.setState({ muted });

    if (muted) {
      this.props.localParticipant.muteVideo();
    } else {
      this.props.localParticipant.unmuteVideo();
    }

    matopush(["trackEvent", "videoChat", "videoButton", "toggle"]);
  }

  render(): JSX.Element {
    return (
      <div className="button videoButton" onClick={this.handleClick}>
        {this.state.muted && (
          <Tooltip title="Turn on camera" mouseEnterDelay={0} mouseLeaveDelay={0}>
            <Button shape="circle" size="large" icon={<VideoCameraAddOutlined />} />
          </Tooltip>
        )}
        {!this.state.muted && (
          <Tooltip title="Turn off camera" mouseEnterDelay={0} mouseLeaveDelay={0}>
            <Button shape="circle" size="large" icon={<VideoCameraOutlined />} />
          </Tooltip>
        )}
      </div>
    );
  }
}
