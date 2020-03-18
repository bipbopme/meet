import io from 'socket.io-client';
import Peer from 'simple-peer';
import EventEmitter from 'events';

export default class PeerMesh extends EventEmitter {
  constructor(roomID) {
    super();

    this.roomID = roomID;
    this.peers = {};
    this.socket = io();

    this.socket.on('joined', this.onJoined.bind(this));
    this.socket.on('signal', this.onSignal.bind(this));

    this.join();
  }

  join() {
    this.socket.emit('join', this.roomID);
  }

  sendToAll(data) {
    const dataString = JSON.stringify(data);

    Object.values(this.peers).forEach(p => {
      p.send(dataString);
    });
  }

  fire(type, data) {
    this.sendToAll({ type, data });
  }

  onJoined(data) {
    console.log('joined', data);

    const socketID = data.socketID;
    const peer = this.initPeer(socketID, true);

    this.peers[socketID] = peer;
  }

  onSignal(signal) {
    console.log('socket signal', signal);

    // TODO: is this necessary? do we ever have this peer?
    // See if we already have this peer
    let peer = this.peers[signal.socketID];

    if (!peer) {
      this.peers[signal.socketID] = peer = this.initPeer(signal.socketID);
    }

    peer.signal(signal.data);
  }

  initPeer(socketID, initiator = false) {
    const peer = new Peer({ initiator: initiator, trickle: false });

    peer.on('signal', data => {
      console.log('peerSignal', data);

      this.socket.emit('signal', {
        socketID: socketID,
        data: data
      });
    });

    peer.on('error', err => console.log('error', err));

    peer.on('connect', () => {
      console.log('peerConnect', socketID);
    });

    peer.on('close', () => {
      console.log('peerClose', socketID);

      delete this.peers[socketID];
    });

    peer.on('data', eventString => {
      const event = JSON.parse(eventString)
      console.log('peerData', event);

      this.emit(event.type, event.data);
    });

    return peer;
  }
}