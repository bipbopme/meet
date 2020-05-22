import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'
import { bind } from 'lodash-decorators'

interface LeaveButtonProps {
  onLeave(): void;
}

export default class LeaveButton extends React.Component<LeaveButtonProps> {
  @bind()
  handleClick () {
    this.props.onLeave()

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
