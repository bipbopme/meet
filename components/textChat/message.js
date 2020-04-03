import React from 'react'

export default class Message extends React.Component {
  getAvatarSrc () {
    return `https://avatars.dicebear.com/v2/initials/${encodeURIComponent(this.props.message.name)}.svg?options[chars][]=1`
  }

  render () {
    const msg = this.props.message

    return (
      <div className='message'>
        <img className='avatar' src={this.getAvatarSrc()} title={msg.name} />
        <div className='name'>{msg.name}</div>
        <div className='body'>{msg.body}</div>
      </div>
    )
  }
}
