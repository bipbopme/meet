import Video from "../videoChat/video";
import localforage from 'localforage';
import VideoChat from '../videoChat/videoChat';

export default class Welcome extends React.Component {
  constructor(props) {
    super(props);

    this.onJoin = this.props.onJoin;
    this.onClickJoin = this.onClickJoin.bind(this);
    this.updateName = this.updateName.bind(this);
    this.onGetUserMedia = this.onGetUserMedia.bind(this);

    this.state = {
      name: '',
      localStream: null
    }
  }

  async componentDidMount() {
    const name = await localforage.getItem('name');

    this.setState({ name: name });

    navigator.mediaDevices.getUserMedia(VideoChat.audioVideoConfig).then(this.onGetUserMedia);
  }

  onGetUserMedia(stream) {
    this.setState({ localStream: stream });
  }

  onClickJoin() {
    this.onJoin(this.state.name, this.state.localStream);
  }

  updateName(event) {
    const name = event.target.value;

    localforage.setItem('name', name);
    this.setState({ name: name });
  }

  render() {
    return (
      <div className="welcome">
        <div className="inner">
          <div className="videoPreview">
            <h2>Ready to join?</h2>
            <Video key="localStream" local={true} stream={this.state.localStream} />
          </div>
          <h3>What's your name?</h3>
          <div className="name">
            <input placeholder="Name" value={this.state.name} onChange={this.updateName} />
          </div>
          <div className="footer">
            <button onClick={this.onClickJoin}>Join</button>
          </div>
        </div>
      </div>
    );
  }
}
