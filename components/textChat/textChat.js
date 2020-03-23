import React from 'react';
import ChatBox from './chatBox';
import Message from './message';
import ScrollToBottom from 'react-scroll-to-bottom';

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
        <header></header>
        <ScrollToBottom className="messages" checkInterval="50">
          {this.state.messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </ScrollToBottom>
        <ChatBox swarm={this.swarm} name={this.props.name} onReceiveMessage={this.receiveMessage.bind(this)} />
      </div>
    );
  }
}
