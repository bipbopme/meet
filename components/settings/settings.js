import localforage from 'localforage';
import Video from "../videoChat/video";
import { getMediaContraints, stopStreamTracks } from '../../lib/utils';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.updateName = this.updateName.bind(this);
    this.updateAudioInput = this.updateAudioInput.bind(this);
    this.updateAudioOutput = this.updateAudioOutput.bind(this);
    this.updateVideoInput = this.updateVideoInput.bind(this);
    this.onGetUserMedia = this.onGetUserMedia.bind(this);
    this.onEnumerateDevices = this.onEnumerateDevices.bind(this);
    this.onError = this.onError.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = {
      name: '',
      selectedAudioInputID: '',
      selectedAudioOutputID: '',
      selectedVideoInputID: '',
      localStream: undefined
    };
  }

  componentDidMount() {
    this.getUserMedia();
  }

  componentWillUnmount() {
    // TODO: we're passing along the stream but leaving this here as an option in case there are still problems
    // stopStreamTracks(this.state.localStream);
  }

  async getUserMedia() {
    stopStreamTracks(this.state.localStream);

    await this.loadSavedSettings();

    const constraints = await getMediaContraints(this.state.selectedAudioInputID, this.state.selectedVideoInputID);

    navigator.mediaDevices.getUserMedia(constraints).then(this.onGetUserMedia).then(this.onEnumerateDevices).catch(this.onError);
  }

  async onError(error) {
    // TODO: brute force error handling. need something more nuanced.
    if (this.state.selectedAudioInputID || this.state.selectedAudioOutputID || this.state.selectedVideoInputID) {
      await localforage.removeItem('selectedAudioInputID');
      await localforage.removeItem('selectedAudioOutputID');
      await localforage.removeItem('selectedVideoInputID');

      // Try again
      this.getUserMedia();
    }
  }

  onGetUserMedia(stream) {
    this.setState({ localStream: stream });

    return navigator.mediaDevices.enumerateDevices();
  }

  async loadSavedSettings() {
    const name = await localforage.getItem('name');
    const selectedAudioInputID = await localforage.getItem('selectedAudioInputID');
    const selectedAudioOutputID = await localforage.getItem('selectedAudioOutputID');
    const selectedVideoInputID = await localforage.getItem('selectedVideoInputID');

    this.setState({
      name,
      selectedAudioInputID,
      selectedAudioOutputID,
      selectedVideoInputID
    });
  }

  async onEnumerateDevices(devices) {
    const audioInputs = devices.filter(d => d.kind == 'audioinput');
    const audioOutputs = devices.filter(d => d.kind == 'audiooutput');
    const videoInputs = devices.filter(d => d.kind == 'videoinput');

    this.setState({
      audioInputs,
      audioOutputs,
      videoInputs
    });
  }

  updateName(event) {
    const name = event.target.value;

    localforage.setItem('name', name);
    this.setState({ name: name });
  }

  updateAudioInput(event) {
    const selectedAudioInputID = event.target.value;

    localforage.setItem('selectedAudioInputID', selectedAudioInputID);
    this.setState({ selectedAudioInputID });
  }

  updateAudioOutput(event) {
    const selectedAudioOutputID = event.target.value;

    localforage.setItem('selectedAudioOutputID', selectedAudioOutputID);
    this.setState({ selectedAudioOutputID });
  }

  updateVideoInput(event) {
    const selectedVideoInputID = event.target.value;

    localforage.setItem('selectedVideoInputID', selectedVideoInputID);
    this.setState({ selectedVideoInputID });

    this.getUserMedia();
  }

  onClick() {
    if (this.props.onButtonClick) {
      this.props.onButtonClick(this.state);
    }
  }

  render() {
    return (
      <div className="settings">
        {this.state.localStream &&
          <React.Fragment>
            <div className="videoContainer">
              <Video key="localStream" local={true} stream={this.state.localStream} />
            </div>
            <div className="formContainer">
              <form>
                <label>Name</label>
                <input value={this.state.name} onChange={this.updateName} />

                <div className="row">
                  <label>Microphone</label>
                  <select onChange={this.updateAudioInput} value={this.state.selectedAudioInputID}>
                    {this.state.audioInputs && this.state.audioInputs.map(audioInput => (
                      <option key={audioInput.deviceId} value={audioInput.deviceId}>{audioInput.label}</option>
                    ))}
                  </select>
                </div>

                {this.state.audioOutputs && this.state.audioOutputs.length > 0 &&
                  <div className="row">
                    <label>Speaker</label>
                      <select onChange={this.updateAudioOutput} value={this.state.selectedAudioOutputID}>
                      {this.state.audioOutputs && this.state.audioOutputs.map(audioOutput => (
                        <option key={audioOutput.deviceId} value={audioOutput.deviceId}>{audioOutput.label}</option>
                      ))}
                    </select>
                  </div>
                }

                <div className="row">
                  <label>Camera</label>
                  <select onChange={this.updateVideoInput} value={this.state.selectedVideoInputID}>
                    {this.state.videoInputs && this.state.videoInputs.map(videoInput => (
                      <option key={videoInput.deviceId} value={videoInput.deviceId}>{videoInput.label}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            {this.props.buttonText &&
              <div className="buttonContainer">
                <button onClick={this.onClick}>{this.props.buttonText}</button>
              </div>
            }
          </React.Fragment>
        }

        {!this.state.localStream &&
          <div className="loading">
            <h3>Waiting for video stream...</h3>
            <h4>Please allow video in your browser.</h4>
          </div>
        }
      </div>
    );
  }
}
