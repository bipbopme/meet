import React from 'react'

export default class Message extends React.Component {
  getAvatarSrc () {
    const participant = this.props.message.participant
    const avatarName = `${participant.displayName}-${participant.id}`

    return `https://avatars.dicebear.com/v2/initials/${encodeURIComponent(avatarName)}.svg?options[chars][]=1`
  }

  render () {
    const message = this.props.message

    return (
      <div className='message'>
        <img className='avatar' src={this.getAvatarSrc()} title={message.participant.displayName} />
        <div className='name'>{message.participant.displayName}</div>
        <div className='text'>{message.text}</div>
      </div>
    )
  }
}
