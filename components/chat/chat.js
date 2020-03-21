import React from 'react';
import ChatBox from './chatBox';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.swarm = props.swarm;
    this.swarm.on('chat.message', this.receiveMessage.bind(this));

    this.state = {
      messages: []
    }
  }

  receiveMessage(node, message) {
    this.setState(state => ({
      messages: [...state.messages, message]
    }));
  }

  render() {
    return (
      <div className="chat">
        <h4>Messages</h4>
        <div className="messages">
          {this.state.messages.map(message => (
            <div className="message" key={message.id}>
              {message.name}: {message.body}
            </div>
          ))}
        </div>
        <ChatBox swarm={this.swarm} name={this.props.name} onReceiveMessage={this.receiveMessage.bind(this)} />
      </div>
    );
  }
}
