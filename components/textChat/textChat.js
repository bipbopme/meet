import ChatBox from './chatBox'
import Message from './message'
import React from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'
import { observer } from 'mobx-react'

@observer
export default class TextChat extends React.Component {
  render () {
    const { messages } = this.props.conference

    return (
      <div className='textChat'>
        <header />
        <ScrollToBottom className='messages' checkInterval={50}>
          {messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </ScrollToBottom>
        <ChatBox conference={this.props.conference} />
      </div>
    )
  }
}
