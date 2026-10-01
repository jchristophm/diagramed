# Diagramed native JSON version 3

`format` is `diagramed`, `version` is 3, and `id` is a persistent document ID. Metadata stores title and creation/update times. `semantics` and `presentation` remain separate. JSON is readable UTF-8 with two-space indentation and `.diagramed.json` extension. Konva nodes, hit zones, selection handles, rendered images and UI drafts are never serialized.

## Objects and variables

Objects contain id, name, category, abbreviation, sparse properties and optional plate polarity. Categories: ordinary, spatialPoint, planetSurface, spring, cable, chargedPlate, fluid. Names do not establish categories or behavior. Properties map quantity names to variable IDs; omitted means undefined, never zero.

Object quantities and units:

| Quantity | Units | Known values |
|---|---|---|
| mass | kg, g | nonnegative |
| charge | C, mC, µC, nC | signed |
| density | kg/m^3, g/cm^3 | nonnegative |
| gravity | m/s^2, N/kg | nonnegative |
| springConstant | N/m | nonnegative |
| extension | m, cm | signed |
| surfaceChargeDensity | C/m^2, µC/m^2 | signed, matching plate polarity |

Spatial points allow only charge. Planet Surface allows gravity; Spring allows springConstant/extension; Cable has no intrinsic properties; Charged Plate allows surfaceChargeDensity; Fluid allows density. Ordinary objects retain mass/charge/density regardless of selected circle/rectangle/point representation.

Variables contain id, symbol, quantity, unit, state and exactly one property/vector/interaction owner: ownerObjectId, ownerVectorId or ownerInteractionId. Known has a finite value. Unknown has no value. Eligible vector magnitudes may have state=expression and an expression AST instead of value. Symbols are distinct after removing whitespace/grouping braces. IDs remain stable through renaming or changing states. Legacy standalone variables without ownership metadata remain supported.

## Interactions and vectors

Interactions contain id, kind, objectIds, sourceId (BY), targetId (ON), model, optional separationId, sparse interaction properties, optional friction mode and resultantVisible. Source and target are distinct. Kinds are gravitational, electric, contact, buoyant. Model distinguishes nearSurface/universal gravity and ordinary/spring/cable contact. Interaction properties reference owned volume/staticFriction/kineticFriction variables.

Volume supports m^3, cm^3, L and nonnegative known values. Coefficients use dimensionless unit `1` and nonnegative known values. No graphical geometry determines them.

Vectors contain id, kind and scalar variableId. Separation has ordered fromId/toId. Force references interactionId and objectId, with optional normal/friction/resultant role. Field references sourceId, observation objectId, fieldType and optional separationId. Motion has objectId and motionType velocity/acceleration/displacement.

Force magnitudes use N/kN, gravitational fields m/s^2 or N/kg, electric fields N/C or V/m, lengths/displacements m/cm/km, velocities m/s or km/h, accelerations m/s^2. Known magnitudes are nonnegative; known separation is strictly positive. Scalar magnitude and displayed direction/length are independent.

Inverse-square forces require separation between the participants in either order. Point-source fields require an ordered source-to-observation separation. Near-surface gravity and uniform plate fields require no separation. A hidden source can remain physically relevant. Field observation must be a spatialPoint. Eligibility is validated structurally, not by numerical availability or physical correctness.

## Presentation and attachments

`presentation` contains canvas width/height, grid size/visible and ordered elements. Each object/vector owns one independent graphical configuration. Object graphics reference semanticId; vector graphics reference vectorId. Visible is explicit. Hidden configurations preserve IDs, transforms, geometry, styling and labels.

All original geometry/styling fields remain: id, kind, x/y, rotation, scaleX/Y, width/height, radius, points, stroke/fill/strokeWidth, text/latex/fontSize/fontFamily. New kinds are surface, spring and cable. Point and ordinary shapes retain their original fields.

Surface has x=0, width=canvas.width, y at its adjustable upper boundary, height=canvas.height-y, no rotation and unit scale. Ground/plate/fluid styling derives from category; plate charge markers derive from stored polarity. Only its upper edge intercepts pointer gestures. Springs and cables use four local endpoint coordinates; their midpoint is the central attachment location.

Rectangle center maps through stored scale/rotation. Circle/point use their center. Separation drawing is derived from both endpoint centers and suppressed when either endpoint graphic is hidden. Its persisted configuration is independent of those derived positions. Attached vector tails derive from target/observation centers; points store relative graphical tip directions/lengths. Object moves do not rewrite physical variables.

A contact interaction with friction owns exactly one normal, friction and resultant vector. The normal graphical direction establishes group orientation; friction uses its independently stored length perpendicular to it. Resultant direction/length derive by adding displayed component vectors. No physical magnitude is calculated. Resultant remains an optional visible configuration and cannot be independently dragged.

Labels store showName/showProperties and offsetX/Y. Name/symbol content derives from the semantic registry; labels remain upright and independently draggable. Objects persist abbreviation and optional abbreviationName (the name used for that assignment). generatedSymbol is an optional boolean on every owned variable, including properties and interaction quantities. True enables central automatic notation; absent/false preserves historical custom symbols. Neither symbols nor abbreviations establish relationships. Canonical G/k_e are reserved. Generated names use conventional quantity prefixes and participating-object abbreviations; collision suffixes remain presentation only.

New labels add optional placement: objectCenter or vectorTip. Object-center offsets are relative to the horizontally centered combined name/math label. Vector-tip offsets are screen-coordinate displacements from the direction-dependent arrowhead anchor (bounded to the canvas before applying manual offsets), so labels remain upright and manual adjustments follow current geometry. Missing placement preserves the historical offset frame; known old defaults (object 24/24, vector 12/12) adopt current automatic placement during rendering without rewriting the imported file. Dragging saves an explicit placement and offsets. Shared black origin dots are derived Konva-only presentation, not serialized records.

## Expressions and constants

AST nodes:

- `{type:"number",value}`: finite numeric literal.
- `{type:"reference",id}`: persistent variable or canonical constant ID.
- `{type:"pi"}`: ordinary mathematical π.
- `{type:"unary",op,operand}`: `-` or `abs`.
- `{type:"binary",op,left,right}`: `+`, `-`, `*`, `/`, `^`.

Maximum 256 nodes, depth 32. Expressions have no evaluated result. Rendering resolves current symbols; references must belong to the vector's contextual palette. Self/circular references are rejected. Unknown ingredient values are allowed. Deletion/removal protects references before committing changes.

Constants `constant:G` (6.67430e-11 N*m^2/kg^2) and `constant:ke` (8.98755e9 N*m^2/C^2) are canonical immutable application definitions. Documents reference their IDs and cannot redefine their symbols/identities or serialize mutable copies. Only relevant contexts expose them.

## Migration and validation

Versions 1/2 load and save as version 3. Their original generic graphics remain in order with identical identities, geometry, LaTeX and text. Historical arrows never acquire interactions. Existing semantic objects migrate to ordinary category, preserving names and properties. Historical Earth is not renamed to Planet Surface, and historical point graphics are not reclassified as spatial points. Version 1's explicit semantic property references receive missing ownership/state/quantity/unit metadata; no drawing is interpreted as physics. Missing explicit-object configurations receive hidden defaults as in Contract 2.

Validation covers object/category/property eligibility, variable ownership/quantity/units/state, unique identities/symbols, constant reservations, vector prerequisites, interaction participants, separation endpoints, contact groups, expressions, graphical configurations and supported geometry. Imports validate and prepare mathematics before replacing the open document. Failure preserves current data.

Limits retain 10 MB JSON, 5,000 records per array, 100,000 characters per general text field, 80 per symbol, 120 per object name, 10,000 per canvas axis, 10,000 grid lines and geometry magnitude <=1,000,000. Physical values need only be finite and quantity-appropriate; astronomical masses are allowed. Extra metadata/extension fields are preserved. No comprehensive dimensional algebra, physics correctness, equation solving or automatic unit conversion is performed.

## Contract 3.1 compatibility

No new format version. Historical symbols stay custom unless already marked generated. An unambiguous generic F on a friction-enabled normal component is corrected to N with its original variable/vector IDs and expression references. Unrelated custom component symbols are retained. All imported structural data is validated before notation repair, then validated again before replacement. Drawing controls are removed from the UI only: directions, endpoints, transforms and component lengths remain persisted. Physical edits preserve existing vector geometry; displayed resultants remain derived from normal plus perpendicular friction.


## Coordinate systems and graphical decomposition (2026-10-01)

The existing version-3 `semantics.coordinateSystems` array permits zero or one entry:

```json
{"id":"persistent-id","dimensions":2,"origin":[400,300],"angle":30,"visible":true}
```

`angle` is in mathematical degrees: positive counterclockwise, x right at zero, y up. The screen-space basis is x=(cos(a),-sin(a)), y=(-sin(a),-cos(a)). `visible` is optional for older definitions and defaults to true. No physical object owns the frame. Translating its origin cannot alter projections. Switching dimensions preserves origin and x orientation; retained semantic y components are unavailable graphically in 1D.

Vector graphics optionally persist `showComponents` (boolean, default true with an explicit frame). Projection geometry and component labels are derived, not serialized as physical quantities or new variables. Labels append x/y to existing participant subscripts. Only the active vector displays coordinate components; it remains active while the frame is manipulated. Dot styling and parent labels remain intact.

`COMPONENT_ANGLE_TOLERANCE_DEGREES` is a presentation-only internal constant, default 10. Let delta be the acute angle between the actual vector and the undirected rotated x axis (0..90 degrees). Graphical decomposition appears only if delta>10 and delta<80. In 2D both projections appear; in 1D only x appears. At either inclusive boundary all projection arrows and labels are suppressed. Nothing snaps, rotates or rounds authoritative vector data. Recalculation follows vector/frame rotation and live attached geometry.

Missing frames do not introduce implicit axes or new graphics. The earlier application has semantic component records but no coordinate-projection renderer; its physical contact vectors retain their legacy behavior. Deleting a frame removes dependent semantic component records and graphical display settings, while preserving physical vectors and variables. Imports reject duplicate frames and malformed visibility. Version remains 3.


## Independent axis directions (2026-10-01 cleanup)

Coordinate-system records optionally include `reverseX` and `reverseY` boolean flags. Missing flags retain the historical unreversed convention; imports are not rewritten or migrated. No new format version. `angle` continues to rotate the reference axes. Each reversed positive basis vector is multiplied by -1 independently, preserving perpendicularity (including left-handed axis choices). The interactive rotation handle follows the reference x direction, independent of reversals.

The graphical dot-product sign changes when its basis axis reverses; multiplying that signed projection by the reversed basis leaves its physical arrow geometry unchanged. Internal `direction` metadata records only positive/negative graphical coordinate direction, never a numerical physical magnitude. Absolute angular separations and the inclusive 10° threshold are invariant under reversals. In 1D only x appears; reverseY remains stored for restoration in 2D.

New Planet Surface presets initialize visible Earth with g=9.8 m/s². Loading/editing existing planets preserves their names, gravity, visibility and graphical configuration. Default changes perform no migration or naming-system replacement.

## Editing history and saved-state tracking

History and the saved baseline are session-only DocumentStore state, never part of version-3 JSON. Bounded snapshots retain the full authoritative document without Konva nodes or math-image caches. Mutation notifications capture committed edits; transactions group modal mutations and continuous canvas gestures. Undo/Redo restore snapshots without generating new IDs or history entries. Successful import establishes a fresh baseline only after validation and rendering. Saved-state comparisons ignore updatedAt, semantic collection ordering and omitted optional flags equivalent to existing defaults, while preserving presentation stacking order. Grid visibility continues to be persisted and undoable. No format or import migration is added.
