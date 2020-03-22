import React from 'react';
import ChatBox from './chatBox';
import Message from './message';

export default class TextChat extends React.Component {
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
      <div className="textChat">
        <header>
          Text Chat Header
        </header>
        <section className="messages">
          {this.state.messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </section>
        <ChatBox swarm={this.swarm} name={this.props.name} onReceiveMessage={this.receiveMessage.bind(this)} />
      </div>
    );
  }
}
