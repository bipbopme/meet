import Head from 'next/head'
import React from 'react'
import Settings from '../settings/settings'

interface RoomSetupProps {
  onComplete(name: string | undefined, audioTrack: JitsiMeetJS.JitsiTrack, videoTrack: JitsiMeetJS.JitsiTrack): void;
}

export default class RoomSetup extends React.Component<RoomSetupProps> {
  render () {
    return (
      <div className='roomPage roomSetup'>
        <Head>
          <title>Welcome | bipbop</title>
          <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        </Head>
        <div className='videoChat'>
          <header><h1>bipbop</h1></header>
          <section className='videosPreview'>
            <div className='preview'>
              <Settings titleText='Ready to join?' buttonText='Join' onButtonClick={this.props.onComplete} collapseAudioVideoSettings={true} />
            </div>
          </section>
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
