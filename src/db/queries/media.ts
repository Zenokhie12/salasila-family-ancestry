import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import type { MediaAttachment } from '../../models/types';
import { db } from '../client';
import { rowToMediaAttachment } from '../mappers';
import { mediaAttachments } from '../schema';

export async function createMediaAttachment(
  input: Omit<MediaAttachment, 'id' | 'createdAt'> & { id?: string },
): Promise<MediaAttachment> {
  const attachment: MediaAttachment = {
    ...input,
    id: input.id ?? Crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await db.insert(mediaAttachments).values(attachment);
  return attachment;
}

export async function deleteMediaAttachment(id: string): Promise<void> {
  await db.delete(mediaAttachments).where(eq(mediaAttachments.id, id));
}

export async function getMediaForPerson(personId: string): Promise<MediaAttachment[]> {
  const rows = await db
    .select()
    .from(mediaAttachments)
    .where(eq(mediaAttachments.personId, personId));
  return rows.map(rowToMediaAttachment);
}
