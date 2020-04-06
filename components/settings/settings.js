import { getMediaContraints, stopStreamTracks } from '../../lib/utils'

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
    this.onGetUserMedia = this.onGetUserMedia.bind(this)
    this.onEnumerateDevices = this.onEnumerateDevices.bind(this)
    this.onError = this.onError.bind(this)
    this.handleButtonClick = this.handleButtonClick.bind(this)

    this.state = {
      name: '',
      selectedAudioInputID: '',
      selectedAudioOutputID: '',
      selectedVideoInputID: '',
      localStream: undefined
    }
  }

  componentDidMount () {
    this.getUserMedia()
  }

  async getUserMedia () {
    stopStreamTracks(this.state.localStream)

    await this.loadSavedSettings()

    const constraints = await getMediaContraints(this.state.selectedAudioInputID, this.state.selectedVideoInputID)

    navigator.mediaDevices.getUserMedia(constraints).then(this.onGetUserMedia).then(this.onEnumerateDevices).catch(this.onError)
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

  onGetUserMedia (stream) {
    this.setState({ localStream: stream })

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

  async onEnumerateDevices (devices) {
    const audioInputs = devices.filter(d => d.kind === 'audioinput')
    const audioOutputs = devices.filter(d => d.kind === 'audiooutput')
    const videoInputs = devices.filter(d => d.kind === 'videoinput')

    this.setState({
      audioInputs,
      audioOutputs,
      videoInputs
    })
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

  render () {
    return (
      <div className='settings'>
        {this.state.localStream &&
          <>
            <div className='videoContainer'>
              <Video key='localStream' local stream={this.state.localStream} />
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

        {!this.state.localStream &&
          <div className='loading'>
            <h3>Waiting for video stream...</h3>
            <h4>Please allow video in your browser.</h4>
          </div>}
      </div>
    )
  }
}
