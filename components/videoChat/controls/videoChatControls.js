import MicButton from "./micButton";
import VideoButton from "./videoButton";

export default class VideoChatControls extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <footer className="controls">
        <MicButton localStream={this.props.localStream}/>
        <VideoButton localStream={this.props.localStream} />
      </footer>
    );
  }
}
