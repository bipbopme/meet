import Head from 'next/head'
import JitsiManager from '../../lib/jitsiManager'
import React from 'react'
import TextChat from '../../components/textChat/textChat'
import VideoChat from '../../components/videoChat/videoChat'
import Welcome from '../../components/welcome/welcome'
import { observer } from 'mobx-react'

@observer
export default class RoomPage extends React.Component {
  static async getInitialProps ({ query }) {
    return {
      id: query.id
    }
  }

  constructor (props) {
    super(props)

    this.id = props.id
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

    this.jitsi = new JitsiManager('meet.bipbop.me')
  }

  handleUnload () {
    this.jitsi.disconnect()
  }

  handleJoin (name, localTracks) {
    this.conference = this.jitsi.initConferenceManager(this.id, localTracks, name)
    this.setState({ name: name, localTracks: localTracks, joined: true })
    this.conference.join()
  }

  render () {
    if (this.state.joined) {
      return (
        <div className='roomPage'>
          <Head>
            <title>Video Chat | bipbop</title>
            <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
          </Head>
          <VideoChat conference={this.conference} />
          <TextChat conference={this.conference} />
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
