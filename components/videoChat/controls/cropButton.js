import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faCompressAlt } from '@fortawesome/free-solid-svg-icons'
import { faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'

export default class CropButton extends React.Component {
  constructor (props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    // Toggle cropped
    const crop = !this.props.crop

    this.props.onToggle(crop)

    matopush(['trackEvent', 'videoChat', 'cropButton', 'toggle'])
  }

  render () {
    return (
      <div className='button viewButton' title="Toggle video crop" onClick={this.handleClick}>
        {this.props.crop &&
          <FontAwesomeIcon icon={faCompressAlt} />}
        {!this.props.crop &&
          <FontAwesomeIcon icon={faExpandAlt} />}
      </div>
    )
  }
}
