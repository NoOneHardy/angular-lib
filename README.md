# @no1hardy/angular-common

Reusable Angular components, directives, and services — published as `@no1hardy/angular-common` and showcased in a live Storybook.

[![Build](https://github.com/NoOneHardy/angular-lib/actions/workflows/no1hardy-angular-common.yml/badge.svg)](https://github.com/NoOneHardy/angular-lib/actions/workflows/no1hardy-angular-common.yml)
[![Storybook](https://github.com/NoOneHardy/angular-lib/actions/workflows/storybook-common.yml/badge.svg)](https://noonehardy.github.io/angular-lib/)
[![npm version](https://img.shields.io/npm/v/@no1hardy/angular-common?registry_uri=https://npm.no1hardy.ch)](https://npm.no1hardy.ch/-/web/detail/@no1hardy/angular-common)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

## Storybook

Browse every component, its inputs/outputs, and live usage examples in the deployed Storybook:

**https://noonehardy.github.io/angular-lib/**

That's the source of truth for what's available in the library and how to use it.

## Installation

```shell
echo "@no1hardy:registry=https://npm.no1hardy.ch" >> .npmrc
pnpm add @no1hardy/angular-common
```

## Development

This repo is a pnpm workspace containing the `common` library under `projects/common`.

```shell
pnpm install
pnpm run storybook       # local Storybook dev server
pnpm run test            # unit tests (Vitest)
pnpm run lint            # ESLint
pnpm run build:common    # build the library with ng-packagr
```

## Contributing

1. Branch off `develop`, make your changes, and ensure `pnpm run test` and `pnpm run lint` pass.
2. Commit messages follow a gitmoji convention: a gitmoji, a concise single line subject, and the issue number in parentheses — no description.
   ```
   ✨ add verification workflows (#35)
   🔧 fix path to dockerfile (#36)
   📦 upgrade to angular 21
   ```
3. Open a pull request against `develop`. CI (test, lint, build) must pass before merge.

On merge to `release`, the library is published to npm and Storybook is deployed to GitHub Pages and Docker (`docker.no1hardy.ch`).

## License

Licensed under the [GNU General Public License v3.0](LICENSE).
