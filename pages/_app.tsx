import "../assets/styles/app.scss";
import { initMatomo } from "../lib/matomo";
import App from "next/app";
import React from "react";

export default class MyApp extends App {
  componentDidMount(): void {
    initMatomo();
  }

  render(): JSX.Element {
    const { Component, pageProps } = this.props;

    return <Component {...pageProps} />;
  }
}
