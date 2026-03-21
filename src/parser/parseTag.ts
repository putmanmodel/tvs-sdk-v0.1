import { COMMIT_CLASSES, type TVSTag } from "../types/core";
import { ParseError } from "../types/errors";
import { isCommitClass, isPayload, isProvenance, isRecord } from "../types/guards";

export function parseTag(input: string | unknown): TVSTag {
  const value = typeof input === "string" ? parseJson(input) : input;

  if (!isRecord(value)) {
    throw new ParseError("TVS tag must be an object.");
  }

  if (!isCommitClass(value.commitClass)) {
    throw new ParseError('commitClass must be "CANONICAL" or "ASSOCIATIVE".');
  }

  const commitClass = value.commitClass;

  if (typeof value.domainId !== "string" || value.domainId.trim() === "") {
    throw new ParseError("domainId must be a non-empty string.");
  }

  if (typeof value.routeId !== "string" || value.routeId.trim() === "") {
    throw new ParseError("routeId must be a non-empty string.");
  }

  if (!isPayload(value.payload)) {
    throw new ParseError("payload must be JSON-serializable.");
  }

  if (value.provenance !== undefined && !isProvenance(value.provenance)) {
    throw new ParseError("provenance must include producer and dictionary metadata.");
  }

  if (commitClass === COMMIT_CLASSES.CANONICAL && !isProvenance(value.provenance)) {
    throw new ParseError("Canonical tags require provenance.");
  }

  return {
    domainId: value.domainId,
    routeId: value.routeId,
    payload: value.payload,
    commitClass,
    ...(value.provenance ? { provenance: value.provenance } : {})
  } as TVSTag;
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new ParseError(
      `Unable to parse TVS tag JSON: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
}
