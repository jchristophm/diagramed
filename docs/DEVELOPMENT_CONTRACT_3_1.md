
# DIAGRAMED
# Development Contract 3.1
## Automatic Mathematical Notation and Graphical Interface Refinements

**Repository:** jchristophm/diagramed
**Working branch:** development
**Execution:** ChatGPT Work
**Starting point:** Completed Development Contract 3

## PRIMARY OBJECTIVE

Refine Diagramed's mathematical notation and graphical interface to produce a simpler, more intuitive introductory physics experience.

The primary changes are:

1. Automatically generate mathematical symbols for physical properties, interactions, and vectors.
2. Remove unnecessary student-facing LaTeX terminology and manual symbol entry.
3. Combine object names and property symbols into compact, movable labels.
4. Automatically position vector labels near their arrowheads.
5. Make shared vector attachment points visually unambiguous.
6. Correct the mathematical labels for linked normal, friction, and resultant contact forces.
7. Remove graphical direction and length inputs from all vector creation and editing dialogs.

Students should define physics through physical quantities and relationships, then manipulate their graphical representations directly on the canvas.

Preserve the completed Contract 3 functionality, semantic architecture, mathematical expression system, document persistence, and automated testing.

This is a focused refinement pass. Do not introduce new physics functionality.

---

# 1. PRESERVE THE EXISTING DEVELOPMENT FOUNDATION

Before implementation:

- Inspect the latest development branch HEAD.
- Read README.md, docs/STATUS.md, and docs/FORMAT.md.
- Inspect the completed Contract 3 implementation.
- Review the existing semantic naming, variable registry, vector creation, graphical rendering, and persistence code.
- Review existing automated tests.

If another development session has already committed some of these refinements, identify and preserve that work. Do not implement duplicate systems or overwrite completed changes.

Continue using the existing authoritative document store, persistent semantic identities, Konva rendering infrastructure, and structured mathematical expressions.

Never modify the original Problemly repository or deployment.

Do not merge development into main.

---

# 2. CENTRALIZED AUTOMATIC MATHEMATICAL NOTATION

Implement one consistent mathematical naming mechanism shared by Diagramed's physical objects, properties, interactions, and vectors.

Students should ordinarily define physical meaning rather than manually enter mathematical symbols.

The system generates notation based on:

- Physical quantity.
- Physical object category.
- Object identity and abbreviation.
- Interaction type.
- Participating objects.
- Vector type.

Mathematical symbols must remain independent of persistent semantic identities.

Never identify or link physical quantities by parsing their displayed mathematical symbols.

Existing structured mathematical expressions must continue referencing persistent variable IDs.

## 2.1 Object abbreviations

Assign readable, unique object abbreviations.

Ordinarily, use the first letter of an object's name.

Examples:

- Book: B
- Table: T
- Rock: R
- Emu: E

When two objects have conflicting abbreviations, extend them sufficiently to distinguish the objects.

For example:

Emu and Earth become Em and Ea.

Apply the resulting abbreviations consistently throughout the entire document.

Avoid changing existing abbreviations unnecessarily.

Handle identical object names deterministically, using suffixes when needed.

Store abbreviation assignments independently of semantic object identities.

Renaming an object must update generated mathematical notation wherever appropriate without changing persistent references.

Adding another object that creates an abbreviation conflict must update affected generated symbols consistently.

Do not make abbreviations depend on graphical position or array ordering.

## 2.2 Automatically generate property symbols

Newly created physical properties should receive automatic mathematical symbols.

Examples:

| Physical quantity | Generated notation |
|---|---|
| Book mass | m_B |
| Rock mass | m_R |
| Emu mass | m_Em |
| Earth mass | m_Ea |
| Particle charge | q_P |
| Water density | \rho_W |
| Charged-plate surface density | \sigma_P |

Use the actual assigned object abbreviation.

Apply appropriate conventional notation for every physical property currently supported by Diagramed.

Special cases:

**Planet Surface**

Use g when there is only one gravitational environment.

If several Planet Surface objects exist, disambiguate their gravitational field-strength variables using their object abbreviations.

**Spring**

Use k for a single spring's spring constant.

For multiple springs, use object abbreviations to generate distinct spring constants.

Apply the same convention to spring extension.

**Universal constants**

Preserve the fixed conventional symbols:

- G for universal gravitation.
- k_e for the Coulomb constant.

Never confuse a user-defined spring constant with the Coulomb constant.

## 2.3 Interaction-owned variables

Extend automatic naming to interaction-owned quantities.

This includes:

- Friction coefficients.
- Displaced fluid volume.
- Separation magnitudes.
- Other existing interaction-owned quantities.

Use participating-object abbreviations when necessary to distinguish quantities associated with different interactions.

Preserve existing physical quantity definitions, ownership relationships, known/unknown states, units, and values.

Do not automatically create physical quantities merely to assign mathematical symbols.

## 2.4 Historical custom symbols

Existing documents may contain manually defined mathematical symbols.

Preserve those symbols and their associated persistent identities when loading historical documents.

Do not silently overwrite explicitly authored notation or invalidate existing structured expressions.

Apply automatic naming by default to newly created quantities.

Existing custom-symbol support may remain internally available where required for compatibility.

Do not introduce an elaborate new advanced notation editor as part of this refinement.

---

# 3. AUTOMATIC VECTOR SYMBOLS

Remove manual symbol entry from the ordinary vector creation workflow.

Generate vector notation directly from its semantic definition.

Examples:

**Ordinary contact**

Force BY Table ON Book:

F_{T,B}

**Near-surface gravity**

Weight BY Planet Surface ON Book:

W_{P,B}

**Normal force**

N_{T,B}

**Friction force**

f_{T,B}

**Cable tension**

T_{C,B}

**Electric field**

Field BY Charged Particle AT Point:

E_{C,P}

**Separation**

FROM Object A TO Object B:

Vector: \vec{r}_{A,B}

Magnitude: r_{A,B}

**Motion**

Velocity of Book:

\vec{v}_B

Acceleration of Book:

\vec{a}_B

Apply consistent conventions to the remaining supported vector and interaction categories.

Distinguish identical-looking mathematical symbols when multiple distinct physical relationships require separate identities.

All generated notation must use the existing mathematical rendering infrastructure.

The generated symbol should update when an associated object abbreviation changes.

This must never change the underlying variable, interaction, or vector identity.

Do not alter physical definitions, automatically calculate magnitudes, or determine the correct physical direction.

This feature concerns mathematical notation, not automatic physics reasoning.

---

# 4. REMOVE STUDENT-FACING LATEX REQUIREMENTS

Students should never be required to type LaTeX to create ordinary objects, physical properties, interactions, or vectors.

Remove the ordinary editable "Symbol (LaTeX)" fields wherever automatic mathematical naming supplies the notation.

Display the generated symbol as properly rendered mathematics.

When a mathematical quantity genuinely requires a student-facing label, use understandable terminology such as "Symbol."

Do not expose internal implementation terminology unnecessarily.

Review:

- Object creation and editing.
- Property configuration.
- Interaction configuration.
- Vector creation and editing.
- Collection interfaces.
- Mathematical previews.
- Ordinary student-facing messages.

Preserve the existing LaTeX rendering system internally.

Maintain historical-document compatibility.

Do not remove the structured mathematical expression editor or change its ability to reference persistent variables.

The purpose is to hide mathematical markup, not eliminate mathematical notation.

---

# 5. COMPACT OBJECT LABELS

Currently, object names and associated mathematical property symbols may appear on separate lines.

Combine these into one compact graphical label.

Examples:

Book, m_B

Water, \rho_W

Planet Surface, g

For an object with several visible properties, display its name followed by the relevant mathematical symbols, separated by commas.

Render object names as ordinary text and mathematical symbols using the existing mathematical renderer.

Treat the combined label as one graphical unit.

## 5.1 Default positioning

Initially center each ordinary object's combined label horizontally relative to its central attachment point.

Use a small vertical offset where appropriate to avoid obscuring the object's shape.

Specialized large surfaces may retain category-specific placement.

Avoid unnecessary visual clutter.

## 5.2 Preserve existing label manipulation

The current implementation successfully allows object labels to be moved independently while remaining attached to their associated objects.

Preserve this behavior.

Students must be able to drag the combined label as a single unit.

When the object moves, preserve the label's relative position.

When the object name or mathematical symbols change, update the label without discarding its manually adjusted position.

Retain existing label-visibility controls.

Persist manual adjustments in JSON.

---

# 6. AUTOMATIC VECTOR LABEL PLACEMENT

Automatically position vector labels near their arrowheads.

This applies to:

- Forces.
- Fields.
- Separation vectors.
- Velocity.
- Acceleration.
- Displacement.
- Normal forces.
- Friction forces.
- Optional contact-force resultants.

Place labels a small distance from the arrowhead, avoiding direct overlap with the arrow shaft or selection handle.

Use the arrow's direction to determine a reasonable default offset.

Keep labels screen-upright when vectors rotate.

Recalculate automatic positioning when vector geometry changes.

## 6.1 Manual adjustment

Preserve the ability to drag vector labels independently.

Once a student manually repositions a label, maintain that adjustment relative to the vector's current geometry.

Moving or rotating an associated vector must not arbitrarily reset manually adjusted labels.

Saving and reopening the diagram must preserve label adjustments.

Changing a generated mathematical symbol must update its rendered label without discarding its position.

Do not implement a comprehensive automatic label-collision or diagram-layout engine.

Sensible defaults and persistent manual adjustments are sufficient.

---

# 7. SHARED VECTOR ATTACHMENT POINTS

When several vectors originate at the same physical object, their opposite graphical directions can make them resemble a single double-headed arrow.

Make their common origin visually unambiguous.

Prefer a small black dot at the shared central attachment point.

Draw this marker over the associated vector shafts.

The marker is a presentation-only element.

It must not:

- Become a physical object.
- Receive an independent semantic identity.
- Create a mathematical variable.
- Interfere with vector dragging.
- Obstruct mobile selection or touch controls.

If a small visual offset is necessary to distinguish overlapping graphical elements, it must not alter their underlying physical attachment relationship.

Distinguish permanent shared-origin markers from temporary vector selection handles.

Preserve the existing central attachment semantics.

---

# 8. CORRECT CONTACT-FORCE NOTATION

The current friction-enabled contact-force implementation can incorrectly retain the generic contact-force symbol on the normal vector.

Correct this at the semantic level.

For contact force BY Table ON Book:

Normal force:

N_{T,B}

Friction force:

f_{T,B}

Optional resultant:

F_{T,B}

These are distinct physical and graphical quantities.

When friction is enabled, the generic contact-force symbol belongs to the optional resultant, not the normal component.

When friction is disabled, retain the ordinary contact-force representation and F_{T,B} notation.

## 8.1 Linked graphical behavior

Preserve the completed linked normal/friction functionality.

Normal and friction remain distinct vectors associated with the same physical interaction.

Their graphical lengths can be adjusted independently by dragging their arrowheads.

Their directions remain perpendicular.

Rotating the linked pair preserves that perpendicular relationship.

When the optional resultant is enabled, its graphical direction and length must be derived from the displayed component vectors.

Changes to either displayed component must update the displayed resultant.

Do not create an independently adjustable resultant vector.

Do not infer numerical physical magnitudes from graphical lengths.

Preserve persistent semantic identities and mathematical relationships.

## 8.2 Existing-document compatibility

Inspect how existing Contract 3 documents represent linked contact forces.

Where semantic roles are unambiguous, correct the displayed notation for normal, friction, and resultant vectors.

Preserve existing persistent IDs and structured mathematical references.

Do not arbitrarily rewrite unrelated custom symbols or historical generic graphics.

Existing friction-enabled documents must reopen with correct component labeling and behavior.

---

# 9. REMOVE GRAPHICAL DIRECTION AND LENGTH CONTROLS

This is an explicit interface simplification.

Remove graphical direction and graphical length inputs from BOTH vector creation and vector editing dialogs.

Students should manipulate vector direction and graphical length directly on the canvas.

Do not replace the existing numerical inputs with sliders, angle pickers, or other redundant graphical controls.

## 9.1 Ordinary vectors

The vector creation dialog should contain only relevant physical and semantic configuration, including:

- Vector type.
- Participating objects or observation point.
- Interaction configuration.
- Physical magnitude definition.
- Relevant mathematical quantities.
- Visibility.

Do not ask students to specify a graphical direction or graphical length.

When a vector is created, provide sensible default graphical geometry.

Students subsequently drag its arrowhead to change its displayed direction and length.

Preserve the existing ability to manipulate vectors directly.

## 9.2 Contact forces with friction

The creation and editing dialogs may contain:

- Contact interaction configuration.
- Static or kinetic friction selection.
- Relevant physical quantity definitions.
- Show/hide controls.
- Show resultant.

Remove all numerical graphical direction and length controls.

Students adjust the normal and friction vectors directly on the canvas.

Maintain their perpendicularity.

The optional resultant follows the displayed component geometry automatically.

Do not introduce a separate resultant manipulation control.

## 9.3 Separation vectors

Separation vectors continue to derive their graphical endpoints and direction from their ordered FROM and TO objects.

Students manipulate the participating objects rather than independently dragging the separation endpoints.

Preserve the separation vector's optional visibility and independently defined physical magnitude.

Do not expose graphical direction or length controls.

## 9.4 Backend geometry

Retain all necessary graphical direction, endpoint, attachment, length, and transformation information internally.

Continue persisting graphical geometry in native JSON.

The future coordinate-system implementation will need this information.

The removal of numerical interface controls must not remove, simplify, or degrade the underlying geometry model.

Keep physical magnitude completely independent of graphical arrow length.

## 9.5 Editing consistency

Creation and editing dialogs should expose the same relevant physical configuration controls.

Editing a vector must not require students to enter graphical measurements.

Dragging or rotating a vector on the canvas must update its stored graphical configuration.

Existing saved geometry must survive reopening.

Preserve mobile touch interactions and enlarged graphical selection targets.

---

# 10. PERSISTENCE AND DATA INTEGRITY

Preserve the existing native JSON format wherever practical.

Avoid introducing another format version unless genuinely necessary.

All relevant information must survive downloading and reopening, including:

- Persistent object identities.
- Object abbreviations.
- Generated mathematical notation.
- Existing historical custom symbols.
- Physical properties and values.
- Interaction identities and quantities.
- Vector identities and magnitude definitions.
- Structured mathematical expression references.
- Graphical direction and length.
- Object and vector visibility.
- Manual label adjustments.
- Linked contact-force geometry.
- Optional resultant configuration.

Preserve version 1 and version 2 backward compatibility.

Continue supporting existing Contract 3 documents.

Validate imported documents before replacing the currently open document.

Do not weaken existing dependency protections or reference validation.

---

# 11. AUTOMATED TESTING

Preserve all currently passing tests.

Extend the existing unit and Playwright browser suites.

Add focused regression tests for the following.

### Automatic naming

- Default property-symbol generation.
- Unique object abbreviations.
- Abbreviation conflicts introduced after object creation.
- Object renaming.
- Multiple springs.
- Multiple gravitational environments.
- Interaction-owned variables.
- Automatic vector notation.
- Preservation of built-in physical constants.
- Avoidance of symbol collisions.

### Mathematical integrity

- Stable variable IDs after abbreviation changes.
- Stable interaction and vector IDs.
- Updated mathematical expression rendering.
- Preservation of persistent expression references.
- Historical custom-symbol compatibility.

### Graphical labels

- Compact combined object labels.
- Default object-label positioning.
- Combined-label dragging.
- Preserved manual object-label offsets.
- Automatic vector-tip label placement.
- Preserved manual vector-label adjustments.
- Mathematical-label synchronization.

### Contact-force behavior

- Correct normal-force notation.
- Correct friction-force notation.
- Correct optional resultant notation.
- Perpendicular linked-vector geometry.
- Independent component graphical-length manipulation.
- Correct graphical resultant updates.
- Preserved semantic magnitude definitions.

### Interface simplification

- No ordinary student-facing LaTeX requirements.
- No graphical direction inputs in creation dialogs.
- No graphical length inputs in creation dialogs.
- No graphical direction inputs in editing dialogs.
- No graphical length inputs in editing dialogs.
- Continued direct graphical manipulation.
- Successful editing of reopened vectors.

### Persistence

- Download and reopen updated documents.
- Import historical Contract 2 documents.
- Import existing Contract 3 documents.
- Preserve all persistent semantic identities.
- Preserve graphical geometry.
- Preserve generated notation and historical custom symbols.
- Preserve manual label adjustments.

Run desktop and emulated mobile browser tests.

Actual touchscreen acceptance remains the user's responsibility.

---

# 12. REQUIRED VISUAL ACCEPTANCE

Use a concrete introductory physics scenario.

Create:

- Planet Surface.
- Table.
- Book with an explicitly unknown mass.

Show Planet Surface and position Table and Book above it.

Verify that the Book's label appears as one compact label using its name and automatically generated mass symbol.

Create weight BY Planet Surface ON Book.

Create ordinary contact force BY Table ON Book.

Confirm that the force symbols are generated automatically without requiring manual mathematical markup.

Enable friction.

Verify:

1. The normal is labeled N_{T,B}.
2. Friction is labeled f_{T,B}.
3. The generic F_{T,B} label belongs only to the optional resultant when friction is enabled.
4. Normal and friction can be manipulated independently.
5. Normal and friction remain perpendicular.
6. The optional resultant updates correctly.
7. Vector labels appear near their arrowheads.
8. A common attachment-point marker prevents opposite forces from resembling one double-headed arrow.
9. The vector dialogs contain no graphical direction or length controls.

Manipulate the Table and Book to construct an inclined-plane representation.

Confirm that graphical attachments, relative object-label positions, vector-tip labels, linked-vector geometry, and optional resultant behavior remain functional.

Add another object whose name conflicts with an existing abbreviation.

Verify that generated symbols update consistently without changing semantic identities or breaking mathematical expressions.

Download the completed diagram.

Refresh the application and reopen the saved JSON.

Confirm that all physical definitions, mathematical relationships, graphical geometry, labels, and interactions are restored correctly.

Repeat the relevant scenarios in mobile browser emulation.

---

# 13. EXECUTION CHECKPOINTS

Implement the refinement through three recoverable checkpoints.

## Checkpoint 1: Automatic notation

Implement:

- Centralized mathematical naming.
- Object abbreviations and collision handling.
- Automatic property and interaction-variable symbols.
- Automatic vector notation.
- Removal of unnecessary student-facing LaTeX entry.
- Preservation of existing structured mathematical references.
- Associated tests.

Commit and push the completed checkpoint.

## Checkpoint 2: Graphical and interface refinements

Implement:

- Compact combined object labels.
- Automatic vector-tip label placement.
- Persistent manual label adjustments.
- Shared vector attachment-point indicators.
- Corrected normal/friction/resultant labeling.
- Removal of graphical direction and length controls from creation and editing dialogs.
- Preservation of direct graphical manipulation.
- Associated tests.

Commit and push the completed checkpoint.

## Checkpoint 3: Integration and deployment

Complete:

- All required regression tests.
- JSON compatibility tests.
- Desktop and mobile-emulation tests.
- Required visual acceptance scenario.
- Successful production build.
- GitHub Actions verification.
- Independent deployment verification.
- Updated README.md and relevant format documentation.
- Updated docs/STATUS.md.

Deploy the verified application to the existing independent Diagramed development URL.

Report the final branch, commit SHA, test results, deployment status, and any remaining manual testing requirements.

---

# 14. RECOVERY REQUIREMENTS

Preserve completed work incrementally.

Do not wait until the entire contract is finished to commit and push successful milestones.

If execution is interrupted or the Work session becomes unresponsive:

- Preserve and push completed checkpoints.
- Keep the development branch recoverable.
- Record the latest successful commit.
- Record passing and failing tests.
- Document the precise remaining work.
- Update docs/STATUS.md.

Never abandon completed work because a later milestone encounters a problem.

Do not report completion until the final tests and deployment verification succeed.

Never modify Problemly.

Do not merge into main without authorization.

---

# 15. EXPLICIT EXCLUSIONS

Do not implement:

- Additional physical object categories.
- Additional physical interactions.
- Coordinate systems.
- Vector component calculations.
- Automatic physical direction determination.
- Automatic equations or equation suggestions.
- Mathematical solving.
- Notebook functionality.
- Mathed integration.
- AI tutoring or assessment.
- Comprehensive diagram-layout automation.
- Additional unrelated interface controls.
- A general graphical editor redesign.

Preserve all existing Contract 3 capabilities.

Avoid adding new dependencies or architectural layers unless genuinely necessary.

---

# FINAL COMPLETION CRITERION

Students can create physical objects, define properties, establish interactions, and construct semantic vectors without manually entering mathematical markup.

Diagramed automatically generates consistent mathematical notation while preserving persistent semantic identities and mathematical references.

Object labels are compact and movable.

Vector labels appear near their arrowheads by default.

Shared attachment points are visually clear.

Linked contact forces use the correct normal, friction, and resultant notation.

Students manipulate graphical vector direction and length exclusively through direct canvas interaction. All necessary graphical geometry remains available internally for persistence and future coordinate systems.

Existing documents remain compatible.

All refinements are tested, committed, deployed, and independently verified.

Proceed with implementation.
