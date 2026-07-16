import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { ParentRole } from '../models/types';

export const people = sqliteTable('people', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  dateOfBirth: text('date_of_birth'),
  placeOfBirth: text('place_of_birth'),
  currentAddress: text('current_address'),
  isDeceased: integer('is_deceased', { mode: 'boolean' }),
  dateOfDeath: text('date_of_death'),
  placeOfDeath: text('place_of_death'),
  isRoot: integer('is_root', { mode: 'boolean' }),
  lineage: text('lineage', { enum: ['root', 'maternal', 'paternal', 'unknown'] }),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// parentIds/childIds are JSON columns rather than a junction table: the whole
// graph is loaded into memory for tree layout anyway, and a private tree stays
// small enough that per-person SQL lookups are never the bottleneck.
export const familyUnits = sqliteTable('family_units', {
  id: text('id').primaryKey(),
  parentIds: text('parent_ids', { mode: 'json' }).$type<string[]>().notNull(),
  parentRoles: text('parent_roles', { mode: 'json' }).$type<Record<string, ParentRole>>(),
  childIds: text('child_ids', { mode: 'json' }).$type<string[]>().notNull(),
  marriageDate: text('marriage_date'),
  marriagePlace: text('marriage_place'),
});

export const mediaAttachments = sqliteTable(
  'media_attachments',
  {
    id: text('id').primaryKey(),
    personId: text('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['photo', 'audio', 'story'] }).notNull(),
    uri: text('uri'),
    caption: text('caption'),
    textContent: text('text_content'),
    durationMs: integer('duration_ms'),
    mimeType: text('mime_type'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('idx_media_person').on(table.personId)],
);
