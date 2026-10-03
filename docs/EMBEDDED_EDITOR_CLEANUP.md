# Embedded editor cleanup and semantic consistency

## Delivered

Mathed owns its Variables dropdown alongside Functions and Symbols. The top toolbar has exactly two rows: Fraction, Power, Subscript, Parentheses, Square root; then Variables, Functions, Symbols. The bottom controls are left, right, and Backspace. Sigma entry and redundant lifecycle/history/structural touch buttons are removed; existing structured sums still load, and keyboard navigation, Delete, history and submission remain supported.

Suggestions render mathematical symbols without descriptions or units. The first match is selected automatically; left/right changes the pending selection and Space commits its persistent ID. After commitment, arrows navigate the expression. `updateVocabulary` refreshes reference displays without resetting structure, cursor, pending text or history. `insertVariable` uses that retained cursor, including nested slots. These behaviors are implemented upstream in Mathed, commit `19339f1677924b854bae6820af55a56b70f57dc8`, and copied unchanged into Diagramed's bundled editor. Diagramed's parallel picker is removed. Switching a property/magnitude to Expression gives the actual input keyboard focus.

Static/kinetic friction is one coefficient identity per contact interaction. Switching updates the interaction mode, property key, coefficient quantity metadata and generated display symbol while retaining the ID. Existing editor and canvas references resolve its new display immediately. Known/unknown coefficient configuration is shown directly, without an existence checkbox or visible units. Coefficient units remain `1` in semantic data.

Spring k and extension, Fluid density, Planet Surface g, and Charged Plate surface charge density exist automatically. Their configurations have no existence checkboxes and their unknown variables are available to Mathed immediately. Earth 9.8 and Water 1000 defaults remain. Ordinary mass/charge/density and point charge remain optional. Older files acquire missing intrinsic quantities once on import, preserving existing IDs and values.

Contact discovery always exposes Ordinary contact, Spring, and Tension. Unavailable options are disabled; eligible participant lists are unchanged.

## Cascade deletion

`src/deletion.ts` computes one dependency closure for objects, interactions/contact groups, vectors, variables and coordinates. It removes dependent semantic and presentation records, separation-dependent relationships and component variables. Surviving quantities whose expressions referenced removed IDs retain their identity/unit and return to Unknown; their expression/value fields are removed. No dangling IDs remain. Deleting any linked contact arrow deletes the complete semantic group.

`src/delete-ui.ts` provides a native confirmation dialog with Cancel and Delete all. Object modal/list, vector modal/list, keyboard deletion and coordinate deletion share it. Configuration removal is staged in an isolated document and confirmed before replacing the saved document. An expression in an open modal whose operand is removed returns to Unknown in the draft. Cancel leaves the saved document unchanged. A confirmed deletion/removal performs a single document replacement and one undo restores the entire semantic/presentation state. Collection updates do not reopen a dialog closed while deletion finishes.

## Files

- Upstream Mathed: controller, editor, styles; README and integration/architecture/status documentation; autocomplete unit and native-control browser tests; existing controller and browser regressions updated for the requested controls.
- Diagramed: shared expression adapter, property/vector/coordinate UI, main UI entry points, intrinsic properties and load migration, physics identity handling, coordinates, deletion planner and confirmation adapter, index/styles, and bundled Mathed source/provenance.
- Diagramed regressions: new embedded-cleanup unit/browser suites; existing object/history/expression/separation/coordinate/category/editor/angle/vector/integration tests retain their scenarios with new intrinsic-property and confirmation expectations.

## Verification

- Diagramed: 370 unit tests, 146 desktop/touch browser tests; production TypeScript/Vite build.
- Mathed: 104 unit tests, 54 desktop/touch browser tests; demo, reusable-module and declaration builds.
- New Diagramed focused suite: 22 desktop/touch checks passed, including same-modal property removal, static/kinetic identity/display, native controls, autofocus, autocomplete, intrinsic vocabulary, contact discovery, cascade cancellation, persistence and atomic undo/redo.
- Full Diagramed and deployed acceptance results are recorded in the development workflow; the completion report gives final exact counts and deployment status.
- Mobile editor screenshot visually checked for two toolbar rows, no extra picker or coefficient checkbox, dimensionless coefficient controls, equation rendering and three bottom controls.

No Notebook, assessment, AI, mathematical correctness checks, execution, solving, unit conversion, equation generation, new physics domains or architecture rewrite was added. Existing IDs, JSON expression structure, semantic ownership, motion placement, labels, components, angles and viewport interactions retain their established behavior.
