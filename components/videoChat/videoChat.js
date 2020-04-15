/* global JitsiMeetJS */
import React from 'react'
import Video from './video'
import VideoChatControls from './controls/videoChatControls'

export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.room = props.room
    this.tracksByParticipant = {}

    this.room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, this.handleConferenceJoined.bind(this))
    this.room.on(JitsiMeetJS.events.conference.USER_JOINED, this.handleUserJoined.bind(this))
    this.room.on(JitsiMeetJS.events.conference.USER_LEFT, this.handleUserLeft.bind(this))
    this.room.on(JitsiMeetJS.events.conference.TRACK_ADDED, this.handleTrackAdded.bind(this))
    this.room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, this.handleTrackRemoved.bind(this))

    this.state = {
      tracksByParticipant: []
    }
  }

  handleConferenceJoined () {
    this.props.localTracks.forEach((track) => {
      this.room.addTrack(track)
      this.room.setReceiverVideoConstraint(360)
    })
  }

  handleUserJoined (id) {
    this.tracksByParticipant[id] = []
  }

  handleUserLeft (id) {
    if (this.tracksByParticipant[id]) {
      delete this.tracksByParticipant[id]
      this.updateParticipants()
    }
  }

  handleTrackAdded (track) {
    if (!track.isLocal()) {
      const id = track.getParticipantId()
      this.tracksByParticipant[id].push(track)
      this.updateParticipants()
    }
  }

  handleTrackRemoved (track) {
    const id = track.getParticipantId()

    if (this.tracksByParticipant[id]) {
      const index = this.tracksByParticipant[id].indexOf(track)

      if (index <= 0) {
        this.tracksByParticipant[id].slice(index, 1)
        this.updateParticipants()
      }
    }
  }

  updateParticipants () {
    this.selectAllParticipants()
    this.setState({ tracksByParticipant: this.tracksByParticipant })
  }

  selectAllParticipants () {
    this.room.selectParticipants(Object.keys(this.tracksByParticipant))
  }

  render () {
    const pids = Object.keys(this.tracksByParticipant)

    return (
      <div className='videoChat'>
        <header>
          <h1>bipbop</h1>
        </header>
        <section className={`videos videos-count-${pids.length + 1}`}>
          {pids.map(pid => (
            <Video key={pid} tracks={this.state.tracksByParticipant[pid]} />
          ))}
          <Video key='myVideo' local tracks={this.props.localTracks} />
        </section>
        <VideoChatControls localTracks={this.props.localTracks} />
      </div>
    )
  }
}
