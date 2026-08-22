/**
 * Data-access layer — the ONLY module that knows where data physically lives.
 *
 * Today: reads the JSON files in /data, baked into the static build at build time.
 * Tomorrow: the bodies below become Supabase/Postgres queries. Because every
 * accessor is already async and returns the typed interfaces from ./types, that
 * migration is a body swap — pages, components, and routes never change.
 *
 * Rule: nothing outside this file imports from '@data/*'. Everything else imports
 * the typed accessors here.
 */

import peopleJson from '@data/people.json';
import recordsJson from '@data/records.json';
import repositoriesJson from '@data/repositories.json';
import siteContent from '@data/site-content.json';
import mapSites from '@data/map-sites.json';
import journeys from '@data/journeys.json';

import type {
  Person,
  ArchivalRecord,
  Repository,
  NavItem,
  Quote,
} from './types';

// Cast the raw JSON to the contract. This is the single seam between the storage
// format and the typed domain model — the one place a DB mapper would slot in.
const people = peopleJson as Person[];
const records = recordsJson as ArchivalRecord[];
const repositories = repositoriesJson as Repository[];

// ---- Site-wide content -------------------------------------------------------

export async function getSite() {
  return siteContent.site;
}

export async function getNavigation(): Promise<NavItem[]> {
  return siteContent.navigation as NavItem[];
}

export async function getPrimaryQuote(): Promise<Quote> {
  return siteContent.quotes[0] as Quote;
}

export async function getStandard(): Promise<string> {
  return siteContent.standard;
}

// ---- Repositories (the Databases page) --------------------------------------

export async function getRepositories(): Promise<Repository[]> {
  return repositories;
}

/** Repositories grouped by `category`, preserving first-seen order. */
export async function getRepositoriesByCategory(): Promise<
  { category: string; items: Repository[] }[]
> {
  const groups: { category: string; items: Repository[] }[] = [];
  for (const repo of repositories) {
    let group = groups.find((g) => g.category === repo.category);
    if (!group) {
      group = { category: repo.category, items: [] };
      groups.push(group);
    }
    group.items.push(repo);
  }
  return groups;
}

// ---- People -----------------------------------------------------------------

export async function getPeople(): Promise<Person[]> {
  return people;
}

export async function getPerson(id: string): Promise<Person | undefined> {
  return people.find((p) => p.id === id);
}

/** Resolve a list of person ids to full records, dropping any that don't exist. */
export async function getPeopleByIds(ids: string[] | undefined): Promise<Person[]> {
  if (!ids) return [];
  return ids
    .map((id) => people.find((p) => p.id === id))
    .filter((p): p is Person => p !== undefined);
}

// ---- Records ----------------------------------------------------------------

export async function getRecords(): Promise<ArchivalRecord[]> {
  return records;
}

/** Records whose `subject` or `subjects[]` includes the given person id. */
export async function getRecordsForPerson(personId: string): Promise<ArchivalRecord[]> {
  return records.filter(
    (r) => r.subject === personId || (r.subjects?.includes(personId) ?? false),
  );
}

// ---- Editorial content (case, method, brief) --------------------------------

/** The Case page: narrative steps, conflicts, negatives, and the standard. */
export async function getCaseStudy() {
  return {
    steps: siteContent.caseSteps,
    conflicts: siteContent.conflicts,
    negativeResults: siteContent.negativeResults,
    standard: siteContent.standard,
  };
}

/** The Method page: the ordered steps and the two governing rules. */
export async function getMethod() {
  return {
    steps: siteContent.methodSteps,
    rules: siteContent.methodRules,
  };
}

/** The one-page Research Brief. */
export async function getBrief() {
  return siteContent.brief;
}

/** Audio clips (Helen's testimony and interview excerpts). */
export async function getAudioClips() {
  return siteContent.audioClips;
}

// ---- Map & journeys ---------------------------------------------------------

export async function getMapSites() {
  return mapSites;
}

export async function getJourneys() {
  return journeys;
}
