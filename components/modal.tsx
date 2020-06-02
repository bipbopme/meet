import { Portal } from "react-portal";
import { bind } from "lodash-decorators";
import React from "react";

interface ModalProps {
  onCancel?(): void;
  className?: string;
}

export default class Modal extends React.Component<ModalProps> {
  constructor(props: ModalProps) {
    super(props);

    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  @bind()
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.cancel();
    }
  }

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
        <div
          className={`modal ${this.props.className}`}
          onClick={this.stopClickPropagation}
          onDoubleClick={this.stopClickPropagation}
        >
          <div className="modalInner">{this.props.children}</div>
        </div>
      </Portal>
    );
  }
}
