# MercadoCar Snack Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an isolated `/snack` Expo application that imports in Expo Snack without local binary asset uploads.

**Architecture:** The Snack directory owns the entry component, data, API client, and minimal manifests. Images use HTTPS URIs and the logo uses React Native primitives, so no local asset is uploaded.

**Tech Stack:** Expo SDK 57, React 19.2.3, React Native 0.86.3, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-09-22-snack-export-design.md`

## Global Constraints

- Do not modify root application source, root manifests, root assets, or existing local changes.
- `/snack` contains no `node_modules`, lockfile, binary assets, parent-directory imports, or local `require()` asset references.
- Runtime versions follow the root Expo SDK 57 family.

## Review Focus

- Every relative Snack import exists inside `/snack`.
- Snack source has no local asset reference or `require()` call.
- Both manifests parse and contain no local visual asset configuration.
- Imported runtime packages are declared and no declared package is unused.
- Each preserved product image is an HTTPS URI.

---

### Task 1: Define Snack static acceptance test

**Files:**
- Create: `tests/snack-export.test.mjs`

**Interfaces:**
- Consumes: all Snack application files.
- Produces: `node --test tests/snack-export.test.mjs` static acceptance command.

- [ ] Write a Node test asserting the five required Snack files exist, manifests parse, required dependencies exactly match source imports, product images use HTTPS, no Snack source contains `require(`, and no relative import begins with `..`.
- [ ] Run `node --test tests/snack-export.test.mjs` and observe it fail because `/snack` does not exist.

### Task 2: Create the isolated Snack application

**Files:**
- Create: `snack/App.js`
- Create: `snack/data/products.js`
- Create: `snack/services/api.js`
- Create: `snack/package.json`
- Create: `snack/app.json`

**Interfaces:**
- Consumes: root `App.js` behavior, product model, and optional API contract.
- Produces: a self-contained Expo Snack entry point.

- [ ] Copy the root app flow into `snack/App.js`; change `AppLogo` to a `View`/`Text` mark and remove the local image import.
- [ ] Copy data and replace every product `require()` value with an HTTPS URI.
- [ ] Copy the API client beneath `/snack/services` with no parent path.
- [ ] Add an Expo 57 package manifest containing only `expo`, `react`, `react-native`, `@expo/vector-icons`, and `react-native-safe-area-context`.
- [ ] Add an app manifest with name and slug only, no visual asset or plugin configuration.
- [ ] Run `node --test tests/snack-export.test.mjs` and observe it pass.

### Task 3: Validate and commit

**Files:**
- Modify: `tests/snack-export.test.mjs` only if validation reveals an omitted requirement.

**Interfaces:**
- Consumes: Snack app and static acceptance test.
- Produces: a validated implementation commit.

- [ ] Run `node -e "JSON.parse(require('fs').readFileSync('snack/package.json')); JSON.parse(require('fs').readFileSync('snack/app.json'))"`.
- [ ] Run `npx expo-doctor` from `/snack`; record any network or tooling limitation.
- [ ] Run `node --test tests/*.test.mjs`.
- [ ] Commit `snack` and `tests/snack-export.test.mjs` as `feat: add Expo Snack export`.
