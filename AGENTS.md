# 🤖 AGENTS GUIDE · prisma-schema-dsl

## 🧭 Project Overview
- **Purpose:** `prisma-schema-dsl` exposes TypeScript builders and printers that help programmatically compose Prisma Schema ASTs and render them into `.prisma` files.
- **Runtime:** Pure TypeScript library compiled to CommonJS (see `tsconfig.json` targeting `es3` with declarations emitted to `dist`).
- **Key Capabilities:**
  - Validation-heavy builders in `src/builders.ts` ensure model, enum, scalar, relation, data source, and generator definitions are syntactically safe.
  - Printer pipeline in `src/print.ts` traverses the AST and outputs formatted Prisma schema text, keeping inline documentation blocks intact.
- **Artifacts:** No docs site is generated; distribution is handled via `npm` with `.npmignore` excluding test specs so only runtime code ships.

## 🗂 Repository Structure
| Path | Notes |
| --- | --- |
| `.github/workflows/nodejs.yaml` | Single CI workflow enforcing install → formatting → tests → build on Node 12.x.
| `assets/hero.png` | Project artwork referenced from `readme.md` (lowercase filename).
| `src/` | Library source and co-located Jest specs (`builders.ts` / `builders.spec.ts`, `print.ts` / `print.spec.ts`, `index.ts`).
| `package.json` / `package-lock.json` | NPM scripts and dependency lock (uses `@prisma/internals`, `lodash.isempty`, `typescript`).
| `tsconfig.json` | Strict compiler settings (`strict: true`, `module: commonjs`, `target: es3`, `baseUrl: src`, `incremental: true`).
| `LICENSE`, `.gitignore`, `.npmignore`, `readme.md` | OSS metadata, ignore rules (note `.npmignore` excludes `*.spec.*`), and primary documentation.

## 🛠 Development Workflow & Guidelines
1. **Environment:** Align with CI by using Node 12.x (or newer compatible) and npm.
2. **Install:** Always run `npm ci` on fresh clones to honor the lockfile versions used in CI.
3. **Edit Flow:**
   - Modify TypeScript sources inside `src/`.
   - Keep tests next to the code they cover (e.g., if you add `src/foo.ts`, create `src/foo.spec.ts`).
   - Maintain builder validation behavior—new helpers should reuse existing validation utilities when possible.
4. **Validation Order:** Follow the same order as CI (`check-format` → `test` → `build`) before raising PRs.
5. **Artifacts:** Do not commit `dist/`; builds are reproducible via `npm run build` and are intended for publish steps.

## 🧩 Code Patterns
- **Builder Validation:**
  - `validateName` enforces `/[A-Za-z][A-Za-z0-9_]*/` naming.
  - `validateModifiers` prevents optional lists (`OPTIONAL_LIST_ERROR_MESSAGE`).
  - Attributes are sanitized through `validateAndPrepareModelAttributes` / `validateAndPrepareFieldAttributes`, guaranteeing prefixes (`@@` for models, `@` for fields).
  - Scalar defaults (`validateScalarDefault`) guard against invalid literal/call-expression combinations.
- **Printer Composition:** `src/print.ts` renders schemas by composing helpers (e.g., `printScalarField`, `printRelation`) and injecting documentation via `withDocumentation`.
- **Testing Style:**
  - Jest specs inside `src/*.spec.ts` use table-driven `test.each` coverage for builder permutations and printer snapshots.
  - Failure paths rely on `expect(() => ...).toThrow(...)`, mirroring runtime validation messages.
- **Exports:** `src/index.ts` re-exports builders and the `print` helper, keeping the public API minimal.

## ✅ Quality Standards
- **TypeScript Strictness:** `strict: true`, `esModuleInterop`, and `allowSyntheticDefaultImports` must remain enabled; new code should satisfy `tsc` without suppressions.
- **Formatting:** Prettier governs style—only run it against `src/` (`npm run format`) and rely on `npm run check-format` for CI parity.
- **Testing:** Jest (`ts-jest` preset) is the single source of truth. Specs must avoid referencing `dist/`; rely on source imports for accuracy.
- **Packaging:** Ensure new runtime files are included under `src/` and that `.npmignore` continues to exclude `*.spec.*` so tests do not ship.
- **CI Compliance:** The GitHub Actions workflow will fail early on formatting discrepancies before running tests/build—mirror this flow locally to minimize churn.

## ⚠️ Critical Rules
- **Never bypass builder guards:** Always call the exported builders (`createModel`, `createScalarField`, etc.) rather than mutating AST objects manually.
- **Do not relax validation regexes or modifier rules** unless there is a finalized Prisma spec change—tests expect current errors.
- **Maintain co-location of specs:** removing or moving specs outside `src/` will break the existing `.npmignore` assumptions.
- **Preserve command ordering:** `npm run check-format` must precede `npm test` and `npm run build` in scripts/automation to reflect CI behavior.
- **No auto-generated docs:** There is no doc generation step; update `readme.md` or this guide for documentation changes.

## 🧰 Common Tasks
| Task | Command | Notes |
| --- | --- | --- |
| Install dependencies | `npm ci` | Recreates `node_modules` using `package-lock.json`; required before tests/builds.
| Run unit tests | `npm test` | Executes Jest with `ts-jest` preset against `src/**/*.spec.ts`.
| Check formatting | `npm run check-format` | Runs Prettier in check mode over `src/`; matches CI.
| Auto-format | `npm run format` | Applies Prettier fixes to `src/`.
| Build TypeScript | `npm run build` | Invokes `tsc` (outputs to `dist/` with declarations).
| Prepare (pre-publish hook) | `npm run prepare` | Alias for `npm run build`; executes automatically on `npm publish`.

### Suggested Local Loop
```bash
npm ci
npm run check-format
npm test
npm run build
```

## 📚 Reference Examples
- **Builder validations:** `src/builders.ts` shows utility exports such as `createModel`, `validateScalarDefault`, and shared error messages.
- **Printer:** `src/print.ts` demonstrates how schema AST nodes are converted to Prisma DSL text while preserving documentation blocks.
- **Index barrel:** `src/index.ts` reveals the public API surface exported by the package.
- **Specs:**
  - `src/builders.spec.ts` provides table-driven cases for successful and failing builder inputs.
  - `src/print.spec.ts` covers end-to-end schema printing expectations.
- **Automation:** `.github/workflows/nodejs.yaml` specifies the enforced GitHub Actions pipeline (checkout → `npm ci` → `npm run check-format` → `npm test` → `npm run build`).

## 🔗 Additional Resources
- [`readme.md`](readme.md): Usage examples, installation instructions, and API overview.
- [`LICENSE`](LICENSE): MIT license granting redistribution and modification rights.
- [`tsconfig.json`](tsconfig.json): Source of truth for compiler targets and module resolution.
- [`package.json`](package.json): Script definitions, dependencies, and Jest configuration.
