import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bind } from "lodash-decorators";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
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
        <div className="button shareButton" title="Invite others" onClick={this.handleClick}>
          <FontAwesomeIcon icon={faUserPlus} /> <span className="label">Invite</span>
        </div>
        {this.state.showShare && <Share onCancel={this.handleCancel} />}
      </>
    );
  }
}
