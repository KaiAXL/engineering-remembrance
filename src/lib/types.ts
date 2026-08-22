/**
 * The data contract for the whole site.
 *
 * These interfaces are the boundary. Pages and components depend on THESE, never
 * on the raw JSON shape. Today they happen to match the /data files; when a real
 * database arrives, the DB rows get mapped to these same interfaces inside
 * data.ts and nothing downstream changes. Optional (`?`) fields are the norm
 * because records are genuinely heterogeneous — a labourer's card carries
 * different facts than a birth register.
 */

export interface Photo {
  year: string;
  file: string;
  caption: string;
}

export interface BirthRecordRef {
  register?: string;
  entry?: number;
  page?: number;
  note?: string;
  citation?: string;
}

export interface CampRecord {
  board?: number;
  prisonerNumber?: number;
  registered?: string;
  block?: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  aka?: string[];
  born?: string;
  bornPlace?: string;
  bornAge?: string;
  birthRegistered?: string;
  died?: string;
  trade?: string;
  residence?: string;
  origin?: string;
  family?: string;
  note?: string;
  bio?: string;
  email?: string;
  arrest?: string;
  fate?: string;
  age1944?: number;
  children?: number | string[];
  /** People referenced by id — the relational edges. */
  parents?: string[];
  spouse?: string;
  sons?: string[];
  path?: string[];
  birthDateConflict?: string[];
  deathDateConflict?: string[];
  birthRecord?: BirthRecordRef;
  buchenwald?: CampRecord;
  photos?: Photo[];
}

export interface ArchivalRecord {
  id: string;
  type: string;
  title: string;
  /** One or the other; use getRecordsForPerson to resolve either. */
  subject?: string;
  subjects?: string[];
  image?: string;
  board?: number;
  repository?: string;
  reference?: string;
  date?: string;
  note?: string;
  fields?: Record<string, string>;
  significance?: string;
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  category: string;
  cost: string;
  costTag: 'free' | 'part';
  description: string;
  tip: string | null;
}

export interface NavItem {
  k: string;
  label: string;
  href: string;
}

export interface Quote {
  id: string;
  text: string;
  attribution: string;
}
