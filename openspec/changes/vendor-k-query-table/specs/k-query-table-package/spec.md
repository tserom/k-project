## ADDED Requirements

### Requirement: Vendor package location

The KQueryTable library SHALL live at `vendor/k-query-table/` with npm package name `@k-project/k-query-table`.

#### Scenario: Package discovery

- **WHEN** a developer lists `vendor/`
- **THEN** `k-query-table/` exists alongside `sula/` and `business-component/` as a reference component library

### Requirement: Build outputs

The package SHALL publish build artifacts as ESM, CJS, and TypeScript declarations from `src/` entry `src/index.ts`.

#### Scenario: Consumer import

- **WHEN** a host app imports `@k-project/k-query-table`
- **THEN** it resolves types from `.d.ts` and runtime from ESM or CJS bundle

### Requirement: Peer dependencies

The package SHALL declare `react` and `antd` as peer dependencies compatible with React 18/19 and Ant Design 5+.

#### Scenario: No Ant Design 4 lock-in

- **WHEN** `package.json` is inspected
- **THEN** `antd` peer range is `^5.0.0` and `bssula` / `umi` are not listed as dependencies or peers

### Requirement: README and scripts

The package SHALL provide `README.md` with install, dev demo, and config quickstart; npm scripts SHALL include at least `build`, `dev` (demo), and `typecheck`.

#### Scenario: Local development

- **WHEN** developer runs package dev script from `vendor/k-query-table`
- **THEN** a demo page renders `KQueryTable` without requiring umi
