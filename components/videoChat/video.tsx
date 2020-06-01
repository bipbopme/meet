import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophoneSlash, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import { observer } from "mobx-react";
import JitsiParticipant from "../../lib/jitsiManager/jitsiParticipant";
import React, { RefObject } from "react";

interface VideoProps {
  participant?: JitsiParticipant;
  isLocal: boolean;
  audioTrack: JitsiMeetJS.JitsiTrack | undefined;
  videoTrack: JitsiMeetJS.JitsiTrack | undefined;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
  isDominantSpeaker?: boolean;
}

@observer
export default class Video extends React.Component<VideoProps> {
  private videoContainerRef: RefObject<HTMLDivElement>;
  private videoRef: RefObject<HTMLVideoElement>;
  private audioRef: RefObject<HTMLAudioElement>;

  constructor(props: VideoProps) {
    super(props);

    this.videoContainerRef = React.createRef();
    this.videoRef = React.createRef();
    this.audioRef = React.createRef();
  }

  componentDidMount(): void {
    this.attachTracks();
  }

  componentDidUpdate(): void {
    this.attachTracks();
  }

  componentWillUnmount(): void {
    const { audioTrack, videoTrack } = this.props;

    if (audioTrack && this.audioRef.current) {
      audioTrack.detach(this.audioRef.current);
    }

    if (videoTrack && this.videoRef.current) {
      videoTrack.detach(this.videoRef.current);
    }
  }

  attachTracks(): void {
    if (this.audioRef.current && this.props.audioTrack) {
      this.props.audioTrack.attach(this.audioRef.current);
    }

    if (this.videoRef.current && this.props.videoTrack) {
      this.props.videoTrack.attach(this.videoRef.current);
      this.updateAspectRatio();
    }
  }

  updateAspectRatio(): void {
    const containerEl = this.videoContainerRef.current;
    const videoEl = this.videoRef.current;

    if (containerEl && videoEl) {
      const className =
        videoEl.videoWidth / videoEl.videoHeight < 16 / 9 ? "narrowAspect" : "wideAspect";

      containerEl.classList.remove("narrowAspect", "wideAspect");
      containerEl.classList.add(className);
    }
  }

  getClassNames(): string {
    const { isLocal, isAudioMuted, isVideoMuted, isDominantSpeaker, videoTrack } = this.props;
    const classNames = ["video"];

    classNames.push(isLocal ? "local" : "remote");

    if (isAudioMuted) {
      classNames.push("audioMuted");
    }

    if (isVideoMuted) {
      classNames.push("videoMuted");
    }

    if (isDominantSpeaker) {
      classNames.push("dominantSpeaker");
    }

    if (videoTrack) {
      classNames.push(`${videoTrack.videoType}VideoType`);
    }

    return classNames.join(" ");
  }

  render(): JSX.Element {
    return (
      <div className={this.getClassNames()} ref={this.videoContainerRef}>
        <video ref={this.videoRef} autoPlay playsInline />
        <audio ref={this.audioRef} autoPlay muted={this.props.isLocal} />
        {this.props.isAudioMuted && <FontAwesomeIcon icon={faMicrophoneSlash} />}
        {this.props.isVideoMuted && <FontAwesomeIcon icon={faVideoSlash} />}
      </div>
    );
  }
}
