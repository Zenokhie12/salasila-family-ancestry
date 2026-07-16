import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '../db/client';
import { rowToFamilyUnit, rowToMediaAttachment, rowToPerson } from '../db/mappers';
import { familyUnits, mediaAttachments, people } from '../db/schema';
import type { FamilyUnit, MediaAttachment, Person } from '../models/types';

/** Live queries re-run automatically on any write to the underlying table. */

export function usePeople(): Person[] {
  const { data } = useLiveQuery(db.select().from(people));
  return useMemo(() => (data ?? []).map(rowToPerson), [data]);
}

export function usePerson(id: string): Person | undefined {
  const { data } = useLiveQuery(db.select().from(people).where(eq(people.id, id)), [id]);
  return useMemo(() => (data?.[0] ? rowToPerson(data[0]) : undefined), [data]);
}

export function useFamilyUnits(): FamilyUnit[] {
  const { data } = useLiveQuery(db.select().from(familyUnits));
  return useMemo(() => (data ?? []).map(rowToFamilyUnit), [data]);
}

export function useMediaForPerson(personId: string): MediaAttachment[] {
  const { data } = useLiveQuery(
    db.select().from(mediaAttachments).where(eq(mediaAttachments.personId, personId)),
    [personId],
  );
  return useMemo(() => (data ?? []).map(rowToMediaAttachment), [data]);
}
