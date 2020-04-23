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

    this.state = {
      joined: false
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
