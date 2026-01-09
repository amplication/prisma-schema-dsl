# 🤖 AGENTS GUIDE · prisma-schema-dsl

## 📦 Project Overview
- **Purpose:** TypeScript helpers for building Prisma Schema ASTs (`createSchema`, model/enum/field/data source builders) plus a high-fidelity `print` formatter backed by `@prisma/internals` (`src/print.ts`).
- **Usage surface:** Consumers import from `src/index.ts` (re-export barrel) to compose schemas programmatically, then call `print(schema)` to emit formatted `.prisma` files (see `readme.md`).
- **Key guarantees:** Strict validation for identifiers, modifiers, attributes, and scalar defaults before emitting schemas; MongoDB-specific defaults and relation metadata are handled to match Prisma expectations.

## 🗂️ Repository Structure
- `src/index.ts` – Public entry point exporting builder helpers and the `print` API.
- `src/builders.ts` – Core factory/validation logic for schemas, models, enums, scalar/object fields, data sources, and generators.
- `src/print.ts` – Converts AST nodes to Prisma SDL strings, adds documentation blocks, relation attributes, MongoDB overrides, and calls `formatSchema`.
- `src/print.spec.ts` – Jest coverage for `print*` helpers, including relation formatting, documentation insertion, MongoDB defaults, and modifier ordering.
- `src/builders.spec.ts` – Guards against invalid combinations (e.g., optional lists) across scalar and object fields.
- `.github/workflows/nodejs.yaml` – "Node.js CI" pipeline enforcing install → format check → tests → build on Node 12.x.
- `readme.md` – Installation/API quickstart plus development checklist (npm@7, `npm install`, `npm test`).
- `package.json` – Scripts (`build`, `test`, `format`, `check-format`, `prepare`) and dependency versions.
- `tsconfig.json` – Emits compiled artifacts into `dist/` (generated output; **never edit files inside `dist/` manually**).

## 🧑‍💻 Development Workflow & Tooling
- **Runtime/tooling:** Node.js 12.x (mirrors CI) with npm ≥ 7 (`readme.md`). TypeScript 4.1.3 compiles sources into `dist/` via `npm run build` (tsc).
- **Dependencies:** Runtime: `@prisma/internals`, `lodash.isempty`, `typescript`. Dev/test: `jest`, `ts-jest`, `prettier`, `prisma-schema-dsl-types`, `@types/jest`, `ts-toolbelt` (`package.json`).
- **Scripts:**
  - `npm run format` → `prettier --write src`
  - `npm run check-format` → `prettier --check src`
  - `npm test` → Jest with `ts-jest` preset (Node environment, ignores `dist/`)
  - `npm run build` → TypeScript compile
  - `npm run prepare` → Invokes build before publish (via npm lifecycle)
- **GitHub Actions:** Workflow caches npm modules, then runs `npm ci`, `npm run check-format`, `npm test`, `npm run build` (see `.github/workflows/nodejs.yaml`). Keep local flow consistent.

## 🧠 Code Patterns & Conventions
- **Validation-first builders (`src/builders.ts`):**
  - `validateName` enforces `/[A-Za-z][A-Za-z0-9_]*/` across models, enums, and fields.
  - `validateModifiers` prevents optional lists (throws `OPTIONAL_LIST_ERROR_MESSAGE`).
  - Attribute helpers (`validateAndPrepareModelAttributes`, `validateAndPrepareFieldAttributes`) ensure model attributes start with `@@` and field attributes with `@`, trimming and sanitizing string inputs.
  - `validateScalarDefault` guards each scalar type (string/UUID/CUID, boolean, numeric types, `AUTO_INCREMENT`, `NOW`, JSON string, etc.).
- **Printing conventions (`src/print.ts`):**
  - `printModel` injects documentation, `@@map`, and field strings; `printModelAttributes` ensures blank lines are preserved.
  - `printScalarField` decorates IDs/foreign keys with `@id`, `@map("_id")`, `@db.ObjectId`, `@default(...)` while preventing duplicate attributes.
  - Relation handling uses `printObjectField`, dynamic `@relation` assembly (name/fields/references, `onDelete`/`onUpdate`).
  - `print` always funnels through `formatSchema` from `@prisma/internals`; keep ASTs valid to avoid formatting errors.
- **Testing style:** Jest specs (`src/*.spec.ts`) use fixtures/constants plus `test.each` tables to cover enumerations, documentation overlays, MongoDB-specific logic, and guard clauses.

## ✅ Quality Standards
- **Formatting:** Prettier (`npm run check-format`) must pass locally before opening a PR. CI fails if formatting drifts.
- **Testing:** `npm test` must succeed; specs assert validation errors (builders) and rendering accuracy (print).
- **Build artifacts:** `npm run build` should emit clean `dist/` output with no manual edits. Commit only source changes.
- **CI parity:** Follow `.github/workflows/nodejs.yaml` order (install → format check → tests → build) to match automated gating.
- **Validation discipline:** Never bypass builder guards or emit user-provided attribute strings without running through the prefix validators.

## 🛠️ Common Tasks & Commands
1. **Install dependencies (requires npm@7):**
   ```bash
   npm install
   ```
2. **Check formatting without modifying files:**
   ```bash
   npm run check-format
   ```
3. **Auto-format sources before committing:**
   ```bash
   npm run format
   ```
4. **Run the Jest suite:**
   ```bash
   npm test
   ```
5. **Build TypeScript output (updates `dist/`):**
   ```bash
   npm run build
   ```
6. **Add a new schema helper:**
   - Extend `src/builders.ts` or `src/print.ts` with the required factory logic.
   - Enforce naming/modifier rules via `validateName`, `validateModifiers`, attribute validators.
   - Export from `src/index.ts` if part of the public API.
   - Cover behavior in the relevant spec (`src/builders.spec.ts` or `src/print.spec.ts`).
7. **Update documentation/tests when behavior changes:**
   - Adjust `readme.md` API notes if signatures change.
   - Update fixtures/constants in specs and rerun `npm test`.
   - Re-run `npm run check-format` and `npm run build` before opening a PR.

## 📚 Reference Examples
- **Simple export structure:** `src/index.ts` shows the barrel export pattern for builders and `print`.
- **Complex logic:** `src/print.ts` demonstrates relation rendering, MongoDB-specific modifiers, and integration with `@prisma/internals`.
- **Validation-focused tests:** `src/builders.spec.ts` covers modifier guards; `src/print.spec.ts` exercises formatter outputs via table-driven tests.
- **CI configuration:** `.github/workflows/nodejs.yaml` documents the required pipeline order and tooling versions.

## 🔗 Additional Resources / Links
- [`readme.md`](./readme.md) – Official installation, API, and development notes.
- [npm: prisma-schema-dsl](https://www.npmjs.com/package/prisma-schema-dsl) – Published package details.
- [Prisma Schema docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema) – Authoritative reference for schema syntax validated/printed by this library.
