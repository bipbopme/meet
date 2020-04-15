/* global JitsiMeetJS */
import React from 'react'
import Video from '../videoChat/video'
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
    this.handleButtonClick = this.handleButtonClick.bind(this)

    this.state = {
      name: '',
      selectedAudioInputID: '',
      selectedAudioOutputID: '',
      selectedVideoInputID: '',
      localTracks: undefined
    }
  }

  componentDidMount () {
    this.getUserMedia()
  }

  async getUserMedia () {
    await this.loadSavedSettings()

    this.setAudioOutputDevice()

    JitsiMeetJS.createLocalTracks({
      devices: ['audio', 'video'],
      cameraDeviceId: this.state.selectedVideoInputID,
      micDeviceId: this.state.selectedAudioInputID
    })
      .then(this.handleCreateLocalTracks)
      .then(this.handleEnumerateDevices)
      .catch(this.onError)
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
    this.setState({ localTracks: tracks })

    return navigator.mediaDevices.enumerateDevices()
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
      const audioInputs = devices.filter(d => d.kind === 'audioinput')
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput')
      const videoInputs = devices.filter(d => d.kind === 'videoinput')

      this.setState({
        audioInputs,
        audioOutputs,
        videoInputs
      })
    }
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

    matopush(['trackEvent', 'settings', 'audioInput', 'update'])
  }

  handleAudioOutputChange (event) {
    const selectedAudioOutputID = event.target.value

    localforage.setItem('selectedAudioOutputID', selectedAudioOutputID)
    this.setState({ selectedAudioOutputID })

    this.setAudioOutputDevice()

    matopush(['trackEvent', 'settings', 'audioOutput', 'update'])
  }

  handleVideoInputChange (event) {
    const selectedVideoInputID = event.target.value

    localforage.setItem('selectedVideoInputID', selectedVideoInputID)
    this.setState({ selectedVideoInputID })

    matopush(['trackEvent', 'settings', 'videoInput', 'update'])

    this.getUserMedia()
  }

  handleButtonClick () {
    if (this.props.onButtonClick) {
      this.props.onButtonClick(this.state)
    }
  }

  setAudioOutputDevice () {
    if (this.state.selectedAudioOutputID) {
      JitsiMeetJS.mediaDevices.setAudioOutputDevice(this.state.selectedAudioOutputID)
    }
  }

  render () {
    return (
      <div className='settings'>
        {this.state.localTracks &&
          <>
            <div className='videoContainer'>
              <Video key='localVideo' local tracks={this.state.localTracks} />
            </div>
            <div className='formContainer'>
              <form>
                <label>Name</label>
                <input value={this.state.name} onChange={this.handleNameChange} />

                <div className='row'>
                  <label>Microphone</label>
                  <select onChange={this.handleAudioInputChange} value={this.state.selectedAudioInputID}>
                    {this.state.audioInputs && this.state.audioInputs.map(audioInput => (
                      <option key={audioInput.deviceId} value={audioInput.deviceId}>{audioInput.label}</option>
                    ))}
                  </select>
                </div>

                {this.state.audioOutputs && this.state.audioOutputs.length > 0 &&
                  <div className='row'>
                    <label>Speaker</label>
                    <select onChange={this.handleAudioOutputChange} value={this.state.selectedAudioOutputID}>
                      {this.state.audioOutputs && this.state.audioOutputs.map(audioOutput => (
                        <option key={audioOutput.deviceId} value={audioOutput.deviceId}>{audioOutput.label}</option>
                      ))}
                    </select>
                  </div>}

                <div className='row'>
                  <label>Camera</label>
                  <select onChange={this.handleVideoInputChange} value={this.state.selectedVideoInputID}>
                    {this.state.videoInputs && this.state.videoInputs.map(videoInput => (
                      <option key={videoInput.deviceId} value={videoInput.deviceId}>{videoInput.label}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            {this.props.buttonText &&
              <div className='buttonContainer'>
                <button onClick={this.handleButtonClick}>{this.props.buttonText}</button>
              </div>}
          </>}

        {!this.state.localTracks &&
          <div className='loading'>
            <h3>Waiting for video stream...</h3>
            <h4>Please allow video in your browser.</h4>
          </div>}
      </div>
    )
  }
}
