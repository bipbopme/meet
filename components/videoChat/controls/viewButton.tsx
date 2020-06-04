import { AppstoreOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
import React from "react";

interface ViewButtonProps {
  onToggle(view: string): void;
  view: string;
}

export default class ViewButton extends React.Component<ViewButtonProps> {
  @bind()
  handleClick(): void {
    this.props.onToggle(this.props.view === "grid" ? "spotlight" : "grid");

    matopush(["trackEvent", "videoChat", "viewButton", "toggle"]);
  }

  render(): JSX.Element {
    return (
      <div className="button viewButton" onClick={this.handleClick}>
        <Button type="text" size="large" icon={<AppstoreOutlined />}>
          Change view
        </Button>
      </div>
    );
  }
}
