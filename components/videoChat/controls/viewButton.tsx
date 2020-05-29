import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bind } from "lodash-decorators";
import { faThLarge } from "@fortawesome/free-solid-svg-icons";
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
      <div className="button viewButton" title="Toggle grid view" onClick={this.handleClick}>
        <FontAwesomeIcon icon={faThLarge} /> <span className="label">Toggle view</span>
      </div>
    );
  }
}
