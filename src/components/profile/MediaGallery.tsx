import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { createMediaAttachment, deleteMediaAttachment } from '../../db/queries/media';
import { UI } from '../../lib/colors';
import { confirmAsync } from '../../lib/confirm';
import {
  deleteMediaFile,
  extensionFromMimeType,
  resolveMediaUri,
  saveMediaFile,
} from '../../lib/mediaStorage';
import type { MediaAttachment } from '../../models/types';
import { AudioPlayerRow } from '../media/AudioPlayerRow';
import { AudioRecorderButton } from '../media/AudioRecorderButton';
import { StoryComposer } from '../media/StoryComposer';

interface Props {
  personId: string;
  media: MediaAttachment[];
}

export function MediaGallery({ personId, media }: Props) {
  const [composingStory, setComposingStory] = useState(false);

  const photos = media.filter((m) => m.type === 'photo');
  const audio = media.filter((m) => m.type === 'audio');
  const stories = media.filter((m) => m.type === 'story');

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: Platform.OS === 'web',
    });
    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    const id = Crypto.randomUUID();
    const mimeType = asset.mimeType ?? 'image/jpeg';
    // Web has no sandbox FS; a data: URI persists in SQLite instead.
    const sourceUri =
      Platform.OS === 'web' && asset.base64
        ? `data:${mimeType};base64,${asset.base64}`
        : asset.uri;
    const uri = saveMediaFile(personId, id, sourceUri, extensionFromMimeType(mimeType, 'jpg'));
    await createMediaAttachment({ id, personId, type: 'photo', uri, mimeType });
  };

  const saveRecording = async (sourceUri: string, durationMs: number) => {
    const id = Crypto.randomUUID();
    const uri = saveMediaFile(personId, id, sourceUri, 'm4a');
    await createMediaAttachment({
      id,
      personId,
      type: 'audio',
      uri,
      durationMs,
      mimeType: 'audio/m4a',
    });
  };

  const saveStory = async (caption: string, textContent: string) => {
    await createMediaAttachment({
      personId,
      type: 'story',
      caption: caption || undefined,
      textContent,
    });
    setComposingStory(false);
  };

  const remove = async (attachment: MediaAttachment) => {
    const confirmed = await confirmAsync(
      'Delete attachment',
      'This removes it permanently from the family archive.',
    );
    if (!confirmed) return;
    deleteMediaFile(attachment.uri);
    await deleteMediaAttachment(attachment.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <Pressable style={styles.actionButton} onPress={pickPhoto}>
          <Text style={styles.actionLabel}>🖼 Add photo</Text>
        </Pressable>
        <AudioRecorderButton onRecorded={saveRecording} />
        <Pressable style={styles.actionButton} onPress={() => setComposingStory(true)}>
          <Text style={styles.actionLabel}>✍️ Add story</Text>
        </Pressable>
      </View>

      {composingStory && (
        <StoryComposer onSave={saveStory} onCancel={() => setComposingStory(false)} />
      )}

      {photos.length > 0 && (
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <Pressable key={photo.id} onLongPress={() => remove(photo)}>
              <Image
                source={{ uri: resolveMediaUri(photo.uri) }}
                style={styles.photo}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </View>
      )}

      {audio.map((clip) => (
        <AudioPlayerRow key={clip.id} attachment={clip} onDelete={() => remove(clip)} />
      ))}

      {stories.map((story) => (
        <View key={story.id} style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <Text style={styles.storyTitle}>{story.caption || 'Family story'}</Text>
            <Pressable onPress={() => remove(story)} hitSlop={8}>
              <Text style={styles.delete}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.storyBody}>{story.textContent}</Text>
        </View>
      ))}

      {media.length === 0 && !composingStory && (
        <Text style={styles.empty}>
          No photos, recordings, or stories yet. Preserve something for future generations.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: UI.card,
  },
  actionLabel: { color: UI.text, fontSize: 14 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 104, height: 104, borderRadius: 10, backgroundColor: UI.border },
  storyCard: {
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  storyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyTitle: { fontSize: 15, fontWeight: 'bold', color: UI.text },
  storyBody: { fontSize: 14, color: UI.text, lineHeight: 20 },
  delete: { color: UI.subtleText, fontSize: 16, padding: 4 },
  empty: { color: UI.subtleText, fontSize: 13, fontStyle: 'italic' },
});
