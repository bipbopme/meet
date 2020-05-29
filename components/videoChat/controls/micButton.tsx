import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
          <FontAwesomeIcon title="Turn On Microphone" icon={faMicrophoneSlash} />
        )}
        {!this.state.muted && <FontAwesomeIcon title="Turn Off Microphone" icon={faMicrophone} />}
      </div>
    );
  }
}
