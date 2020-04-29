import React from 'react'

export default class Message extends React.Component {
  getAvatarSrc () {
    const participant = this.props.message.participant
    const avatarName = `${participant.displayName}-${participant.id}`

    return `https://avatars.dicebear.com/v2/jdenticon/${encodeURIComponent(avatarName)}.svg`
  }

  render () {
    const { participant, text} = this.props.message

    return (
      <div className={`message ${participant.isLocal ? 'fromMe' : 'fromThem'}`}>
        <img className='avatar' src={this.getAvatarSrc()} title={participant.displayName} />
        <div className='name'>{participant.displayName}</div>
        <div className='text'>{text}</div>
      </div>
    )
  }
}
