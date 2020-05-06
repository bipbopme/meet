import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faSmile } from '@fortawesome/free-regular-svg-icons'
import { faThLarge } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class ViewButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      zoomed: false
    }
  }

  handleClick () {
    // Toggle zoomed
    const zoomed = !this.state.zoomed

    // Flip the state
    this.setState({ zoomed })

    this.props.onToggle(zoomed ? 'grid' : 'single')

    matopush(['trackEvent', 'videoChat', 'videoButton', 'toggle'])
  }

  render () {
    return (
      <div className='button viewButton' title="Toggle grid view" onClick={this.handleClick}>
        {this.state.zoomed &&
          <FontAwesomeIcon icon={faSmile} />}
        {!this.state.zoomed &&
          <FontAwesomeIcon icon={faThLarge} />}
      </div>
    )
  }
}
