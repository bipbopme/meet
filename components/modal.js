import { Portal } from 'react-portal'
import React from 'react'

export default class Modal extends React.Component {
  constructor (props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)

    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown (event) {
    if (event.key === 'Escape') {
      this.cancel()
    }
  }

  cancel () {
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  }

  render () {
    return (
      <Portal>
        <div className='modal'>
          <div className='modalInner'>
            {this.props.children}
          </div>
        </div>
      </Portal>
    )
  }
}
