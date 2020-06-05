import { Button, Tooltip } from "antd";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
import AudioIcon from "../../../assets/icons/audio.svg";
import AudioOffIcon from "../../../assets/icons/audio-off.svg";
import Icon from "@ant-design/icons";
import JitsiParticipant from "../../../lib/jitsiManager/jitsiParticipant";
import React from "react";

interface MicButtonProps {
  localParticipant: JitsiParticipant;
}

interface MicButtonState {
  muted: boolean;
}

export default class MicButton extends React.Component<MicButtonProps, MicButtonState> {
  constructor(props: MicButtonProps) {
    super(props);

    this.state = {
      muted: this.props.localParticipant.isAudioMuted
    };
  }

  @bind()
  handleClick(): void {
    // Toggle muted
    const muted = !this.state.muted;

    // Flip the state
    this.setState({ muted });

    if (muted) {
      this.props.localParticipant.muteAudio();
    } else {
      this.props.localParticipant.unmuteAudio();
    }

    matopush(["trackEvent", "videoChat", "micButton", "toggle"]);
  }

  render(): JSX.Element {
    return (
      <div className="button micButton" onClick={this.handleClick}>
        {this.state.muted && (
          <Tooltip title="Turn on microphone" mouseEnterDelay={0} mouseLeaveDelay={0}>
            <Button shape="circle" size="large" icon={<Icon component={AudioOffIcon} />} />
          </Tooltip>
        )}
        {!this.state.muted && (
          <Tooltip title="Turn off microphone" mouseEnterDelay={0} mouseLeaveDelay={0}>
            <Button shape="circle" size="large" icon={<Icon component={AudioIcon} />} />
          </Tooltip>
        )}
      </div>
    );
  }
}
