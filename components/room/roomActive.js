import Head from 'next/head'
import React from 'react'
import TextChat from '../textChat/textChat'
import VideoChat from '../videoChat/videoChat'

export default class RoomActive extends React.Component {
  constructor (props) {
    super(props)

    this.handleToggleChat = this.handleToggleChat.bind(this)

    this.state = {
      chatShown: false
    }
  }

  handleToggleChat () {
    this.setState({ chatShown: !this.state.chatShown })
  }

  render () {
    return (
      <div className={`roomPage ${this.state.chatShown ? 'chatShown' : 'chatHidden'}`}>
        <Head>
          <title>Video Chat | bipbop</title>
          <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        </Head>
        <VideoChat conference={this.props.conference} onLeave={this.props.onLeave} onToggleChat={this.handleToggleChat} />
        <TextChat conference={this.props.conference} />
      </div>
    )
  }
}
