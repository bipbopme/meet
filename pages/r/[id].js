import React from 'react';
import shortid from 'shortid';
import PeerMesh from '../../lib/peerMesh';
import naampje from 'naampje';

export default class RoomPage extends React.Component {
  static async getInitialProps({ query, req }) {
    return {
      id: query.id
    };
  }

  constructor(props) {
    super(props);

    this.name = naampje.name();

    this.peerMesh = new PeerMesh(this.props.id);

    this.peerMesh.on('message', this.receiveMessage.bind(this));

    this.chatInput = React.createRef();
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      messages: []
    };
  }

  receiveMessage(message) {
    this.setState(state => ({
      messages: [...state.messages, message]
    }));
  }

  onSubmit(e) {
    e.preventDefault();
    
    const message = { id: shortid.generate(), name: this.name, body: this.chatInput.current.value }

    this.peerMesh.fire('message', message);
    this.receiveMessage(message);

    this.chatInput.current.value = '';
  }

  render() {
    return (
      <div className="roomPage">
        <h3>WebRTC Mesh Chat</h3>

        <div className="messages">
          {this.state.messages.map(message => (
            <div className="message" key={message.id}>
              {message.name}: {message.body}
            </div>
          ))}
        </div>

        <form onSubmit={this.onSubmit}>
          <input ref={this.chatInput}/>
        </form>
      </div>
    );
  }
}