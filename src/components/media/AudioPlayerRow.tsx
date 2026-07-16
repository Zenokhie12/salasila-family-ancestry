import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UI } from '../../lib/colors';
import { resolveMediaUri } from '../../lib/mediaStorage';
import type { MediaAttachment } from '../../models/types';

interface Props {
  attachment: MediaAttachment;
  onDelete: () => void;
}

function formatDuration(ms: number | undefined): string {
  if (!ms) return '';
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = `${total % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function AudioPlayerRow({ attachment, onDelete }: Props) {
  const player = useAudioPlayer(resolveMediaUri(attachment.uri) ?? null);
  const status = useAudioPlayerStatus(player);

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // expo-audio does not rewind automatically when playback finishes.
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={styles.row}>
      <Pressable style={styles.playButton} onPress={toggle}>
        <Text style={styles.playIcon}>{status.playing ? '❚❚' : '▶'}</Text>
      </Pressable>
      <View style={styles.info}>
        <Text style={styles.caption}>{attachment.caption || 'Voice recording'}</Text>
        <Text style={styles.duration}>{formatDuration(attachment.durationMs)}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8}>
        <Text style={styles.delete}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    padding: 10,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: UI.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: UI.onDark, fontSize: 13 },
  info: { flex: 1 },
  caption: { color: UI.text, fontSize: 14 },
  duration: { color: UI.subtleText, fontSize: 12 },
  delete: { color: UI.subtleText, fontSize: 16, padding: 4 },
});
