import React from 'react';

export default class Video extends React.Component {
  constructor(props) {
    super(props);

    this.videoRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.props.stream) {
      this.videoRef.current.srcObject = this.props.stream;
    }
  }

  render() {
    return (
      <div className="video">
        <video ref={this.videoRef} autoPlay playsInline muted={this.props.local} width="500" height="500" />
      </div>
    );
  }
}
