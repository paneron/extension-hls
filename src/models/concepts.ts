import { StandardRef, StandardClause } from './standards';
import { WithRevisions } from './revisions';
import {
  AuthoritativeLanguage,
  OptionalLanguage,
  SupportedLanguage,
} from './lang';

/* Concepts */

export const PARENT_RELATIONSHIP = 'parent' as const;

export type ConceptRelation = { type: string; to: ConceptRef };
// Stored in the database

export type IncomingConceptRelation = { type: string; from: ConceptRef };
// Inferred at runtime

export type MultiLanguageConcept<Ref extends ConceptRef> = {
  termid: Ref;

  parent?: Ref;
  // Domain or subject.

  relations?: ConceptRelation[];
  eng: WithRevisions<Concept<Ref, AuthoritativeLanguage>>;
  // English is required, others optional
} & _Concepts<Ref>;

export type _Concepts<Ref extends ConceptRef> = {
  [Lang in OptionalLanguage]?: WithRevisions<Concept<Ref, Lang>>;
};

export const LIFECYCLE_STAGES = [
  'Proposal',
  'Evaluation',
  'Validation',
  'Rejected',
  'Withdrawn',
  'Resolved',
  'Extended procedure',
  'Test',
  'Draft',
] as const;

export type LifecycleStage = typeof LIFECYCLE_STAGES[number];

export interface Concept<
  Ref extends ConceptRef,
  Lang extends SupportedLanguage
> {
  id: Ref;
  language_code: Lang;
  entry_status: ConceptStatus;

  lifecycle_stage?: LifecycleStage;

  terms: Designation[];

  domain?: string;
  // Legacy.

  //subject_field: SubjectFieldLabel

  usageInfo?: string;

  // Superfluous in current data schema,
  // which allows only one designation per concept,
  // which would hence be the preferred one.
  // When designations are decoupled from concept,
  // there may be preferred and non-preferred designations.
  //is_preferred: boolean

  definition: string;
  notes: Note[];
  examples: Example[];

  // These apply to the definition.

  authoritative_source: AuthoritativeSource;
  // Can be set

  //lineage_source: LineageSource

  // Date concept was first introduced?
  date_accepted?: Date;

  // ?
  release?: string;

  // Deprecated:

  //classification?: 'preferred'

  review_date?: Date;
  review_status?: string;
  review_decision?: 'accepted' | 'rejected';

  lineage_source?: string;
  lineage_source_similarity?: number;
}

interface AuthoritativeSourceRelationship {
  type: 'identical' | 'modified';
  modificiation?: string;
}

export type AuthoritativeSource = {
  // All are optional, but either ref & clause or link must be present
  ref?: StandardRef;
  clause?: StandardClause;
  link?: string;
  original?: string;
  relationship?: AuthoritativeSourceRelationship;
};

export type SubjectFieldLabel = string;

type Note = string;
// Rich text

type Example = string;
// Rich text

type ConceptStatus = 'retired' | 'valid' | 'superseded' | 'proposed';

export type ConceptRef = number;

// Misc.

export interface ConceptCollection {
  id: string;
  // ID is global across all collections,
  // regardless of nesting

  creatorEmail?: string;

  parentID?: string;
  // May not be supported in the widget initially.

  label: string;
  items: ConceptRef[];
}

// type GitHash = string;

/* Designations */

export type Designation = {
  designation: string;
  normative_status?: NormativeStatus;
} & TypedDesignation;

export const NORMATIVE_STATUS_CHOICES = [
  'preferred',
  'admitted',
  'deprecated',
] as const;
export type NormativeStatus = typeof NORMATIVE_STATUS_CHOICES[number];

export type TypedDesignation = Symbol | Expression | Prefix;
export const DESIGNATION_TYPES = [
  'expression',
  'symbol',
  'prefix',
  // IMPORTANT: Changing order of designation types REQUIRES changing corresponding types following
] as const;
export type DesignationType = typeof DESIGNATION_TYPES[number];
type Symbol = { type: typeof DESIGNATION_TYPES[1] };
type Prefix = { type: typeof DESIGNATION_TYPES[2] };
export type Expression = { type: typeof DESIGNATION_TYPES[0] } & Usage &
  Grammar;

type Usage = {
  geographicalArea?: string;
};

type Grammar = {
  alternateForms?: string[];
  // NOT synonyms; variations of number/tense etc.
  isAbbreviation?: true;
} & (Noun | Verb | Adjective | Adverb | { partOfSpeech?: undefined });
// {} is for unknown part of speech.

export type Noun = {
  partOfSpeech: 'noun';

  grammaticalNumber?: 'plural' | 'singular' | 'mass';
  // Doesn’t have to be explicit for singulars, unless circumstances require

  gender?: 'masculine' | 'feminine' | 'common' | 'neuter';
};

type Verb = {
  partOfSpeech: 'verb';
};

type MaybeParticiple = {
  isParticiple?: true;
};

type Adjective = MaybeParticiple & {
  partOfSpeech: 'adjective';
};

type Adverb = MaybeParticiple & {
  partOfSpeech: 'adverb';
};
