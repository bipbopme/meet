import { Col, Row } from "antd";
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
      <Row className="roomSetup" align="middle" justify="center">
        <Col span="18">
          <Settings
            titleText="Ready to join?"
            buttonText="Join"
            onButtonClick={this.props.onComplete}
            collapseAudioVideoSettings={true}
          />
        </Col>
      </Row>
    );
  }
}
