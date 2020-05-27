import { Portal } from 'react-portal'
import React from 'react'
import { bind } from 'lodash-decorators';

interface ModalProps {
  onCancel(): void;
}

export default class Modal extends React.Component<ModalProps> {
  constructor (props: ModalProps) {
    super(props)

    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  @bind()
  handleKeyDown (event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.cancel()
    }
  }

  cancel () {
    this.props.onCancel()
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
