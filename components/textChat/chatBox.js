import React from 'react'
import shortid from 'shortid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { matopush } from '../../lib/matomo'

export default class ChatBox extends React.Component {
  constructor (props) {
    super(props)

    this.swarm = props.swarm
    this.onReceiveMessage = props.onReceiveMessage
    this.inputRef = React.createRef()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()

    // TODO: Pass down user info
    const message = { id: shortid.generate(), name: this.props.name, body: this.inputRef.current.value }

    this.swarm.sendToAll('chat.message', message)
    this.onReceiveMessage(null, message)

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
