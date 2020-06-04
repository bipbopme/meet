import { Button, Modal } from "antd";
import { Typography } from "antd";
import React from "react";

const { Paragraph } = Typography;

interface ShareProps {
  onCancel(): void;
}

interface ShareState {
  url: string;
}

export default class Share extends React.Component<ShareProps, ShareState> {
  state = {
    url: window.location.toString()
  };

  render(): JSX.Element {
    return (
      <Modal
        className="share"
        centered
        onCancel={this.props.onCancel}
        visible={true}
        title="Invite your people"
        footer={[
          <Button key="submit" type="primary" onClick={this.props.onCancel}>
            Got It
          </Button>
        ]}
      >
        <Paragraph type="secondary">
          Share this link with people you want to join this chat
        </Paragraph>
        <Paragraph strong copyable>
          {this.state.url}
        </Paragraph>
      </Modal>
    );
  }
}
