import React from 'react'

export default class RoomLeft extends React.Component {
  render () {
    return (
      <div className='leftRoom'>
        <h1>👋You left the chat.</h1>
        <button onClick={this.props.onRejoin}>Join again</button>
      </div>
    )
  }
}
