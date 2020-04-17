/* global JitsiMeetJS */
import React from 'react'
import Video from './video'
import VideoChatControls from './controls/videoChatControls'
import debounce from 'lodash/debounce'

export default class VideoChat extends React.Component {
  constructor (props) {
    super(props)

    this.conference = props.conference
    this.tracksByParticipant = {}

    this.conference.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, this.handleConferenceJoined.bind(this))
    this.conference.on(JitsiMeetJS.events.conference.USER_JOINED, this.handleUserJoined.bind(this))
    this.conference.on(JitsiMeetJS.events.conference.USER_LEFT, this.handleUserLeft.bind(this))
    this.conference.on(JitsiMeetJS.events.conference.TRACK_ADDED, this.handleTrackAdded.bind(this))
    this.conference.on(JitsiMeetJS.events.conference.TRACK_REMOVED, this.handleTrackRemoved.bind(this))

    this.debouncedCalculateVideoConstraint = debounce(this.calculateVideoConstraint.bind(this), 1000)

    window.addEventListener('resize', this.debouncedCalculateVideoConstraint)

    this.state = {
      tracksByParticipant: []
    }
  }

  handleConferenceJoined () {
    this.props.localTracks.forEach((track) => {
      this.conference.addTrack(track)
    })

    this.debouncedCalculateVideoConstraint()
  }

  handleUserJoined (id) {
    this.tracksByParticipant[id] = []

    this.debouncedCalculateVideoConstraint()
  }

  calculateVideoConstraint () {
    const sampleVideoContainer = document.getElementsByClassName('video')[0]

    if (sampleVideoContainer) {
      let elementHeight = sampleVideoContainer.offsetHeight
      let videoConstraint;

      if (elementHeight < 180) {
        videoConstraint = 180
      } else if (elementHeight < 500) {
        videoConstraint = 360
      } else if (elementHeight < 1000) {
        videoConstraint = 720
      } else {
        videoConstraint = 1080
      }

      console.log('calculateVideoConstraint', elementHeight, videoConstraint)

      this.conference.setReceiverVideoConstraint(videoConstraint)
    }
  }

  handleUserLeft (id) {
    if (this.tracksByParticipant[id]) {
      delete this.tracksByParticipant[id]

      this.updateParticipants()
      this.debouncedCalculateVideoConstraint()
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
    this.conference.selectParticipants(Object.keys(this.tracksByParticipant))
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
            <Video key={pid} conference={this.conference} tracks={this.state.tracksByParticipant[pid]} />
          ))}
          <Video key='myVideo' conference={this.conference} local tracks={this.props.localTracks} />
        </section>
        <VideoChatControls localTracks={this.props.localTracks} />
      </div>
    )
  }
}
