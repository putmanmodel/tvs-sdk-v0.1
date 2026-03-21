#!/usr/bin/env node
import { loadRegistryFromDir } from "../schema/registry";
import { resolveTag } from "../resolve/resolveTag";
import { createReplayRecord, replayTag } from "../replay/replayRecord";
import { serializeTag } from "../serialize/serializeTag";
import { validateTag } from "../validate/validateTag";
import { COMMIT_CLASSES, type CanonicalTVSTag } from "../types/core";

function runDemo(): void {
  const registry = loadRegistryFromDir(process.cwd());

  const tag: CanonicalTVSTag = {
    domainId: "customer-support",
    routeId: "intent-resolution",
    payload: {
      confidenceBand: "high",
      intent: "refund_request"
    },
    commitClass: COMMIT_CLASSES.CANONICAL,
    provenance: {
      producerId: "tvs-sdk-demo",
      producerVersion: "0.1.0",
      domainDictVersion: registry.domains.version,
      routeDictVersion: registry.routes.version,
      timestamp: "2026-03-21T13:00:00.000Z"
    }
  };

  const resolution = resolveTag(tag, registry);
  validateTag(tag);
  const serialized = serializeTag(tag);
  const replayRecord = createReplayRecord(tag, "2026-03-21T13:00:01.000Z");
  const replayed = replayTag(replayRecord);

  console.log(
    JSON.stringify(
      {
        step: "construct -> resolve -> validate -> serialize -> replay",
        resolution,
        serialized,
        replayRecord,
        replayed
      },
      null,
      2
    )
  );
}

runDemo();
