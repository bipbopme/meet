export default class Message extends React.Component {
  constructor(props) {
    super(props);
  }

  getAvatarSrc() {
    return `https://avatars.dicebear.com/v2/human/${encodeURIComponent(this.props.message.name)}.svg?options[mood][]=happy`;
  }

  render() {
    const msg = this.props.message;

    return (
      <div className="message">
        <img className="avatar" src={this.getAvatarSrc()} />
        <div className="name">{msg.name}</div>
        <div className="body">{msg.body}</div>
      </div>
    );
  }
}
