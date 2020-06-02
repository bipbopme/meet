import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bind } from "lodash-decorators";
import { faCopy, faShareSquare } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Modal from "./modal";
import React from "react";

interface ShareProps {
  onCancel(): void;
}

interface ShareState {
  url: string;
}

export default class Share extends React.Component<ShareProps, ShareState> {
  constructor(props: ShareProps) {
    super(props);

    this.state = {
      url: window.location.toString()
    };
  }

  @bind()
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.state.url);
      toast("Copied to clipboard.");
    } catch (error) {
      console.error(error);
    }
  }

  @bind()
  async shareLink(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({ text: "Video chat with me on bipbop", url: this.state.url });
      } catch (error) {
        console.error(error);
      }
    }
  }

  render(): JSX.Element {
    return (
      <Modal className="share" onCancel={this.props.onCancel}>
        <h2>Invite your people</h2>
        <div className="message">Share this link with people you want to join this chat</div>
        <div className="url">
          <span>{this.state.url}</span>
        </div>
        <div className="action">
          {!navigator.share && (
            <a onClick={this.copyLink}>
              <FontAwesomeIcon icon={faCopy} />
              Copy link
            </a>
          )}
          {navigator.share && (
            <a onClick={this.shareLink}>
              <FontAwesomeIcon icon={faShareSquare} />
              Share Link
            </a>
          )}
        </div>
      </Modal>
    );
  }
}
