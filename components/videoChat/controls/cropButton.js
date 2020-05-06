import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faCompressAlt } from '@fortawesome/free-solid-svg-icons'
import { faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class CropButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)

    this.state = {
      cropped: true
    }
  }

  handleClick () {
    // Toggle cropped
    const cropped = !this.state.cropped

    // Flip the state
    this.setState({ cropped })

    this.props.onToggle(cropped)

    matopush(['trackEvent', 'videoChat', 'cropButton', 'toggle'])
  }

  render () {
    return (
      <div className='button viewButton' title="Toggle video crop" onClick={this.handleClick}>
        {this.state.cropped &&
          <FontAwesomeIcon icon={faCompressAlt} />}
        {!this.state.cropped &&
          <FontAwesomeIcon icon={faExpandAlt} />}
      </div>
    )
  }
}
