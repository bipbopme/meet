import { Button, Modal } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { bind } from "lodash-decorators";
import { matopush } from "../../../lib/matomo";
import JitsiParticipant from "../../../lib/jitsiManager/jitsiParticipant";
import React from "react";
import Settings from "../../settings/settings";

interface SettingsButtonProps {
  localParticipant: JitsiParticipant;
}

interface SettingsButtonState {
  showSettings: boolean;
}

export default class SettingsButton extends React.Component<
  SettingsButtonProps,
  SettingsButtonState
> {
  state = {
    showSettings: false
  };

  @bind()
  handleClick(): void {
    this.setState({ showSettings: true });

    matopush(["trackEvent", "videoChat", "settingsButton", "click"]);
  }

  @bind()
  async handleDone(
    name: string | undefined,
    audioTrack: JitsiMeetJS.JitsiTrack,
    videoTrack: JitsiMeetJS.JitsiTrack
  ): Promise<void> {
    await this.props.localParticipant.replaceAudioTrack(audioTrack);
    await this.props.localParticipant.replaceVideoTrack(videoTrack);

    this.setState({ showSettings: false });
  }

  @bind()
  handleModalCancel(): void {
    this.setState({ showSettings: false });
  }

  render(): JSX.Element {
    return (
      <>
        <div className="button settingsButton" onClick={this.handleClick}>
          <Button type="text" size="large" icon={<SettingOutlined />}>
            Settings
          </Button>
        </div>
        <Modal
          onCancel={this.handleModalCancel}
          visible={this.state.showSettings}
          title="Settings"
          footer={[
            <Button key="back" onClick={this.handleModalCancel}>
              Cancel
            </Button>,
            <Button form="settingsForm" key="submit" type="primary" htmlType="submit">
              Update
            </Button>
          ]}
          width={800}
        >
          <Settings onButtonClick={this.handleDone} />
        </Modal>
      </>
    );
  }
}
