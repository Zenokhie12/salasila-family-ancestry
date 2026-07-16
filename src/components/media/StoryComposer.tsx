import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { UI } from '../../lib/colors';

interface Props {
  onSave: (caption: string, textContent: string) => void;
  onCancel: () => void;
}

export function StoryComposer({ onSave, onCancel }: Props) {
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Story title (optional)"
        placeholderTextColor={UI.subtleText}
        value={caption}
        onChangeText={setCaption}
      />
      <TextInput
        style={styles.bodyInput}
        placeholder="Write a story, memory, or piece of family history…"
        placeholderTextColor={UI.subtleText}
        value={textContent}
        onChangeText={setTextContent}
        multiline
      />
      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, !textContent.trim() && styles.disabled]}
          disabled={!textContent.trim()}
          onPress={() => onSave(caption.trim(), textContent.trim())}
        >
          <Text style={styles.saveLabel}>Save story</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: UI.text,
  },
  bodyInput: {
    borderWidth: 1,
    borderColor: UI.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: UI.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 12 },
  cancelLabel: { color: UI.subtleText, fontSize: 14 },
  saveButton: {
    backgroundColor: UI.accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveLabel: { color: UI.onDark, fontSize: 14, fontWeight: 'bold' },
  disabled: { opacity: 0.4 },
});
