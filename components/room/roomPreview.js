import Head from 'next/head'
import React from 'react'
import Welcome from '../welcome/welcome'

export default class RoomPreview extends React.Component {
  render () {
    return (
      <div className='roomPage'>
        <Head>
          <title>Welcome | bipbop</title>
          <meta key='viewport' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1' />
        </Head>
        <Welcome onJoin={this.props.onJoin} />
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
