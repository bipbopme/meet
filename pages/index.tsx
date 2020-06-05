import { Button } from "antd";
import { uuid } from "../lib/utils";
import Head from "next/head";
import React from "react";
import Router from "next/router";

export default class HomePage extends React.Component {
  handleClick(): void {
    Router.push(`/r/${uuid()}`);
  }

  render(): JSX.Element {
    return (
      <div className="homePage">
        <Head>
          <title>bipbop | free video chat in your browser</title>
        </Head>
        <header>
          <h1>bipbop</h1>
        </header>
        <section>
          <div className="illustration">
            <img src="/images/people@2x.png" />
          </div>
          <div className="pitch">
            <h2>Video chat with your favorite people for free.</h2>
            <div className="copy">
              There&apos;s nothing to install. Just send your friends a link and start chatting.
              From any device. Anywhere.
            </div>
            <div className="buttons">
              <Button type="primary" size="large" shape="round" onClick={this.handleClick}>
                Start a chat
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
