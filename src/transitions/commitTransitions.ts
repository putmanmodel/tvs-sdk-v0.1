import { COMMIT_CLASSES, type AssociativeTVSTag, type CanonicalTVSTag, type Provenance, type TVSTag } from "../types/core";
import { TransitionError } from "../types/errors";
import type { TransitionRecord } from "../records/transitionRecord";

export function promoteToCanonical(
  tag: TVSTag,
  provenance: Provenance,
  rationale = "Explicit promotion to canonical."
): { tag: CanonicalTVSTag; transition: TransitionRecord } {
  if (tag.commitClass === COMMIT_CLASSES.CANONICAL) {
    throw new TransitionError("Only associative tags can be promoted.");
  }

  const promoted: CanonicalTVSTag = {
    ...tag,
    commitClass: COMMIT_CLASSES.CANONICAL,
    provenance
  };

  return {
    tag: promoted,
    transition: {
      eventType: "PROMOTION",
      fromCommitClass: COMMIT_CLASSES.ASSOCIATIVE,
      toCommitClass: COMMIT_CLASSES.CANONICAL,
      timestamp: provenance.timestamp,
      rationale
    }
  };
}

export function demoteToAssociative(
  tag: CanonicalTVSTag,
  rationale: string,
  timestamp: string
): { tag: AssociativeTVSTag; transition: TransitionRecord } {
  if (tag.commitClass !== COMMIT_CLASSES.CANONICAL) {
    throw new TransitionError("Only canonical tags can be demoted.");
  }

  const demoted: AssociativeTVSTag = {
    domainId: tag.domainId,
    routeId: tag.routeId,
    payload: tag.payload,
    commitClass: COMMIT_CLASSES.ASSOCIATIVE,
    provenance: tag.provenance
  };

  return {
    tag: demoted,
    transition: {
      eventType: "DEMOTION",
      fromCommitClass: COMMIT_CLASSES.CANONICAL,
      toCommitClass: COMMIT_CLASSES.ASSOCIATIVE,
      timestamp,
      rationale
    }
  };
}
