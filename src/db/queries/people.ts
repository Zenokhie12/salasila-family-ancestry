import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import type { LineageSide, Person } from '../../models/types';
import { db } from '../client';
import { rowToPerson } from '../mappers';
import { people } from '../schema';

export type NewPerson = Omit<Person, 'id' | 'createdAt' | 'updatedAt'>;

/** null explicitly clears a field; undefined leaves it untouched. */
export type PersonUpdate = Partial<{
  fullName: string;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  currentAddress: string | null;
  isDeceased: boolean | null;
  dateOfDeath: string | null;
  placeOfDeath: string | null;
  isRoot: boolean | null;
  lineage: LineageSide | null;
  notes: string | null;
}>;

export async function createPerson(input: NewPerson): Promise<Person> {
  const now = new Date().toISOString();
  const person: Person = {
    ...input,
    id: Crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(people).values(person);
  return person;
}

export async function updatePerson(id: string, changes: PersonUpdate): Promise<void> {
  await db
    .update(people)
    .set({ ...changes, updatedAt: new Date().toISOString() })
    .where(eq(people.id, id));
}

export async function deletePerson(id: string): Promise<void> {
  await db.delete(people).where(eq(people.id, id));
}

export async function getPerson(id: string): Promise<Person | undefined> {
  const row = await db.query.people.findFirst({ where: eq(people.id, id) });
  return row ? rowToPerson(row) : undefined;
}

export async function getAllPeople(): Promise<Person[]> {
  const rows = await db.select().from(people);
  return rows.map(rowToPerson);
}

export async function getRootPerson(): Promise<Person | undefined> {
  const row = await db.query.people.findFirst({ where: eq(people.isRoot, true) });
  return row ? rowToPerson(row) : undefined;
}
