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
    this.setState({ name });
  }


  render() {
    return (
      <div className="welcome">
        <h1>BipBop</h1>
        <h2>Hi there, let's make sure your video is working.</h2>
        <div className="videoPreview">
          <Video key="localStream" local={true} stream={this.state.localStream} />
        </div>
        <h2>What's your name?</h2>
        <div className="name">
          <input placeholder="Name" value={this.state.name} onChange={this.updateName} />
        </div>
        <div className="footer">
          <button onClick={this.onClickJoin}>Join</button>
        </div>
      </div>
    );
  }
}
