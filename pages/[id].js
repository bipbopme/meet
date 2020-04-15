/* global JitsiMeetJS */
import Head from 'next/head'
import React from 'react'
import Roster from '../components/roster/roster'
import TextChat from '../components/textChat/textChat'
import VideoChat from '../components/videoChat/videoChat'
import Welcome from '../components/welcome/welcome'

export default class RoomPage extends React.Component {
  static async getInitialProps ({ query }) {
    return {
      id: query.id
    }
  }

  constructor (props) {
    super(props)

    this.id = props.id

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

    this.state = {
      name: '',
      joined: false,
      localTracks: undefined
    }
  }

  componentDidMount () {
    window.addEventListener('beforeunload', this.handleUnload)

    this.connect()
  }

  handleUnload () {
    if (this.connection) {
      this.room.leave()
      this.connection.disconnect()
    }
  }

  handleJoin (name, localTracks) {
    this.room = this.connection.initJitsiConference(this.id, {})
    this.setState({ name: name, localTracks: localTracks, joined: true })
    this.room.join()
  }

  connect () {
    JitsiMeetJS.init({ disableAudioLevels: true, disableThirdPartyRequests: true })
    JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO)

    this.connection = new JitsiMeetJS.JitsiConnection(null, null, this.connectionOptions)
    this.connection.connect()
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
            {/* TODO: replace this with bundled versions */}
            <script src='/jitsi/jquery-3.5.0.min.js' />
            <script src='/jitsi/lib-jitsi-meet.min.js' />
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
