import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import { matopush } from '../../../lib/matomo';

export default class VideoButton extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);

    this.state = {
      muted: false
    }
  }

  onClick() {
    if (this.props.localStream) {
      const videoTrack = this.props.localStream.getVideoTracks()[0];
      const currentlyMuted = this.state.muted;

      // These two are inverted so muted == disabled
      videoTrack.enabled = currentlyMuted;

      // Flip the state
      this.setState({ muted: !currentlyMuted });

      matopush(['trackEvent', 'videoChat', 'videoButton', 'toggle']);
    }
  }

  render() {
    return (
      <div className="button micButton" onClick={this.onClick}>
        {this.state.muted &&
          <span><FontAwesomeIcon icon={faVideoSlash} /> On</span>
        }
        {!this.state.muted &&
          <span><FontAwesomeIcon icon={faVideo} /> Off</span>
        }
      </div>
    );
  }
}
