import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Media files live under <documentDirectory>/media/<personId>/<attachmentId>.<ext>.
 * Only that relative path is stored in the DB — the iOS sandbox container path
 * changes across app updates, so absolute URIs must never be persisted.
 *
 * On web there is no sandbox file system: the source URI (a data: URI for
 * photos, a blob: URI for recordings) is stored as-is. data: URIs persist;
 * blob: URIs do not survive a reload — a known limitation of the web target.
 */

export function saveMediaFile(
  personId: string,
  attachmentId: string,
  sourceUri: string,
  extension: string,
): string {
  if (Platform.OS === 'web') return sourceUri;

  const dir = new Directory(Paths.document, 'media', personId);
  if (!dir.exists) dir.create({ intermediates: true });
  const destination = new File(dir, `${attachmentId}.${extension}`);
  new File(sourceUri).copy(destination);
  return `media/${personId}/${attachmentId}.${extension}`;
}

export function resolveMediaUri(storedUri: string | undefined): string | undefined {
  if (!storedUri) return undefined;
  if (Platform.OS === 'web') return storedUri;
  return new File(Paths.document, ...storedUri.split('/')).uri;
}

export function deleteMediaFile(storedUri: string | undefined): void {
  if (!storedUri || Platform.OS === 'web') return;
  const file = new File(Paths.document, ...storedUri.split('/'));
  if (file.exists) file.delete();
}

export function extensionFromMimeType(mimeType: string | undefined, fallback: string): string {
  if (!mimeType) return fallback;
  const subtype = mimeType.split('/')[1];
  if (!subtype) return fallback;
  return subtype === 'jpeg' ? 'jpg' : subtype;
}
