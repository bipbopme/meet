import React, { ReactNode } from "react";

import Head from "next/head";

interface RoomStatusProps {
  children: ReactNode;
}

export default class RoomStatus extends React.Component<RoomStatusProps> {
  render(): JSX.Element {
    return (
      <div className="roomPage roomSetup">
        <Head>
          <title>Welcome | bipbop</title>
          <meta
            key="viewport"
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1"
          />
        </Head>
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
