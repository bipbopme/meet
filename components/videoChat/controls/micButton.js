import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

export default class MicButton extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);

    this.state = {
      muted: false
    }
  }

  onClick() {
    if (this.props.localStream) {
      const audioTrack = this.props.localStream.getAudioTracks()[0];

      console.log('audio before', audioTrack.enabled);

      const currentlyMuted = this.state.muted;

      // These two are inverted so muted == disabled
      audioTrack.enabled = currentlyMuted;

      // Flip the state
      this.setState({ muted: !currentlyMuted });

      console.log('audio after', audioTrack.enabled);
    }
  }

  render() {
    return (
      <div className="button micButton" onClick={this.onClick}>
        {this.state.muted &&
          <span><FontAwesomeIcon icon={faMicrophoneSlash} /> Unmute</span>
        }
        {!this.state.muted &&
          <span><FontAwesomeIcon icon={faMicrophone} /> Mute</span>
        }
      </div>
    );
  }
}
