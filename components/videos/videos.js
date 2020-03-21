import React from 'react';
import Video from './video';

export default class Videos extends React.Component {
  constructor(props) {
    super(props);

    this.swarm = props.swarm;

    this.swarm.on('connect', this.onNodeConnect.bind(this));
    this.swarm.on('disconnect', this.updateNodes.bind(this));
    this.swarm.on('stream', this.onNodeStream.bind(this));

    this.state = {
      nodes: [],
      localStream: null
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(this.onGetUserMedia.bind(this));
  }

  onGetUserMedia(stream) {
    console.log('we have a stream');

    this.setState({ localStream: stream });

    // For anyone connected before we had a stream
    this.swarm.streamToAll(stream);
  }

  onNodeStream(node, stream) {
    node.meta.stream = stream;

    this.updateNodes(node);
  }

  onNodeConnect(node) {
    this.updateNodes(node);

    // Send the stream if we have it
    if (this.state.localStream) {
      this.swarm.streamToOne(node, this.state.localStream);
    }
  }

  updateNodes(node) {
    this.setState({ nodes: this.swarm.nodes });
  }

  render() {
    return (
      <div className="videos">
        {this.state.nodes.map(node => (
          <Video key={node.id} node={node} stream={node.meta.stream} />
        ))}
        <Video key='myVideo' local={true} stream={this.state.localStream} />
      </div>
    );
  }
}
