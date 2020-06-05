import React, { ReactNode } from "react";

interface RoomStatusProps {
  children: ReactNode;
}

export default class RoomStatus extends React.Component<RoomStatusProps> {
  render(): JSX.Element {
    return (
      <div className="room roomSetup">
        <div className="videoChat">
          <header>
            <h1>bipbop</h1>
          </header>
          <section className="videosPreview">
            <div className="statusMessage">{this.props.children}</div>
          </section>
          <footer className="controls" />
        </div>
      </div>
    );
  }
}
