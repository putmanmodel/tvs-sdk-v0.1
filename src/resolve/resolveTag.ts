import { COMMIT_CLASSES, type ResolutionResult, type TVSTag, type TVSRegistry } from "../types/core";
import { compareDeclaredVersion } from "../schema/semver";

export function resolveTag(tag: TVSTag, registry: TVSRegistry): ResolutionResult {
  const domainKnown = registry.domains.entries.some((entry) => entry.id === tag.domainId);
  const routeKnown = registry.routes.entries.some((entry) => entry.id === tag.routeId);

  const domainCompatibility = compareDeclaredVersion(
    tag.provenance?.domainDictVersion,
    registry.domains.version
  );
  const routeCompatibility = compareDeclaredVersion(
    tag.provenance?.routeDictVersion,
    registry.routes.version
  );

  const issues: string[] = [];

  if (!domainKnown) {
    issues.push(`Unknown domainId "${tag.domainId}".`);
  }

  if (!routeKnown) {
    issues.push(`Unknown routeId "${tag.routeId}".`);
  }

  if (domainCompatibility.level !== "COMPATIBLE") {
    issues.push(`Domain dictionary compatibility: ${domainCompatibility.reason}`);
  }

  if (routeCompatibility.level !== "COMPATIBLE") {
    issues.push(`Route dictionary compatibility: ${routeCompatibility.reason}`);
  }

  const canonical =
    tag.commitClass === COMMIT_CLASSES.CANONICAL &&
    domainKnown &&
    routeKnown &&
    domainCompatibility.level === "COMPATIBLE" &&
    routeCompatibility.level === "COMPATIBLE";

  return {
    tag,
    canonical,
    issues,
    domainKnown,
    routeKnown,
    domainCompatibility,
    routeCompatibility
  };
}
