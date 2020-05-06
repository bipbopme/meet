import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { faThLarge } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class ViewButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    // Toggle view
    const newView = this.props.view === 'grid' ? 'single' : 'grid'

    this.props.onToggle(newView)

    matopush(['trackEvent', 'videoChat', 'viewButton', 'toggle'])
  }

  render () {
    return (
      <div className='button viewButton' title="Toggle grid view" onClick={this.handleClick}>
        {this.props.view === 'grid' &&
          <FontAwesomeIcon icon={faSmile} />}
        {this.props.view === 'single' &&
          <FontAwesomeIcon icon={faThLarge} />}
      </div>
    )
  }
}
