import type { ParentRole, Person } from '../models/types';
import {
  createFamilyUnit,
  getAllFamilyUnits,
  removePersonFromAllUnits,
  updateFamilyUnit,
} from '../db/queries/familyUnits';
import { deleteMediaAttachment, getMediaForPerson } from '../db/queries/media';
import {
  createPerson,
  deletePerson,
  getAllPeople,
  updatePerson,
  type NewPerson,
} from '../db/queries/people';
import { computeLineages } from './lineage';
import { deleteMediaFile } from './mediaStorage';

export type RelationType = 'parent' | 'child' | 'spouse' | 'sibling';

/** Adds a parent to the child's birth unit, creating the unit if needed. */
export async function linkParent(
  childId: string,
  parentId: string,
  role?: ParentRole,
): Promise<void> {
  const units = await getAllFamilyUnits();
  const birthUnit = units.find((u) => u.childIds.includes(childId));

  if (!birthUnit) {
    await createFamilyUnit({
      parentIds: [parentId],
      parentRoles: role ? { [parentId]: role } : undefined,
      childIds: [childId],
    });
    return;
  }
  if (birthUnit.parentIds.includes(parentId)) return;
  if (birthUnit.parentIds.length >= 2) {
    throw new Error('This person already has two recorded parents.');
  }
  await updateFamilyUnit(birthUnit.id, {
    parentIds: [...birthUnit.parentIds, parentId],
    parentRoles: role
      ? { ...birthUnit.parentRoles, [parentId]: role }
      : birthUnit.parentRoles,
  });
}

/** Adds a child to the parent's first family unit, creating one if needed. */
export async function linkChild(parentId: string, childId: string): Promise<void> {
  const units = await getAllFamilyUnits();
  if (units.some((u) => u.parentIds.includes(parentId) && u.childIds.includes(childId))) return;

  const unit = units.find((u) => u.parentIds.includes(parentId));
  if (unit) {
    await updateFamilyUnit(unit.id, { childIds: [...unit.childIds, childId] });
  } else {
    await createFamilyUnit({ parentIds: [parentId], childIds: [childId] });
  }
}

/** Marries two people: joins an existing single-parent unit or creates a childless one. */
export async function linkSpouse(personId: string, spouseId: string): Promise<void> {
  const units = await getAllFamilyUnits();
  if (units.some((u) => u.parentIds.includes(personId) && u.parentIds.includes(spouseId))) return;

  const soloUnit = units.find((u) => u.parentIds.length === 1 && u.parentIds[0] === personId);
  if (soloUnit) {
    await updateFamilyUnit(soloUnit.id, { parentIds: [...soloUnit.parentIds, spouseId] });
  } else {
    await createFamilyUnit({ parentIds: [personId, spouseId], childIds: [] });
  }
}

/** Adds a sibling into the person's birth unit; without one, creates a parentless unit. */
export async function linkSibling(personId: string, siblingId: string): Promise<void> {
  const units = await getAllFamilyUnits();
  const birthUnit = units.find((u) => u.childIds.includes(personId));
  if (birthUnit) {
    if (!birthUnit.childIds.includes(siblingId)) {
      await updateFamilyUnit(birthUnit.id, { childIds: [...birthUnit.childIds, siblingId] });
    }
  } else {
    await createFamilyUnit({ parentIds: [], childIds: [personId, siblingId] });
  }
}

/** Recomputes the maternal/paternal cache for everyone and persists changes. */
export async function recomputeLineages(): Promise<void> {
  const [people, units] = await Promise.all([getAllPeople(), getAllFamilyUnits()]);
  const lineages = computeLineages(people, units);
  for (const person of people) {
    const next = lineages.get(person.id) ?? 'unknown';
    if ((person.lineage ?? 'unknown') !== next) {
      await updatePerson(person.id, { lineage: next });
    }
  }
}

/** Creates a person and links them to an existing member in one operation. */
export async function addRelative(
  input: NewPerson,
  anchorId: string,
  relation: RelationType,
  parentRole?: ParentRole,
): Promise<Person> {
  const person = await createPerson(input);
  switch (relation) {
    case 'parent':
      await linkParent(anchorId, person.id, parentRole);
      break;
    case 'child':
      await linkChild(anchorId, person.id);
      break;
    case 'spouse':
      await linkSpouse(anchorId, person.id);
      break;
    case 'sibling':
      await linkSibling(anchorId, person.id);
      break;
  }
  await recomputeLineages();
  return person;
}

/** Deletes a person plus their media files, unit memberships, and lineage cache impact. */
export async function removePerson(personId: string): Promise<void> {
  const media = await getMediaForPerson(personId);
  for (const attachment of media) {
    deleteMediaFile(attachment.uri);
    await deleteMediaAttachment(attachment.id);
  }
  await removePersonFromAllUnits(personId);
  await deletePerson(personId);
  await recomputeLineages();
}
