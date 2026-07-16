import type { FamilyUnit, MediaAttachment, Person } from '../models/types';
import type { familyUnits, mediaAttachments, people } from './schema';

/** SQLite rows use null; the domain model uses optional fields. */
const opt = <T>(value: T | null): T | undefined => value ?? undefined;

export function rowToPerson(row: typeof people.$inferSelect): Person {
  return {
    id: row.id,
    fullName: row.fullName,
    dateOfBirth: opt(row.dateOfBirth),
    placeOfBirth: opt(row.placeOfBirth),
    currentAddress: opt(row.currentAddress),
    isDeceased: opt(row.isDeceased),
    dateOfDeath: opt(row.dateOfDeath),
    placeOfDeath: opt(row.placeOfDeath),
    isRoot: opt(row.isRoot),
    lineage: opt(row.lineage),
    notes: opt(row.notes),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function rowToFamilyUnit(row: typeof familyUnits.$inferSelect): FamilyUnit {
  return {
    id: row.id,
    parentIds: row.parentIds,
    parentRoles: opt(row.parentRoles),
    childIds: row.childIds,
    marriageDate: opt(row.marriageDate),
    marriagePlace: opt(row.marriagePlace),
  };
}

export function rowToMediaAttachment(row: typeof mediaAttachments.$inferSelect): MediaAttachment {
  return {
    id: row.id,
    personId: row.personId,
    type: row.type,
    uri: opt(row.uri),
    caption: opt(row.caption),
    textContent: opt(row.textContent),
    durationMs: opt(row.durationMs),
    mimeType: opt(row.mimeType),
    createdAt: row.createdAt,
  };
}
