import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faThLarge } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../../lib/matomo'
import { bind } from 'lodash-decorators'

interface ViewButtonProps {
  onToggle(view: string): void;
  view: string;
}

export default class ViewButton extends React.Component<ViewButtonProps> {
  @bind()
  handleClick () {
    this.props.onToggle(this.props.view === 'grid' ? 'spotlight' : 'grid')

    matopush(['trackEvent', 'videoChat', 'viewButton', 'toggle'])
  }

  render () {
    return (
      <div className='button viewButton' title="Toggle grid view" onClick={this.handleClick}>
          <FontAwesomeIcon icon={faThLarge} />  <span className='label'>Toggle view</span>
      </div>
    )
  }
}
