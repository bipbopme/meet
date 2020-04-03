import React from 'react'
import SwarmCommander from '../../lib/swarmCommander'
import TextChat from '../../components/textChat/textChat'
import Roster from '../../components/roster/roster'
import VideoChat from '../../components/videoChat/videoChat'
import Welcome from '../../components/welcome/welcome'
import Head from 'next/head'

export default class RoomPage extends React.Component {
  static async getInitialProps ({ query, req }) {
    return {
      id: query.id
    }
  }

  constructor (props) {
    super(props)

    this.id = this.props.id
    this.onJoin = this.onJoin.bind(this)
    this.onBeforeUnload = this.onBeforeUnload.bind(this)

    this.state = {
      name: '',
      joined: false
    }
  }

  componentDidMount () {
    window.addEventListener('beforeunload', this.onBeforeUnload)
  }

  onBeforeUnload () {
    if (this.swarm) {
      this.swarm.close()
    }
  }

  onJoin (name, localStream) {
    this.swarm = new SwarmCommander(this.id, localStream)

    this.setState({ joined: true, name: name, localStream: localStream })
  }

  render () {
    if (this.state.joined) {
      return (
        <div className='roomPage'>
          <Head>
            <title>Video Chat | bipbop</title>
            <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
          </Head>
          <Roster swarm={this.swarm} name={this.state.name} />
          <VideoChat swarm={this.swarm} localStream={this.state.localStream} />
          <TextChat swarm={this.swarm} name={this.state.name} />
        </div>
      )
    } else {
      return (
        <div className='roomPage'>
          <Welcome onJoin={this.onJoin} />
          <Head>
            <title>Welcome | bipbop</title>
            <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
          </Head>
          <div className='videoChat'>
            <header><h1>bipbop</h1></header>
            <section className='videos' />
            <footer className='controls' />
          </div>
          <div className='textChat'>
            <header />
            <section className='messages' />
            <footer className='chatBox' />
          </div>
        </div>
      )
    }
  }
}
