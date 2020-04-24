import Head from 'next/head'
import JitsiManager from '../../lib/jitsiManager'
import React from 'react'
import TextChat from '../../components/textChat/textChat'
import VideoChat from '../../components/videoChat/videoChat'
import Welcome from '../../components/welcome/welcome'
import { observer } from 'mobx-react'

const JITSI_CONFIG = JSON.parse(process.env.JITSI_CONFIG)

@observer
export default class RoomPage extends React.Component {
  constructor (props) {
    super(props)

    this.handleJoin = this.handleJoin.bind(this)
    this.handleLeave = this.handleLeave.bind(this)

    this.state = {
      joined: false,
      left: false
    }
  }

  componentDidMount () {
    this.id = window.location.pathname.split('/').pop()
    this.jitsi = new JitsiManager(JITSI_CONFIG.host)
  }

  handleJoin (name, localTracks) {
    this.conference = this.jitsi.initConferenceManager(this.id, localTracks, name)
    this.setState({ joined: true })
    this.conference.join()
  }

  handleLeave () {
    this.conference.leave()
    this.jitsi.disconnect()

    this.setState({ left: true })
  }

  handleRejoin () {
    window.location.reload()
  }

  render () {
    if (this.state.joined) {
      if (this.state.left) {
        return (
          <div className='leftRoom'>
            <h1>👋You left the chat.</h1>
            <button onClick={this.handleRejoin}>Join again</button>
          </div>
        )
      } else {
        return (
          <div className='roomPage'>
            <Head>
              <title>Video Chat | bipbop</title>
              <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
            </Head>
            <VideoChat conference={this.conference} onLeave={this.handleLeave} />
            <TextChat conference={this.conference} />
          </div>
        )
      }
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
