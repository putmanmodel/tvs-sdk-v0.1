import type { CommitClass } from "../types/core";

export interface TransitionRecord {
  eventType: "PROMOTION" | "DEMOTION";
  fromCommitClass: CommitClass;
  toCommitClass: CommitClass;
  timestamp: string;
  rationale: string;
}
