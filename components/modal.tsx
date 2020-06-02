import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Portal } from "react-portal";
import { bind } from "lodash-decorators";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import React from "react";

interface ModalProps {
  onCancel?(): void;
  className?: string;
}

export default class Modal extends React.Component<ModalProps> {
  constructor(props: ModalProps) {
    super(props);

    if (this.props.onCancel) {
      document.addEventListener("keydown", this.handleKeyDown);
    }
  }

  componentWillUnmount(): void {
    if (this.props.onCancel) {
      document.removeEventListener("keydown", this.handleKeyDown);
    }
  }

  @bind()
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.cancel();
    }
  }

  @bind()
  cancel(): void {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  // Doesn't let click events leave the modal dialog.
  // Helps prevent interference with global click events that are managing
  // the autohiding toolbar.
  stopClickPropagation(event: React.MouseEvent<HTMLDivElement>): void {
    event.stopPropagation();
  }

  render(): JSX.Element {
    return (
      <Portal>
        <div className={`modal ${this.props.className}`} onClick={this.cancel}>
          <div
            className="modalInner"
            onClick={this.stopClickPropagation}
            onDoubleClick={this.stopClickPropagation}
          >
            {this.props.onCancel && (
              <FontAwesomeIcon
                className="close"
                title="Close"
                icon={faTimes}
                onClick={this.cancel}
              />
            )}
            {this.props.children}
          </div>
        </div>
      </Portal>
    );
  }
}
