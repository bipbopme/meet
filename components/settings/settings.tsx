/* global JitsiMeetJS */
import { Button, Col, Form, Row, Select, Typography } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { bind } from "lodash-decorators";
import { matopush } from "../../lib/matomo";
import React from "react";
import Video from "../videoChat/video";
import _uniqBy from "lodash/uniqBy";
import localforage from "localforage";

const { Title, Paragraph } = Typography;

interface SettingsProps {
  collapseAudioVideoSettings?: boolean;
  titleText?: string;
  buttonText?: string;
  onButtonClick(
    name: string | undefined,
    audioTrack: JitsiMeetJS.JitsiTrack,
    videoTrack: JitsiMeetJS.JitsiTrack
  ): void;
}

interface SettingsState {
  name?: string;
  selectedAudioInputID?: string;
  selectedAudioOutputID?: string;
  selectedVideoInputID?: string;
  audioTrack?: JitsiMeetJS.JitsiTrack;
  videoTrack?: JitsiMeetJS.JitsiTrack;
  collapseAudioVideoSettings?: boolean;
  audioInputs?: MediaDeviceInfo[];
  audioOutputs?: MediaDeviceInfo[];
  videoInputs?: MediaDeviceInfo[];
}

export default class Settings extends React.Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props);

    this.state = {
      name: "",
      selectedAudioInputID: undefined,
      selectedAudioOutputID: undefined,
      selectedVideoInputID: undefined,
      audioTrack: undefined,
      videoTrack: undefined,
      collapseAudioVideoSettings: this.props.collapseAudioVideoSettings
    };
  }

  componentDidMount(): void {
    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      this.handleDeviceListChanged
    );

    this.getUserMedia();
  }

  componentWillUnmount(): void {
    JitsiMeetJS.mediaDevices.removeEventListener(
      JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      this.handleDeviceListChanged
    );
  }

  async getUserMedia(): Promise<void> {
    await this.loadSavedSettings();

    if (this.state.audioTrack) {
      this.state.audioTrack.getTrack().stop();
    }

    if (this.state.videoTrack) {
      this.state.videoTrack.getTrack().stop();
    }

    const options = {
      devices: ["audio", "video"],
      cameraDeviceId: this.state.selectedVideoInputID,
      micDeviceId: this.state.selectedAudioInputID
    };

    JitsiMeetJS.createLocalTracks(options).then(this.handleCreateLocalTracks).catch(this.onError);
  }

  @bind()
  async onError(error: Error): Promise<void> {
    console.error(error);

    // TODO: brute force error handling. need something more nuanced.
    if (
      this.state.selectedAudioInputID ||
      this.state.selectedAudioOutputID ||
      this.state.selectedVideoInputID
    ) {
      await localforage.removeItem("selectedAudioInputID");
      await localforage.removeItem("selectedAudioOutputID");
      await localforage.removeItem("selectedVideoInputID");

      // Try again
      this.getUserMedia();
    }
  }

  @bind()
  handleCreateLocalTracks(tracks: JitsiMeetJS.JitsiTrack[]): void {
    let audioTrack: JitsiMeetJS.JitsiTrack | undefined;
    let videoTrack: JitsiMeetJS.JitsiTrack | undefined;

    if (tracks) {
      audioTrack = tracks.find((t) => t.getType() === "audio");
      videoTrack = tracks.find((t) => t.getType() === "video");
    }

    if (audioTrack && videoTrack) {
      this.setState({ audioTrack: audioTrack, videoTrack: videoTrack });
      JitsiMeetJS.mediaDevices.enumerateDevices(this.handleEnumerateDevices);
    } else {
      throw new Error("Missing expected media track");
    }
  }

  async loadSavedSettings(): Promise<void> {
    const name = await localforage.getItem<string>("name");
    const selectedAudioInputID = await localforage.getItem<string>("selectedAudioInputID");
    const selectedAudioOutputID = await localforage.getItem<string>("selectedAudioOutputID");
    const selectedVideoInputID = await localforage.getItem<string>("selectedVideoInputID");

    this.setState({
      name,
      selectedAudioInputID,
      selectedAudioOutputID,
      selectedVideoInputID
    });
  }

  @bind()
  async handleEnumerateDevices(devices: MediaDeviceInfo[]): Promise<void> {
    if (devices) {
      const audioInputs = _uniqBy(
        devices.filter((d) => d.kind === "audioinput"),
        "deviceId"
      );
      const audioOutputs = _uniqBy(
        devices.filter((d) => d.kind === "audiooutput"),
        "deviceId"
      );
      const videoInputs = _uniqBy(
        devices.filter((d) => d.kind === "videoinput"),
        "deviceId"
      );

      this.syncAudioVideoDefaults(audioOutputs);

      this.setState({
        audioInputs,
        audioOutputs,
        videoInputs
      });
    }
  }

  @bind()
  handleDeviceListChanged(devices: MediaDeviceInfo[]): void {
    console.log("Device list changed");
    this.handleEnumerateDevices(devices);
  }

  @bind()
  handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const name = event.target.value;

    localforage.setItem("name", name);
    this.setState({ name: name });

    matopush(["trackEvent", "settings", "name", "update"]);
  }

  @bind()
  handleAudioInputChange(selectedAudioInputID: string): void {
    localforage.setItem("selectedAudioInputID", selectedAudioInputID);
    this.setState({ selectedAudioInputID });

    this.getUserMedia();

    matopush(["trackEvent", "settings", "audioInput", "update"]);
  }

  @bind()
  handleAudioOutputChange(selectedAudioOutputID: string): void {
    localforage.setItem("selectedAudioOutputID", selectedAudioOutputID);
    this.setState({ selectedAudioOutputID });

    JitsiMeetJS.mediaDevices.setAudioOutputDevice(selectedAudioOutputID);

    matopush(["trackEvent", "settings", "audioOutput", "update"]);
  }

  @bind()
  handleVideoInputChange(selectedVideoInputID: string): void {
    localforage.setItem("selectedVideoInputID", selectedVideoInputID);
    this.setState({ selectedVideoInputID });

    this.getUserMedia();

    matopush(["trackEvent", "settings", "videoInput", "update"]);
  }

  // Handle device setting inconsistencies
  syncAudioVideoDefaults(audioOutputs: MediaDeviceInfo[]): void {
    const newState: SettingsState = {};

    const {
      audioTrack,
      videoTrack,
      selectedVideoInputID,
      selectedAudioInputID,
      selectedAudioOutputID
    } = this.state;

    if (audioTrack) {
      const audioTrackDeviceId = audioTrack.getDeviceId();

      if (selectedAudioInputID !== audioTrackDeviceId) {
        localforage.setItem("selectedAudioInputID", audioTrackDeviceId);
        newState.selectedAudioInputID = audioTrackDeviceId;

        console.log("Synced audio input");
      }
    }

    if (videoTrack) {
      const videoTrackDeviceId = videoTrack.getDeviceId();

      if (selectedVideoInputID !== videoTrackDeviceId) {
        localforage.setItem("selectedVideoInputID", videoTrackDeviceId);
        newState.selectedVideoInputID = videoTrackDeviceId;

        console.log("Synced video input");
      }
    }

    // Sync output settings
    if (selectedAudioOutputID) {
      if (audioOutputs.find((d) => d.deviceId === selectedAudioOutputID)) {
        // Device exists so activate it
        JitsiMeetJS.mediaDevices.setAudioOutputDevice(selectedAudioOutputID);
      } else {
        // Couldn't find previous device so clear it and rely on defaults
        localforage.removeItem("selectedAudioOutputID");
        newState.selectedAudioOutputID = undefined;
        console.log("Synced video output");
      }
    }

    this.setState(newState);
  }

  @bind()
  handleFormFinish(): void {
    if (this.props.onButtonClick) {
      const { name, audioTrack, videoTrack } = this.state;

      if (audioTrack && videoTrack) {
        this.props.onButtonClick(name, audioTrack, videoTrack);
      } else {
        throw new Error("Missing media track");
      }
    }
  }

  @bind()
  handleShowAudioVideoSettings(): void {
    this.setState({ collapseAudioVideoSettings: false });
  }

  render(): JSX.Element {
    return (
      <Row className="settings" gutter={16} align="middle">
        <>
          <Col span={16} className="videoContainer">
            <Video
              key="localVideo"
              isLocal
              audioTrack={this.state.audioTrack}
              videoTrack={this.state.videoTrack}
            />
          </Col>
          <Col span={8} className="formContainer">
            {this.props.titleText && <Title level={2}>{this.props.titleText}</Title>}
            {!this.state.videoTrack && (
              <Paragraph type="secondary" strong>
                Please allow access to your <br />
                microphone and camera.
              </Paragraph>
            )}
            {this.state.videoTrack && (
              <Form
                id="settingsForm"
                layout="vertical"
                onFinish={this.handleFormFinish}
                initialValues={{
                  selectedVideoInputID: this.state.selectedVideoInputID || "",
                  selectedAudioInputID: this.state.selectedAudioInputID || "",
                  selectedAudioOutputID: this.state.selectedAudioOutputID || ""
                }}
              >
                {this.state.collapseAudioVideoSettings && (
                  <Form.Item className="changeSettingsItem">
                    <Button
                      type="text"
                      onClick={this.handleShowAudioVideoSettings}
                      icon={<SettingOutlined />}
                    >
                      Change camera or microphone
                    </Button>
                  </Form.Item>
                )}
                {!this.state.collapseAudioVideoSettings && (
                  <>
                    <Form.Item label="Camera" name="selectedVideoInputID">
                      <Select onChange={this.handleVideoInputChange}>
                        {this.state.videoInputs?.map((videoInput) => (
                          <Select.Option key={videoInput.deviceId} value={videoInput.deviceId}>
                            {videoInput.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label="Microphone" name="selectedAudioInputID">
                      <Select onChange={this.handleAudioInputChange}>
                        {this.state.audioInputs?.map((audioInput) => (
                          <Select.Option key={audioInput.deviceId} value={audioInput.deviceId}>
                            {audioInput.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {this.state.audioOutputs && this.state.audioOutputs.length > 0 && (
                      <Form.Item label="Speaker" name="selectedAudioOutputID">
                        <Select onChange={this.handleAudioOutputChange}>
                          {this.state.audioOutputs?.map((audioOutput) => (
                            <Select.Option key={audioOutput.deviceId} value={audioOutput.deviceId}>
                              {audioOutput.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    )}
                  </>
                )}
                {this.props.buttonText && (
                  <Form.Item>
                    <Button type="primary" shape="round" size="large" htmlType="submit">
                      {this.props.buttonText}
                    </Button>
                  </Form.Item>
                )}
              </Form>
            )}
          </Col>
        </>
      </Row>
    );
  }
}
