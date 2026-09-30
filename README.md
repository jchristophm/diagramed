# Diagramed

A semantic physics diagram editor. Live development application: https://jchristophm.github.io/diagramed/ . Source and all checkpoints are on `development`; `main` preserves the original import. Problemly is unchanged, and `original/` remains untouched.

## Using the editor

**Object** opens a confirmed physical definition. Ordinary objects have circle, rectangle, point or hidden representations and optional mass, charge and density. Category is independent of name. Presets include Spatial point (optional charge), Planet Surface (hidden, g=9.8 m/s²), Spring (optional k and extension), String/Cable, Charged Plate (polarity and optional surface charge density), and Fluid (Water, density=1000 kg/m³). Defaults still obey symbol collision checks. No placement creates forces or fields automatically.

Ground, plate and fluid span the logical canvas and anchor to its bottom. Drag their upper boundary to adjust the surface. Fluid is translucent and behind ordinary objects; its interior does not intercept object gestures. Springs and cables have independently adjustable endpoints. These graphical operations never change physical properties. Ordinary rectangles resize independently horizontally and vertically. Points retain enlarged hit targets.

**Objects** contains visible and hidden objects. Select, edit, show/hide or delete. Names and property symbols form one compact, horizontally centered label (for example Book, m_B). Optional label information can be disabled. Drag the combined label to adjust its position; its offset follows the object and survives renames and reopening. Double-click/double-tap a graphic or label to edit.

**Vector** defines Separation, Force, Field, Velocity, Acceleration or Displacement before creating its graphic. Unavailable choices are visible and disabled without hints. A separation has ordered FROM/TO references; its dashed arrow follows endpoint objects, and its physical distance is independent of the drawing. Point-source fields require source-to-observation separation; inverse-square forces accept either separation orientation without changing it.

Forces specify BY and ON, including near-surface/universal gravity, electric, ordinary contact, spring, cable tension and buoyancy. Fields specify BY and AT a Spatial point. Unknown magnitudes are valid. Buoyancy owns displaced volume; friction can own a static/kinetic coefficient. Contact with friction creates separate linked normal/friction vectors with independent lengths and perpendicular directions. Normal/friction/resultant notation is N/f/F respectively; without friction the ordinary contact force is F. Optional resultant presentation sums their displayed geometry, without calculating physical magnitudes.

Vector labels default near arrowheads, remain upright and follow geometry; independently dragged label offsets persist. A small noninteractive black dot marks shared vector origins. For attached arrows, drag the tip to change graphical direction and length; the tail stays attached. A contact normal tip rotates the pair, while its friction tip adjusts friction length along the perpendicular axis. Direction and graphical length are manipulated exclusively on the canvas; creation/editing dialogs contain only physical configuration. Separation endpoints and resultants cannot be disconnected. Hidden source objects can still produce force/field arrows attached to visible targets; hidden separation endpoints suppress only the separation drawing.

**Vectors** contains all defined vectors, including hidden ones. Linked contact vectors edit as a group and can be deleted with Delete group. Ordinary vector deletion removes its owned variables and removes the interaction only when no remaining vector uses it. Dependency guards refuse operations that would invalidate expressions, separation, field or interaction references.

## Mathematical definitions

Optional physical properties and magnitudes have stable variable IDs, quantities, units, ownership and explicit Known/Unknown states. Undefined properties are absent, never zero. Charge, surface charge density and spring extension can be signed. Known separation distances must be positive. No automatic unit conversion occurs.

Eligible vector magnitudes also support **Expression**. A contextual palette offers actual defined variables and relevant immutable G/k_e constants. Use ingredient buttons, arithmetic, parentheses, powers, negation, absolute value, π and finite numerical literals. Expressions begin empty; no governing equations are suggested. Variable references are stored by ID. Changing symbols updates the rendered expression without evaluating or rewriting it. Context restrictions, bounded syntax and cycle checks preserve integrity. For interaction quantities defined during initial creation, confirm the unknown force first and edit it to use the newly registered quantity in an expression.

Object abbreviations distinguish shared initials (Earth/Emu → Ea/Em). Generated symbols use those assignments while physical relationships use persistent IDs. New properties, interaction quantities and vectors receive automatic conventional symbols and rendered previews. Ordinary forms require no mathematical markup. Historical authored symbols remain custom and are preserved. Renames and new abbreviation conflicts update generated notation while expression references stay IDs. Identical names receive deterministic suffixes; stored abbreviations survive array reordering and deletion.

**Open**, **Grid**, **Delete**, **Save** manage JSON, grid visibility, selection deletion and JSON download. v1/v2 documents migrate to v3 with original graphics, names and identities intact. Legacy Earth objects are ordinary objects; historical points/arrows do not acquire new physics. Imported generic text/math remain editable, but generic creation is unavailable. Invalid files preserve the current document.

There is no autosave, undo or unsaved-change prompt. Download before leaving the page.

## Architecture

- `model.ts`: authoritative document store and independent graphical identities.
- `semantics.ts`: objects/categories, variables, interactions, vectors, expressions and reserved coordinate/component types.
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

Future coordinate systems and components should reference vector/variable IDs and use stored graphical directions with explicitly defined physical magnitudes. Extend the reserved coordinate/component records and eligibility/quantity units, without inferring distance from pixels. Mathed can consume expression ASTs and registry IDs. No coordinate components, algebra, assessment, AI tutor, authentication, server storage or image export are implemented.

## Verification and deployment

Run `npm ci`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run test:browser`. Browser tests use compiled production assets through local Vite preview. `TEST_URL=https://jchristophm.github.io/diagramed/ npm run test:browser` tests the deployed app independently.

GitHub Actions verifies development pushes/PRs, deploys development after verification, then uses a separate runner to repeat desktop/mobile acceptance against the live URL. Local Chromium launches are currently prohibited by the cloud workspace socket restriction; GitHub runners perform browser checks. Real touchscreen testing remains the user's responsibility. PR previews are not configured.

`examples/scenario-A` through `scenario-F` contain representative student-authored models/expressions. They are example documents, not UI equation templates. `representative.diagramed.json` and `version2.diagramed.json` remain genuine legacy fixtures. See docs/FORMAT.md, docs/STATUS.md and the three historical development contracts.

Contract 3.1 refines notation and presentation without adding physics categories, coordinate systems, equations or solving. The native format remains version 3. See docs/DEVELOPMENT_CONTRACT_3_1.md and the final verification record in docs/STATUS.md.
