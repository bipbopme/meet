import React from "react";

interface RoomLeftProps {
  onRejoin(): void;
}

export default class RoomLeft extends React.Component<RoomLeftProps> {
  render(): JSX.Element {
    return (
      <div className="leftRoom">
        <h1>👋You left the chat.</h1>
        <button onClick={this.props.onRejoin}>Join again</button>
      </div>
    );
  }
}
