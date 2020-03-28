// TODO: utils.js -- :facepalm: are you kidding me?
import localforage from 'localforage';

export async function getMediaContraints(selectedAudioInputID = undefined, selectedVideoInputID = undefined) {
  if (!selectedAudioInputID) {
    selectedAudioInputID = await localforage.getItem('selectedAudioInputID');
  }
  if (!selectedVideoInputID) {
    selectedVideoInputID = await localforage.getItem('selectedVideoInputID');
  }

  return {
    audio: { echoCancellation: true, autoGainControl: true, deviceId: selectedAudioInputID ? { exact: selectedAudioInputID } : undefined},
    video: { aspectRatio: 4/3, resizeMode: 'crop-and-scale', deviceId: selectedVideoInputID ? { exact: selectedVideoInputID } : undefined}
  };
}

export function stopStreamTracks(stream) {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
}
