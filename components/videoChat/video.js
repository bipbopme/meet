import React from 'react';
import localforage from 'localforage';

export default class Video extends React.Component {
  constructor(props) {
    super(props);

    this.videoRef = React.createRef();
  }

  componentDidMount() {
    this.configureVideo();
  }

  componentDidUpdate() {
    this.configureVideo();
  }

  async configureVideo() {
    if (this.props.stream && !this.videoRef.current.srcObject) {
      this.videoRef.current.srcObject = this.props.stream;
    }

    const selectedAudioOutputID = await localforage.getItem('selectedAudioOutputID');

    if (selectedAudioOutputID && typeof this.videoRef.current.sinkId !== 'undefined') {
      this.videoRef.current.setSinkId(selectedAudioOutputID)
        .then(() => {
          console.log(`Success, audio output device attached: ${selectedAudioOutputID}`);
        })
        .catch(error => {
          console.error('Error setting audio output', error);
        });
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
