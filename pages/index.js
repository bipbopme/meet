import Head from 'next/head';
import Router from 'next/router';
import shortid from 'shortid';

export default class HomePage extends React.Component {
  onClick() {
    const id = shortid.generate();

    Router.push('/r/' + id);
  }

  render() {
    return (
      <div className="container">
        <Head>
          <title>BipBop.</title>
        </Head>

        <h1>BipBop</h1>

        <button onClick={this.onClick}>Start</button>
      </div>
    );
  }
}
