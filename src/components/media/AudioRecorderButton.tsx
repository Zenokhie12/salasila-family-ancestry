import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { UI } from '../../lib/colors';

interface Props {
  onRecorded: (uri: string, durationMs: number) => void;
}

export function AudioRecorderButton({ onRecorded }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (state.isRecording) {
        const durationMs = state.durationMillis ?? 0;
        await recorder.stop();
        await setAudioModeAsync({ allowsRecording: false });
        if (recorder.uri) onRecorded(recorder.uri, durationMs);
      } else {
        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) return;
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
      }
    } finally {
      setBusy(false);
    }
  };

  const seconds = Math.floor((state.durationMillis ?? 0) / 1000);

  return (
    <Pressable
      style={[styles.button, state.isRecording && styles.recording]}
      onPress={toggle}
    >
      <Text style={[styles.label, state.isRecording && styles.recordingLabel]}>
        {state.isRecording ? `■ Stop (${seconds}s)` : '🎙 Record audio'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: UI.card,
  },
  recording: { backgroundColor: UI.danger, borderColor: UI.danger },
  label: { color: UI.text, fontSize: 14 },
  recordingLabel: { color: UI.onDark, fontWeight: 'bold' },
});
