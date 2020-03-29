import swarm from 'webrtc-swarm';
import signalhub from 'signalhub';
import EventEmitter from 'events';
import remove from 'lodash/remove';

export default class SwarmCommander extends EventEmitter {
  static webrtcConfig = { iceServers: [{ urls: [ 'stun:u3.xirsys.com' ]}, { username: 'hzBJjbOI31Im55OoCJuRAfHDAGvKMMahj4VCM07pmY2JyDJWZE-ORixu6tMxAMNOAAAAAF544o5uY2hhcG1hbg==', credential: 'a9814c94-6d22-11ea-a8d2-6a8e270ea0a6', urls: [ 'turn:u3.xirsys.com:80?transport=udp', 'turn:u3.xirsys.com:3478?transport=udp', 'turn:u3.xirsys.com:80?transport=tcp', 'turn:u3.xirsys.com:3478?transport=tcp', 'turns:u3.xirsys.com:443?transport=tcp', 'turns:u3.xirsys.com:5349?transport=tcp' ]}] };

  constructor(id, stream) {
    super();

    this.id = id;
    this.hub = signalhub('bipbop-' + id, ['https://signal.bipbop.me/']);
    this.swarm = swarm(this.hub, { config: SwarmCommander.webrtcConfig, stream: stream });
    this.nodes = [];

    this.swarm.on('connect', this.onPeerConnect.bind(this));
    this.swarm.on('disconnect', this.onPeerDisconnect.bind(this));

    this.on('willclose', this.onWillClose.bind(this));

    // Debug
    this.on('connect', node => {
      console.log('connected to a new peer:', node.id);
      console.log('node count:', this.nodes.length, this.swarm.peers.length);
    });

    this.on('disconnect', node => {
      console.log('disconnected from a peer:', node);
      console.log('node count:', this.nodes.length, this.swarm.peers.length);
    });
  }

  sendToAll(event, data) {
    this.nodes.forEach(node => this.sendToOne(node, event, data));
  }

  sendToOne(idOrNode, event, data) {
    const node = typeof(idOrNode) === 'string' ? this.getNodeByID(idOrNode) : idOrNode;

    node.peer.send(JSON.stringify({ event, data }));
  }

  streamToAll(event, data) {
    this.nodes.forEach(node => this.streamToOne(node, event, data));
  }

  streamToOne(idOrNode, stream) {
    const node = typeof(idOrNode) === 'string' ? this.getNodeByID(idOrNode) : idOrNode;

    node.peer.addStream(stream);
  }

  close() {
    this.sendToAll('willclose');
    this.swarm.close();
  }

  getNodeByID(id) {
    return this.nodes.find(p => p.id === id);
  }

  onPeerConnect(peer, id) {
    const node = this._createNode(peer, id);

    // TODO: do we need to .off these?
    peer.on('data', data => this.onPeerData(peer, id, data));
    peer.on('stream', stream => this.onPeerStream(peer, id, stream));

    this.emit('connect', node);
  }

  // This will fire twice: willclose and swarm.disconnect
  onPeerDisconnect(peer, id) {
    const node = this._removeNode(id);

    if (node) {
      this.emit('disconnect', node);
    }
  }

  onWillClose(node) {
    this.onPeerDisconnect(node.peer, node.id);
  }

  onPeerData(peer, id, data) {
    const message = JSON.parse(data);
    const node = this.getNodeByID(id);

    // Make sure we're still connected to this node
    if (node) {
      this.emit(message.event, node, message.data);
    }
  }

  onPeerStream(peer, id, stream) {
    const node = this.getNodeByID(id);

    // Make sure we're still connected to this node
    if (node) {
      this.emit('stream', node, stream);
    }
  }

  _createNode(peer, id) {
    const node = { id: id, peer: peer, meta: {} };

    this.nodes.push(node);

    return node;
  }

  _removeNode(id) {
    return remove(this.nodes, p => { return p.id === id })[0];
  }
}
