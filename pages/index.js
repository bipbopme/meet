import Head from 'next/head'
import React from 'react'
import Router from 'next/router'
import shortid from 'shortid'

export default class HomePage extends React.Component {
  handleClick () {
    const id = shortid.generate()

    Router.push('/r/' + id)
  }

  render () {
    return (
      <div className='homePage'>
        <Head>
          <title>bipbop.</title>
        </Head>

        <h1>bipbop</h1>
        <h2>private 👏 simple 👏 free 👏 video 👏 chat</h2>

        <button onClick={this.handleClick}>Start</button>
      </div>
    )
  }
}
