# AGENTS Guide

## 🚀 Project Overview
- **Repository:** `amplication/prisma-schema-dsl`
- **Purpose:** Provide a TypeScript/Node.js interface for constructing Prisma schema ASTs via strongly validated builders (`src/builders.ts`) and for printing those ASTs into formatted `.prisma` files (`src/print.ts`).
- **Primary consumers:** Tooling and code generators that need to author Prisma schemas programmatically while benefiting from Prisma's `formatSchema` output.
- **Language & runtime:** TypeScript compiled to CommonJS (`tsconfig.json`) targeting Node.js (CI uses Node 12.x).

## 🗂️ Repository Structure
| Path | Description |
| --- | --- |
| `src/` | Runtime source and colocated Jest specs. Includes `builders.ts`, `print.ts`, `index.ts`, and their `*.spec.ts` files.
| `assets/hero.png` | Branding image referenced in the README badge section.
| `.github/workflows/nodejs.yaml` | GitHub Actions pipeline that runs install → lint/format check → tests → build.
| `package.json` / `package-lock.json` | npm metadata plus script definitions (`build`, `test`, `format`, `check-format`, `prepare`).
| `tsconfig.json` | Strict TypeScript compiler configuration emitting declarations to `dist/` with incremental builds enabled.
| `readme.md` | Public overview, installation instructions, and API surface summary for builders/print helpers.

## 🛠️ Tooling & Commands
Use npm@7 as noted in `readme.md` before installing dependencies.

```bash
npm install        # install dependencies after cloning
npm run build      # compile TypeScript via tsc (outputs to dist/)
npm test           # execute Jest test suite through ts-jest
npm run format     # apply Prettier formatting to src/
npm run check-format  # verify formatting without modifying files
npm run prepare    # build step wired into npm lifecycle (runs tsc)
```

## 🔁 Development Workflow
1. **Bootstrap:** Clone, ensure `npm@7`, then `npm install`.
2. **Implement:** Update TypeScript files under `src/`. Keep builders/printer logic cohesive and colocate new tests next to implementations.
3. **Format & Lint:** Run `npm run check-format` (or `npm run format` when applying fixes). Prettier only targets `src/`.
4. **Test:** Execute `npm test` to run ts-jest suites (`builders.spec.ts`, `print.spec.ts`). Tests rely on runtime validation behavior; keep them deterministic.
5. **Build:** `npm run build` must succeed to generate `dist/` artifacts and type declarations. CI and `npm run prepare` depend on it.
6. **Review:** Validate changes against README/API expectations and ensure Prisma schemas printed by `print()` remain formatted via `@prisma/internals` `formatSchema` helper.

## ✅ Testing & Quality Expectations
- **Testing framework:** Jest configured via `ts-jest` (see `package.json`). Specs import builders/printer to verify serialization, validation errors, and Prisma-specific behaviors (e.g., MongoDB ObjectId mappings, relation attributes).
- **Validation rules enforced in code:**
  - Names must match `/[A-Za-z][A-Za-z0-9_]*/` (`validateName`).
  - Optional list fields are forbidden (`OPTIONAL_LIST_ERROR_MESSAGE`).
  - Model attributes must start with `@@`, field attributes with `@`.
  - Scalar defaults must align with their `ScalarType` (e.g., `uuid()/cuid()` for `String`, `autoincrement()` for `Int`/`BigInt`).
- **Formatting:** Prettier governs source formatting; Prisma output is normalized by `formatSchema` within `print()`.
- **TypeScript settings:** `strict: true`, declaration output, incremental builds, and `esModuleInterop` are required—do not relax without discussion.

## 🤖 CI & Automation
- **Workflow:** `.github/workflows/nodejs.yaml` runs on pushes/PRs to `master`.
- **Environment:** `ubuntu-latest` runner with Node.js `12.x`.
- **Steps:**
  1. Checkout repository.
  2. Cache npm deps using lockfile hash.
  3. `npm ci` for clean installs.
  4. `npm run check-format` to enforce Prettier.
  5. `npm test` for Jest coverage.
  6. `npm run build` to ensure the TypeScript compiler passes.
- **Timeout:** 10 minutes; keep tasks within this window.

## 📏 Critical Rules & Conventions
- **Builder invariants:** Always call `validateName`, `validateModifiers`, and attribute prefix helpers when introducing new builder APIs. Reuse exported error messages so tests remain meaningful.
- **Attributes handling:** Accept both arrays and strings; normalize to arrays with trimmed `@`/`@@` prefixes (see `validateAndPrepareAttributesPrefix`).
- **Printer expectations:**
  - Always route final schema text through `formatSchema` to match Prisma formatting.
  - Respect MongoDB-specific behaviors (ObjectId mapping, foreign key annotation) in `printScalarField`.
  - Use helper functions (`withDocumentation`, `printRelation`, etc.) instead of duplicating string construction.
- **Type safety:** Maintain shared types from `prisma-schema-dsl-types`. When new AST shapes are needed, update builders and printer consistently.
- **Docs/testing parity:** Whenever API contracts change, update `readme.md` and associated specs.

## 🧰 Common Tasks / Playbooks
- **Adding a new builder helper:**
  1. Define the helper in `src/builders.ts`, enforcing naming/modifier rules.
  2. Export it via `src/index.ts`.
  3. Add validation and happy-path coverage in `src/builders.spec.ts`.
  4. Document usage in `readme.md` if public.
- **Extending printer output (e.g., new attribute):**
  1. Modify `src/print.ts` (prefer helper functions for formatting).
  2. Add schema fixtures to `src/print.spec.ts` verifying string output and `formatSchema` integration.
  3. Run `npm test` and `npm run check-format` before pushing.
- **Releasing / verifying dist:**
  ```bash
  npm run build
  ls dist/          # ensure compiled JS and .d.ts files exist
  ```
- **Troubleshooting formatting failures:**
  ```bash
  npm run format && npm run check-format
  git diff          # confirm only intended files changed
  ```

## 📚 Reference Examples
- `src/index.ts` – central export surface tying builders and printer together.
- `src/builders.ts` – illustrates validation helpers (`validateScalarDefault`, attribute prefix enforcement) and error messaging patterns.
- `src/print.ts` – complete serialization pipeline, including documentation handling, relation rendering, and MongoDB-specific logic.
- `src/builders.spec.ts` – tests for invalid names, modifier conflicts, and attribute parsing.
- `src/print.spec.ts` – data-driven tests covering enums, models, generators, relations, defaults, and formatting expectations.
- `.github/workflows/nodejs.yaml` – authoritative automation recipe for local replication.

## 📎 Additional Resources
- [README](./readme.md) – installation steps, API reference, and development prerequisites.
- [Prisma Schema DSL reference](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema) – upstream schema syntax and conventions relevant to builders/printer.
