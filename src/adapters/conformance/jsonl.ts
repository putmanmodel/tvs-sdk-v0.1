import { deserializeTag, serializeTag } from "../../serialize/serializeTag";
import type { TVSTag } from "../../types/core";

export function toConformanceJsonl(tags: TVSTag[]): string {
  return tags.map((tag) => serializeTag(tag)).join("\n");
}

export function fromConformanceJsonl(jsonl: string): TVSTag[] {
  return jsonl
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => deserializeTag(line));
}
