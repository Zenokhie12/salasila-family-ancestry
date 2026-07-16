import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import type { FamilyUnit } from '../../models/types';
import { db } from '../client';
import { rowToFamilyUnit } from '../mappers';
import { familyUnits } from '../schema';

export async function createFamilyUnit(input: Omit<FamilyUnit, 'id'>): Promise<FamilyUnit> {
  const unit: FamilyUnit = { ...input, id: Crypto.randomUUID() };
  await db.insert(familyUnits).values(unit);
  return unit;
}

export async function updateFamilyUnit(
  id: string,
  changes: Partial<Omit<FamilyUnit, 'id'>>,
): Promise<void> {
  await db.update(familyUnits).set(changes).where(eq(familyUnits.id, id));
}

export async function deleteFamilyUnit(id: string): Promise<void> {
  await db.delete(familyUnits).where(eq(familyUnits.id, id));
}

export async function getAllFamilyUnits(): Promise<FamilyUnit[]> {
  const rows = await db.select().from(familyUnits);
  return rows.map(rowToFamilyUnit);
}

/** Removes a person from every unit they appear in; deletes units left empty. */
export async function removePersonFromAllUnits(personId: string): Promise<void> {
  const units = await getAllFamilyUnits();
  for (const unit of units) {
    if (!unit.parentIds.includes(personId) && !unit.childIds.includes(personId)) continue;

    const parentIds = unit.parentIds.filter((id) => id !== personId);
    const childIds = unit.childIds.filter((id) => id !== personId);
    const parentRoles = { ...unit.parentRoles };
    delete parentRoles[personId];

    // A unit that no longer relates two people carries no information.
    if (parentIds.length + childIds.length < 2) {
      await deleteFamilyUnit(unit.id);
    } else {
      await updateFamilyUnit(unit.id, { parentIds, childIds, parentRoles });
    }
  }
}
