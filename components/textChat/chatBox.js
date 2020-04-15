import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../lib/matomo'
import { uuid } from '../../lib/utils'

export default class ChatBox extends React.Component {
  constructor (props) {
    super(props)

    this.conference = props.conference
    this.inputRef = React.createRef()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()

    this.conference.sendTextMessage(this.inputRef.current.value)
    this.inputRef.current.value = ''

    matopush(['trackEvent', 'textChat', 'message', 'sent'])
  }

  render () {
    return (
      <footer className='chatBox'>
        <form onSubmit={this.handleSubmit}>
          <input ref={this.inputRef} placeholder='Message' />
          <button type='submit'><FontAwesomeIcon icon={faPaperPlane} /></button>
        </form>
      </footer>
    )
  }
}
