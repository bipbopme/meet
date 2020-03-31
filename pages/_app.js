import App from 'next/app';
import { initMatomo } from '../lib/matomo';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

import '../styles/app.scss'

export default class MyApp extends App {
  componentDidMount() {
    initMatomo({
      siteId: 1,
      matomoUrl: 'https://matomo.bipbop.me',
      cookieDomain: '*.bipbop.me'
    });
  }

  render() {
    const { Component, pageProps } = this.props;

    return <Component {...pageProps} />
  }
}
