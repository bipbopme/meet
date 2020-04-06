import Head from 'next/head'
import React from 'react'
import Roster from '../components/roster/roster'
import SwarmCommander from '../lib/swarmCommander'
import TextChat from '../components/textChat/textChat'
import VideoChat from '../components/videoChat/videoChat'
import Welcome from '../components/welcome/welcome'

export default class RoomPage extends React.Component {
  constructor (props) {
    super(props)

    this.handleJoin = this.handleJoin.bind(this)
    this.handleUnload = this.handleUnload.bind(this)

    this.state = {
      name: '',
      joined: false
    }
  }

  componentDidMount () {
    // Remove the hash from the id
    this.id = window.location.hash.slice(1)
    
    window.addEventListener('beforeunload', this.handleUnload)
  }

  handleUnload () {
    if (this.swarm) {
      this.swarm.close()
    }
  }

  handleJoin (name, localStream) {
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
          <Welcome onJoin={this.handleJoin} />
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
