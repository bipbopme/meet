import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bind } from "lodash-decorators";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { matopush } from "../../../lib/matomo";
import React from "react";

interface LeaveButtonProps {
  onLeave(): void;
}

export default class LeaveButton extends React.Component<LeaveButtonProps> {
  @bind()
  handleClick(): void {
    this.props.onLeave();

    matopush(["trackEvent", "videoChat", "leaveButton", "click"]);
  }

  render(): JSX.Element {
    return (
      <div className="button leaveButton" onClick={this.handleClick}>
        <span title="Leave Video Chat">
          <FontAwesomeIcon icon={faTimes} />
        </span>
      </div>
    );
  }
}
