import React from 'react';

export default class Roster extends React.Component {
  constructor(props) {
    super(props);

    this.swarm = props.swarm;

    this.swarm.on('connect', this.onNodeConnect.bind(this));
    this.swarm.on('disconnect', this.updateNodes.bind(this));

    this.swarm.on('roster.hello', this.onRosterHello.bind(this));

    this.state = {
      nodes: []
    }
  }

  onRosterHello(node, data) {
    node.meta.roster = data;

    this.updateNodes(node);
  }

  onNodeConnect(node) {
    this.swarm.sendToOne(node, 'roster.hello', { name: this.props.name });

    this.updateNodes(node);
  }

  updateNodes(node) {
    this.setState({ nodes: this.swarm.nodes });
  }

  render() {
    return (
      <div className="roster">
        <h4>Roster</h4>
        <div className="nodes">
          {this.state.nodes.map(node => (
            <div className="node" key={node.id}>
              {node.meta.roster && node.meta.roster.name} ({node.id})
            </div>
          ))}
        </div>
      </div>
    );
  }
}
