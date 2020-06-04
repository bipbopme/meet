import { Button } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
import React from "react";
import Share from "../../share";

interface ShareButtonState {
  showShare: boolean;
}

export default class ShareButton extends React.Component<unknown, ShareButtonState> {
  state = {
    showShare: false
  };

  @bind()
  handleClick(): void {
    this.setState({ showShare: true });

    matopush(["trackEvent", "videoChat", "shareButton", "click"]);
  }

  @bind()
  async handleCancel(): Promise<void> {
    this.setState({ showShare: false });
  }

  render(): JSX.Element {
    return (
      <>
        <div className="button shareButton" onClick={this.handleClick}>
          <Button type="text" size="large" icon={<UserAddOutlined />}>
            Invite
          </Button>
        </div>
        {this.state.showShare && <Share onCancel={this.handleCancel} />}
      </>
    );
  }
}
