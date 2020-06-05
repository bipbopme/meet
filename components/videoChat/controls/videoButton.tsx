import { Button, Tooltip } from "antd";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
import CameraIcon from "../../../assets/icons/camera.svg";
import CameraOffIcon from "../../../assets/icons/camera-off.svg";
import Icon from "@ant-design/icons";
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
            <Button shape="circle" size="large" icon={<Icon component={CameraOffIcon} />} />
          </Tooltip>
        )}
        {!this.state.muted && (
          <Tooltip title="Turn off camera" mouseEnterDelay={0} mouseLeaveDelay={0}>
            <Button shape="circle" size="large" icon={<Icon component={CameraIcon} />} />
          </Tooltip>
        )}
      </div>
    );
  }
}
