import { observer } from "mobx-react";
import JitsiConferenceManager from "../../lib/jitsiManager/jitsiConferenceManager";
import JitsiParticipant from "../../lib/jitsiManager/jitsiParticipant";
import React, { RefObject } from "react";
import Video from "./video";

interface QuakeViewProps {
  conference: JitsiConferenceManager;
  localParticipant: JitsiParticipant;
  participants: JitsiParticipant[];
  crop: boolean;
}

@observer
export default class QuakeView extends React.Component<QuakeViewProps> {
  private viewContainerRef: RefObject<HTMLDivElement>;

  constructor(props: QuakeViewProps) {
    super(props);

    this.viewContainerRef = React.createRef();
  }

  getCssClassNames(): string {
    const classNames = ["spotlightView", "quakeView"];

    classNames.push(this.props.crop ? "cropped" : "uncropped");

    return classNames.join(" ");
  }

  render(): JSX.Element {
    const { participants, localParticipant } = this.props;
    const allParticipants = [localParticipant, ...participants];

    return (
      <div className="videoChatViewContainer" ref={this.viewContainerRef}>
        <div className={this.getCssClassNames()}>
          <div className="nonSpeakingParticipants">
            {allParticipants.map((participant) => (
              <Video
                key={participant.id}
                participant={participant}
                isLocal={participant.isLocal}
                audioTrack={participant.audioTrack}
                videoTrack={participant.videoTrack}
                isAudioMuted={participant.isAudioMuted}
                isVideoMuted={participant.isVideoMuted}
                isDominantSpeaker={participant.isDominantSpeaker}
              />
            ))}
          </div>
          <div className="gameZone">
            <iframe
              src="https://quake.bipbop.me/start.html"
              height="768"
              width="1024"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  }
}
