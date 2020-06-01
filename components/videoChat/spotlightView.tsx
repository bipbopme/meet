import { observer } from "mobx-react";
import JitsiConferenceManager from "../../lib/jitsiManager/jitsiConferenceManager";
import JitsiParticipant from "../../lib/jitsiManager/jitsiParticipant";
import React, { RefObject } from "react";
import Video from "./video";

interface SpotlightViewProps {
  conference: JitsiConferenceManager;
  localParticipant: JitsiParticipant;
  participants: JitsiParticipant[];
  crop: boolean;
}

@observer
export default class SpotlightView extends React.Component<SpotlightViewProps> {
  private videosRef: RefObject<HTMLDivElement>;
  private speakingParticipant: JitsiParticipant | undefined = undefined;

  constructor(props: SpotlightViewProps) {
    super(props);

    this.videosRef = React.createRef();
  }

  componentDidMount(): void {
    this.updateVideoConstraints();
  }

  componentDidUpdate(): void {
    this.updateVideoConstraints();
  }

  updateVideoConstraints(): void {
    if (this.speakingParticipant) {
      this.props.conference.selectParticipants([this.speakingParticipant.id]);
      this.props.conference.setReceiverVideoConstraint(720);
    }
  }

  getCssClassNames(): string {
    const classNames = ["spotlightView"];

    classNames.push(this.props.crop ? "cropped" : "uncropped");

    return classNames.join(" ");
  }

  render(): JSX.Element {
    const { participants, localParticipant } = this.props;

    const sortedParticipants = participants
      .slice()
      .sort((a, b) => b.lastDominantSpeakerAt.valueOf() - a.lastDominantSpeakerAt.valueOf());
    const speakingParticipant =
      sortedParticipants.filter((p) => p.isDominantSpeaker)[0] ||
      sortedParticipants[0] ||
      localParticipant;
    const nonSpeakingParticipants = [localParticipant, ...sortedParticipants].filter(
      (p) => p !== speakingParticipant
    );

    // Save the speaking participant in order to update video contraints
    this.speakingParticipant = speakingParticipant;

    return (
      <section className="videos" ref={this.videosRef}>
        <div className={this.getCssClassNames()}>
          <div className="nonSpeakingParticipants">
            {nonSpeakingParticipants.map((participant) => (
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
          <div className="speakingParticipant">
            {speakingParticipant && (
              <Video
                key={speakingParticipant.id}
                participant={speakingParticipant}
                isLocal={speakingParticipant.isLocal}
                audioTrack={speakingParticipant.audioTrack}
                videoTrack={speakingParticipant.videoTrack}
                isAudioMuted={speakingParticipant.isAudioMuted}
                isVideoMuted={speakingParticipant.isVideoMuted}
                isDominantSpeaker={speakingParticipant.isDominantSpeaker}
              />
            )}
          </div>
        </div>
      </section>
    );
  }
}
