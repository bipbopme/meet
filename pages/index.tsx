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
          <title>bipbop.</title>
        </Head>
        <h1>bipbop</h1>
        <h2>easy video chats in your browser</h2>
        <Button type="primary" size="large" shape="round" onClick={this.handleClick}>
          Start
        </Button>
      </div>
    );
  }
}
