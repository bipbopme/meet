import Head from 'next/head'
import React from 'react'
import Router from 'next/router'
import { uuid } from '../lib/utils'

export default class HomePage extends React.Component {
  handleClick () {
    Router.push(`/r/${uuid()}`)
  }

  render () {
    return (
      <div className='homePage'>
        <Head>
          <title>bipbop.</title>
        </Head>

        <h1>bipbop</h1>
        <h2>easy video chats in your browser</h2>

        <button onClick={this.handleClick}>Start</button>

        <div className='temporary'>(yes, there will be a proper home page soon)</div>
      </div>
    )
  }
}
