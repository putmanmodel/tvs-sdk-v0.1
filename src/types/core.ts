export const COMMIT_CLASSES = {
  CANONICAL: "CANONICAL",
  ASSOCIATIVE: "ASSOCIATIVE"
} as const;

export type CommitClass = (typeof COMMIT_CLASSES)[keyof typeof COMMIT_CLASSES];

export interface Provenance {
  producerId: string;
  producerVersion: string;
  domainDictVersion: string;
  routeDictVersion: string;
  timestamp: string;
}

export type TVSPayload =
  | null
  | boolean
  | number
  | string
  | TVSPayload[]
  | { [key: string]: TVSPayload };

export interface TVSTagBase {
  domainId: string;
  routeId: string;
  payload: TVSPayload;
}

export interface CanonicalTVSTag extends TVSTagBase {
  commitClass: typeof COMMIT_CLASSES.CANONICAL;
  provenance: Provenance;
}

export interface AssociativeTVSTag extends TVSTagBase {
  commitClass: typeof COMMIT_CLASSES.ASSOCIATIVE;
  provenance?: Provenance;
}

export type TVSTag = CanonicalTVSTag | AssociativeTVSTag;

export interface DictionaryEntry {
  id: string;
  description?: string;
}

export interface DictionaryManifest {
  dictionaryId: string;
  version: string;
  entries: DictionaryEntry[];
}

export interface TVSRegistry {
  domains: DictionaryManifest;
  routes: DictionaryManifest;
}

export type CompatibilityLevel = "COMPATIBLE" | "AHEAD" | "BREAKING" | "INVALID";

export interface CompatibilityResult {
  declaredVersion?: string;
  registryVersion: string;
  level: CompatibilityLevel;
  reason?: string;
}

export interface ResolutionResult {
  tag: TVSTag;
  canonical: boolean;
  issues: string[];
  domainKnown: boolean;
  routeKnown: boolean;
  domainCompatibility: CompatibilityResult;
  routeCompatibility: CompatibilityResult;
}
