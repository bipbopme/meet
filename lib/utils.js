// TODO: utils.js -- :facepalm: are you kidding me?
import localforage from 'localforage'
import short from 'short-uuid'

export async function getMediaContraints (selectedAudioInputID = undefined, selectedVideoInputID = undefined) {
  if (!selectedAudioInputID) {
    selectedAudioInputID = await localforage.getItem('selectedAudioInputID')
  }
  if (!selectedVideoInputID) {
    selectedVideoInputID = await localforage.getItem('selectedVideoInputID')
  }

  return {
    audio: { deviceId: selectedAudioInputID ? { exact: selectedAudioInputID } : undefined },
    video: { aspectRatio: 4 / 3, deviceId: selectedVideoInputID ? { exact: selectedVideoInputID } : undefined }
  }
}

export function stopStreamTracks (stream) {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop()
    })
  }
}

export function uuid () {
  return short().generate()
}