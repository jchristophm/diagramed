# Diagramed JSON format version 2

`format` is `diagramed`; `version` is `2`; `id` is the persistent document UUID. Metadata contains title, createdAt and updatedAt. Semantics and presentation remain explicitly separate. Version 2 makes property state, ownership, visibility and labels formal document data.

## Semantic objects and property registry

`semantics.objects` contains records `{ id, name, properties }`. `properties` is a sparse mapping of selected `mass`, `charge`, `density` keys to variable IDs. An unselected property has no key; it never means zero. Objects have no geometric shape, position or visibility in their physical definition.

`semantics.variables` contains property records `{ id, symbol, quantity, ownerObjectId, unit, state, value? }`. `quantity` is mass, charge or density. State is explicit known/unknown. Unknown forbids a value; known requires a finite numerical value, with signed charge and nonnegative mass/density. Units currently offered are kg/g, C/mC/µC/nC, kg/m^3/g/cm^3. No automatic unit conversion or physics calculations occur. The value is interpreted in its stored unit. Editing a symbol/state/value retains the variable ID; removing a property removes its owned variable. Whitespace and grouping braces are ignored for collision checks (`m_2` and `m_{2}` conflict). This is a practical ambiguity check, not a symbolic mathematics equivalence engine.

Interaction, vector, coordinate-system and component arrays remain present but are not created by this phase. Referential validation and deletion guards anticipate their later use. Standalone legacy variables without property metadata can be retained; newly defined property variables require a valid owner and matching property reference.

## Presentation

`presentation.canvas` stores document width/height, independent of viewport. Grid stores size/visible. Ordered `elements` is drawing order. All Phase 1 geometry/styling fields are retained: id, kind, x/y, rotation, scaleX/Y, width/height, radius, local points, stroke/fill/strokeWidth, text/latex/fontSize/fontFamily.

Each physical object has exactly one saved graphical configuration, even when hidden. Its `semanticId` points to the object; the graphic `id` is independent and stable. Its kind is circle, rectangle or point. `visible` is boolean. "No visible representation" means a hidden configuration, not deleting physical or graphical data. Hidden state and appearance can be restored by Show. Initial hidden objects use a hidden circle configuration until a different appearance is selected.

`label` stores `{ showName, showProperties, offsetX, offsetY }`. Labels derive their text/symbols from the semantic definitions, so there are no orphaned arbitrary text elements for semantic objects. Offset is relative to the central attachment location; label orientation is screen-upright. Labels can be dragged and their visibility edited. Rendering images, Konva nodes, hit zones and selection controls are transient and never saved.

Rectangle x/y is its upper-left, circle/point x/y its center. `attachmentPoint()` maps a rectangle's local midpoint through scale and rotation into document coordinates; circle/point use their stored center. Visual rotation never implies rotational mechanics. Rectangle transforms can be nonuniform; its semantic meaning remains point-like. Circle transforms keep a uniform aspect in the normal editor controls. Semantic stroke widths remain visually consistent during resizing.

## Version 1 compatibility

The loader accepts versions 1 and 2. It validates before changing the open document and saves loaded data as version 2. Genuine Phase 1 generic graphics are retained in original order, with identical IDs, geometry, text, LaTeX and transforms. They are never assigned invented physical meanings. Reopened legacy labels/equations remain editable. No generic creation tools are visible.

If a version 1 file already contains explicit semantic property relationships, migration populates missing state/quantity/owner/unit from those explicit references. It does not infer relationships from drawings. An explicitly defined object lacking a configuration receives a new hidden configuration; its old generic graphics remain untouched. Existing v1 semantic graphics receive missing visibility/label defaults. Malformed references are rejected rather than repaired silently.

## Validation and persistence guarantees

Validation checks required fields, unique identities, finite supported geometry, known graphical types, complete label settings, one object configuration, valid object/property/variable ownership, supported units, known/unknown state, symbol ambiguity and relationship references. Unknown versions, invalid JSON, missing/orphaned references and contradictory property values produce understandable errors. The current diagram remains intact. Math is prepared before the candidate replaces the document.

Limits: 10 MB JSON, 5,000 entries per array, 100,000 characters per general text field, 80 per property symbol, 120 per object name, 10,000 units per canvas axis and 10,000 grid lines. Geometry magnitude is capped at 1,000,000; property values may be any finite number (Earth-sized masses are allowed). Extra fields are preserved for metadata/extensions; incompatible future semantics require another format version.

Download is UTF-8 application/json, two-space indentation and `.diagramed.json` extension. Serialization itself does not update metadata. Round-trip equivalence preserves physical definitions, identities, property values/states, graphical geometry, order, visibility, label configuration and editability; JSON whitespace/order is not significant.

The retained `examples/representative.diagramed.json` is a genuine v1 fixture. `examples/semantic-objects.diagramed.json` demonstrates v2 Rock, Table and hidden Earth.

## Contract 3 format extension (version 3)

New documents use version 3. Versions 1/2 migrate explicit object categories to `ordinary`, preserving names, identities, properties and geometry. Historical Earth and graphical point objects are never reinterpreted. Object category is independent of name and shape. Specialized categories are spatialPoint, planetSurface, spring, cable, chargedPlate and fluid. The property registry adds gravity, springConstant, extension and surfaceChargeDensity, with quantity-specific units. Charge, extension and surface charge density permit signed values. Plates store explicit polarity and reject contradictory known signed density.

Surface graphics use full canvas width, x=0, unrotated unit scale, y at their upper boundary and height=canvas.height-y. Spring/cable graphics store two independently editable local endpoints. Every hidden object retains one configuration. No physical quantities are inferred from graphical geometry.
