/* global JitsiMeetJS */

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

    this.connectionOptions = {
      hosts: {
        domain: 'jitsi.bipbop.me',
        muc: 'conference.jitsi.bipbop.me'
      },
      serviceUrl: 'https://jitsi.bipbop.me/http-bind',
      clientNode: 'http://bipbop.me/JitsiMeetJS'
    }

    this.handleJoin = this.handleJoin.bind(this)
    this.handleUnload = this.handleUnload.bind(this)
    this.handleConnectionEstablished = this.handleConnectionEstablished.bind(this)

    this.state = {
      name: '',
      joined: false,
      localTracks: undefined
    }
  }

  componentDidMount () {
    // Remove the hash from the id
    this.id = window.location.hash.slice(1)

    window.addEventListener('beforeunload', this.handleUnload)
  }

  handleUnload () {
    if (this.connection) {
      this.room.leave()
      this.connection.disconnect()
    }
  }

  handleJoin (name, localStream) {
    this.setState({ name: name })
    this.connect()
  }

  connect () {
    // Configure global options
    JitsiMeetJS.init({ disableAudioLevels: true, disableThirdPartyRequests: true })
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO);

    this.connection = new JitsiMeetJS.JitsiConnection(null, null, this.connectionOptions)
    this.connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, this.handleConnectionEstablished)
    this.connection.connect()
  }

  async handleConnectionEstablished () {
    this.room = this.connection.initJitsiConference(this.id, {});

    // TODO: These should be passed from settings like localStream
    let localTracks = await JitsiMeetJS.createLocalTracks({ devices: ['audio', 'video'] });

    // Setup components
    this.setState({ joined: true, localTracks: localTracks })

    // Join the room
    this.room.join()
  }

  render () {
    if (this.state.joined) {
      return (
        <div className='roomPage'>
          <Head>
            <title>Video Chat | bipbop</title>
            <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
          </Head>
          <VideoChat room={this.room} localTracks={this.state.localTracks} />
          {/* <TextChat swarm={this.swarm} name={this.state.name} /> */}
        </div>
      )
    } else {
      return (
        <div className='roomPage'>
          <Welcome onJoin={this.handleJoin} />
          <Head>
            <title>Welcome | bipbop</title>
            <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
            <script async src="/jitsi/jquery-3.5.0.min.js" />
            <script async src="/jitsi/lib-jitsi-meet.min.js" />
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
