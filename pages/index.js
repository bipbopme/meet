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
        <h2>simple 👏 free 👏 video 👏 chat</h2>

        <button onClick={this.handleClick}>Start</button>
      </div>
    )
  }
}
