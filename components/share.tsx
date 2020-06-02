import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Modal from "./modal";
import React from "react";

interface ShareProps {
  onCancel(): void;
}

export default class Share extends React.Component<ShareProps> {
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.toString());
      toast("Copied to clipboard.");
    } catch (error) {
      console.error(error);
    }
  }

  render(): JSX.Element {
    const url = window.location.toString();

    return (
      <Modal className="share" onCancel={this.props.onCancel}>
        <h2>Invite your people</h2>
        <div className="message">Share this link with people you want to join this chat</div>
        <div className="url">
          <span>{url} </span>
          <FontAwesomeIcon onClick={this.copyLink} icon={faCopy} title="Copy link to clipboard" />
        </div>
      </Modal>
    );
  }
}
