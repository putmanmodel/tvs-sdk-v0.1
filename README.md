# tvs-sdk

`tvs-sdk` is the installable representation boundary for TVS tags.

It standardizes how Tone Vector System tags are represented, parsed, resolved, validated, serialized, replayed, and transitioned between commit classes. It does not implement extraction, live inference, deviation scoring, governance routing, persistence policy, memory-tier ownership, dashboards, or network services.

This package implements the TVS representation boundary described in *Tone Vector System (TVS): A Modular Representation Layer for Interoperable Signals*.

## Scope

Version `0.1` includes:

- Typed TVS tag contracts
- Provenance-aware canonical tags
- Declared dictionary-version resolution
- Commit-class semantics for `CANONICAL` and `ASSOCIATIVE`
- Explicit promotion and demotion transition records
- Deterministic serialization and deserialization
- Minimal replay-record helpers
- Tiny CLI demo
- Tests
- Optional conformance JSONL adapter helpers

## Tag model

Every TVS tag is built from:

- `domainId`
- `routeId`
- `payload`

Payload values must be JSON-safe, including finite numbers only. `NaN`, `Infinity`, and `-Infinity` are rejected.

Canonical tags additionally require provenance:

- `producerId`
- `producerVersion`
- `domainDictVersion`
- `routeDictVersion`
- `timestamp`

Unknown domains or routes may still parse, but they resolve as non-canonical by default.

Dictionary compatibility follows semver:

- `MAJOR`: breaking
- `MINOR`: additive
- `PATCH`: editorial

## Install

```bash
npm install
npm run build
```

`package-lock.json` and the minimal `@types/node` dev dependency are included for reproducible installs and reliable compilation.

## CLI demo

```bash
npm run demo
```

The demo shows the SDK flow:

```text
construct -> resolve -> validate -> serialize -> replay
```

## Example

```ts
import {
  COMMIT_CLASSES,
  createReplayRecord,
  parseTag,
  resolveTag,
  serializeTag,
  validateTag
} from "tvs-sdk";

const tag = parseTag({
  commitClass: COMMIT_CLASSES.CANONICAL,
  domainId: "customer-support",
  routeId: "intent-resolution",
  payload: {
    intent: "refund_request"
  },
  provenance: {
    producerId: "example-producer",
    producerVersion: "0.1.0",
    domainDictVersion: "1.2.0",
    routeDictVersion: "1.1.1",
    timestamp: "2026-03-21T13:00:00.000Z"
  }
});

const registry = {
  domains: {
    dictionaryId: "tvs-domains",
    version: "1.2.0",
    entries: [{ id: "customer-support" }]
  },
  routes: {
    dictionaryId: "tvs-routes",
    version: "1.1.1",
    entries: [{ id: "intent-resolution" }]
  }
};

const resolution = resolveTag(tag, registry);
validateTag(tag);
const serialized = serializeTag(tag);
const replayRecord = createReplayRecord(tag);

console.log({ resolution, serialized, replayRecord });
```

## Public API

Main exports come from [`src/index.ts`](./src/index.ts).

Key modules:

- Parser: [`src/parser/parseTag.ts`](./src/parser/parseTag.ts)
- Resolver: [`src/resolve/resolveTag.ts`](./src/resolve/resolveTag.ts)
- Validator: [`src/validate/validateTag.ts`](./src/validate/validateTag.ts)
- Serializer: [`src/serialize/serializeTag.ts`](./src/serialize/serializeTag.ts)
- Replay helpers: [`src/replay/replayRecord.ts`](./src/replay/replayRecord.ts)
- Transition helpers: [`src/transitions/commitTransitions.ts`](./src/transitions/commitTransitions.ts)

Optional helpers remain available through subpath modules rather than the root package surface:

- Registry loader: `tvs-sdk/schema/registry`
- Semver comparison helper: `tvs-sdk/schema/semver`
- Conformance adapter: `tvs-sdk/adapters/conformance`

## Verification

- `npm run build`
- `npm test`
- `npm run demo`

## Notes

The replay helper is intentionally minimal. It preserves deterministic serialized tags for replay, but does not claim ownership of persistence or memory policy.


## Contact

Stephen A. Putman
putmanmodel@pm.me
@putmanmodel X/BlueSky
u/putmanmodel Reddit

## License

Creative Commons Attribution-NonCommercial 4.0 International Public
See full LICENSE for details. 
