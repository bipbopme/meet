import React from 'react'

export default class Message extends React.Component {
  getAvatarSrc () {
    return `https://avatars.dicebear.com/v2/initials/${encodeURIComponent(this.props.message.name)}.svg?options[chars][]=1`
  }

  render () {
    const message = this.props.message

    return (
      <div className='message'>
        <img className='avatar' src={this.getAvatarSrc()} title={message.name} />
        <div className='name'>{message.name}</div>
        <div className='text'>{message.text}</div>
      </div>
    )
  }
}
