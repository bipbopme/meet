import { Typography } from "antd";
import React from "react";

const { Paragraph } = Typography;

interface ShareState {
  url: string;
}

export default class Share extends React.Component<unknown, ShareState> {
  state = {
    url: window.location.toString()
  };

  render(): JSX.Element {
    return (
      <>
        <Paragraph type="secondary">
          Share this link with people you want to join this chat
        </Paragraph>
        <Paragraph strong copyable>
          {this.state.url}
        </Paragraph>
      </>
    );
  }
}
