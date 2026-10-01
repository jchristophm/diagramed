# Zero-valued motion presentation

Implementation based on deployed development revision 9fd677f96773d80cc2126c6fdbddc8989ac9affe. That preceding revision completed automatic run https://github.com/jchristophm/diagramed/actions/runs/36930540997 with 235 unit tests, build, 68 desktop/mobile browser tests, Pages deployment and 68 independent live acceptance tests all passing.

Known-zero acceleration, velocity and displacement now have attached mathematical equality labels with their existing symbols and configured units. No arrow or endpoint control is rendered. Their persisted graphical records are label-only with zero endpoints, while dormant previous arrow points preserve configuration for returning to nonzero or unknown. Existing vector/variable/graphic IDs, ownership, labels, visibility, components and history are retained. Pre-fix zero arrows normalize only their motion presentation on import. Force/field behavior, Mathed and Notebook are unchanged.

Local checkpoint: 246 unit tests and production build passed; six targeted desktop/mobile browser cases passed, covering each motion type, units, object movement, zero/nonzero/unknown transitions, save/reopen and Undo/Redo. Mobile screenshots were inspected. All 74 desktop/mobile browser regression cases passed against the compiled production build. The existing automatic push/deployment/live workflow provides the public verification gate. No dependency or physics definition was added. Physical touchscreen testing is separate.

---

## Previous history cycle (historical)

# Final interface cleanup, Undo/Redo and data protection

Implementation prepared on development, based on a94f5e9ce37e090ee836f2d96a25093ee481dbe5. Automatic deployment/live verification are pending; previous completed reports follow below.

- New-vector creation explicitly selects eligible Force and resets independently of editing. Existing semantic types and eligibility are retained.
- Bottom toolbar: Grid, Undo, Redo, Open, Save. Matching monochrome SVG icons have visible labels underneath, pressed Grid state, disabled history states and 44-pixel touch targets. Permanent Delete is removed; keyboard, editing dialogs and management deletion remain available with existing dependency guards.
- DocumentStore retains 100 completed document snapshots. Modal saves group multiple mutations; drag, endpoint, label, origin, rotation and transform start/end handlers group continuous changes. Pointer/touch cancellation or focus loss finalizes the last valid gesture state. Restored snapshots retain IDs, relationships, automatic notation and geometry; rendering derives fresh Konva nodes. Selection and dialogs are transient. New edits invalidate Redo; no-op edits do not create entries.
- Saved-state comparison ignores timestamps, semantic record ordering and equivalent omitted defaults. Save initiation updates its baseline without clearing history. Invalid/canceled replacement leaves document, selection and history intact; successful loading resets history only after validation/preparation/rendering. beforeunload requests the browser's standard warning while dirty.

Local verification: 235 unit tests and TypeScript/Vite build passed. All 16 new desktop/mobile-emulation cases passed, including actual multi-step canvas gestures, pointer cancellation, keyboard focus and shortcuts, modal edits/deletions, failed downloads, canceled/invalid imports and desktop beforeunload cancellation. The complete 68-case browser regression suite passed against the production build; desktop/mobile toolbar screenshots were inspected. The preexisting separation test now explicitly selects Separation so it retains all assertions while Force becomes the eligible default. No new dependency or file format was introduced; deployment workflow is unchanged.

Limits: history is in memory, not autosave/recovery. Browser download initiation cannot verify permanent retention. Mobile browsers and OS/process termination may bypass beforeunload; actual physical touchscreen and tab/process termination behavior remain unverified. Existing dependency guards require removing relationships before deleting their objects; Undo restores the removed records with original IDs. Existing coordinate-derived component labels are noninteractive and have no persisted offsets; this cycle preserves their existing positioning, while existing draggable physical-vector/contact and object labels participate in history.

Contract: docs/DEVELOPMENT_CONTRACT_6.md.

---

## Previous completed cleanup (historical)

# Final coordinate and interface cleanup

Completed and deployed 2026-10-01 UTC on development. Verified revision: 538872c2f6aedc17f2b091d431ec596960c2ead3, including implementation 460f42daa967f4a44675cdb24d91717a2c42dba2. Successful automatic verification/deployment/live-acceptance run: https://github.com/jchristophm/diagramed/actions/runs/36923439524 . Live application: https://jchristophm.github.io/diagramed/ . Historical reports below describe previous cycles.

- Independent optional reverseX/reverseY booleans reuse the coordinate record and existing configuration dialog. Rotation remains the reference angle; the handle retains its independent reference direction. Flips preserve the origin, perpendicular axes, physical vector geometry, identities and naming. Hidden y reversal persists in 1D and restores in 2D.
- Derived graphical projections respect signed axis conventions, while the existing inclusive 10-degree suppression remains unchanged for rotated/reversed frames and 1D. No numerical physical quantities or semantic component calculations were added.
- Four monochrome inline SVG toolbar icons retain text labels, disabled states, existing dialogs, keyboard access and 44-pixel touch targets.
- New Planet Surface objects default to visible Earth with g=9.8. Existing saved names, properties and hidden representations are retained. Vector Type options now read Force, Field, Separation, Acceleration, Velocity, Displacement with unchanged eligibility.
- Native JSON remains version 3. Missing reversal flags retain previous directions. No dependency, framework, new physics type or deployment system was added.

Verification: 223 unit tests across 11 files passed locally and on GitHub; TypeScript and Vite production build passed with the existing bundle-size advisory. All 52 compiled-build browser cases passed on desktop Chromium and Pixel 7 mobile emulation. Pages deployment succeeded, followed by all 52 independent live acceptance cases passing against the public URL. Downloaded public HTML exactly matches dist/index.html; JavaScript and CSS asset SHA-256 hashes match the production build. Desktop and mobile screenshots were inspected.

Focused tests cover reversal combinations, rotated geometry, inclusive tolerance boundaries, persistence/legacy files, duplicate Weight BY/ON naming, defaults, toolbar behavior and menu order. The first candidate passed all six new browser cases but caught an existing collision fixture relying on the old Planet Surface default name. The fixture now explicitly creates a custom-named Planet Surface to retain its original collision assertion; the full corrected suite passed. Local Chromium launch was blocked by workspace socket restrictions, so browser verification used the existing GitHub runners. Physical touchscreen testing remains separate. No unresolved regression was found in the required checks.

This documentation-only completion commit skips CI to avoid repeating an already successful deployment; application and test contents remain identical to the verified revision.

Contract: docs/DEVELOPMENT_CONTRACT_5.md. The existing automatic development verification → Pages deployment → live acceptance workflow is unchanged.

---

## Previous coordinate cycle (historical)

# Coordinate systems and interface consolidation complete

Verified 2026-10-01 UTC on the existing development branch, based on 88cdf849c1d632fab195061def83e455721fc430. This implementation is not publicly deployed.

## Delivered

- One persistent independent 1D/2D frame with center creation, origin dragging, free handle rotation, numerical counterclockwise angles, perpendicular axes, dimensionality changes, visibility and deletion. Origin/rotation hit targets stay 44 screen pixels across canvas scaling.
- Dotted graphical coordinate projections of the active vector, including signed directions and existing participant notation with x/y subscripts. The active vector remains active while the frame is manipulated. Its parent arrow and label remain present. Optional component visibility persists in graphical configuration.
- One presentation-only 10-degree constant. Both positive/negative directions and rotated frames use the inclusive boundary; 2D decomposition is absent near either axis. 1D suppresses near-parallel redundancy and near-perpendicular insignificant x projections. Live vector/frame gestures update display without enforcing angular snapping or changing physical quantities.
- Object | Vector | Coordinates | Elements toolbar. Elements launches existing object/vector management modals and coordinate configuration. Double-click/double-tap and modal editing remain available.
- Unified Object type selector, existing specialized defaults, contextual properties/representations during creation/editing, retained shared valid draft values and custom names. Existing code had no named Book/Rock preset entries; ordinary objects retain those custom names. Type-selection discovery retains disabled vector choices and the unavailable Vector button.
- Version-3 persistence extensions remain optional. No axes are inserted into older diagrams. Duplicate axes and malformed flags are rejected.
- Development pushes/PRs continue verification. Public deployment now requires explicit workflow dispatch, satisfying the contract's no-public-release requirement.

## Architecture and compatibility

Reused DocumentStore, CoordinateSystem semantic records, Konva renderer, physical attachment geometry, mathematical image renderer, naming conventions, object/category property eligibility, specialized object defaults, vector eligibility, and the existing management modals. No new dependency or rendering framework.

Inspection found reserved semantic component records but no existing coordinate-projection graphics. Added one derived graphical projection path; existing normal/friction/resultant contact vectors remain separate physical definitions with their established behavior. No implicit screen-axis projection is added for legacy documents. Hidden coordinates retain their semantic frame and projections; deleting coordinates removes dependent component records/settings while preserving physical objects, vectors and variables.

Graphical projections do not create numerical values, equations, derived physical magnitudes or semantic variables. Mathed, tutoring, assessment and export are excluded.

## Verification

- 196 unit tests passed, including 134 coordinate/tolerance regression cases, signed geometry, frame rotation, origin invariance, zero vectors, persistence, singleton constraints, legacy documents and deletion.
- TypeScript checks and Vite production build passed. The existing large-bundle advisory remains.
- All 46 browser tests passed against compiled assets: desktop Chromium and Pixel 7 mobile emulation. Existing physics, labels, expressions, JSON, legacy imports, object/vector gestures and management flows passed alongside the new coordinate/dialog cases.
- The six new coordinate/dialog browser cases were rerun successfully after enlarging touch targets and adding vector-tip gestures crossing the angular threshold. They cover coordinate origin/handle gestures, exact-angle boundary changes, 1D projections, component visibility, hide/show, deletion and save/reopen without changing physical geometry during frame operations.
- Inspected desktop/mobile screenshots of the coordinate axes, dotted components and consolidated toolbar.
- No manual human/device interaction, actual hardware touchscreen test or deployed-site verification was performed for this cycle. Automated gestures ran in a real local Chromium browser with emulated touch input.

The contract and amendment are preserved in docs/DEVELOPMENT_CONTRACT_4.md; conventions and additions are documented in README.md and docs/FORMAT.md. No main/original files changed. No public release, Mathed integration, new physics definitions or application-wide redesign.

---

## Previous verified cycle (historical)

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
