import { AudioMutedOutlined, AudioOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
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
          <Tooltip title="Turn on microphone">
            <Button shape="circle" size="large" icon={<AudioMutedOutlined />} />
          </Tooltip>
        )}
        {!this.state.muted && (
          <Tooltip title="Turn off microphone">
            <Button shape="circle" size="large" icon={<AudioOutlined />} />
          </Tooltip>
        )}
      </div>
    );
  }
}
