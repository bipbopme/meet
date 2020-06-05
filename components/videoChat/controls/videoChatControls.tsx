import { Button, Col, Dropdown, Menu, Row, Space } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { observer } from "mobx-react";
import DetectRTC from "detectrtc";
import JitsiParticipant from "../../../lib/jitsiManager/jitsiParticipant";
import LeaveButton from "./leaveButton";
import MicButton from "./micButton";
import React from "react";
import ScreenShareButton from "./screenShareButton";
import SettingsButton from "./settingsButton";
import ShareButton from "./shareButton";
import VideoButton from "./videoButton";
import ViewButton from "./viewButton";

interface VideoChatControlsProps {
  localParticipant: JitsiParticipant;
  onLeave(): void;
  onViewChange(view: string): void;
  view: string;
}

@observer
export default class VideoChatControls extends React.Component<VideoChatControlsProps> {
  private canScreenCapture = JitsiMeetJS.isDesktopSharingEnabled() && !DetectRTC.isMobileDevice;

  render(): JSX.Element {
    const menu = (
      <Menu>
        <Menu.Item>
          <ShareButton />
        </Menu.Item>
        <Menu.Item>
          <ViewButton view={this.props.view} onToggle={this.props.onViewChange} />
        </Menu.Item>
        <Menu.Item>
          <SettingsButton localParticipant={this.props.localParticipant} />
        </Menu.Item>
      </Menu>
    );

    return (
      <Row className="videoChatControls" align="middle">
        <Col span="8" className="left">
          <Space>
            {this.canScreenCapture && (
              <ScreenShareButton localParticipant={this.props.localParticipant} />
            )}
          </Space>
        </Col>
        <Col span="8" className="center">
          <Space>
            <MicButton localParticipant={this.props.localParticipant} />
            <LeaveButton onLeave={this.props.onLeave} />
            <VideoButton localParticipant={this.props.localParticipant} />
          </Space>
        </Col>
        <Col span="8" className="right">
          <Space>
            <Dropdown overlay={menu} placement="topRight" trigger={["click"]}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        </Col>
      </Row>
    );
  }
}
