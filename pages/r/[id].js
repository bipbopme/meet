import React from 'react';
import SwarmCommander from '../../lib/swarmCommander';
import Chat from '../../components/chat/chat';
import Roster from '../../components/roster/roster';
import naampje from 'naampje';
import Videos from '../../components/videos/videos';

export default class RoomPage extends React.Component {
  static async getInitialProps({ query, req }) {
    return {
      id: query.id
    };
  }

  constructor(props) {
    super(props);

    this.id = this.props.id;

    this.state = {
      swarmInitialized: false,
      name: naampje.name()
    };
  }

  componentDidMount() {
    this.initSwarm();
  }

  initSwarm() {
    this.swarm = new SwarmCommander(this.id);

    this.setState({ swarmInitialized: true });
  }

  render() {
    if (this.state.swarmInitialized) {
      return (
        <div className="roomPage">
          <h3>BipBop</h3>

          <Roster swarm={this.swarm} name={this.state.name} />
          <Chat swarm={this.swarm} name={this.state.name} />
          <Videos swarm={this.swarm} />
        </div>
      );
    } else {
      return (
        <div>I'm offline</div>
      );
    }
  }
}
