import { COMMIT_CLASSES, type TVSTag } from "../types/core";
import { ValidationError } from "../types/errors";

export function validateTag(tag: TVSTag): void {
  if (!tag.domainId.trim()) {
    throw new ValidationError("domainId must not be empty.");
  }

  if (!tag.routeId.trim()) {
    throw new ValidationError("routeId must not be empty.");
  }

  if (tag.commitClass === COMMIT_CLASSES.CANONICAL) {
    if (!tag.provenance) {
      throw new ValidationError("Canonical tags require provenance.");
    }

    if (Number.isNaN(Date.parse(tag.provenance.timestamp))) {
      throw new ValidationError("provenance.timestamp must be a valid ISO-8601 timestamp.");
    }
  }

  if (tag.provenance && Number.isNaN(Date.parse(tag.provenance.timestamp))) {
    throw new ValidationError("provenance.timestamp must be a valid ISO-8601 timestamp.");
  }
}
