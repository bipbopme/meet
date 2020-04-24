import Head from 'next/head'
import React from 'react'
import TextChat from '../textChat/textChat'
import VideoChat from '../videoChat/videoChat'

export default class RoomActive extends React.Component {
  render () {
    return (
      <div className='roomPage'>
        <Head>
          <title>Video Chat | bipbop</title>
          <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        </Head>
        <VideoChat conference={this.props.conference} onLeave={this.props.onLeave} />
        <TextChat conference={this.props.conference} />
      </div>
    )
  }
}
