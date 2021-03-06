import { Button, Tooltip } from "antd";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
import CloseIcon from "../../../assets/icons/close.svg";
import Icon from "@ant-design/icons";
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
        <Tooltip title="Leave video chat" mouseEnterDelay={0} mouseLeaveDelay={0}>
          <Button shape="circle" size="large" icon={<Icon component={CloseIcon} />} />
        </Tooltip>
      </div>
    );
  }
}
