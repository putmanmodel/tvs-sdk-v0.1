import { createHash } from "node:crypto";

import type { CommitClass, TVSTag } from "../types/core";
import { deserializeTag, serializeTag } from "../serialize/serializeTag";

export interface ReplayRecord {
  eventType: "TVS_REPLAY_RECORD";
  commitClass: CommitClass;
  domainId: string;
  routeId: string;
  createdAt: string;
  serializedTag: string;
  digest: string;
}

export function createReplayRecord(tag: TVSTag, createdAt = new Date().toISOString()): ReplayRecord {
  const serializedTag = serializeTag(tag);

  return {
    eventType: "TVS_REPLAY_RECORD",
    commitClass: tag.commitClass,
    domainId: tag.domainId,
    routeId: tag.routeId,
    createdAt,
    serializedTag,
    digest: createHash("sha256").update(serializedTag).digest("hex")
  };
}

export function replayTag(record: ReplayRecord): TVSTag {
  return deserializeTag(record.serializedTag);
}
