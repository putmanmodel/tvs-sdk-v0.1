import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import * as publicApi from "../src/index";
import { loadRegistryFromDir } from "../src/schema/registry";
import {
  COMMIT_CLASSES,
  createReplayRecord,
  demoteToAssociative,
  deserializeTag,
  parseTag,
  promoteToCanonical,
  replayTag,
  resolveTag,
  serializeTag,
  validateTag
} from "../src/index";

const rootDir = join(__dirname, "..", "..");
const registry = loadRegistryFromDir(rootDir);

function readFixture(...parts: string[]): string {
  return readFileSync(join(rootDir, ...parts), "utf8");
}

test("parses and resolves a canonical fixture", () => {
  const tag = parseTag(readFixture("fixtures", "valid", "canonical-tag.json"));
  const resolution = resolveTag(tag, registry);

  assert.equal(tag.commitClass, COMMIT_CLASSES.CANONICAL);
  assert.equal(resolution.canonical, true);
  assert.deepEqual(resolution.issues, []);
});

test("unknown routes parse but do not resolve as canonical", () => {
  const tag = parseTag(readFixture("fixtures", "valid", "associative-unknown-route.json"));
  const resolution = resolveTag(tag, registry);

  assert.equal(tag.commitClass, COMMIT_CLASSES.ASSOCIATIVE);
  assert.equal(resolution.canonical, false);
  assert.equal(resolution.routeKnown, false);
});

test("canonical tags missing provenance fail parsing", () => {
  assert.throws(
    () => parseTag(readFixture("fixtures", "invalid", "bad-canonical-missing-provenance.json")),
    /Canonical tags require provenance/
  );
});

test("rejects NaN payload values", () => {
  assert.throws(
    () =>
      parseTag({
        commitClass: "ASSOCIATIVE",
        domainId: "customer-support",
        routeId: "intent-resolution",
        payload: Number.NaN
      }),
    /payload must be JSON-serializable/
  );
});

test("rejects Infinity payload values", () => {
  assert.throws(
    () =>
      parseTag({
        commitClass: "ASSOCIATIVE",
        domainId: "customer-support",
        routeId: "intent-resolution",
        payload: Number.POSITIVE_INFINITY
      }),
    /payload must be JSON-serializable/
  );
});

test("rejects invalid commit classes", () => {
  assert.throws(
    () =>
      parseTag({
        commitClass: "CANONCAL",
        domainId: "customer-support",
        routeId: "intent-resolution",
        payload: {
          intent: "refund_request"
        }
      }),
    /commitClass must be "CANONICAL" or "ASSOCIATIVE"/
  );
});

test("deterministic serialization is stable across key order", () => {
  const first = parseTag({
    commitClass: "ASSOCIATIVE",
    domainId: "customer-support",
    routeId: "intent-resolution",
    payload: {
      b: 2,
      a: 1
    }
  });
  const second = parseTag({
    routeId: "intent-resolution",
    domainId: "customer-support",
    payload: {
      a: 1,
      b: 2
    },
    commitClass: "ASSOCIATIVE"
  });

  assert.equal(serializeTag(first), serializeTag(second));
});

test("promotion and demotion emit transition records", () => {
  const associative = parseTag({
    commitClass: "ASSOCIATIVE",
    domainId: "customer-support",
    routeId: "intent-resolution",
    payload: {
      intent: "refund_request"
    }
  });

  const promoted = promoteToCanonical(associative, {
    producerId: "tests",
    producerVersion: "0.1.0",
    domainDictVersion: "1.2.0",
    routeDictVersion: "1.1.1",
    timestamp: "2026-03-21T14:00:00.000Z"
  });

  const demoted = demoteToAssociative(promoted.tag, "Manual review required.", "2026-03-21T14:05:00.000Z");

  assert.equal(promoted.transition.eventType, "PROMOTION");
  assert.equal(demoted.transition.eventType, "DEMOTION");
  assert.equal(demoted.transition.rationale, "Manual review required.");
});

test("replay records deserialize back to the original tag", () => {
  const tag = parseTag(readFixture("fixtures", "valid", "canonical-tag.json"));
  validateTag(tag);

  const record = createReplayRecord(tag, "2026-03-21T13:00:01.000Z");
  const replayed = replayTag(record);

  assert.deepEqual(replayed, deserializeTag(record.serializedTag));
  assert.equal(record.commitClass, COMMIT_CLASSES.CANONICAL);
});

test("semver major mismatches prevent canonical resolution", () => {
  const tag = parseTag({
    commitClass: "CANONICAL",
    domainId: "customer-support",
    routeId: "intent-resolution",
    payload: {
      intent: "refund_request"
    },
    provenance: {
      producerId: "tests",
      producerVersion: "0.1.0",
      domainDictVersion: "2.0.0",
      routeDictVersion: "1.1.1",
      timestamp: "2026-03-21T15:00:00.000Z"
    }
  });

  const resolution = resolveTag(tag, registry);

  assert.equal(resolution.canonical, false);
  assert.equal(resolution.domainCompatibility.level, "BREAKING");
});

test("valid canonical and associative tags still parse", () => {
  const canonical = parseTag(readFixture("fixtures", "valid", "canonical-tag.json"));
  const associative = parseTag(readFixture("fixtures", "valid", "associative-unknown-route.json"));

  assert.equal(canonical.commitClass, COMMIT_CLASSES.CANONICAL);
  assert.equal(associative.commitClass, COMMIT_CLASSES.ASSOCIATIVE);
});

test("root public API exports only the intended boundary surface", () => {
  assert.deepEqual(Object.keys(publicApi).sort(), [
    "COMMIT_CLASSES",
    "ParseError",
    "TVSError",
    "TransitionError",
    "ValidationError",
    "createReplayRecord",
    "demoteToAssociative",
    "deserializeTag",
    "parseTag",
    "promoteToCanonical",
    "replayTag",
    "resolveTag",
    "serializeTag",
    "validateTag"
  ]);
});
