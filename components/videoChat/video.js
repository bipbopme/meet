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

  getCssClasses() {
    return 'video' + this.props.local ? ' local' : '';
  }

  render() {
    return (
      <div className={`video ${this.props.local ? 'local' : 'remote'}`}>
        <video ref={this.videoRef} autoPlay playsInline muted={this.props.local} />
      </div>
    );
  }
}
