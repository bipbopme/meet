import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faCommentAlt } from '@fortawesome/free-regular-svg-icons'
import { faCommentAlt as fasCommentAlt } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class TextChatButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.props.conference.on('MESSAGE_RECEIVED', this.handleMessageRecieved.bind(this))

    this.state = {
      show: false,
      hiddenMessagesCount: 0
    }
  }

  handleMessageRecieved () {
    if (!this.state.show) {
      this.setState((state, props) => ({
        hiddenMessagesCount: state.hiddenMessagesCount + 1
      }))
    }
  }

  handleClick () {
    // Toggle show
    const show = !this.state.show

    // Flip the state
    this.setState({ show, hiddenMessagesCount: 0 })

    // Toggle chat visibility up the chain
    this.props.onToggleChat()

    matopush(['trackEvent', 'videoChat', 'textChatButton', 'toggle'])
  }

  render () {
    return (
      <div className={`button textChatButton ${this.state.hiddenMessagesCount > 0 ? 'hasHiddenMessages' : ''}`} onClick={this.handleClick}>
        {!this.state.show &&
          <>
            <FontAwesomeIcon icon={faCommentAlt} />
            {this.state.hiddenMessagesCount > 0 &&
              <span className='count'>{this.state.hiddenMessagesCount}</span>
            }
            <span className='label'>Show chat</span>
          </>}
        {this.state.show &&
          <>
            <FontAwesomeIcon icon={fasCommentAlt} />
            <span className='label'>Hide chat</span>
          </>}
      </div>
    )
  }
}
