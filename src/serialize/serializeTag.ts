import type { TVSTag } from "../types/core";
import { parseTag } from "../parser/parseTag";
import { deterministicStringify } from "./canonicalJson";

export function serializeTag(tag: TVSTag): string {
  return deterministicStringify(tag);
}

export function deserializeTag(input: string): TVSTag {
  return parseTag(input);
}
