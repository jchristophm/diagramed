# Development Contract 3.1 complete

Verified 2026-09-30 UTC. Working branch: development. Live application: https://jchristophm.github.io/diagramed/ .

Verified application revision: c9db28a70019096c455ab0907a31139f06c40f54.
Successful verification/deployment/live-acceptance run: https://github.com/jchristophm/diagramed/actions/runs/36766423793.
The subsequent documentation-only completion commit records these results without changing application code.

## Recoverable checkpoints

1. Automatic mathematical notation: c09d347f8be575e2bddbda31dfb14f7faf4bddca; successful run 36762872315 (52 unit tests and 36 desktop/mobile browser tests, deployment and independent live acceptance).
2. Graphical/interface refinements: 890ada46634ec31ae1ff56180b92780bca3e6cd9; successful run 36764245148 (57 unit tests and 40 desktop/mobile browser tests, deployment and independent live acceptance).
3. Integration and final refinements: c9db28a70019096c455ab0907a31139f06c40f54; successful run 36766423793 (62 unit tests and 40 desktop/mobile browser tests, deployment and independent live acceptance).

Earlier candidate checks caught an outdated Pebble/Planet abbreviation expectation and a test helper imported from another spec; both were fixed in recoverable commits. Candidate fcbd34f passed full run 36765608002 before the final singleton-deletion naming correction.

## Completed behavior

One naming mechanism generates object properties, interaction-owned variables and vector magnitudes using persistent object abbreviations. Conflicting names extend abbreviations or receive deterministic suffixes. Assignments do not depend on array order or position and avoid unnecessary changes after deletion. Single/multiple springs and gravitational environments receive appropriate k/extension/g notation. Deleting the second spring/environment restores singleton symbols without changing IDs. G and k_e remain immutable and reserved.

Ordinary forms display rendered mathematics without editable markup fields. Historical authored notation stays custom; semantic relationships and structured expressions reference persistent IDs. Renaming or introducing an abbreviation conflict updates automatic notation and expression rendering without rewriting references.

Object names and mathematical symbols form one compact movable label. Ordinary defaults are horizontally centered; label offsets follow object movement and persist through renames/reopening. Vector labels default near arrowheads, remain upright, follow current geometry and keep manual offsets. Automatic anchors receive a small canvas-boundary adjustment before manual offsets. Known historical automatic defaults adopt refined placement during rendering without rewriting imported files.

A small black presentation-only dot marks shared vector origins above shafts and does not intercept gestures or create semantic records. Linked contact uses N/f/F for normal/friction/resultant; no-friction contact uses F. Unambiguous historical generic normal labels are repaired with original IDs and references. Unrelated custom symbols remain unchanged.

Creation/editing dialogs contain no graphical direction or length inputs. Normal and friction lengths are independently manipulated through actual canvas gestures; directions remain perpendicular and the optional resultant follows displayed component sums. Backend geometry and physical magnitude remain independent and fully persisted.

## Verification

62 unit tests, TypeScript compilation and production build passed.
All 40 browser tests passed on desktop and mobile emulation against compiled assets, then all 40 passed independently against the deployed URL on a separate GitHub runner.
The required Planet Surface/Table/unknown-mass Book scenario exercises automatic notation, authored weight expression, linked contact labels, object/vector label dragging, direct component gestures, table rotation, Book movement, abbreviation conflicts, saved geometry/AST/IDs, download/reopen and physical editing without graphical controls.
Desktop/mobile screenshots were inspected. All original regression scenarios and genuine v1/v2 fixtures remain supported; native format remains version 3. Invalid import/dependency protections are retained.

Main remains e9347bb6c94c3fd758326492d062b2f249df3474. Problemly main remains fb432d00f07bcf9d2b386fa4de98d792b823a57f. No original/ files changed, no Problemly writes and no main merge.

## Documentation and limits

README.md and docs/FORMAT.md describe notation, optional label placement, historical compatibility and persisted geometry. docs/DEVELOPMENT_CONTRACT_3_1.md preserves the contract.
Actual physical-device touchscreen testing remains the user's responsibility. Browser automation uses mobile emulation; GitHub runners perform browser verification.
No new physics categories, interactions, dependencies, coordinate systems, components, equations, solving, AI, Mathed integration or layout engine were added. Existing no-autosave/no-undo limitations remain.
