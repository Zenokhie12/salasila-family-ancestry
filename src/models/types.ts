export type LineageSide = 'root' | 'maternal' | 'paternal' | 'unknown';

/** 'parent' = unspecified/non-binary/unknown role */
export type ParentRole = 'mother' | 'father' | 'parent';

export type MediaType = 'photo' | 'audio' | 'story';

export interface Person {
  id: string;
  fullName: string;
  dateOfBirth?: string; // ISO 8601
  placeOfBirth?: string;
  currentAddress?: string;

  isDeceased?: boolean;
  dateOfDeath?: string;
  placeOfDeath?: string;

  /** true for exactly one Person: the user */
  isRoot?: boolean;
  /** cached, recomputed by lib/lineage.ts on relationship edits */
  lineage?: LineageSide;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * GEDCOM-style family unit: links 1-2 parents to an ordered list of
 * children. Spouse and sibling relations are derived from co-membership,
 * never stored directly. A unit may have 0 parents (siblings with unknown
 * parents) or 0 children (childless couple).
 */
export interface FamilyUnit {
  id: string;
  parentIds: string[];
  /** personId -> role; used only to resolve maternal/paternal traversal */
  parentRoles?: Record<string, ParentRole>;
  childIds: string[];
  marriageDate?: string;
  marriagePlace?: string;
}

export interface MediaAttachment {
  id: string;
  personId: string;
  type: MediaType;
  /**
   * Path relative to the app document directory (e.g. "media/<personId>/<id>.jpg").
   * Required for 'photo'/'audio'; absent for 'story'. Resolve with
   * lib/mediaStorage.resolveMediaUri — never store absolute URIs (the iOS
   * sandbox container path changes across app updates).
   */
  uri?: string;
  caption?: string;
  /** for type: 'story' */
  textContent?: string;
  /** for type: 'audio' */
  durationMs?: number;
  /** e.g. 'audio/m4a', 'image/jpeg' */
  mimeType?: string;
  createdAt: string;
}

/** Relations derived from FamilyUnit membership for a given person. */
export interface DerivedRelations {
  parents: Person[];
  children: Person[];
  spouses: Person[];
  siblings: Person[];
}
