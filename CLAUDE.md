# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Overview

`@no1hardy/angular-common` — a pnpm-workspace Angular library repo. The only workspace member is the
`common` library at `projects/common`, published to a private registry (`npm.no1hardy.ch`) and showcased
in a live Storybook (https://noonehardy.github.io/angular-lib/), which is the source of truth for what's
available and how to use it.

## Commands

Run from the repo root (pnpm workspace):

```shell
pnpm install
pnpm run test            # ng test -> Vitest, watch mode
pnpm run test:ci         # ng test --no-watch --no-progress
pnpm run lint            # ng lint
pnpm run lint:fix        # ng lint --fix
pnpm run build:common    # ng build common (ng-packagr)
pnpm run storybook       # local Storybook dev server on :6006
pnpm run storybook:build # static Storybook build
```

To run a single spec file, use the Angular CLI's `--include` glob (or `--filter` for a test-name regex),
invoked via `npx ng test common` directly rather than through `pnpm run test --`, e.g.:

```shell
npx ng test common --include='**/workflow.store.spec.ts' --watch=false
```

## Architecture

- Everything the library exports is re-exported from `projects/common/src/public-api.ts` — when adding a
  new public component/service/type, it must be added there or it isn't part of the package.
- `n1h` is the selector prefix for all components/directives (enforced by eslint
  `@angular-eslint/component-selector` / `directive-selector`).
- `projects/common/src/lib/ngrx/workflow/` is the core, non-trivial piece of the library: a factory
  (`workflowStoreFactory` in `workflow.store.ts`) that builds an NgRx Signals store (`signalStore`) for a
  step-based workflow/wizard from a declarative `TransitionConfig`.
  - `TransitionConfig<T, S, M>` maps each step `S` to its outgoing `Transition`s, evaluated in order:
    each transition either has a `canActivate(data)` guard or is the fallback `default: true`; a
    transition either points at another step (`target`) or ends the workflow (`finish: true`).
  - `workflowStoreFactory` has two overloads distinguished by `options.providePositions`:
    - `providePositions: true` requires a `PositionedTransitionConfig` (every step's `meta` must carry a
      `position`) and returns a store with extra `positions` / `currentPosition` / `currentIndex` /
      `totalPositions` signals.
    - Otherwise a plain `TransitionConfig` is accepted and the store carries none of those signals.
    Both overloads funnel into the single `createWorkflowStore` implementation — the overloads exist
    purely for the conditional typing, not for behavior differences.
  - Store methods: `next(data?)` evaluates the current step's transitions and advances (or finishes);
    `back()` pops the last entry off the recorded `path` and returns to it; `skip(data?)` marks
    `isSkipping` and calls `next` (a step is skipped unless its config sets `skippable: true`);
    `reset()` restores `initialState`; `setError(msg)` sets the `error` signal.
  - `options.preserveDataOnBack` controls whether `back()` restores the data snapshot recorded when the
    step was left (default: it resets to that snapshot).
  - `workflowStore` is an `InjectionToken` for injecting a workflow store instance by interface
    (`WorkflowStore<T, S, M>` / `PositionedWorkflowStore<T, S, M>`) rather than a concrete class.
- `projects/common/src/lib/services/swipe.service.ts` — a small root-provided service turning
  `touchstart`/`touchend` events into a `swipeDir$: Observable<-1 | 0 | 1>`.
- `projects/common/src/lib/typing/partial-recursive.ts` — a recursive `Partial<T>` type utility.
- Storybook stories live outside `src/`, in `projects/common/stories/`, mirroring the lib structure (e.g.
  `stories/workflow/` demonstrates the workflow store via `workflow-demo.component.ts`).
- Tests are Vitest specs colocated with source as `*.spec.ts` (see `workflow.store.spec.ts`), run through
  the Angular CLI's `@angular/build:unit-test` builder with `runner: vitest`.

## Conventions

- No semicolons, single quotes, 2-space indent (enforced by eslint, `eslint.config.js`).
- JSDoc-style `/** ... */` comments are used throughout to document the *why*/contract of exported types
  and non-obvious functions (see `workflow.store.ts`), not to restate what code already says.
## Git conventions

- Branch off `develop`; open PRs against `develop`. CI (test, lint, build) must pass before merge. On
  merge to `release`, the library publishes to npm and Storybook deploys to GitHub Pages / Docker.
- Commit in small, sensible bits: one logical change per commit. Don't bundle unrelated changes (e.g. a
  feature plus an unrelated lint fix) into a single commit.
- Commit messages are a **single-line subject only** — gitmoji + concise imperative description + the
  GitHub issue number in parentheses, nothing else (no body, no `Co-Authored-By` trailer):
  ```
  ✨ add verification workflows (#35)
  🔧 fix path to dockerfile (#36)
  ```
  - Always include the issue number. If it isn't obvious from the branch name (issue numbers commonly
    appear there, e.g. `feature/67-workflow-reset`) or context, ask rather than guessing.
  - Pick the gitmoji to match the change, consistent with `git log --oneline` history — e.g. ✨ new
    feature, 🐛 bug fix, 📝 docs, 📦 build/deps/packaging, 🧪 tests, 🔧 config, 💻 tooling.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
