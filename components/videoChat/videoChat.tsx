import { bind } from "lodash-decorators";
import { notification } from "antd";
import { observer } from "mobx-react";
import GridView from "./gridView";
import JitsiConferenceManager from "../../lib/jitsiManager/jitsiConferenceManager";
import QuakeView from "./quakeView";
import React from "react";
import Share from "../share";
import SpotlightView from "./spotlightView";
import VideoChatControls from "./controls/videoChatControls";
import debounce from "lodash/debounce";

interface VideoChatProps {
  conference: JitsiConferenceManager;
  onLeave(): void;
}

interface VideoChatState {
  view: string;
  crop: boolean;
  autoSwitchView: boolean;
}

@observer
export default class VideoChat extends React.Component<VideoChatProps, VideoChatState> {
  private autoSwitchViewDebounced: () => void;
  private isQuake = false;

  constructor(props: VideoChatProps) {
    super(props);

    this.isQuake = this.props.conference.id.indexOf("quake") >= 0;
    this.autoSwitchViewDebounced = debounce(this.autoSwitchView, 200);

    // TODO: these are dangerous because they trigger double renders
    this.props.conference.on(JitsiConferenceManager.events.PARTICIPANT_JOINED, this.autoSwitchView);
    this.props.conference.on(JitsiConferenceManager.events.PARTICIPANT_LEFT, this.autoSwitchView);

    window.addEventListener("resize", this.autoSwitchViewDebounced);

    this.state = {
      view: this.isQuake ? "quake" : "spotlight",
      crop: true,
      autoSwitchView: !this.isQuake
    };
  }

  componentDidMount(): void {
    if (this.props.conference.participants.length == 0) {
      this.showShareNotification();
    }
  }

  componentDidUpdate(): void {
    if (this.props.conference.participants.length > 0) {
      this.closeShareNotification();
    }
  }

  componentWillUnmount(): void {
    this.props.conference.off(
      JitsiConferenceManager.events.PARTICIPANT_JOINED,
      this.autoSwitchView
    );
    this.props.conference.off(JitsiConferenceManager.events.PARTICIPANT_LEFT, this.autoSwitchView);
    window.removeEventListener("resize", this.autoSwitchViewDebounced);
  }

  showShareNotification(): void {
    notification.open({
      key: "share",
      message: "Invite your people!",
      description: <Share />,
      duration: 30
    });
  }

  closeShareNotification(): void {
    notification.close("share");
  }

  @bind()
  autoSwitchView(): void {
    if (this.state.autoSwitchView) {
      const { conference } = this.props;
      let { view, crop } = this.state;
      const width = document.documentElement.offsetWidth;

      if (conference.participants.length >= 2) {
        view = "grid";
        crop = width < 960;
      } else {
        view = "spotlight";
        crop = true;
      }

      this.setState({ view, crop });
    }
  }

  @bind()
  handleViewChange(view: string): void {
    // Always zoom spotlight view
    const crop = view === "spotlight";
    const autoSwitchView = false;

    this.setState({ view: view, crop, autoSwitchView });
  }

  render(): JSX.Element | null {
    const conference = this.props.conference;
    const { localParticipant, participants, status } = conference;

    return status === "joined" && localParticipant ? (
      <div className="videoChat">
        {this.state.view === "spotlight" && (
          <SpotlightView
            conference={conference}
            localParticipant={localParticipant}
            participants={participants}
            crop={this.state.crop}
          />
        )}
        {this.state.view === "grid" && (
          <GridView
            conference={this.props.conference}
            localParticipant={localParticipant}
            participants={participants}
            crop={this.state.crop}
          />
        )}
        {this.state.view === "quake" && (
          <QuakeView
            conference={this.props.conference}
            localParticipant={localParticipant}
            participants={participants}
            crop={this.state.crop}
          />
        )}
        <VideoChatControls
          localParticipant={localParticipant}
          participants={participants}
          view={this.state.view}
          onLeave={this.props.onLeave}
          onViewChange={this.handleViewChange}
        />
      </div>
    ) : null;
  }
}
