import { SendHorizontal } from "lucide-react";
import React from "react";
import { useEffect } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

function AudioRecorderMic({
  setIsAudioRecording,
  isAudioRecording,
  handleSendFile,
}) {
  const recorderControls = useAudioRecorder();

  const addAudioElement = (blob) => {
    recorderControls.stopRecording();
  };

  useEffect(() => {
    if (recorderControls.isRecording) {
      setIsAudioRecording(true);
    }
  }, [recorderControls.isRecording, setIsAudioRecording]);

  useEffect(() => {
    if (!isAudioRecording) {
      recorderControls.stopRecording();
      if (recorderControls.recordingBlob)
        handleSendFile(recorderControls.recordingBlob);
      setIsAudioRecording(false);
    }
  }, [isAudioRecording]);

  return (
    <div className="flex items-center gap-2 mr-2">
      <AudioRecorder
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
        downloadFileExtension="webm"
        recorderControls={recorderControls}
        showVisualizer={true}
      />
    </div>
  );
}

export default AudioRecorderMic;
