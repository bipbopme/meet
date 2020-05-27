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

  componentWillUnmount (): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  @bind()
  handleKeyDown (event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel()
    }
  }

  cancel (): void {
    this.props.onCancel()
  }

  render (): JSX.Element {
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
