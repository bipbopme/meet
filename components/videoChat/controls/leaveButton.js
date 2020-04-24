import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class LeaveButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    matopush(['trackEvent', 'videoChat', 'leaveButton', 'click'])
  }

  render () {
    return (
      <div className='button leaveButton' onClick={this.handleClick}>
        <span title="Leave Video Chat"><FontAwesomeIcon icon={faTimes} /></span>
      </div>
    )
  }
}
