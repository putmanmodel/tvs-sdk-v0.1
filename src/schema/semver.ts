import type { CompatibilityResult } from "../types/core";

interface SemverParts {
  major: number;
  minor: number;
  patch: number;
}

function parseSemver(version: string): SemverParts | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());

  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

export function compareDeclaredVersion(
  declaredVersion: string | undefined,
  registryVersion: string
): CompatibilityResult {
  if (!declaredVersion) {
    return {
      declaredVersion,
      registryVersion,
      level: "INVALID",
      reason: "Missing declared dictionary version."
    };
  }

  const declared = parseSemver(declaredVersion);
  const registry = parseSemver(registryVersion);

  if (!declared || !registry) {
    return {
      declaredVersion,
      registryVersion,
      level: "INVALID",
      reason: "Dictionary versions must use MAJOR.MINOR.PATCH semver."
    };
  }

  if (declared.major !== registry.major) {
    return {
      declaredVersion,
      registryVersion,
      level: "BREAKING",
      reason: "MAJOR version mismatch is breaking."
    };
  }

  if (declared.minor > registry.minor) {
    return {
      declaredVersion,
      registryVersion,
      level: "AHEAD",
      reason: "Declared MINOR version is newer than the registry."
    };
  }

  if (declared.minor < registry.minor) {
    return {
      declaredVersion,
      registryVersion,
      level: "COMPATIBLE",
      reason: "Declared MINOR version is older but still compatible."
    };
  }

  if (declared.patch > registry.patch) {
    return {
      declaredVersion,
      registryVersion,
      level: "AHEAD",
      reason: "Declared PATCH version is newer than the registry."
    };
  }

  return {
    declaredVersion,
    registryVersion,
    level: "COMPATIBLE",
    reason: "Declared version is compatible with the registry."
  };
}
