/* global JitsiMeetJS */
import DetectRTC from 'detectrtc'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Video from '../videoChat/video'
import _uniqBy from 'lodash/uniqBy'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import localforage from 'localforage'
import { matopush } from '../../lib/matomo'

export default class Settings extends React.Component {
  constructor (props) {
    super(props)

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleAudioInputChange = this.handleAudioInputChange.bind(this)
    this.handleAudioOutputChange = this.handleAudioOutputChange.bind(this)
    this.handleVideoInputChange = this.handleVideoInputChange.bind(this)
    this.handleCreateLocalTracks = this.handleCreateLocalTracks.bind(this)
    this.handleEnumerateDevices = this.handleEnumerateDevices.bind(this)
    this.onError = this.onError.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleShowAudioVideoSettings = this.handleShowAudioVideoSettings.bind(this)

    this.state = {
      name: '',
      selectedAudioInputID: undefined,
      selectedAudioOutputID: undefined,
      selectedVideoInputID: undefined,
      audioTrack: undefined,
      videoTrack: undefined,
      collapseAudioVideoSettings: this.props.collapseAudioVideoSettings
    }
  }

  componentDidMount () {
    this.getUserMedia()

    JitsiMeetJS.mediaDevices.addEventListener(JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED, this.handleDeviceListChanged.bind(this))
  }

  async getUserMedia () {
    await this.loadSavedSettings()

    if (this.state.audioTrack) {
      this.state.audioTrack.getTrack().stop()
    }

    if (this.state.videoTrack) {
      this.state.videoTrack.getTrack().stop()
    }

    const options = {
      devices: ['audio', 'video']
    }

    // TODO: Work around bug in JitsiMeetJS
    if (DetectRTC.browser.isFirefox) {
      options.constraints = {
        audio: {
          deviceId: this.state.selectedAudioInputID ? { exact: this.state.selectedAudioInputID } : undefined
        },
        video: {
          deviceId: this.state.selectedVideoInputID ? { exact: this.state.selectedVideoInputID } : undefined,
          height: { ideal: 720, max: 720, min: 240 }
        }
      }
    } else {
      options.cameraDeviceId = this.state.selectedVideoInputID
      options.micDeviceId = this.state.selectedAudioInputID
    }

    JitsiMeetJS.createLocalTracks(options).then(this.handleCreateLocalTracks).catch(this.onError)
  }

  async onError (error) {
    console.error(error)

    // TODO: brute force error handling. need something more nuanced.
    if (this.state.selectedAudioInputID || this.state.selectedAudioOutputID || this.state.selectedVideoInputID) {
      await localforage.removeItem('selectedAudioInputID')
      await localforage.removeItem('selectedAudioOutputID')
      await localforage.removeItem('selectedVideoInputID')

      // Try again
      this.getUserMedia()
    }
  }

  handleCreateLocalTracks (tracks) {
    let audioTrack, videoTrack

    if (tracks) {
      audioTrack = tracks.find(t => t.getType() === 'audio')
      videoTrack = tracks.find(t => t.getType() === 'video')
    }

    this.setState({ audioTrack: audioTrack, videoTrack: videoTrack })

    JitsiMeetJS.mediaDevices.enumerateDevices(this.handleEnumerateDevices)
  }

  async loadSavedSettings () {
    const name = await localforage.getItem('name')
    const selectedAudioInputID = await localforage.getItem('selectedAudioInputID')
    const selectedAudioOutputID = await localforage.getItem('selectedAudioOutputID')
    const selectedVideoInputID = await localforage.getItem('selectedVideoInputID')

    this.setState({
      name,
      selectedAudioInputID,
      selectedAudioOutputID,
      selectedVideoInputID
    })
  }

  async handleEnumerateDevices (devices) {
    if (devices) {
      const audioInputs = _uniqBy(devices.filter(d => d.kind === 'audioinput'), 'deviceId')
      const audioOutputs = _uniqBy(devices.filter(d => d.kind === 'audiooutput'), 'deviceId')
      const videoInputs = _uniqBy(devices.filter(d => d.kind === 'videoinput'), 'deviceId')

      this.syncAudioVideoDefaults(audioOutputs)

      this.setState({
        audioInputs,
        audioOutputs,
        videoInputs
      })
    }
  }

  handleDeviceListChanged (devices) {
    console.log('Device list changed')
    this.handleEnumerateDevices(devices)
  }

  handleNameChange (event) {
    const name = event.target.value

    localforage.setItem('name', name)
    this.setState({ name: name })

    matopush(['trackEvent', 'settings', 'name', 'update'])
  }

  handleAudioInputChange (event) {
    const selectedAudioInputID = event.target.value

    localforage.setItem('selectedAudioInputID', selectedAudioInputID)
    this.setState({ selectedAudioInputID })

    this.getUserMedia()

    matopush(['trackEvent', 'settings', 'audioInput', 'update'])
  }

  handleAudioOutputChange (event) {
    const selectedAudioOutputID = event.target.value

    localforage.setItem('selectedAudioOutputID', selectedAudioOutputID)
    this.setState({ selectedAudioOutputID })

    JitsiMeetJS.mediaDevices.setAudioOutputDevice(selectedAudioOutputID)

    matopush(['trackEvent', 'settings', 'audioOutput', 'update'])
  }

  handleVideoInputChange (event) {
    const selectedVideoInputID = event.target.value

    localforage.setItem('selectedVideoInputID', selectedVideoInputID)
    this.setState({ selectedVideoInputID })

    this.getUserMedia()

    matopush(['trackEvent', 'settings', 'videoInput', 'update'])
  }

  // Handle device setting inconsistencies
  syncAudioVideoDefaults (audioOutputs) {
    const newState = {}

    const { audioTrack, videoTrack, selectedVideoInputID, selectedAudioInputID, selectedAudioOutputID } = this.state

    if (audioTrack) {
      const audioTrackDeviceId = audioTrack.getDeviceId()

      if (selectedAudioInputID !== audioTrackDeviceId) {
        localforage.setItem('selectedAudioInputID', audioTrackDeviceId)
        newState.selectedAudioInputID = audioTrackDeviceId

        console.log('Synced audio input')
      }
    }

    if (videoTrack) {
      const videoTrackDeviceId = videoTrack.getDeviceId()

      if (selectedVideoInputID !== videoTrackDeviceId) {
        localforage.setItem('selectedVideoInputID', videoTrackDeviceId)
        newState.selectedVideoInputID = videoTrackDeviceId

        console.log('Synced video input')
      }
    }

    // Sync output settings
    if (selectedAudioOutputID) {
      if (audioOutputs.find(d => d.deviceId === selectedAudioOutputID)) {
        // Device exists so activate it
        JitsiMeetJS.mediaDevices.setAudioOutputDevice(selectedAudioOutputID)
      } else {
        // Couldn't find previous device so clear it and rely on defaults
        localforage.removeItem('selectedAudioOutputID')
        newState.selectedAudioOutputID = null
        console.log('Synced video output')
      }
    }

    this.setState(newState)
  }

  handleSubmit (event) {
    event.preventDefault()

    if (this.props.onButtonClick) {
      const { name, audioTrack, videoTrack } = this.state

      this.props.onButtonClick({ name, audioTrack, videoTrack })
    }
  }

  handleShowAudioVideoSettings () {
    this.setState({ collapseAudioVideoSettings: false })
  }

  render () {
    return (
      <div className='settings'>
        {this.state.videoTrack &&
          <>
            <div className='videoContainer'>
              <Video key='localVideo' isLocal audioTrack={this.state.audioTrack} videoTrack={this.state.videoTrack} />
            </div>
            <div className='formContainer'>
              {this.props.titleText &&
                <h2>{this.props.titleText}</h2>
              }
              <form onSubmit={this.handleSubmit}>
                <div className='row nameRow'>
                  <label>Name</label>
                  <input value={this.state.name || ''} onChange={this.handleNameChange} />
                </div>

                {this.state.collapseAudioVideoSettings &&
                  <div className='showAudioVideoSettings'>
                    <a onClick={this.handleShowAudioVideoSettings}><FontAwesomeIcon icon={faCog} /> Change camera or microphone</a>
                  </div>
                }

                {!this.state.collapseAudioVideoSettings &&
                  <div className='audioVideoSettings'>
                    <div className='row'>
                      <label>Camera</label>
                      <select onChange={this.handleVideoInputChange} value={this.state.selectedVideoInputID || ''}>
                        {this.state.videoInputs && this.state.videoInputs.map(videoInput => (
                          <option key={videoInput.deviceId} value={videoInput.deviceId}>{videoInput.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className='row'>
                      <label>Microphone</label>
                      <select onChange={this.handleAudioInputChange} value={this.state.selectedAudioInputID || ''}>
                        {this.state.audioInputs && this.state.audioInputs.map(audioInput => (
                          <option key={audioInput.deviceId} value={audioInput.deviceId}>{audioInput.label}</option>
                        ))}
                      </select>
                    </div>

                    {this.state.audioOutputs && this.state.audioOutputs.length > 0 &&
                      <div className='row'>
                        <label>Speaker</label>
                        <select onChange={this.handleAudioOutputChange} value={this.state.selectedAudioOutputID || ''}>
                          {this.state.audioOutputs && this.state.audioOutputs.map(audioOutput => (
                            <option key={audioOutput.deviceId} value={audioOutput.deviceId}>{audioOutput.label}</option>
                          ))}
                        </select>
                      </div>
                    }
                  </div>
                }
                {this.props.buttonText &&
                  <div className='row buttonRow'>
                    <button onClick={this.handleSubmit}>{this.props.buttonText}</button>
                  </div>
                }
              </form>
            </div>
          </>}

        {!this.state.videoTrack &&
          <div className='statusMessage'>
            <h2>Hello, there.</h2>
            <h3>Please allow access to your camera and microphone.</h3>
          </div>}
      </div>
    )
  }
}
