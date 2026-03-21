import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { DictionaryManifest, TVSRegistry } from "../types/core";

function loadManifest(path: string): DictionaryManifest {
  return JSON.parse(readFileSync(path, "utf8")) as DictionaryManifest;
}

export function loadRegistryFromDir(rootDir: string): TVSRegistry {
  return {
    domains: loadManifest(join(rootDir, "manifests", "domains", "default.json")),
    routes: loadManifest(join(rootDir, "manifests", "routes", "default.json"))
  };
}
