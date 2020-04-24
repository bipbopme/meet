import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faCommentAlt } from '@fortawesome/free-regular-svg-icons'
import { faCommentAlt as fasCommentAlt } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class TextChatButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      shown: false
    }
  }

  handleClick () {
    // Toggle shown
    const shown = !this.state.shown

    // Flip the state
    this.setState({ shown })

    matopush(['trackEvent', 'videoChat', 'textChatButton', 'toggle'])
  }

  render () {
    return (
      <div className='button textChatButton' onClick={this.handleClick}>
        {!this.state.shown &&
          <><FontAwesomeIcon icon={faCommentAlt} /> <span className='label'>Show chat</span></>}
        {this.state.shown &&
          <><FontAwesomeIcon icon={fasCommentAlt} /> <span className='label'>Hide chat</span></>}
      </div>
    )
  }
}
