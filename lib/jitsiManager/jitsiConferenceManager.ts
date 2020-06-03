import { action, observable } from "mobx";
import { bind } from "lodash-decorators";
import JitsiManager from "../jitsiManager";
import JitsiMessage from "./jitsiMessage";
import JitsiParticipant from "./jitsiParticipant";
import events from "events";

export default class JitsiConferenceManager extends events.EventEmitter {
  static events = {
    CONFERENCE_JOINED: "CONFERENCE_JOINED",
    MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
    PARTICIPANT_JOINED: "PARTICIPANT_JOINED",
    PARTICIPANT_LEFT: "PARTICIPANT_LEFT"
  };

  id: string;
  private jitsiManager: JitsiManager;
  private localTracks: JitsiMeetJS.JitsiTrack[];
  private conference: JitsiMeetJS.JitsiConference;
  private displayName: string | undefined;

  @observable status: string | undefined = undefined;
  @observable localParticipant: JitsiParticipant | undefined = undefined;
  @observable subject: string | undefined = undefined;
  @observable participants: JitsiParticipant[] = [];
  @observable messages: JitsiMessage[] = [];

  constructor(
    jitsiManager: JitsiManager,
    id: string,
    localTracks: JitsiMeetJS.JitsiTrack[],
    displayName: string | undefined
  ) {
    super();

    this.id = id;
    this.jitsiManager = jitsiManager;
    this.localTracks = localTracks;
    this.displayName = displayName;

    this.conference = this.jitsiManager.connection.initJitsiConference(this.id, {
      deploymentInfo: {
        userRegion: this.jitsiManager.region
      },
      testing: {
        octo: {
          probability: 1
        }
      }
    });
  }

  join(): void {
    this.addEventListeners();
    this.conference.join();
  }

  leave(): void {
    this.conference.leave();
  }

  sendTextMessage(text: string): void {
    this.conference.sendTextMessage(text);
  }

  selectParticipants(ids: string[]): void {
    this.conference.selectParticipants(ids);
  }

  selectAllParticipants(): void {
    this.selectParticipants(this.participants.map((p) => p.id));
  }

  setReceiverVideoConstraint(resolution: number): void {
    this.conference.setReceiverVideoConstraint(resolution);
  }

  private addEventListeners(): void {
    // Events from https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/API.md
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.USER_JOINED,
      this.handleUserJoined
    );
    this.conference.addEventListener(JitsiMeetJS.events.conference.USER_LEFT, this.handleUserLeft);
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.MESSAGE_RECEIVED,
      this.handleMessageReceived
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.SUBJECT_CHANGED,
      this.handleSubjectChanged
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.LAST_N_ENDPOINTS_CHANGED,
      this.handleLastNEndpointsChanged
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      this.handleConferenceJoined
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_LEFT,
      this.handleConferenceLeft
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.DTMF_SUPPORT_CHANGED,
      this.handleDtmfSupportChanged
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_FAILED,
      this.handleConferenceFailed
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_ERROR,
      this.handleConferenceError
    );
    this.conference.addEventListener(JitsiMeetJS.events.conference.KICKED, this.handleKicked);
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.START_MUTED_POLICY_CHANGED,
      this.handleStartMutedPolicyChanged
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.STARTED_MUTED,
      this.handleStartedMuted
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.BEFORE_STATISTICS_DISPOSED,
      this.handleBeforeStatisticsDisposed
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.AUTH_STATUS_CHANGED,
      this.handleAuthStatusChanged
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED,
      this.handleEndpointMessageReceived
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.TALK_WHILE_MUTED,
      this.handleTalkWhileMuted
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.NO_AUDIO_INPUT,
      this.handleNoAudioInput
    );
    this.conference.addEventListener(
      JitsiMeetJS.events.conference.AUDIO_INPUT_STATE_CHANGE,
      this.handleAudioInputStateChanged
    );
    this.conference.addEventListener(JitsiMeetJS.events.conference.NOISY_MIC, this.handleNoisyMic);
  }

  private removeEventListeners(): void {
    // Events from https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/API.md
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.USER_JOINED,
      this.handleUserJoined
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.USER_LEFT,
      this.handleUserLeft
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.MESSAGE_RECEIVED,
      this.handleMessageReceived
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.SUBJECT_CHANGED,
      this.handleSubjectChanged
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.LAST_N_ENDPOINTS_CHANGED,
      this.handleLastNEndpointsChanged
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_JOINED,
      this.handleConferenceJoined
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_LEFT,
      this.handleConferenceLeft
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.DTMF_SUPPORT_CHANGED,
      this.handleDtmfSupportChanged
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_FAILED,
      this.handleConferenceFailed
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.CONFERENCE_ERROR,
      this.handleConferenceError
    );
    this.conference.removeEventListener(JitsiMeetJS.events.conference.KICKED, this.handleKicked);
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.START_MUTED_POLICY_CHANGED,
      this.handleStartMutedPolicyChanged
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.STARTED_MUTED,
      this.handleStartedMuted
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.BEFORE_STATISTICS_DISPOSED,
      this.handleBeforeStatisticsDisposed
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.AUTH_STATUS_CHANGED,
      this.handleAuthStatusChanged
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.ENDPOINT_MESSAGE_RECEIVED,
      this.handleEndpointMessageReceived
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.TALK_WHILE_MUTED,
      this.handleTalkWhileMuted
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.NO_AUDIO_INPUT,
      this.handleNoAudioInput
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.AUDIO_INPUT_STATE_CHANGE,
      this.handleAudioInputStateChanged
    );
    this.conference.removeEventListener(
      JitsiMeetJS.events.conference.NOISY_MIC,
      this.handleNoisyMic
    );
  }

  private disposeLocalTracks(): void {
    if (this.localParticipant) {
      if (this.localParticipant.audioTrack) {
        this.localParticipant.audioTrack.dispose();
      }

      if (this.localParticipant.videoTrack) {
        this.localParticipant.videoTrack.dispose();
      }
    }
  }

  @action
  private updateStatus(status: string): void {
    this.status = status;
  }

  @action
  private updateSubject(subject: string): void {
    this.subject = subject;
  }

  @action
  private addParticipant(id: string, displayName: string): JitsiParticipant {
    const participant = new JitsiParticipant(id, this.conference, displayName);

    this.participants.push(participant);

    return participant;
  }

  @action
  private removeParticipant(id: string): void {
    const participant = this.getParticipant(id);

    if (participant) {
      participant.dispose();
      this.participants = this.participants.filter((p) => p.id !== id);
    }
  }

  private getParticipant(id: string): JitsiParticipant | undefined {
    return [...this.participants, this.localParticipant].find((p) => p && p.id === id);
  }

  @action
  private addMessage(participant: JitsiParticipant, text: string, createdAt: Date): JitsiMessage {
    const message = new JitsiMessage(participant, text, createdAt);

    this.messages.push(message);

    return message;
  }

  @action
  private addLocalParticipant(id: string, displayName?: string): void {
    const localParticipant = new JitsiParticipant(id, this.conference, displayName, true);

    // Setup local tracks
    this.localTracks.forEach((t) => {
      this.conference.addTrack(t); // TODO: error handling
      localParticipant.addTrack(t);
    });

    this.localParticipant = localParticipant;
  }

  @bind()
  private handleUserJoined(
    id: string,
    jitsiInternalParticipant: JitsiMeetJS.JitsiParticipant
  ): void {
    console.debug("Implemented: UserJoined", id, jitsiInternalParticipant, this);

    const participant = this.addParticipant(id, jitsiInternalParticipant._displayName);

    this.emit(JitsiConferenceManager.events.PARTICIPANT_JOINED, participant);
  }

  @bind()
  private handleUserLeft(id: string, jitsiInternalParticipant: JitsiMeetJS.JitsiParticipant): void {
    const participant = this.removeParticipant(id);

    this.emit(JitsiConferenceManager.events.PARTICIPANT_LEFT, participant);

    console.debug("Implemented: UserLeft", id, jitsiInternalParticipant, this);
  }

  @bind()
  private handleMessageReceived(id: string, text: string, ts: Date): void {
    const participant = this.getParticipant(id);

    if (participant) {
      const message = this.addMessage(participant, text, ts);

      this.emit(JitsiConferenceManager.events.MESSAGE_RECEIVED, message);

      console.debug("Implemented: MessageReceived", id, text, ts, message);
    }
  }

  @bind()
  private handleSubjectChanged(subject: string): void {
    console.warn("Not implemented: _handleSubjectChanged");

    this.updateSubject(subject);
  }

  @bind()
  private handleLastNEndpointsChanged(
    leavingEndpointIds: string[],
    enteringEndpointIds: string[]
  ): void {
    console.warn(
      "Not implemented: _handleLastNEndpointsChanged",
      leavingEndpointIds,
      enteringEndpointIds
    );
  }

  @bind()
  private handleConferenceJoined(): void {
    this.addLocalParticipant(this.conference.myUserId(), this.displayName);
    this.updateStatus("joined");

    if (this.displayName) {
      this.conference.setDisplayName(this.displayName);
    }

    this.emit(JitsiConferenceManager.events.CONFERENCE_JOINED);

    console.debug("Implemented: ConferenceJoined", this);
  }

  @bind()
  private handleConferenceLeft(): void {
    this.removeEventListeners();
    // TODO: this should probably be handled somewhere else
    this.disposeLocalTracks();
    console.debug("Implemented: _handleConferenceLeft");
  }

  @bind()
  private handleDtmfSupportChanged(supports: boolean): void {
    console.warn("Not implemented: _handleDtmfSupportChanged", supports);
  }

  @bind()
  private handleConferenceFailed(errorCode: string): void {
    console.warn("Not implemented: _handleConferenceFailed", errorCode);
  }

  @bind()
  private handleConferenceError(errorCode: string): void {
    console.warn("Not implemented: _handleConferenceError", errorCode);
  }

  @bind()
  private handleKicked(): void {
    console.warn("Not implemented: _handleKicked");
  }

  @bind()
  private handleStartMutedPolicyChanged(): void {
    console.warn("Not implemented: _handleStartMutedPolicyChanged");
  }

  @bind()
  private handleStartedMuted(): void {
    console.warn("Not implemented: _handleStartedMuted");
  }

  @bind()
  private handleBeforeStatisticsDisposed(): void {
    console.warn("Not implemented: _handleBeforeStatisticsDisposed");
  }

  @bind()
  private handleAuthStatusChanged(isAuthEnabled: boolean, authIdentity: string): void {
    console.warn("Not implemented: _handleAuthStatusChanged", isAuthEnabled, authIdentity);
  }

  @bind()
  private handleEndpointMessageReceived(): void {
    console.warn("Not implemented: _handleEndpointMessageReceived");
  }

  @bind()
  private handleTalkWhileMuted(): void {
    console.warn("Not implemented: _handleTalkWhileMuted");
  }

  @bind()
  private handleNoAudioInput(): void {
    console.warn("Not implemented: _handleNoAudioInput");
  }

  @bind()
  private handleAudioInputStateChanged(): void {
    console.warn("Not implemented: _handleAudioInputStateChanged");
  }

  @bind()
  private handleNoisyMic(): void {
    console.warn("Not implemented: _handleNoisyMic");
  }
}
