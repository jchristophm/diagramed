# Diagramed

A semantic physics diagram editor. Live development application: https://jchristophm.github.io/diagramed/ . Source and all checkpoints are on `development`; `main` preserves the original import. Problemly is unchanged, and `original/` remains untouched.

## Using the editor

**Object** opens a confirmed physical definition. Ordinary objects have circle, rectangle, point or hidden representations and optional mass, charge and density. A single Object type selector determines valid properties and representations; custom names remain independent. Specialized defaults include Spatial point (optional charge), Planet Surface (visible Earth by default, g=9.8 m/s²), Spring (optional k and extension), String/Cable, Charged Plate (polarity and optional surface charge density), and Fluid (Water, density=1000 kg/m³). Defaults still obey symbol collision checks. No placement creates forces or fields automatically.

Ground, plate and fluid span the logical canvas and anchor to its bottom. Drag their upper boundary to adjust the surface. Fluid is translucent and behind ordinary objects; its interior does not intercept object gestures. Springs and cables have independently adjustable endpoints. These graphical operations never change physical properties. Ordinary rectangles resize independently horizontally and vertically. Points retain enlarged hit targets.

**Objects** contains visible and hidden objects. Select, edit, show/hide or delete. Names and property symbols form one compact, horizontally centered label (for example Book, m_B). Optional label information can be disabled. Drag the combined label to adjust its position; its offset follows the object and survives renames and reopening. Double-click/double-tap a graphic or label to edit.

**Vector** defines Separation, Force, Field, Velocity, Acceleration or Displacement before creating its graphic. Unavailable choices are visible and disabled without hints. A separation has ordered FROM/TO references; its dashed arrow follows endpoint objects, and its physical distance is independent of the drawing. Point-source fields require source-to-observation separation; inverse-square forces accept either separation orientation without changing it.

Forces specify BY and ON, including near-surface/universal gravity, electric, ordinary contact, spring, cable tension and buoyancy. Fields specify BY and AT a Spatial point. Unknown magnitudes are valid. Buoyancy owns displaced volume; friction can own a static/kinetic coefficient. Contact with friction creates separate linked normal/friction vectors with independent lengths and perpendicular directions. Normal/friction/resultant notation is N/f/F respectively; without friction the ordinary contact force is F. Optional resultant presentation sums their displayed geometry, without calculating physical magnitudes.

Vector labels default near arrowheads with a small canvas-boundary adjustment, remain upright and follow geometry; independently dragged label offsets persist. A small noninteractive black dot marks shared vector origins. For attached arrows, drag the tip to change graphical direction and length; the tail stays attached. A contact normal tip rotates the pair, while its friction tip adjusts friction length along the perpendicular axis. Direction and graphical length are manipulated exclusively on the canvas; creation/editing dialogs contain only physical configuration. Separation endpoints and resultants cannot be disconnected. Hidden source objects can still produce force/field arrows attached to visible targets; hidden separation endpoints suppress only the separation drawing.

**Vectors** contains all defined vectors, including hidden ones. Linked contact vectors edit as a group and can be deleted with Delete group. Ordinary vector deletion removes its owned variables and removes the interaction only when no remaining vector uses it. Dependency guards refuse operations that would invalidate expressions, separation, field or interaction references.

## Mathematical definitions

Optional physical properties and magnitudes have stable variable IDs, quantities, units, ownership and explicit Known/Unknown states. Undefined properties are absent, never zero. Charge, surface charge density and spring extension can be signed. Known separation distances must be positive. No automatic unit conversion occurs.

Eligible vector magnitudes also support **Expression**. A contextual palette offers actual defined variables and relevant immutable G/k_e constants. Use ingredient buttons, arithmetic, parentheses, powers, negation, absolute value, π and finite numerical literals. Expressions begin empty; no governing equations are suggested. Variable references are stored by ID. Changing symbols updates the rendered expression without evaluating or rewriting it. Context restrictions, bounded syntax and cycle checks preserve integrity. For interaction quantities defined during initial creation, confirm the unknown force first and edit it to use the newly registered quantity in an expression.

Object abbreviations distinguish shared initials (Earth/Emu → Ea/Em). Generated symbols use those assignments while physical relationships use persistent IDs. New properties, interaction quantities and vectors receive automatic conventional symbols and rendered previews. Ordinary forms require no mathematical markup. Historical authored symbols remain custom and are preserved. Renames and new abbreviation conflicts update generated notation while expression references stay IDs. Identical names receive deterministic suffixes; stored abbreviations survive array reordering and deletion.

**Grid**, **Undo**, **Redo**, **Open**, **Save** form the bottom toolbar, using monochrome outline icons with labels. Grid visibility is a persisted setting; its pressed state and Undo/Redo availability update immediately. Delete remains available from the keyboard, object/vector edit dialogs and Elements management. Existing dependency guards remain in place. New vector dialogs explicitly choose Force when eligible, otherwise an eligible type; editing preserves the saved type. v1/v2 documents migrate to v3 with original graphics, names and identities intact. Legacy Earth objects are ordinary objects; historical points/arrows do not acquire new physics. Imported generic text/math remain editable, but generic creation is unavailable. Invalid files preserve the current document.

Document-level Undo/Redo restores complete semantic and graphical snapshots, including IDs, relationships, automatic naming, properties, visibility, labels, coordinates and geometry. History retains 100 completed edits; each drag/rotation/resize or committed dialog save is one action. Cancellation finishes a gesture at its last valid state. Transient selection/dialog activity and no-op edits do not enter history. A new edit after Undo abandons Redo. Keyboard shortcuts are Ctrl/Command+Z, Ctrl/Command+Shift+Z and Ctrl+Y; focused text/editable fields and open dialogs keep their own editing behavior.

Saving initiates a JSON download and marks the current content as the saved baseline without clearing history. Undoing back to that content clears dirty state. Open validates the selected file before asking to discard unsaved changes; cancellation or invalid files preserve current work, selection and history. Successful loading starts clean history for that file. Dirty documents request the browser's standard reload/close/navigation warning. Download initiation cannot prove that the file was permanently retained, and browsers may suppress navigation warnings—especially on mobile, without prior interaction, or during process/OS termination. History is in-memory only; there is no autosave, recovery storage, account or server backup. Save explicitly before leaving.

## Architecture

- `model.ts`: authoritative document store and independent graphical identities.
- `semantics.ts`: objects/categories, variables, interactions, vectors, expressions and one explicit coordinate system and retained semantic component records.
- `objects.ts`: atomic object commands, presets, property eligibility and safe deletion.
- `physics.ts`: interaction/vector commands, quantity units, separation and derived attached presentation.
- `geometry.ts`: central attachment coordinates independent of Konva.
- `eligibility.ts`: deterministic structural prerequisites, reusable without the UI.
- `naming.ts`: abbreviations and generated symbols without parsing labels into relationships.
- `constants.ts`: immutable canonical G/k_e definitions outside document data.
- `expressions.ts`: bounded AST grammar, relevant references, rendering, cycles and deletion guards. No evaluation.
- `renderer.ts`: Konva rendering, enlarged touch targets, specialized graphics and attached vector updates.
- `property-form.ts`, `vector-ui.ts`, `expression-ui.ts`, `main.ts`: draft dialogs, collections and document operations.
- `persistence.ts`: v1/v2 migration and whole-document validation before replacement.

**Coordinates** creates or edits one independent 1D/2D frame. Drag its origin; select its axes to use the rotation handle, or enter a numerical angle in the modal. Positive angles rotate the reference axes counterclockwise. Reverse x-axis and Reverse y-axis independently select positive directions; the y control appears only in 2D, and its setting survives 1D/2D changes. Origin, dimensions, angle, reversals and visibility persist. Hiding axes retains the frame; deleting it removes coordinate-dependent displays without deleting physical elements.

Only the active vector displays dotted coordinate projections, with x/y appended to its existing participant subscripts. They remain visible while manipulating the frame. Show coordinate components in the vector editor controls presentation only. The single internal `COMPONENT_ANGLE_TOLERANCE_DEGREES` defaults to 10°. Within 10° inclusive of either undirected rotated axis, graphical decomposition is entirely suppressed. In 1D, projections are suppressed near parallel or perpendicular alignment; otherwise only x appears. Actual vector geometry, magnitudes, variables and relationships remain unchanged. No pixel length becomes a physical quantity.

The toolbar is Object | Vector | Coordinates | Elements, each with a monochrome outline icon and text label. Vector types appear in the order Force, Field, Separation, Acceleration, Velocity, Displacement. Elements launches the existing Objects and Vectors managers or coordinate configuration. Double-click/double-tap editing remains available. Creation and editing dialogs omit inapplicable properties/representations; applicable unchecked properties remain available. Unavailable vector types remain disabled for discovery.

Files without explicit axes retain their prior appearance and acquire no coordinate definition. Earlier code had no coordinate-decomposition renderer; linked normal/friction/resultant forces retain their existing rendering. Mathed integration, algebra, assessment, AI tutor, authentication, server storage and image export remain separate work.

## Verification and deployment

Run `npm ci`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run test:browser`. Browser tests use compiled production assets through local Vite preview. `TEST_URL=https://jchristophm.github.io/diagramed/ npm run test:browser` tests the deployed app independently.

GitHub Actions verifies development pushes/PRs. Deployment and independent live acceptance require an explicit workflow dispatch; development pushes do not publish. Local Chromium desktop and mobile-emulation tests run against the compiled assets. Real touchscreen testing remains the user's responsibility. PR previews are not configured.

`examples/scenario-A` through `scenario-F` contain representative student-authored models/expressions. They are example documents, not UI equation templates. `representative.diagramed.json` and `version2.diagramed.json` remain genuine legacy fixtures. See docs/FORMAT.md, docs/STATUS.md and the historical development contracts and Contract 3.1 refinements.

Contract 3.1 refines notation and presentation without adding physics categories, coordinate systems, equations or solving. The native format remains version 3. See docs/DEVELOPMENT_CONTRACT_3_1.md and the final verification record in docs/STATUS.md.

Known-zero acceleration, velocity and displacement display an attached mathematical label such as `a_R = 0 m/s²`, using the existing symbol and selected units. Unknown and nonzero motion retain arrows. Zero motion uses a label-only presentation record with zero endpoints; prior arrow points are retained as dormant configuration and restored when leaving known zero. Existing IDs, manual label offsets, visibility, component settings and Undo/Redo are retained. Force and field behavior is unchanged.
