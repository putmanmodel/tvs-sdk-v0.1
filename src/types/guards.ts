import { COMMIT_CLASSES, type Provenance, type TVSPayload } from "./core";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPayload(value: unknown): value is TVSPayload {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isPayload);
  }

  if (isRecord(value)) {
    return Object.values(value).every(isPayload);
  }

  return false;
}

export function isCommitClass(value: unknown): value is (typeof COMMIT_CLASSES)[keyof typeof COMMIT_CLASSES] {
  return value === COMMIT_CLASSES.CANONICAL || value === COMMIT_CLASSES.ASSOCIATIVE;
}

export function isProvenance(value: unknown): value is Provenance {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.producerId === "string" &&
    typeof value.producerVersion === "string" &&
    typeof value.domainDictVersion === "string" &&
    typeof value.routeDictVersion === "string" &&
    typeof value.timestamp === "string"
  );
}
