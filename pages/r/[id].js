import React from 'react';
import SwarmCommander from '../../lib/swarmCommander';
import TextChat from '../../components/textChat/textChat';
import Roster from '../../components/roster/roster';
import naampje from 'naampje';
import VideoChat from '../../components/videoChat/videoChat';
import Welcome from '../../components/welcome/welcome';

export default class RoomPage extends React.Component {
  static async getInitialProps({ query, req }) {
    return {
      id: query.id
    };
  }

  constructor(props) {
    super(props);

    this.id = this.props.id;
    this.onJoin = this.onJoin.bind(this);

    this.state = {
      name: '',
      joined: false
    };
  }
  onJoin(name, localStream) {
    this.swarm = new SwarmCommander(this.id);

    this.setState({ joined: true, name: name });
  }

  render() {
    if (this.state.joined) {
      return (
        <div className="roomPage">
          <Roster swarm={this.swarm} name={this.state.name} />
          <VideoChat swarm={this.swarm} />
          <TextChat swarm={this.swarm} name={this.state.name} />
        </div>
      );
    } else {
      return (
        <div className="roomPage">
          <Welcome onJoin={this.onJoin} />
          <div class="videoChat">
            <header><h1>bipbop</h1></header>
            <section class="videos"></section>
            <footer class="controls"></footer>
          </div>
          <div class="textChat">
            <header></header>
            <section class="messages"></section>
            <footer class="chatBox"></footer>
          </div>
        </div>
      );
    }
  }
}
