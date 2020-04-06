import React from 'react'
import Video from './video'
import VideoChatControls from './controls/videoChatControls'

export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.swarm = props.swarm

    this.swarm.on('connect', this.onNodeConnect.bind(this))
    this.swarm.on('disconnect', this.updateNodes.bind(this))
    this.swarm.on('stream', this.onNodeStream.bind(this))

    this.state = {
      nodes: [],
      localStream: props.localStream
    }
  }

  onNodeStream (node, stream) {
    node.meta.stream = stream

    this.updateNodes(node)
  }

  onNodeConnect (node) {
    this.updateNodes(node)
  }

  updateNodes (node) {
    this.setState({ nodes: this.swarm.nodes })
  }

  render () {
    return (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
        </header>
        <section className={`videos videos-count-${this.state.nodes.length + 1}`}>
          {this.state.nodes.map(node => (
            <Video key={node.id} node={node} stream={node.meta.stream} />
          ))}
          <Video key='myVideo' local stream={this.state.localStream} />
        </section>
        <VideoChatControls localStream={this.state.localStream} />
      </div>
    )
  }
}
