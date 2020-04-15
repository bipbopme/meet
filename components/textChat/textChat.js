/* global JitsiMeetJS */
import ChatBox from './chatBox'
import Message from './message'
import React from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'
import { matopush } from '../../lib/matomo'
import { uuid } from '../../lib/utils'

export default class TextChat extends React.Component {
  constructor (props) {
    super(props)

    this.displayNames = {}

    this.conference = props.conference
    this.conference.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, this.handleConferenceJoined.bind(this))
    this.conference.on(JitsiMeetJS.events.conference.MESSAGE_RECEIVED, this.handleMessageReceived.bind(this))
    this.conference.on(JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED, this.handleDisplayNameChanged.bind(this))

    this.state = {
      messages: []
    }
  }

  handleConferenceJoined () {
    this.displayNames[this.conference.myUserId()] = this.props.name
    this.conference.setDisplayName(this.props.name)
  }

  handleMessageReceived (userID, text, ts) {
    const message = { id: uuid(), userID, name: this.displayNames[userID], text, ts }

    this.setState(state => ({
      messages: [...state.messages, message]
    }))

    matopush(['trackEvent', 'textChat', 'message', 'received'])
  }

  handleDisplayNameChanged (userID, displayName) {
    this.displayNames[userID] = displayName
  }

  render () {
    return (
      <div className='textChat'>
        <header />
        <ScrollToBottom className='messages' checkInterval={50}>
          {this.state.messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </ScrollToBottom>
        <ChatBox conference={this.props.conference} />
      </div>
    )
  }
}
