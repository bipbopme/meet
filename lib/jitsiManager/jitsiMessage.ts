import { observable } from "mobx";
import { uuid } from "../utils";
import JitsiParticipant from "./jitsiParticipant";

export default class JitsiMessage {
  id: string;
  @observable participant: JitsiParticipant;
  @observable text: string;
  @observable createdAt: Date;

  constructor(participant: JitsiParticipant, text: string, createdAt: Date) {
    this.id = uuid();
    this.participant = participant;
    this.text = text;
    this.createdAt = createdAt;
  }
}
