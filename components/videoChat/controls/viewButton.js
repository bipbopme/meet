import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faSquare } from '@fortawesome/free-regular-svg-icons'
import { faSquare as fasSquare } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class ViewButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      zoomed: true
    }
  }

  handleClick () {
    // Toggle zoomed
    const zoomed = !this.state.zoomed

    // Flip the state
    this.setState({ zoomed })

    this.props.onToggle(zoomed)

    matopush(['trackEvent', 'videoChat', 'videoButton', 'toggle'])
  }

  render () {
    return (
      <div className='button viewButton' title="Toggle video zoom" onClick={this.handleClick}>
        {this.state.zoomed &&
          <FontAwesomeIcon icon={fasSquare} />}
        {!this.state.zoomed &&
          <FontAwesomeIcon icon={faSquare} />}
      </div>
    )
  }
}
