declare namespace JitsiMeetJS {
  interface InitOptions {
    useIPv6?: boolean;
    desktopSharingChromeExtId?: string;
    desktopSharingChromeDisabled?: boolean;
    desktopSharingChromeSources?: string[];
    desktopSharingChromeMinExtVersion?: string;
    desktopSharingFirefoxDisabled?: boolean;
    disableAudioLevels?: boolean;
    disableSimulcast?: boolean;
    enableWindowOnErrorHandler?: boolean;
    disableThirdPartyRequests?: boolean;
    enableAnalyticsLogging?: boolean;
    callStatsCustomScriptUrl?: string;
    callStatsConfIDNamespace?: string;
    disableRtx?: boolean;
    disableH264?: boolean;
    preferH264?: boolean;
  }

  function init(options?: InitOptions);

  function setLogLevel(level: string);

  interface CreateLocalTracksOptions {
    devices: string[];
    resolution?: number;
    constraints?: MediaTrackConstraints;
    cameraDeviceId?: string;
    micDeviceId?: string;
    minFps?: number;
    maxFps?: number;
    facingMode?: string;
  }

  function createLocalTracks(options: CreateLocalTracksOptions, firePermissionPromptIsShownEvent?: boolean)

  // TODO: Had to guess on return types
  interface VadProcessor {
    getSampleLength(): number;
    getRequiredPCMFrequency(): string;
    calculateAudioFrameVAD(pcmSample): number;
  }

  function createTrackVADEmitter(localAudioDeviceId: string, sampleRate: number, vadProcessor: VadProcessor)

  // Is there a better way to represent these?
  declare namespace logLevels {
    const TRACE: string;
    const DEBUG: string;
    const INFO: string;
    const LOG: string;
    const WARN: string;
    const ERROR: string;
  }

  declare namespace events {
    declare namespace conference {
      const TRACK_ADDED: string;
      const TRACK_REMOVED: string;
      const TRACK_MUTE_CHANGED: string;
      const TRACK_AUDIO_LEVEL_CHANGED: string;
      const DOMINANT_SPEAKER_CHANGED: string;
      const USER_JOINED: string;
      const USER_LEFT: string;
      const MESSAGE_RECEIVED: string;
      const DISPLAY_NAME_CHANGED: string;
      const SUBJECT_CHANGED: string;
      const LAST_N_ENDPOINTS_CHANGED: string;
      const CONFERENCE_JOINED: string;
      const CONFERENCE_LEFT: string;
      const DTMF_SUPPORT_CHANGED: string;
      const USER_ROLE_CHANGED: string;
      const USER_STATUS_CHANGED: string;
      const CONFERENCE_FAILED: string;
      const CONFERENCE_ERROR: string;
      const KICKED: string;
      const START_MUTED_POLICY_CHANGED: string;
      const STARTED_MUTED: string;
      const CONNECTION_STATS: string; // Deprecated
      const BEFORE_STATISTICS_DISPOSED: string;
      const AUTH_STATUS_CHANGED: string;
      const ENDPOINT_MESSAGE_RECEIVED: string;
      const TALK_WHILE_MUTED: string;
      const NO_AUDIO_INPUT: string;
      const AUDIO_INPUT_STATE_CHANGE: string;
      const NOISY_MIC: string;
    }

    declare namespace connection {
      const CONNECTION_FAILED: string;
      const CONNECTION_ESTABLISHED: string;
      const CONNECTION_DISCONNECTED: string;
      const WRONG_STATE: string;
    }

    declare namespace detection {
      const VAD_SCORE_PUBLISHED: string;
    }

    declare namespace track {
      const LOCAL_TRACK_STOPPED: string;
      const TRACK_AUDIO_OUTPUT_CHANGED: string;
    }

    declare namespace mediaDevices {
      const DEVICE_LIST_CHANGED: string;
      const PERMISSION_PROMPT_IS_SHOWN: string;
    }

    declare namespace connectionQuality {
      const LOCAL_STATS_UPDATED: string;
      const REMOTE_STATS_UPDATED: string;
    }
  }

  declare namespace errors {
    declare namespace conference {
      const CONNECTION_ERROR: string;
      const SETUP_FAILED: string;
      const AUTHENTICATION_REQUIRED: string;
      const PASSWORD_REQUIRED: string;
      const PASSWORD_NOT_SUPPORTED: string;
      const VIDEOBRIDGE_NOT_AVAILABLE: string;
      const RESERVATION_ERROR: string;
      const GRACEFUL_SHUTDOWN: string;
      const JINGLE_FATAL_ERROR: string;
      const CONFERENCE_DESTROYED: string;
      const CHAT_ERROR: string;
      const FOCUS_DISCONNECTED: string;
      const FOCUS_DISCONNECTED: string;
      const CONFERENCE_MAX_USERS: string;
    }

    declare namespace connection {
      const CONNECTION_DROPPED_ERROR: string;
      const PASSWORD_REQUIRED: string;
      const SERVER_ERROR: string;
      const OTHER_ERROR: string;
    }

    declare namespace track {
      const GENERAL: string;
      const UNSUPPORTED_RESOLUTION: string;
      const PERMISSION_DENIED: string;
      const NOT_FOUND: string;
      const CONSTRAINT_FAILED: string;
      const TRACK_IS_DISPOSED: string;
      const TRACK_NO_STREAM_FOUND: string;
      const CHROME_EXTENSION_GENERIC_ERROR: string;
      const CHROME_EXTENSION_USER_CANCELED: string;
      const CHROME_EXTENSION_INSTALLATION_ERROR: string;
      const FIREFOX_EXTENSION_NEEDED: string;
    }
  }

  declare namespace mediaDevices {
    interface EnumerateDevicesCallback {
      (devices: MediaDeviceInfo[]): void;
    }

    function isDeviceListAvailable(): boolean;

    function isDeviceChangeAvailable(deviceType: string);

    function enumerateDevices(callback: EnumerateDevicesCallback);

    function setAudioOutputDevice(deviceId: string): void;

    function getAudioOutputDevice(): string;

    function isDevicePermissionGranted(type: string): Promise;

    function addEventListener(event: string, listener): void;

    function removeEventListener(event: string, listener): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  class JitsiConnection {
    constructor(
      appID: string | undefined, 
      token: string | undefined, 
      options: {
        serviceUrl: string;
        hosts: {
          domain: string;
          muc: string;
          anonymousdomain?: string;
        };
        useStunTurn?: boolean;
        enableLipSync?: boolean;
        clientNode: string; // Not in docs
      }
    );

    connect(options?: { id: string; password: string }): void;

    disconnect(): void;

    initJitsiConference(
      name: string,
      options: {
        openBridgeChannel?: boolean;
        recordingType?: string;
        callStatsID?: string;
        classStatsSecret?: string;
        enableTalkWhileMuted?: boolean;
        ignoreStartMuted?: boolean;
        startSilent?: boolean;
        confID?: string;
        statisticsId?: string;
        statisticsDisplayName?: string;
        // Undocumented
        deploymentInfo: {
          userRegion: string;
        };
        // Undocumented
        testing: {
          octo: {
            probability: number;
          };
        };
      }
    ): JitsiConference;

    // This will need a definition for each type of event and listner
    addEventListener(event: string, listener): void;

    removeEventListener(event: string, listener): void;

    addFeature(feature: string, submit: boolean): void;

    removeFeature(feature: string, submit: boolean): void;
  }

  interface JitsiConferenceCommand {
    value: string;
    attributes;
    children: [];
  }

  interface JitsiConferenceMutedPolicy {
    audio: boolean;
    video: boolean;
  }
  
  class JitsiConference {
    join(password?: string): void;

    // Returns a promise
    leave(): Promise;

    myUserId(): string;

    getLocalTracks(): JitsiTrack[];

    addEventListener(event: string, listener): void;

    removeEventListener(event: string, listener): void;

    on(event: string, listener): void;

    off(event: string, listener): void;

    sendTextMessage(text: string): void;

    setDisplayName(name: string): void;

    selectParticipant(participantId: string): void;

    // Undocumented
    selectParticipants(participantId: string[]): void;

    sendCommand(name: string, values: JitsiConferenceCommand): void;
    
    sendCommandOnce(name: string, values: JitsiConferenceCommand): void;

    removeCommand(name: string): void;

    addCommandListener(command: string, handler): void;

    removeCommandListener(command: string): void;

    addTrack(track: JitsiTrack): Promise;

    removeTrack(track: JitsiTrack): Promise;

    isDTMFSupported(): boolean;

    getRole(): string;

    isModerator(): boolean;

    lock(password: string): Promise

    unlock(): Promise

    kick(id): void;

    setStartMutedPolicy(policy: JitsiConferenceMutedPolicy): void;

    getStartMutedPolicy(): JitsiConferenceMutedPolicy;

    isStartAudioMuted(): boolean;

    isStartVideoMuted(): boolean;

    sendFeedback(overallFeedback: number, detailedFeedback: string): void;

    setSubject(subject: string): void;

    sendEndpointMessage(to: string, payload): void;

    broadcastEndpointMessage(payload): void;

    pinParticipant(participantId: string): void;

    setReceiverVideoConstraint(resolution: number): void;

    setSenderVideoConstraint(resolution: number): void;

    isHidden(): boolean;
  }

  class JitsiTrack {
    conference;
    stream: MediaStream;
    track: MediaStreamTrack;
    trackMediaType: string;
    videoType: string;

    getType(): string;

    mute(): void;

    unmute(): void;

    isMuted(): boolean;

    attach(container: Element): void;

    detach(container?: Element): void;

    dispose(): void;

    getId(): string;

    getParticipantId(): string;
    
    setAudioOutput(audioOutputDeviceId: string): void;

    getDeviceId(): string;

    isEnded(): boolean;

    //setEffect(effect)

    // This is undocumented. Private?
    getTrack(): MediaStreamTrack
  }

  // This seems to be for private use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  class JitsiParticipant {
    _jid: string;
    _displayName: string;
  }
}