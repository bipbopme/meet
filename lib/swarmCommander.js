import EventEmitter from 'events'
import remove from 'lodash/remove'
import sha256 from 'js-sha256'
import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'

const CONFIG = JSON.parse(process.env.SWARM_CONFIG)

export default class SwarmCommander extends EventEmitter {
  constructor (id, stream) {
    super()

    this.id = id
    this.hub = signalhub(sha256(`${CONFIG.signalhubAppName}-${id}`), CONFIG.signalhubUrls)
    this.swarm = swarm(this.hub, { config: CONFIG.webrtcConfig, stream: stream })
    this.nodes = []

    this.swarm.on('connect', this.handlePeerConnect.bind(this))
    this.swarm.on('disconnect', this.handlePeerDisconnect.bind(this))

    this.on('willclose', this.handleWillClose.bind(this))

    // Debug
    this.on('connect', node => {
      console.log('connected to a new peer:', node.id)
      console.log('node count:', this.nodes.length, this.swarm.peers.length)
    })

    this.on('disconnect', node => {
      console.log('disconnected from a peer:', node)
      console.log('node count:', this.nodes.length, this.swarm.peers.length)
    })
  }

  sendToAll (event, data) {
    this.nodes.forEach(node => this.sendToOne(node, event, data))
  }

  sendToOne (idOrNode, event, data) {
    const node = typeof (idOrNode) === 'string' ? this.getNodeByID(idOrNode) : idOrNode

    node.peer.send(JSON.stringify({ event, data }))
  }

  streamToAll (stream) {
    this.nodes.forEach(node => this.streamToOne(node, stream))
  }

  streamToOne (idOrNode, stream) {
    const node = typeof (idOrNode) === 'string' ? this.getNodeByID(idOrNode) : idOrNode

    node.peer.addStream(stream)
  }

  close () {
    this.sendToAll('willclose')
    this.swarm.close()
  }

  getNodeByID (id) {
    return this.nodes.find(p => p.id === id)
  }

  handlePeerConnect (peer, id) {
    const node = this._createNode(peer, id)

    // TODO: do we need to .off these?
    peer.on('data', data => this.handlePeerData(peer, id, data))
    peer.on('stream', stream => this.handlePeerData(peer, id, stream))

    this.emit('connect', node)
  }

  // This will fire twice: willclose and swarm.disconnect
  handlePeerDisconnect (peer, id) {
    const node = this._removeNode(id)

    if (node) {
      this.emit('disconnect', node)
    }
  }

  handleWillClose (node) {
    this.handlePeerDisconnect(node.peer, node.id)
  }

  handlePeerData (peer, id, data) {
    const message = JSON.parse(data)
    const node = this.getNodeByID(id)

    // Make sure we're still connected to this node
    if (node) {
      this.emit(message.event, node, message.data)
    }
  }

  handlePeerData (peer, id, stream) {
    const node = this.getNodeByID(id)

    // Make sure we're still connected to this node
    if (node) {
      this.emit('stream', node, stream)
    }
  }

  _createNode (peer, id) {
    const node = { id: id, peer: peer, meta: {} }

    this.nodes.push(node)

    return node
  }

  _removeNode (id) {
    return remove(this.nodes, p => { return p.id === id })[0]
  }
}
