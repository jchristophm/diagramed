
# DIAGRAMED
# Development Contract 3: Physical Interactions and Semantic Vectors

**Repository:** jchristophm/diagramed  
**Working branch:** development  
**Execution environment:** ChatGPT Work  
**Starting point:** Completed Development Contracts 1 and 2  
**Objective:** Complete Diagramed's object system and implement semantic physical interactions, vectors, separation relationships, and student-authored mathematical expressions.

---

## 1. PRIMARY OBJECTIVE

Transform Diagramed's existing semantic object editor into a functional semantic physics diagram editor.

Students must be able to define physical objects, establish interactions, create meaningful vectors, and optionally construct mathematical expressions using variables associated with their physical models.

Every newly created vector must possess a formal physical definition. Generic arrows without semantic meaning must not be introduced.

Preserve the fundamental distinction between:

1. Physical objects and their properties.
2. Physical interactions between objects.
3. Mathematical variables and expressions.
4. Graphical representations of objects and vectors.

The application model remains authoritative. Konva implements rendering and interaction but never becomes the authoritative physics model.

The resulting architecture must support future independent coordinate systems, calculated vector components, Mathed integration, and an instructor-configurable AI tutoring system.

Do not implement coordinate systems, assessment, physics solving, or AI tutoring during this contract.

This is a substantial development pass. Complete it through the recoverable checkpoints specified below.

---

## 2. PRESERVE THE EXISTING FOUNDATION

Before implementation, inspect:

- docs/DEVELOPMENT_CONTRACT.md
- docs/DEVELOPMENT_CONTRACT_2.md
- docs/STATUS.md
- docs/FORMAT.md
- README.md
- Existing TypeScript modules.
- Existing unit and browser tests.

Work from the current development branch HEAD.

Preserve all successful functionality established in Contracts 1 and 2, including:

- The authoritative document store.
- Independent persistent semantic and graphical identities.
- Existing physical object creation and editing.
- Known and unknown physical properties.
- The mathematical variable registry.
- The object collection.
- Reusable Konva graphical interactions.
- Mathematical rendering.
- Desktop and mobile interfaces.
- Native JSON downloading and reopening.
- Backward compatibility with existing documents.
- Automated verification and GitHub Pages deployment.

Extend the existing architecture rather than creating competing state-management, rendering, or mathematical systems.

Retain the imported Problemly source as an untouched historical reference.

Never modify the original Problemly repository or deployment.

Do not merge development into main without explicit authorization.

---

# PART I: COMPLETE THE PHYSICAL OBJECT SYSTEM

## 3. EXTEND OBJECT DEFINITIONS

Introduce explicit physical object categories or archetypes in the existing semantic object model.

At minimum, support:

- Ordinary physical object.
- Spatial point.
- Planet Surface.
- Spring.
- String/Cable.
- Charged Plate.
- Fluid.

An object's category must be stored independently of its displayed name and graphical representation.

For example, renaming Water to Oil must not remove its identity as a fluid. Renaming Planet Surface to Mars must not change its physical behavior.

All objects retain persistent semantic identities.

Extend the existing predefined-object mechanism. Do not implement a separate object registry.

Each predefined object must support editing, visibility management, graphical persistence, and access through the existing object collection.

Preserve the principle that graphical shapes do not independently establish physical meaning.

### 3.1 Ordinary physical objects

Retain the existing object functionality.

Supported physical properties remain:

- Mass.
- Electric charge.
- Mass density.

Properties remain optional.

Each defined property has a persistent variable identity, user-editable mathematical symbol, appropriate units, and explicit known or unknown state.

### 3.2 Spatial points

Introduce an explicit spatial-point object category.

Spatial points may have:

- No physical properties.
- Optional electric charge.

Mass and mass-density options must be disabled for newly created spatial points.

Spatial points have selectable point representations with enlarged touch targets.

They can be used as observation locations for field vectors and as endpoints for separation vectors.

A charged spatial point may also participate in applicable electric interactions.

Distinguish the semantic spatial-point category from legacy graphical points.

Existing documents containing point graphics with other properties must remain loadable without data loss. Do not automatically reinterpret legacy objects as spatial points.

### 3.3 Planet Surface

Replace the existing Earth predefined-object option with **Planet Surface**.

For newly created Planet Surface objects:

- Default name: Planet Surface.
- Default representation: hidden.
- Default gravitational field strength: known, 9.8 m/s².
- Default symbol: g.
- Allow the student to change the symbol, numerical value, units where appropriate, or known/unknown state.

Planet Surface represents the near-surface uniform gravitational-field approximation.

When shown, its graphical representation is a solid ground plane:

- Full logical canvas width.
- Anchored to the bottom of the canvas.
- Adjustable vertical position of its top edge.
- Visually recognizable as a flat surface.
- Persistent across saving, hiding, showing, and reopening.

Dragging the upper boundary adjusts the graphical surface height. It must not change the defined gravitational field strength.

Do not automatically create gravitational force arrows or field vectors.

Any existing Earth objects in version 2 documents must remain intact. Do not silently rename or reinterpret existing saved documents. New preset behavior applies to newly created objects.

### 3.4 Spring

Add Spring to the predefined-object library.

Its representation should be an adjustable conventional zigzag spring, with independently adjustable graphical endpoints.

The spring may also be hidden.

Support these optional physical properties:

- Spring constant k, with default units N/m.
- Extension or compression Δx, with default units m.

Both properties support known and unknown states and user-defined mathematical symbols.

Spring constants must be nonnegative. Signed extension or compression values are permitted.

The spring's graphical length does not automatically determine its physical extension.

Do not calculate spring force automatically or suggest Hooke's law.

The spring category must be available to the semantic interaction system.

### 3.5 String/Cable

Add String/Cable to the predefined-object library.

Its visible representation is a straight cable segment with independently adjustable endpoints.

Allow it to be hidden.

No special physical properties are required initially.

Tension magnitude belongs to a force associated with the cable's interaction with another object, not to an automatically created intrinsic cable property.

Do not simulate elasticity, sagging, or mechanical constraints.

### 3.6 Charged Plate

Add Charged Plate to the predefined-object library.

It represents an idealized uniformly charged plane capable of producing a uniform electric field.

Its initial representation is an adjustable flat plane similar to Planet Surface, with a distinct visual appearance.

Display small, consistently spaced positive or negative charge indicators according to the selected polarity.

The student must be able to change the polarity.

Add surface charge density as a new physical property:

- Quantity: surface charge density.
- Default symbol: σ.
- Default units: C/m².
- Support known and unknown states.

Surface charge density is a separate physical quantity from mass density. Do not simply add charge-density units to the existing mass-density property.

Its mathematical value may be signed. Ensure that the displayed polarity and any known signed value are consistent. Preserve polarity when the magnitude is unknown.

The idealized model for this preset is a uniformly charged, nonconducting plane. Do not introduce a separate conducting-plate model during this contract.

Do not automatically draw electric field lines or field vectors.

A student must explicitly define any field vector.

Changing graphical geometry must not change the physical surface charge density.

### 3.7 Fluid

Add Fluid to the predefined-object library.

Default name: Water, editable.

Default physical property:

- Mass density.
- Default known value: approximately 1000 kg/m³.
- Default symbol: ρ, subject to the existing variable-symbol collision rules.

The student may change its density, symbol, unit, or known/unknown state.

Its visible graphical representation should resemble water:

- Full logical canvas width.
- Anchored to the bottom.
- Adjustable upper surface.
- Translucent blue fill.
- Positioned visually behind ordinary physical objects where appropriate.

The same adjustable-surface rendering infrastructure should be reusable for Planet Surface, Charged Plate, and Fluid, with category-specific styling.

Ensure that the translucent fluid does not obstruct the selection or manipulation of objects displayed within it.

Fluid visibility must be optional and persistent.

Moving an object into or out of the displayed fluid must not automatically create buoyancy or modify displaced volume.

Do not simulate fluid dynamics, pressure, floating, or sinking.

### 3.8 Specialized graphical architecture

Extend the existing graphical representation system only as required to support these object categories.

Preserve the rule that an object has one persistent graphical configuration, even when hidden.

Additional renderers, specialized geometry, endpoints, and category-specific styling may be introduced without creating a second authoritative document model.

Retain the existing graphical functionality for ordinary objects and imported legacy graphics.

Do not restore generic graphical creation tools.

---

# PART II: SEMANTIC INTERACTIONS AND MATHEMATICAL INFRASTRUCTURE

## 4. EXTEND THE VARIABLE REGISTRY

The existing variable registry primarily supports object-owned properties.

Extend it to accommodate:

1. Object-owned physical properties.
2. Interaction-owned physical quantities.
3. Vector magnitudes.
4. Separation magnitudes.
5. Built-in physical constants.
6. Future derived vector components.

Preserve persistent variable IDs independently of displayed mathematical symbols.

Each variable must have an explicit physical quantity, appropriate units, ownership or reference relationship, and supported value definition.

Continue supporting:

- Unknown.
- Known numerical value.

Additionally, support student-authored mathematical expressions for eligible vector magnitudes.

Expression implementation requirements are specified in Part IV.

Do not attempt to implement a general symbolic algebra system.

### 4.1 Physical constants

Introduce a small built-in physical constants registry.

Initially provide:

**Universal gravitational constant**

Symbol: G  
Value: 6.67430 × 10^-11  
Units: N·m²/kg²

**Coulomb constant**

Symbol: k_e  
Value: approximately 8.98755 × 10^9  
Units: N·m²/C²

These constants have stable identities and immutable standard values.

The Coulomb constant must use k_e to distinguish it from user-defined spring constants.

Built-in constants should not require students to create objects or manually define them.

Expose them only in mathematically relevant contexts.

Allow standard mathematical operations and numerical literals. Support π as an ordinary mathematical constant where applicable.

Do not expand this into a comprehensive physical constants library.

### 4.2 Interaction-owned variables

Support quantities belonging to an interaction rather than an individual physical object.

Required examples:

- Static friction coefficient.
- Kinetic friction coefficient.
- Displaced fluid volume.

These variables must be associated with the relevant persistent interaction ID.

They must remain editable without changing their identities.

Removing an interaction must handle its dependent variables and expressions safely.

Use the existing relationship-aware deletion architecture.

---

## 5. SEMANTIC INTERACTIONS

Extend the existing interaction definitions into functional physical relationships.

Support four primary force categories:

1. Gravitational.
2. Electric.
3. Contact.
4. Buoyant.

Contact must additionally support ordinary contact, spring force, and cable tension.

The interaction model must explicitly reference its participating physical objects.

Force definitions use the relationship:

**Force BY [source object] ON [target object].**

The source and target must be different semantic objects.

Every force must have an explicit interaction type and persistent identity.

Interactions may own physical quantities.

A contact interaction may support several linked force-vector representations without creating unrelated duplicate interactions.

Creating a force and its required interaction should be an atomic confirmed operation where practical.

Canceling must not leave orphaned relationships or variables.

---

## 6. SEPARATION VECTORS

Introduce **Separation** as an independent semantic vector type.

Students define:

**Separation FROM [object or point] TO [object or point].**

Both endpoints must refer to persistent semantic object IDs.

The ordered FROM/TO relationship establishes the vector's direction.

Provide an automatically generated mathematical symbol using the participating objects' persistent abbreviations.

For example:

r⃗_(A,B)

The separation vector has:

- Persistent vector identity.
- Persistent endpoint references.
- A scalar magnitude variable.
- User-editable mathematical symbol.
- Appropriate length units.
- Known or unknown magnitude.
- Independent graphical presentation.
- Optional visibility.

### 6.1 Graphical representation

Use a visually distinct arrow style, preferably a muted dashed arrow, to distinguish separation from solid force and field vectors.

The arrow starts at the FROM object's attachment point and terminates at the TO object's attachment point.

The arrowhead establishes the positive FROM-to-TO direction.

The graphical endpoints are constrained by their semantic object references.

Moving, resizing, or rotating an endpoint object must update the displayed separation arrow automatically.

Students must not be able to disconnect the arrow merely by dragging its graphical endpoints.

Hiding the separation vector must preserve its entire semantic definition.

If an endpoint object is hidden, the separation relationship remains valid even if its graphical arrow cannot currently be displayed.

Hidden separation vectors remain accessible through the vector collection.

### 6.2 Physical magnitude versus displayed geometry

Do not infer physical separation from canvas coordinates.

The scalar physical magnitude is independently defined by the student.

Moving objects for graphical clarity must never overwrite that magnitude.

Require a positive numerical magnitude when a separation distance is explicitly known.

The displayed direction and physical magnitude must remain separate concepts.

This is essential for future coordinate-system calculations.

### 6.3 Reuse and dependency protection

Existing separation relationships may be reused by compatible physical interactions.

Inverse-square force and point-source field configurations require an appropriate separation relationship.

For a force between two objects, a separation joining those two objects in either order is structurally compatible, while its stored direction remains unchanged.

For a field evaluated at a point, the required separation must connect the source and observation point with an explicitly known orientation.

Do not silently reverse an existing separation vector or alter its stored direction.

Deleting an endpoint object or a referenced separation must respect existing dependency guards.

Never leave dangling references.

---

# PART III: VECTOR CREATION AND GRAPHICAL BEHAVIOR

## 7. VECTOR CREATION INTERFACE

Introduce a compact, mobile-friendly semantic vector creation interface.

Students configure a vector before its graphical representation is placed on the canvas.

Support these choices:

- Force.
- Field.
- Separation.
- Velocity.
- Acceleration.
- Displacement (motion).

Do not offer generic arrow creation.

### 7.1 Deterministic availability

Unavailable choices must appear disabled without instructional explanations.

Do not provide explanatory tooltips, suggested missing steps, or hints.

Availability is based on deterministic structural prerequisites.

Examples:

- With no physical objects, vector creation is unavailable.
- Force requires at least two distinct eligible physical objects.
- Separation requires two distinct endpoint objects or points.
- Field requires an eligible source and a spatial observation point.
- Velocity, acceleration, and displacement require an appropriate target object.
- Interaction-specific options require appropriate participating object categories.
- Separation-dependent interactions require a compatible defined separation relationship before they can be completed.

Do not make the existence of numerical property values a universal prerequisite for creating a vector. Students may legitimately define forces with unknown magnitudes.

Evaluate eligibility against the complete actual requirements, not just the number of objects.

Unavailable options must remain visible but disabled.

Provide ordinary validation errors for malformed input or failed document operations, but no pedagogical explanations for unavailable options.

Maintain machine-readable eligibility rules for possible future instructional software.

### 7.2 Configuration workflow

For forces, the student selects:

1. Force.
2. Interaction category.
3. Force BY object.
4. Force ON object.
5. Relevant interaction-specific options.
6. Magnitude definition.
7. Confirmation.

For fields, the student selects:

1. Field.
2. Gravitational or electric field.
3. Source object.
4. Observation spatial point.
5. Magnitude definition.
6. Confirmation.

For separation, the student selects FROM and TO endpoints and defines its optional physical magnitude.

Velocity, acceleration, and displacement are associated with one physical object and have independently defined magnitude and direction.

Do not require coordinate systems to create any of these vectors.

---

## 8. MATHEMATICAL LABELS AND OBJECT ABBREVIATIONS

Generate semantic vector symbols from physical definitions.

Assign document-level object abbreviations that remain distinct and consistent throughout the document.

Normally use the first letter of each object's name.

When names share an initial letter, extend their abbreviations consistently until they are distinguishable.

For example:

Earth and Emu become Ea and Em.

Their force symbol would be:

F_(Ea,Em)

Store object abbreviation assignments independently of variable identities.

Renaming an object may update its displayed abbreviation and generated vector symbols without breaking semantic references or mathematical expressions.

Do not rely on parsing displayed subscripts to discover the physical source or target.

Use the following default force notation:

- Ordinary gravitational force: F_(BY,ON).
- Near-surface gravitational force from Planet Surface: W_(BY,ON).
- Electric force: F_(BY,ON).
- Ordinary contact force: F_(BY,ON).
- Normal force: N_(BY,ON).
- Friction force: f_(BY,ON).
- Cable tension: T_(BY,ON).
- Spring force: F_(BY,ON).
- Buoyant force: F_(BY,ON).

Use distinct semantic IDs and deterministic disambiguation when two relationships would otherwise generate identical displayed symbols.

Force notation must depend on interaction type and physical object category, not on an object's current displayed name.

All mathematical labels must use the existing LaTeX-rendering infrastructure.

---

## 9. FORCE VECTORS

All ordinary force vectors must:

- Have persistent semantic identities.
- Reference their physical interactions.
- Reference their BY and ON objects.
- Have scalar magnitude variables.
- Support unknown, known, or expression-based magnitude definitions.
- Have optional persistent graphical visibility.
- Use solid-arrow representations.
- Have editable graphical direction and length.
- Attach their tails to the ON object's central attachment point.

Forces remain attached when the ON object's graphical representation moves or changes.

Students control their displayed directions and graphical lengths.

Do not automatically determine the correct physical direction.

Do not interpret arrow length as a numerical force magnitude.

Graphical orientation and physical magnitude remain distinct stored information.

Moving or editing a force must not destroy its semantic identity.

### 9.1 Gravitational forces

Support two cases.

**Near-surface gravity**

When the BY object is Planet Surface, use the near-surface model and the W naming convention.

Expose the ON object's mass and Planet Surface's defined gravitational field strength as available mathematical variables when those properties exist.

Do not automatically create or suggest a mathematical relationship.

No separation relationship is required.

**Universal gravitation**

For compatible ordinary mass-capable objects, support separation-dependent gravitational force.

Require a defined compatible separation relationship.

The contextual mathematical palette may expose:

- Mass of the BY object.
- Mass of the ON object.
- Separation magnitude.
- Universal gravitational constant G.

Expose only variables that have actually been defined, along with applicable built-in constants.

Do not silently invent missing properties.

### 9.2 Electric forces

Support separation-dependent electric interactions between eligible charged objects.

Require a compatible separation relationship.

Expose:

- BY object's defined charge.
- ON object's defined charge.
- Separation magnitude.
- Coulomb constant k_e.

Allow signed electric charges.

Preserve the student's graphical force direction independently of the signs and mathematical expression.

Do not automatically determine attraction or repulsion.

Charged Plate also supports uniform electric-field definitions. Do not automatically create electric forces merely because a charged plate exists.

### 9.3 Ordinary contact forces

Support a contact interaction between two eligible physical objects.

When friction is not selected, the interaction produces an ordinary solid force arrow.

When friction is selected, it produces a linked normal/friction force pair.

Allow the student to select static or kinetic friction.

Create an optional interaction-owned friction coefficient with appropriate known or unknown state.

Do not suggest a friction equation.

### 9.4 Linked normal and friction vectors

When friction is enabled, display:

- Normal force N_(BY,ON).
- Friction force f_(BY,ON).

These are two distinct semantic vectors linked to the same contact interaction.

Both are attached to the ON object.

Their graphical lengths must be independently adjustable.

Students may rotate the linked pair, but its two component arrows must remain perpendicular.

Allow the student to choose whether to display the resultant contact-force arrow.

When displayed, the resultant is generated geometrically from the graphical normal and friction vectors and uses the corresponding F_(BY,ON) label.

Changes in either component's displayed length or their shared orientation must update the displayed resultant.

The resultant must not behave as an unrelated independently draggable vector.

Do not infer numerical force magnitudes from graphical lengths.

Maintain separate semantic magnitude definitions and persistent vector identities.

The geometrically derived resultant is a graphical relationship, not an automatic physics solver.

### 9.5 Spring forces

Recognize a Spring as an eligible force source in a spring-contact interaction.

The ON object is another physical object.

Expose the spring's defined spring constant and extension/compression variables to the mathematical expression editor.

Do not automatically generate a spring-force expression.

Its force arrow is an ordinary semantic force vector attached to the ON object.

The spring's graphical extension must remain independent of its defined physical extension.

### 9.6 Cable tension

Recognize String/Cable as an eligible force source in a cable-contact interaction.

Use the T_(BY,ON) naming convention.

The tension magnitude may be unknown, known, or defined through an allowed student-authored expression.

The tension force attaches to the ON object.

Do not infer tension magnitude or direction from the cable's graphical geometry.

### 9.7 Buoyant force

Add Buoyant as the fourth primary force category.

Require:

- One Fluid object as the BY object.
- One distinct eligible physical object as the ON object.

When the student creates the buoyant interaction, provide an interaction-owned displaced-volume variable.

Default symbol: V_disp.  
Default units: m³.

Support appropriate alternative volume units, known or unknown state, and user-editable mathematical symbols.

Displaced volume belongs to the interaction, not intrinsically to the Fluid or ON object.

The mathematical palette for this interaction may expose:

- Fluid density.
- Displaced volume.
- Gravitational field strength from an explicitly defined Planet Surface.

Do not invent Planet Surface or gravitational field strength automatically.

A buoyant force may still be defined without a mathematical expression when the required variables are unavailable.

Use a conventional solid force arrow attached to the ON object.

Do not infer displaced volume, floating behavior, or buoyant-force magnitude from the drawing.

---

## 10. FIELD VECTORS

Implement gravitational and electric field vectors.

Fields use the semantic relationship:

**Field BY [source object] AT [spatial point].**

Every field vector references:

- A persistent source-object identity.
- A persistent observation-point identity.
- Its physical field category.
- A persistent magnitude variable.

Field vectors are drawn as solid arrows attached to their observation points.

Their directions and lengths remain student-controlled.

Support known, unknown, and student-authored expression magnitudes.

### 10.1 Gravitational fields

Allow eligible mass sources and Planet Surface.

For a mass source, require an appropriate source-to-observation separation relationship.

Expose the defined source mass, separation magnitude, and G.

For Planet Surface, no separation relationship is necessary. Expose its defined gravitational field strength.

Do not create a field vector merely because Planet Surface exists.

### 10.2 Electric fields

Allow appropriate electric sources, including:

- Charged ordinary objects.
- Charged spatial points.
- Charged Plate.

For point-source electric fields, require an appropriate separation relationship between the source and observation point.

Expose source charge, separation magnitude, and k_e.

For the uniform charged-plate approximation, no separation relationship is required.

Expose defined surface charge density and applicable mathematical constants.

Do not automatically suggest the governing field equation.

An observation point may have its own electric charge. Its own charge must not automatically become an ingredient in the mathematical expression for the external electric field produced by the selected source.

### 10.3 Field visibility

Field vectors must be explicitly created.

Their visibility is independent of the source object's graphical visibility, subject to whether their graphical attachment can currently be displayed.

Do not automatically draw background field lines, field arrows, or field grids.

---

## 11. VELOCITY, ACCELERATION, AND DISPLACEMENT

Implement semantic motion-related vectors:

- Velocity.
- Acceleration.
- Displacement.

Use Displacement as the specific physical interpretation of the proposed Motion option.

Each vector references one physical target object.

Each has:

- Persistent vector identity.
- Appropriate physical quantity and units.
- Known, unknown, or optional expression-based magnitude.
- Student-controlled graphical direction.
- Student-controlled graphical length.
- Optional visibility.

Display these vectors as solid arrows with visually distinguishable default styling where practical.

Their tails are attached to their associated object's attachment point.

For displacement, retain a defined directional vector associated with the object; do not infer actual motion trajectories or require time-evolution data.

Do not implement kinematics solving, animation, trajectories, or automatic physical calculations.

Do not implement calculated coordinate components in this phase.

---

# PART IV: STUDENT-AUTHORED MATHEMATICAL EXPRESSIONS

## 12. CONTEXTUAL MATHEMATICAL PALETTE

Provide an optional mathematical expression editor for eligible force, field, and motion-vector magnitudes.

The editor must expose the relevant mathematical variables according to the configured semantic relationship.

**Do not suggest or preassemble governing physics equations.**

Students should determine the mathematical relationship independently.

For example, a universal gravitational interaction may make available the two defined masses, the relevant separation magnitude, and G.

An electric interaction may expose the two defined charges, the separation magnitude, and k_e.

A spring interaction exposes its defined spring constant and extension.

A buoyant interaction exposes fluid density, displaced volume, and available gravitational field strength.

These are available mathematical ingredients, not equation templates.

### 12.1 Student-defined symbols

Always display the actual mathematical symbols assigned to the registered variables.

If a student has named the mass of a book m_7, display m_7 rather than silently substituting m_B.

The physical meaning comes from the underlying semantic reference, not the symbol's appearance.

### 12.2 Allowed mathematical operations

Support an appropriately bounded expression grammar including:

- Addition.
- Subtraction and unary negation.
- Multiplication.
- Division.
- Parentheses.
- Exponents.
- Numerical literals.
- Applicable mathematical constants.

Include any additional elementary operations essential to the required interactions, such as absolute value, if straightforward.

Do not introduce a general-purpose symbolic mathematics package unless genuinely necessary.

Do not introduce an unrestricted LaTeX text box that permits unregistered variable references.

Use a structured expression model with persistent references to registered variables and constants.

The existing KaTeX infrastructure should render the resulting expressions.

### 12.3 Context restrictions

The expression editor must expose only variables semantically relevant to its configured physical relationship.

Students must not construct expressions using arbitrary unrelated registered variables or undefined symbols.

If a required quantity has not been defined, do not fabricate it.

The student can return to the relevant object or interaction definition to add that quantity.

Do not display a suggested physics equation or instructional explanation.

### 12.4 Expression persistence

Store expressions as structured mathematical data.

Variable references must use persistent IDs, not merely their displayed symbol strings.

Expressions must remain valid when participating objects or variables are renamed.

When displayed symbols change, regenerate the expression's rendered representation without changing its underlying references.

Prevent dangling references when removing objects, properties, interactions, separation relationships, or constants used by existing expressions.

Validate expression syntax and reference integrity.

Do not automatically assess whether the student's physics is correct.

### 12.5 Magnitude definition states

Each eligible vector magnitude may be:

1. Explicitly unknown.
2. A known numerical value with units.
3. A student-authored mathematical expression.

An expression may reference variables whose numerical values are unknown.

Do not require numerical evaluation.

Do not overwrite a student-authored expression when an underlying variable's numerical value changes.

Do not silently convert a symbolic expression into an automatically calculated result.

### 12.6 Dimensional architecture

Preserve explicit physical quantities and units in the registry.

Structure expressions so future dimensional analysis and Mathed integration are possible.

Basic numeric validation and unit eligibility should remain functional.

Do not implement comprehensive dimensional analysis, unit algebra, equation solving, or assessment during Contract 3.

---

# PART V: INTERFACE AND GRAPHICAL INTEGRATION

## 13. EDITOR INTERFACE

Preserve the current compact, mobile-friendly editor.

Extend its existing controls rather than redesigning the application.

Provide access to:

- Object creation.
- Object collection.
- Vector creation.
- Vector collection.
- Existing document controls.

Do not display nonfunctional placeholders.

The vector collection must include all defined vectors, including hidden separation vectors and other hidden vector definitions.

Students must be able to select, edit, show, hide, and delete their vectors where appropriate.

Selection through the canvas or collection must resolve to the same authoritative semantic record.

Avoid permanent panels that substantially reduce usable canvas space on mobile devices.

Use dialogs or similarly compact contextual interfaces.

### 13.1 Graphical consistency

Use recognizable graphical conventions:

- Physical objects use their selected representations.
- Planet Surface uses a solid ground plane.
- Fluid uses a translucent blue region.
- Charged Plate uses an appropriate plane with charge indicators.
- Spring uses a recognizable zigzag.
- Cable uses a straight segment.
- Forces and fields use solid arrows.
- Separation uses a distinct dashed arrow.
- Normal/friction pairs remain perpendicular.
- Resultant contact force, when enabled, is graphically derived from its displayed components.

All graphical elements must preserve their associated semantic identities.

All graphical configurations must survive JSON downloading and reopening.

### 13.2 Attachment behavior

Use the existing geometry and attachment infrastructure wherever possible.

Extend it to support:

- Ordinary object-attached vectors.
- Point-attached field vectors.
- Persistent separation endpoints.
- Linked contact-force groups.
- Specialized graphical objects.

Moving an object must update dependent graphical attachments.

Do not allow ordinary graphical manipulation to replace semantic relationships.

Retain enlarged mobile touch targets and existing grid behavior.

### 13.3 Presentation versus physics

A student's diagram is illustrative unless numerical geometry has explicitly been defined.

Never infer physical magnitude, separation, spring extension, displaced volume, or vector correctness solely from rendered pixel distances.

Students may adjust graphical presentations independently of their physical definitions.

The model must remain suitable for a future coordinate-system implementation.

---

# PART VI: FUTURE INSTRUCTIONAL ARCHITECTURE

## 14. PREPARE FOR AN AI TUTOR WITHOUT IMPLEMENTING ONE

Diagramed is becoming a structured physics-model construction environment.

Its future AI layer may serve as an instructor-configurable tutor rather than merely an assessment engine.

Preserve sufficient structured information for a future tutoring system to identify:

- Defined physical objects.
- Physical properties and quantities.
- Explicit interactions.
- Defined and undefined variables.
- Vector identities and physical relationships.
- Student-authored mathematical expressions.
- Available structural operations.
- Missing structural prerequisites.

Do not create student-facing instructional hints during this contract.

Disabled creation options must remain disabled without explanations.

The underlying prerequisite logic should be deterministic and reusable.

Anticipate future instructor-controlled configurations such as:

- Formative or summative activity.
- AI tutor enabled or disabled.
- Full instructional assistance.
- Guided assistance.
- Hints only.
- No assistance.

These settings must eventually be controlled outside student-editable diagram data.

Do not implement these controls, tutoring, AI evaluation, correctness grading, or assessment engines during this contract.

Do not add speculative AI infrastructure or unnecessary services.

The current objective is to preserve useful, explicit semantic information.

---

# PART VII: NATIVE JSON AND DATA INTEGRITY

## 15. EXTEND NATIVE JSON PERSISTENCE

Extend the current structured JSON format to support the completed physics functionality.

Introduce a new explicitly documented format version if needed. Version 3 is the anticipated next version.

Preserve separation between semantic definitions and graphical presentation.

The document must persist:

- All physical objects and their categories.
- All object properties and variables.
- All interactions and interaction-owned quantities.
- All vector definitions and vector magnitude variables.
- All student-authored mathematical expressions.
- All separation relationships and their ordered endpoints.
- Persistent identities and references.
- Graphical visibility and geometry.
- Specialized surface, spring, cable, and charge-indicator presentation.
- Vector attachment information.
- Linked normal/friction geometry.
- Optional resultant visibility.
- Object abbreviation assignments and mathematical labels.
- Document metadata.

Built-in constants should retain stable canonical identities and values. Do not create independent mutable copies merely to serialize them.

### 15.1 Backward compatibility

Previously generated version 1 and version 2 documents must continue loading.

Genuine legacy graphical elements must remain intact and editable.

Existing semantic objects must retain their identities and physical properties.

Do not infer new physical interactions from legacy graphical arrows.

Do not silently reinterpret historical point graphics or rename existing objects.

Document all necessary schema migrations.

Validate the entire candidate document before replacing the currently open document.

Malformed documents, unsupported versions, missing references, contradictory relationships, and invalid mathematical expressions must produce understandable errors without destroying the open document.

### 15.2 Relationship-aware deletion

Extend the existing dependency-protection mechanisms.

Prevent deletion or modification that would leave invalid references.

This includes:

- Objects referenced by interactions.
- Objects used as separation endpoints.
- Points hosting field vectors.
- Separation variables referenced by expressions.
- Interaction-owned quantities used in expressions.
- Vectors participating in linked contact groups.
- Variables referenced by mathematical expressions.

Provide safe, consistent deletion behavior.

Do not silently remove unrelated semantic information.

Avoid orphaned variables, vectors, interactions, graphical elements, and expression references.

---

# PART VIII: AUTOMATED TESTING AND ACCEPTANCE

## 16. GENERAL TESTING REQUIREMENTS

Extend the existing Vitest and Playwright infrastructure.

Preserve all currently passing Contract 1 and Contract 2 tests.

Add tests covering:

- Object categories and presets.
- Object property eligibility.
- Specialized graphical representations.
- Variable ownership and symbol synchronization.
- Physical constants.
- Interaction creation and editing.
- Separation-vector persistence and attachment.
- All supported vector categories.
- Mathematical expression references.
- Known, unknown, and expression magnitude states.
- Contextual eligibility.
- Linked contact-vector geometry.
- Graphical visibility.
- Dependency-aware deletion.
- JSON migration and round trips.

Include desktop and emulated mobile-browser acceptance.

Actual physical-device touchscreen acceptance remains the user's responsibility.

Do not claim successful mobile touchscreen verification solely from browser emulation.

---

## 17. REQUIRED ACCEPTANCE SCENARIOS

Implement representative automated acceptance tests for the following scenarios.

### Scenario A: Near-surface gravity

1. Create Planet Surface with default g = 9.8 m/s².
2. Show its adjustable ground-plane representation.
3. Create a Book with an explicitly unknown mass.
4. Define gravitational force BY Planet Surface ON Book.
5. Confirm the generated weight notation.
6. Confirm that the expression palette offers the actual defined g and mass variables.
7. Construct a student-authored expression using these variables.
8. Change the Book's mass symbol and verify expression synchronization.
9. Move the Book and confirm that its force arrow remains attached.
10. Save, reopen, and verify complete preservation.

### Scenario B: Universal gravitation

1. Create two ordinary objects with explicitly defined masses.
2. Define a separation vector between them.
3. Specify its physical magnitude independently of its displayed length.
4. Hide and show the separation arrow.
5. Move both objects and verify persistent graphical attachment.
6. Define their gravitational interaction.
7. Confirm that the expression palette exposes both defined masses, separation magnitude, and G.
8. Construct an expression using registered variables.
9. Verify that no equation is automatically suggested.
10. Save and reopen the complete document.

### Scenario C: Electric field and charged plate

1. Create a charged physical object.
2. Create a spatial observation point.
3. Define their separation.
4. Create an electric field BY the charged object AT the point.
5. Confirm correct variable availability and graphical attachment.
6. Create a Charged Plate.
7. Set its polarity and surface charge density.
8. Display the plate and verify that its charge indicators reflect its polarity.
9. Create a second observation point.
10. Define a uniform electric field from the plate at that point without requiring separation.
11. Verify that no background field vectors were automatically created.
12. Save and reopen.

### Scenario D: Contact forces and friction

1. Create a Book and Table.
2. Define contact force BY Table ON Book.
3. Enable friction.
4. Define an optional friction coefficient.
5. Verify that normal and friction are separate, linked semantic vectors.
6. Adjust their graphical lengths independently.
7. Rotate the pair and verify perpendicularity.
8. Enable the optional resultant.
9. Verify that the resultant's graphical direction and length respond appropriately to changes in its displayed components.
10. Move the Book and verify that the force group remains attached.
11. Save and reopen without losing the relationships.

### Scenario E: Spring and cable

1. Create a Spring with optional k and Δx.
2. Create an ordinary Block.
3. Define spring force BY Spring ON Block.
4. Verify that the expression palette exposes the spring's defined properties.
5. Verify that no spring-force equation is suggested.
6. Create a Cable.
7. Define tension BY Cable ON Block.
8. Confirm the tension notation.
9. Manipulate the specialized graphical objects and their force representations.
10. Save and reopen.

### Scenario F: Buoyancy

1. Create Fluid with the default name Water.
2. Set its mass density.
3. Display its translucent adjustable graphical region.
4. Create a Rock.
5. Define buoyant force BY Water ON Rock.
6. Define an interaction-owned displaced-volume variable.
7. Create Planet Surface with a defined gravitational field strength.
8. Verify that the expression palette exposes fluid density, displaced volume, and the explicitly defined gravitational field strength.
9. Confirm that moving the Rock in the displayed fluid does not modify displaced volume or automatically calculate buoyancy.
10. Save and reopen.

### Scenario G: Compatibility and integrity

1. Open representative genuine version 1 and version 2 documents.
2. Verify that their original content and semantic identities remain intact.
3. Confirm that historical graphical arrows do not acquire invented physics.
4. Extend an existing semantic document using the new features.
5. Download and reopen the updated document.
6. Verify full structural round-trip preservation.
7. Attempt imports containing missing endpoints, orphaned variables, malformed expressions, and invalid interaction references.
8. Confirm that invalid imports never destroy the currently open document.

Also verify that unavailable interface options are disabled without instructional explanations.

---

# PART IX: EXECUTION AND RECOVERY

## 18. REQUIRED DEVELOPMENT CHECKPOINTS

Complete the work incrementally.

Commit and push successfully completed milestones to the development branch.

Run appropriate tests before each checkpoint.

Do not postpone persistence implementation until the final checkpoint. Each completed feature must have an appropriate working data model and recoverable serialization before being considered complete.

### Checkpoint 1: Complete physical object system

Implement:

- Object categories.
- Planet Surface.
- Spatial points.
- Spring.
- Cable.
- Charged Plate.
- Fluid.
- New physical properties.
- Specialized graphical representations.
- Object-level tests.

Preserve all Contract 2 behavior.

Commit and push the completed milestone.

### Checkpoint 2: Interactions and separation

Implement:

- Extended variable ownership.
- Built-in physical constants.
- Semantic interaction definitions.
- Interaction-owned quantities.
- Separation vectors.
- Persistent separation endpoint attachment.
- Separation visibility.
- Associated tests and persistence.

Commit and push the completed milestone.

### Checkpoint 3: Semantic force, field, and motion vectors

Implement:

- Vector configuration interface.
- Deterministic eligibility.
- Gravitational forces.
- Electric forces.
- Contact forces.
- Normal/friction pairs.
- Spring force and tension.
- Buoyant force.
- Field vectors.
- Velocity, acceleration, and displacement.
- Graphical attachments, linked-vector behavior, and visibility.
- Associated tests.

Commit and push the completed milestone.

### Checkpoint 4: Mathematical expressions

Implement:

- Context-sensitive mathematical palettes.
- Student-authored expression construction.
- Structured expression persistence.
- Persistent variable references.
- Automatic symbol synchronization.
- Validation and dependency protection.
- Associated tests.

Commit and push the completed milestone.

### Checkpoint 5: Complete integration, acceptance, and deployment

Complete:

- Final JSON schema documentation and migration coverage.
- All required integration scenarios.
- Desktop and mobile-emulation regression tests.
- Production build verification.
- GitHub Actions verification.
- Deployment to the existing independent Diagramed development URL.
- Independent browser verification against the deployed application.
- Updated architecture documentation.
- Updated development status report.

Commit and push all final documentation.

Do not claim Contract 3 completion until the required automated tests pass and the deployed application is verified.

---

## 19. RESOURCE MANAGEMENT AND RECOVERY

This contract is intentionally substantial.

Preserve completed work incrementally rather than waiting for the entire contract to finish.

Keep each checkpoint independently recoverable.

If execution is interrupted, encounters an external blocker, or cannot complete the full scope:

1. Preserve and push all successfully completed milestones.
2. Leave the development branch in a documented, buildable state.
3. Identify the latest completed checkpoint and commit SHA.
4. Record completed functionality and passing tests.
5. Identify all incomplete work and known failures.
6. Update docs/STATUS.md with precise recovery instructions.

Do not report an incomplete checkpoint as complete.

Do not sacrifice data integrity, existing functionality, or repository isolation to finish additional features.

Make reasonable minor technical decisions independently, while adhering to the required observable behaviors and established architectural principles.

If an implementation detail is especially expensive, prioritize correct semantic behavior, persistence, and tests over unnecessary graphical polish.

Do not introduce speculative frameworks or unrelated infrastructure.

---

## 20. EXPLICIT EXCLUSIONS

Do not implement:

- Coordinate-system creation.
- Vector projections or calculated coordinate components.
- Automatic physical vector decomposition.
- General symbolic equation solving.
- Automatic physics correctness checking.
- Deterministic grading.
- AI tutoring or assessment.
- Instructor activity-management controls.
- Automatic derivation of physical quantities from graphical proportions.
- Automatic creation of forces or fields from object placement.
- Fluid simulation.
- Spring or cable mechanical simulation.
- Extended-body or rotational mechanics.
- Generic graphical creation tools.
- Server-side document storage.
- Authentication.
- PNG or SVG export.
- Mathed integration.
- A comprehensive editor redesign.

Retain architectural compatibility with future coordinate systems and component calculations.

The next development contract will address coordinate systems and mathematical vector components.

---

## 21. FINAL DELIVERABLES

Provide:

1. The updated browser-accessible Diagramed application.
2. The development branch and final pushed commit SHA.
3. A summary of the extended semantic architecture.
4. Documentation of the new JSON schema and migration behavior.
5. Updated example documents.
6. Automated unit and browser testing results.
7. Confirmation of production deployment and live acceptance.
8. Known limitations and required manual touchscreen testing.
9. A concise explanation of the architectural entry points for future coordinate systems, vector components, and Mathed integration.

Update README.md, docs/FORMAT.md, and docs/STATUS.md.

Preserve the previous development contracts as historical records.

Do not modify Problemly.

**Completion criterion:**

Students can define physical objects and their properties; establish gravitational, electric, contact, spring, cable, and buoyant interactions; define separation relationships; create semantically meaningful force, field, velocity, acceleration, and displacement vectors; and construct optional mathematical expressions using contextually available, persistently identified variables.

Every relevant semantic and graphical relationship must survive editing, movement, visibility changes, downloading, and reopening.

Diagramed must provide mathematical ingredients without suggesting governing equations or evaluating the correctness of student-authored physics.

The implementation must remain compatible with future coordinate systems, vector components, Mathed integration, and instructor-configurable AI tutoring.

**Proceed with implementation, using the existing development architecture and required recoverable checkpoints.**
