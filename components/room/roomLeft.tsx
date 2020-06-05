import { Button, Result } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { uuid } from "../../lib/utils";
import React from "react";
import Router from "next/router";

interface RoomLeftProps {
  onRejoin(): void;
}

export default class RoomLeft extends React.Component<RoomLeftProps> {
  handleNewClick(): void {
    Router.push(`/r/${uuid()}`);
  }

  render(): JSX.Element {
    return (
      <div className="room roomLeft">
        <Result
          title="You left the chat."
          subTitle="If you left on accident, just click the button below to join again."
          icon={<CheckCircleOutlined />}
          extra={[
            <Button type="primary" shape="round" key="rejoin" onClick={this.props.onRejoin}>
              Join again
            </Button>,
            <Button shape="round" key="new" onClick={this.handleNewClick}>
              New Chat
            </Button>
          ]}
        />
      </div>
    );
  }
}
