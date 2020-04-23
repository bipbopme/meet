import ChatBox from './chatBox'
import Message from './message'
import React from 'react'
import { observer } from 'mobx-react'

@observer
export default class TextChat extends React.Component {
  constructor (props) {
    super(props)

    this.messagesRef = React.createRef()
  }

  getSnapshotBeforeUpdate (prevProps, prevState) {
    return this.messagesRef.current.scrollHeight - this.messagesRef.current.scrollTop === this.messagesRef.current.clientHeight
  }

  componentDidUpdate (prevProps, prevState, wasScrolledToBottom) {
    if (wasScrolledToBottom) {
      this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight
    }
  }

  render () {
    const { messages } = this.props.conference

    return (
      <div className='textChat'>
        <header />
        <div className='messages' ref={this.messagesRef}>
          {messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <ChatBox conference={this.props.conference} />
      </div>
    )
  }
}
